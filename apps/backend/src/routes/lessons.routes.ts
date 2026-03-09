import { Router } from 'express'
import { getLessonById, updateLesson } from '../controllers/lessons.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/:id', authenticate, getLessonById)
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), updateLesson)

export default router