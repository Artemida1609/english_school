import { Router } from 'express'
import { getModuleById, updateModule } from '../controllers/modules.controller'
import { createLesson } from '../controllers/lessons.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/:id', getModuleById)
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), updateModule)
router.post('/:moduleId/lessons', authenticate, requireRole('TEACHER', 'ADMIN'), createLesson)

export default router
