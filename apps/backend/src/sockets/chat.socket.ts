import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'

interface AuthenticatedSocket extends Socket {
  userId?: string
  userName?: string
}

export const setupSockets = (io: Server): void => {
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string; name: string; email: string
      }
      socket.userId = decoded.id
      socket.userName = decoded.name || decoded.email
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ Socket connected: ${socket.id} (user: ${socket.userId})`)

    socket.on('join_room', async (roomId: string) => {
      try {
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId } })
        if (!room) {
          socket.emit('error', { message: 'Room not found' })
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
        if (!message?.trim()) return

        const saved = await prisma.message.create({
          data: {
            roomId,
            userId: socket.userId!,
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