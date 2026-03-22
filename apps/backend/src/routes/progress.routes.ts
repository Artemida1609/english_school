// progress.routes.ts — повна заміна
import { Router } from 'express'
import { saveProgress, getMyProgress, getModuleProgress } from '../controllers/progress.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, saveProgress)
router.get('/me', authenticate, getMyProgress)
router.get('/module/:moduleId', authenticate, getModuleProgress)

export default router