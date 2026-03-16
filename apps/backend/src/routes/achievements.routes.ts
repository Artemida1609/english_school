import { Router } from 'express'
import { getMyAchievements } from '../controllers/achievements.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authenticate, getMyAchievements)

export default router

