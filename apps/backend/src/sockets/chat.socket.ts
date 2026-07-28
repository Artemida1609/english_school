import { Server, Socket } from 'socket.io'
import * as jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'

interface AuthenticatedSocket extends Socket {
  userId?: string
  userName?: string
  userRole?: string
}

async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
  const member = await prisma.chatRoomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  })
  return Boolean(member)
}

async function canAccessRoom(roomId: string, userId: string, role?: string): Promise<boolean> {
  if (role === 'TEACHER' || role === 'ADMIN') return true
  return isRoomMember(roomId, userId)
}

export const setupSockets = (io: Server): void => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY
      if (!secret) return next(new Error('Server misconfigured'))

      const decoded = jwt.verify(token, secret) as {
        id: string
        name?: string
        email?: string
        role?: string
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      })
      if (!user) return next(new Error('User not found'))

      socket.userId = user.id
      socket.userName = user.name || decoded.name || user.email
      socket.userRole = user.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Socket connected: ${socket.id} (user: ${socket.userId})`)

    socket.on('join_room', async (roomId: string) => {
      try {
        if (!socket.userId) return
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } })
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
          return
        }
        if (!(await canAccessRoom(roomId, socket.userId, socket.userRole))) {
          socket.emit('error', { message: 'Not a member of this room' })
          return
        }
        socket.join(roomId)
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userName: socket.userName,
        })
      } catch (error) {
        console.error('join_room error:', error)
      }
    })

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId)
      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName,
      })
    })

    socket.on('send_message', async (data: { roomId: string; message: string }) => {
      try {
        const { roomId, message } = data
        if (!socket.userId || !message?.trim()) return

        if (!(await canAccessRoom(roomId, socket.userId, socket.userRole))) {
          socket.emit('error', { message: 'Not a member of this room' })
          return
        }

        const saved = await prisma.message.create({
          data: {
            roomId,
            userId: socket.userId,
            message: message.trim(),
          },
          include: {
            user: { select: { id: true, name: true } },
          },
        })

        io.to(roomId).emit('receive_message', {
          id: saved.id,
          message: saved.message,
          createdAt: saved.createdAt,
          user: saved.user,
        })
      } catch (error) {
        console.error('send_message error:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    socket.on('typing_start', (roomId: string) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
      })
    })

    socket.on('typing_stop', (roomId: string) => {
      socket.to(roomId).emit('user_stopped_typing', { userId: socket.userId })
    })

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`)
    })
  })
}
