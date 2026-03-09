import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/profile/me
export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        _count: { select: { enrollments: true } },
      },
    })

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const completedLessons = await prisma.userProgress.count({
      where: { userId: req.user!.id, completed: true },
    })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
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
    const { name, bio, learningGoal, avatar } = req.body
    const userId = req.user!.id

    if (name) {
      await prisma.user.update({ where: { id: userId }, data: { name } })
    }

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: { bio, learningGoal, avatar },
    })

    res.json(profile)
  } catch (error) {
    console.error('UpdateProfile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
