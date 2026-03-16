import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/achievements/me
export const getMyAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const [profile, progress] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.userProgress.findMany({
        where: { userId, completed: true },
        select: { id: true, lessonId: true, completedAt: true },
      }),
    ])

    const completedLessons = progress.length
    const xp = profile?.xp ?? 0
    const streak = profile?.streak ?? 0

    const unlocked: string[] = []

    // Перший модуль — принаймні один завершений урок
    if (completedLessons >= 1) unlocked.push('first-module')

    // 7 днів підряд — streak >= 7
    if (streak >= 7) unlocked.push('streak-7')

    // Швидкий старт — >= 3 завершених уроків або XP >= 30
    if (completedLessons >= 3 || xp >= 30) unlocked.push('quick-start')

    // 100 слів — тут використовуємо XP >= 100 як наближення
    if (xp >= 100) unlocked.push('100-words')

    // Інші досягнення поки залишаємо заблокованими

    res.json({ unlocked })
  } catch (error) {
    console.error('GetMyAchievements error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

