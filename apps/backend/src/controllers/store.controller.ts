import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

const getMaxPurchases = (key: string): number => {
  if (key === 'dark-theme' || key === 'gold-profile') return 1
  return 5
}

// GET /api/store/me
export const getMyStore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const [items, purchasesCount] = await Promise.all([
      prisma.storeItem.findMany(),
      prisma.storePurchase.groupBy({
        where: { userId },
        by: ['itemId'],
        _count: { _all: true },
      }),
    ])

    const countByItemId = new Map<string, number>(
      purchasesCount.map((p) => [p.itemId, p._count._all] as [string, number]),
    )

    const itemsWithState = items.map((item) => {
      const purchasedCount = countByItemId.get(item.id) ?? 0
      const maxPurchases = getMaxPurchases(item.key)

      return {
        id: item.id,
        key: item.key,
        title: item.title,
        description: item.description,
        price: item.price,
        icon: item.icon,
        maxPurchases,
        purchasedCount,
      }
    })

    res.json({
      coins: profile.coins,
      items: itemsWithState,
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

    const existingCount = await prisma.storePurchase.count({
      where: { userId, itemId: item.id },
    })
    const maxPurchases = getMaxPurchases(item.key)

    if (existingCount >= maxPurchases) {
      res.status(400).json({ message: 'Purchase limit reached for this item' })
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
        purchasedCount: existingCount + 1,
        maxPurchases,
      },
    })
  } catch (error) {
    console.error('BuyItem error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

