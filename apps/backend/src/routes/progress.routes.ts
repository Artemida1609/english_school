import { Router } from 'express'
import { saveProgress, getMyProgress } from '../controllers/progress.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authenticate, saveProgress)
router.get('/me', authenticate, getMyProgress)

export default router
