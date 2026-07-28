import { Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

type RoomTypeValue = 'PUBLIC' | 'PRIVATE' | 'GROUP'

async function assertRoomMember(roomId: string, userId: string): Promise<boolean> {
  const member = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  })
  return Boolean(member)
}

async function canAccessRoom(roomId: string, userId: string, role?: string): Promise<boolean> {
  if (role === 'TEACHER' || role === 'ADMIN') return true
  return assertRoomMember(roomId, userId)
}

function mapRoomResponse(
  room: {
    id: string
    name: string
    type: RoomTypeValue
    createdAt: Date
    members?: Array<{
      user: { id: string; name: string; email: string; role: string }
    }>
    messages?: Array<{ message: string; createdAt: Date }>
    _count?: { messages: number }
  },
  currentUserId: string,
) {
  const members = (room.members ?? []).map((m) => m.user)
  const others = members.filter((u) => u.id !== currentUserId)
  const displayName =
    room.type === 'PRIVATE'
      ? others.length === 1
        ? others[0].name
        : others.length > 1
          ? others.map((u) => u.name).join(' · ')
          : room.name
      : room.name

  const last = room.messages?.[0]
  return {
    id: room.id,
    name: displayName,
    type: room.type,
    createdAt: room.createdAt,
    members,
    memberCount: members.length,
    lastMessage: last?.message ?? '',
    lastMessageAt: last?.createdAt ?? null,
    messageCount: room._count?.messages ?? 0,
  }
}

/** GET /api/chat/users — TEACHER/ADMIN: усі користувачі для створення чатів */
export const getChatUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const me = req.user?.id
    if (!me) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    })

    res.json(users)
  } catch (error) {
    console.error('GetChatUsers error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /api/chat/rooms — учасник бачить свої; TEACHER/ADMIN — усі */
export const getRooms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const role = req.user?.role
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const isStaff = role === 'TEACHER' || role === 'ADMIN'
    const rooms = await prisma.chatRoom.findMany({
      where: isStaff
        ? undefined
        : { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { message: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(rooms.map((room) => mapRoomResponse(room, userId)))
  } catch (error) {
    console.error('GetRooms error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /api/chat/rooms/:roomId/messages */
export const getRoomMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id
    const roomId = getParam(req, 'roomId')
    if (!userId || !roomId) {
      res.status(400).json({ message: 'Room ID required' })
      return
    }

    if (!(await canAccessRoom(roomId, userId, req.user?.role))) {
      res.status(403).json({ message: 'Not a member of this room' })
      return
    }

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

/**
 * POST /api/chat/rooms
 * PRIVATE: { type: 'PRIVATE', memberIds: [userA, userB] } — рівно 2 учасники
 * GROUP:   { type: 'GROUP', name, memberIds: [...] }
 */
export const createRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user?.id
    if (!creatorId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const typeRaw = String(req.body?.type ?? 'GROUP').toUpperCase()
    const type: RoomTypeValue =
      typeRaw === 'PRIVATE' ? 'PRIVATE' : typeRaw === 'PUBLIC' ? 'PUBLIC' : 'GROUP'
    const memberIdsRaw: unknown = req.body?.memberIds
    const memberIds = Array.isArray(memberIdsRaw)
      ? [...new Set(memberIdsRaw.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))]
      : []
    const nameInput = typeof req.body?.name === 'string' ? req.body.name.trim() : ''

    const roomInclude = {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        select: { message: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    }

    if (type === 'PRIVATE') {
      if (memberIds.length !== 2) {
        res.status(400).json({ message: 'Private chat needs exactly two users' })
        return
      }

      const [userAId, userBId] = memberIds
      const pair = await prisma.user.findMany({
        where: { id: { in: [userAId, userBId] } },
        select: { id: true, name: true },
      })
      if (pair.length !== 2) {
        res.status(404).json({ message: 'One or both users not found' })
        return
      }

      const existing = await prisma.chatRoom.findFirst({
        where: {
          type: 'PRIVATE',
          AND: [
            { members: { some: { userId: userAId } } },
            { members: { some: { userId: userBId } } },
          ],
        },
        include: {
          members: true,
        },
      })

      if (existing) {
        // Prefer a true 1:1 room (exactly these two members)
        const existingMemberIds = existing.members.map((m) => m.userId).sort()
        const wanted = [...memberIds].sort()
        const isExactPair =
          existingMemberIds.length === 2 &&
          existingMemberIds[0] === wanted[0] &&
          existingMemberIds[1] === wanted[1]

        if (isExactPair) {
          const refreshed = await prisma.chatRoom.findUniqueOrThrow({
            where: { id: existing.id },
            include: roomInclude,
          })
          res.status(200).json(mapRoomResponse(refreshed, creatorId))
          return
        }
      }

      const name = `${pair[0].name} · ${pair[1].name}`
      const room = await prisma.chatRoom.create({
        data: {
          name,
          type: 'PRIVATE',
          members: {
            create: [{ userId: userAId }, { userId: userBId }],
          },
        },
        include: roomInclude,
      })

      res.status(201).json(mapRoomResponse(room, creatorId))
      return
    }

    // GROUP (and PUBLIC treated as group)
    const uniqueOthers = memberIds.filter((id) => id !== creatorId)
    if (!nameInput) {
      res.status(400).json({ message: 'Group name is required' })
      return
    }
    if (uniqueOthers.length < 1) {
      res.status(400).json({ message: 'Select at least one member for the group' })
      return
    }

    const found = await prisma.user.findMany({
      where: { id: { in: uniqueOthers } },
      select: { id: true },
    })
    if (found.length !== uniqueOthers.length) {
      res.status(400).json({ message: 'One or more users not found' })
      return
    }

    const allMemberIds = [creatorId, ...uniqueOthers]
    const room = await prisma.chatRoom.create({
      data: {
        name: nameInput,
        type: 'GROUP',
        members: {
          create: allMemberIds.map((userId) => ({ userId })),
        },
      },
      include: roomInclude,
    })

    res.status(201).json(mapRoomResponse(room, creatorId))
  } catch (error) {
    console.error('CreateRoom error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
