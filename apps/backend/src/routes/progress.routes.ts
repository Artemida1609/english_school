// progress.routes.ts — повна заміна
import { Router } from 'express'
import { saveProgress, getMyProgress, getModuleProgress, getProgressStats, getActivityCalendar } from '../controllers/progress.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, saveProgress)
router.get('/me', authenticate, getMyProgress)
router.get('/stats', authenticate, getProgressStats)
router.get('/activity-calendar', authenticate, getActivityCalendar)
router.get('/module/:moduleId', authenticate, getModuleProgress)

export default router