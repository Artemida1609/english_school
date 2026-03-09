import { Router } from 'express'
import { getRooms, getRoomMessages, createRoom } from '../controllers/chat.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/rooms', authenticate, getRooms)
router.get('/rooms/:roomId/messages', authenticate, getRoomMessages)
router.post('/rooms', authenticate, requireRole('TEACHER', 'ADMIN'), createRoom)

export default router