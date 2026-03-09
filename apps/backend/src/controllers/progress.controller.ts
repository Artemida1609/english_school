import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

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
          include: { course: { select: { id: true, title: true } } },
        },
      },
      orderBy: { completedAt: 'desc' },
    })

    const stats = {
      totalLessons: progress.length,
      completedLessons: progress.filter((p) => p.completed).length,
      averageScore:
        progress.filter((p) => p.score !== null).length > 0
          ? Math.round(
              progress.reduce((acc, p) => acc + (p.score || 0), 0) /
                progress.filter((p) => p.score !== null).length
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
    const { courseId } = req.params

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true, title: true, orderIndex: true },
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
    const percentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

    res.json({ lessons: result, completedCount, totalCount: lessons.length, percentage })
  } catch (error) {
    console.error('GetCourseProgress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
