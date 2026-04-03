import { Router } from 'express'
import { deleteModule, getModuleById, updateModule } from '../controllers/modules.controller'
import { syncConstructorModule } from '../controllers/constructor.controller'
import { createLesson } from '../controllers/lessons.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.put(
  '/:id/constructor',
  authenticate,
  requireRole('TEACHER', 'ADMIN'),
  syncConstructorModule,
)
router.get('/:id', getModuleById)
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), updateModule)
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), deleteModule)
router.post('/:moduleId/lessons', authenticate, requireRole('TEACHER', 'ADMIN'), createLesson)

export default router
