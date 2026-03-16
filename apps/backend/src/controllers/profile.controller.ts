import { Response } from 'express'
import crypto from 'crypto'
import multiavatar from '@multiavatar/multiavatar'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const createRandomAvatarDataUrl = (): string => {
  const seed = crypto.randomUUID()
  const svg = multiavatar(seed)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// GET /api/profile/me
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, _count: { select: { enrollments: true } } },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Ensure profile exists (older accounts / seeds might not have it)
    const profile =
      user.profile ??
      (await prisma.userProfile.upsert({
        where: { userId },
        update: {},
        create: { userId, avatar: createRandomAvatarDataUrl() },
      }))

    const completedLessons = await prisma.userProgress.count({
      where: { userId, completed: true },
    })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile,
      stats: {
        enrolledCourses: user._count.enrollments,
        completedLessons,
      },
    })
  } catch (error) {
    console.error('GetProfile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// PUT /api/profile/me
export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, bio, learningGoal, avatar, rerollAvatar } = req.body
    const userId = req.user!.id

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } })
    }

    const nextAvatar =
      rerollAvatar === true ? createRandomAvatarDataUrl() : avatar

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: { bio, learningGoal, avatar: nextAvatar },
      create: {
        userId,
        bio,
        learningGoal,
        avatar: nextAvatar ?? createRandomAvatarDataUrl(),
      },
    })

    res.json(profile)
  } catch (error) {
    console.error('UpdateProfile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
