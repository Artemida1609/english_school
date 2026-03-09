import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/chats/rooms
export const getRooms = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(rooms)
  } catch (error) {
    console.error('GetRooms error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/chats/rooms/:roomId/messages
export const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const cursor = req.query.cursor as string | undefined

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    })

    res.json(messages.reverse())
  } catch (error) {
    console.error('GetMessages error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/chats/rooms — создать комнату (TEACHER/ADMIN)
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type } = req.body
    if (!name) {
      res.status(400).json({ message: 'Name is required' })
      return
    }
    const room = await prisma.chatRoom.create({
      data: { name, type: type || 'PUBLIC' },
    })
    res.status(201).json(room)
  } catch (error) {
    console.error('CreateRoom error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}