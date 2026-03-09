import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import coursesRoutes from './routes/courses.routes'
import modulesRoutes from './routes/modules.routes'
import lessonsRoutes from './routes/lessons.routes'
import chatRoutes from './routes/chat.routes'
import { setupSockets } from './sockets/chat.socket'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

setupSockets(io)

app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/courses', coursesRoutes)
app.use('/api/modules', modulesRoutes)
app.use('/api/lessons', lessonsRoutes)
app.use('/api/chat', chatRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 4000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔌 Socket.io ready`)
})

export { io }