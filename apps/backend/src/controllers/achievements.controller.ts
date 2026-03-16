import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/achievements/me
export const getMyAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const [profile, progress, spentAgg, avatarRerollCount] = await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.userProgress.findMany({
        where: { userId, completed: true },
        select: { id: true, lessonId: true, completedAt: true },
      }),
      prisma.storePurchase.aggregate({
        where: { userId },
        _sum: { price: true },
      }),
      prisma.storePurchase.count({
        where: {
          userId,
          item: { key: 'avatar-reroll' },
        },
      }),
    ])

    const completedLessons = progress.length
    const xp = profile?.xp ?? 0
    const streak = profile?.streak ?? 0
    const spent = spentAgg._sum.price ?? 0

    const unlocked: string[] = []

    // Перший модуль — принаймні один завершений урок
    if (completedLessons >= 1) unlocked.push('first-module')

    // 7 днів підряд — streak >= 7
    if (streak >= 7) unlocked.push('streak-7')

    // Швидкий старт — >= 3 завершених уроків або XP >= 30
    if (completedLessons >= 3 || xp >= 30) unlocked.push('quick-start')

    // 100 слів — тут використовуємо XP >= 100 як наближення
    if (xp >= 100) unlocked.push('100-words')

    // Витратити 100 монет
    if (spent >= 100) unlocked.push('spend-100')

    // 10 разів перегенерувати аватар
    if (avatarRerollCount >= 10) unlocked.push('avatar-reroll-10')

    // Інші досягнення поки залишаємо заблокованими

    const progressByKey: Record<
      string,
      { current: number; target: number }
    > = {
      'first-module': { current: Math.min(completedLessons, 1), target: 1 },
      'streak-7': { current: Math.min(streak, 7), target: 7 },
      'quick-start': { current: Math.min(completedLessons, 3), target: 3 },
      '100-words': { current: Math.min(xp, 100), target: 100 },
      'spend-100': { current: Math.min(spent, 100), target: 100 },
      'avatar-reroll-10': { current: Math.min(avatarRerollCount, 10), target: 10 },
    }

    res.json({ unlocked, progress: progressByKey })
  } catch (error) {
    console.error('GetMyAchievements error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

