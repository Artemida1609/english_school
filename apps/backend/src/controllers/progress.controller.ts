import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

// POST /api/progress — mark lesson as complete / save score
export const saveProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId, completed, score } = req.body
    const userId = req.user!.id

    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        completed,
        score,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        completed,
        score,
        completedAt: completed ? new Date() : null,
      },
    })

    // Award XP when completing a lesson
    if (completed) {
      await prisma.userProfile.update({
        where: { userId },
        data: {
          xp: { increment: 10 },
          lastActivity: new Date(),
        },
      })
    }

    res.json(progress)
  } catch (error) {
    console.error('SaveProgress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/progress/me — get all progress for current user
export const getMyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: { module: { include: { course: { select: { id: true, title: true } } } } },
        },
      },
      orderBy: { completedAt: 'desc' },
    })

    const stats = {
      totalLessons: progress.length,
      completedLessons: progress.filter((p: { completed: boolean }) => p.completed).length,
      averageScore:
        progress.filter((p: { score: number | null }) => p.score !== null).length > 0
          ? Math.round(
              progress.reduce(
                (acc: number, p: { score: number | null }) => acc + (p.score || 0),
                0
              ) / progress.filter((p: { score: number | null }) => p.score !== null).length
            )
          : null,
    }

    res.json({ progress, stats })
  } catch (error) {
    console.error('GetProgress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/progress/course/:courseId — progress for a specific course
export const getCourseProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const courseId = getParam(req, 'courseId')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    const lessons = await prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true, title: true, orderIndex: true, type: true },
    })

    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map((l: { id: string }) => l.id) },
      },
    })

    const progressMap = new Map(
      progress.map((p: { lessonId: string }) => [p.lessonId, p] as [string, typeof p])
    )

    const result = lessons.map((lesson: { id: string; title: string; orderIndex: number }) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) || null,
    }))

    const completedCount = progress.filter((p: { completed: boolean }) => p.completed).length
    const percentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

    res.json({ lessons: result, completedCount, totalCount: lessons.length, percentage })
  } catch (error) {
    console.error('GetCourseProgress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/progress/module/:moduleId — progress for a specific module
export const getModuleProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const moduleId = getParam(req, 'moduleId')
    if (!moduleId) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true, title: true, type: true, orderIndex: true },
    })

    const progress = await prisma.userProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map((l) => l.id) },
      },
    })

    const progressMap = new Map(progress.map((p) => [p.lessonId, p]))

    const result = lessons.map((lesson) => ({
      ...lesson,
      progress: progressMap.get(lesson.id) || null,
    }))

    const completedCount = progress.filter((p) => p.completed).length
    const totalCount = lessons.length
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    res.json({ lessons: result, completedCount, totalCount, percentage })
  } catch (error) {
    console.error('GetModuleProgress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/progress/stats — detailed progress statistics for user profile
export const getProgressStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    // Get all progress records
    const allProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: { id: true, type: true, moduleId: true },
        },
      },
    })

    // Count completed lessons by type
    const completedLessons = allProgress.filter((p) => p.completed).length
    const completedByType = {
      VIDEO: allProgress.filter((p) => p.completed && p.lesson.type === 'VIDEO').length,
      THEORY: allProgress.filter((p) => p.completed && p.lesson.type === 'THEORY').length,
      TASK: allProgress.filter((p) => p.completed && p.lesson.type === 'TASK').length,
      TEST: allProgress.filter((p) => p.completed && p.lesson.type === 'TEST').length,
    }

    // Count unique modules studied (modules where at least 1 lesson is completed)
    const completedModuleIds = new Set(
      allProgress
        .filter((p) => p.completed)
        .map((p) => p.lesson.moduleId)
    )
    const topicsStudied = completedModuleIds.size

    // Get total modules for percentage
    const allModules = await prisma.module.findMany({
      select: { id: true },
    })
    const topicsPercentage = allModules.length > 0 
      ? Math.round((topicsStudied / allModules.length) * 100)
      : 0

    // Calculate accuracy (average score from lessons with scores)
    const progressWithScores = allProgress.filter((p) => p.score !== null && p.completed)
    const accuracy = progressWithScores.length > 0
      ? Math.round(
          progressWithScores.reduce((sum, p) => sum + (p.score || 0), 0) /
            progressWithScores.length
        )
      : 0

    res.json({
      tasksCompleted: completedLessons,
      byType: completedByType,
      topicsStudied,
      topicsTotal: allModules.length,
      topicsPercentage,
      accuracy,
    })
  } catch (error) {
    console.error('GetProgressStats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/progress/activity-calendar — activity dates for calendar
export const getActivityCalendar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    // Get all completed lessons with completion dates
    const completedLessons = await prisma.userProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { not: null },
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    })

    // Group by date (YYYY-MM-DD)
    const activityDates = new Set<string>()
    completedLessons.forEach(({ completedAt }) => {
      if (completedAt) {
        const date = new Date(completedAt).toISOString().split('T')[0]
        activityDates.add(date)
      }
    })

    // Calculate streak
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { streak: true, lastActivity: true },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActivityDate = userProfile?.lastActivity 
      ? new Date(userProfile.lastActivity)
      : null

    if (lastActivityDate) {
      lastActivityDate.setHours(0, 0, 0, 0)
    }

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0
    if (lastActivityDate) {
      const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0 || daysDiff === 1) {
        // User was active today or yesterday, check streak
        let checkDate = new Date(today)
        let streakDays = 0

        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0]
          if (activityDates.has(dateStr)) {
            streakDays++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }

        currentStreak = streakDays
      }
    }

    res.json({
      activityDates: Array.from(activityDates),
      currentStreak,
      lastActivity: userProfile?.lastActivity || null,
    })
  } catch (error) {
    console.error('GetActivityCalendar error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}