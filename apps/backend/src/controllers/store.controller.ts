import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/store/me
export const getMyStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const purchases = await prisma.storePurchase.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            key: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      coins: profile.coins,
      purchases: purchases.map((p) => ({
        id: p.id,
        itemKey: p.item.key,
        title: p.title,
        price: p.price,
        icon: p.item.icon,
        createdAt: p.createdAt,
      })),
    })
  } catch (error) {
    console.error('GetMyStore error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/store/buy
export const buyItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { key } = req.body as { key?: string }

    if (!key) {
      res.status(400).json({ message: 'Item key is required' })
      return
    }

    const item = await prisma.storeItem.findUnique({ where: { key } })
    if (!item) {
      res.status(404).json({ message: 'Item not found' })
      return
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    if (profile.coins < item.price) {
      res.status(400).json({ message: 'Not enough coins' })
      return
    }

    const [updatedProfile, purchase] = await prisma.$transaction([
      prisma.userProfile.update({
        where: { userId },
        data: { coins: { decrement: item.price } },
      }),
      prisma.storePurchase.create({
        data: {
          userId,
          itemId: item.id,
          title: item.title,
          price: item.price,
        },
      }),
    ])

    res.status(201).json({
      coins: updatedProfile.coins,
      purchase: {
        id: purchase.id,
        itemKey: item.key,
        title: purchase.title,
        price: purchase.price,
        icon: item.icon,
        createdAt: purchase.createdAt,
      },
    })
  } catch (error) {
    console.error('BuyItem error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

