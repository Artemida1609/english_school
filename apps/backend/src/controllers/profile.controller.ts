import { Response } from "express";
import crypto from "crypto";
import multiavatar from "@multiavatar/multiavatar";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const createRandomAvatarDataUrl = (): string => {
  const seed = crypto.randomUUID();
  const svg = multiavatar(seed);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Calculate user level based on XP
 * Level 1: 0-99 XP
 * Level 2: 100-199 XP
 * Level 3: 200-299 XP
 * Level 4: 300-399 XP
 * Level 5+: 400+ XP
 */
const calculateLevel = (xp: number): number => {
  return Math.max(1, Math.floor(xp / 100) + 1);
};

/**
 * Calculate XP needed to reach next level
 */
const getXpToNextLevel = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  const xpForNextLevel = currentLevel * 100;
  return Math.max(0, xpForNextLevel - xp);
};

/**
 * Calculate progress percentage to next level (0-100)
 */
const getLevelProgress = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  const levelStartXp = (currentLevel - 1) * 100;
  const levelEndXp = currentLevel * 100;
  const xpInLevel = xp - levelStartXp;
  const xpNeededForLevel = levelEndXp - levelStartXp;
  return Math.min(100, Math.round((xpInLevel / xpNeededForLevel) * 100));
};

// GET /api/profile/me
export const getMyProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, _count: { select: { enrollments: true } } },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Ensure profile exists (older accounts / seeds might not have it)
    const profile =
      user.profile ??
      (await prisma.userProfile.upsert({
        where: { userId },
        update: {},
        create: { userId, avatar: createRandomAvatarDataUrl() },
      }));

    const completedLessons = await prisma.userProgress.count({
      where: { userId, completed: true },
    });

    // Determine course path for current user (if multiple enrollments, use most recent)
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
    });

    const activeCourseId = req.query.courseId
      ? String(req.query.courseId)
      : enrollment?.courseId;

    const activeCourse =
      (activeCourseId
        ? await prisma.course.findUnique({ where: { id: activeCourseId } })
        : null) ??
      (await prisma.course.findFirst({
        where: { isPublished: true },
        orderBy: { createdAt: "asc" },
      }));

    const courseId = activeCourse?.id;

    const modules = courseId
      ? await prisma.module.findMany({
          where: { courseId },
          orderBy: { orderIndex: "asc" },
          include: { lessons: { select: { id: true } } },
        })
      : [];

    const lessonIds = modules.flatMap((mod) => mod.lessons.map((l) => l.id));

    const lessonProgress = await prisma.userProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
      select: { lessonId: true, completed: true, completedAt: true },
    });

    const progressByLesson = new Map(
      lessonProgress.map((p) => [p.lessonId, p]),
    );

    const modulesWithStatus = modules.map((mod, index) => {
      const total = mod.lessons.length;
      const completed = mod.lessons.filter(
        (l) => progressByLesson.get(l.id)?.completed,
      ).length;
      const isCompleted = total > 0 && completed >= total;
      return {
        id: mod.id,
        title: mod.title,
        stage: mod.stage ?? 1,
        orderIndex: mod.orderIndex,
        totalLessons: total,
        completedLessons: completed,
        completed: isCompleted,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    let prevStageComplete = true;
    const unlockedModules = modulesWithStatus.map((modStatus, idx) => {
      const unlocked = idx === 0 ? true : prevStageComplete;
      prevStageComplete = prevStageComplete && modStatus.completed;
      return { ...modStatus, unlocked };
    });

    const currentModule =
      unlockedModules.find((m) => m.unlocked && !m.completed) ??
      unlockedModules[unlockedModules.length - 1] ??
      null;

    const completedModulesCount = modulesWithStatus.filter(
      (m) => m.completed,
    ).length;

    // Calculate dynamic level based on XP
    const currentLevel = calculateLevel(profile.xp);
    const xpToNextLevel = getXpToNextLevel(profile.xp);
    const levelProgress = getLevelProgress(profile.xp);

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: {
        ...profile,
        level: currentLevel,
        xpToNextLevel,
        levelProgress,
      },
      stats: {
        enrolledCourses: user._count.enrollments,
        completedLessons,
        completedModules: completedModulesCount,
        totalModules: modules.length,
      },
      learning: {
        course: activeCourse
          ? { id: activeCourse.id, title: activeCourse.title }
          : null,
        continueModule: currentModule,
        modules: unlockedModules,
      },
    });
  } catch (error) {
    console.error("GetProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /api/profile/me
export const updateMyProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, bio, learningGoal, avatar, rerollAvatar } = req.body;
    const userId = req.user!.id;

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } });
    }

    const nextAvatar =
      rerollAvatar === true ? createRandomAvatarDataUrl() : avatar;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { bio, learningGoal, avatar: nextAvatar },
      create: {
        userId,
        bio,
        learningGoal,
        avatar: nextAvatar ?? createRandomAvatarDataUrl(),
      },
    });

    res.json(profile);
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
