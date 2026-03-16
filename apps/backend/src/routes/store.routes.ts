import { Router } from 'express'
import { getMyStore, buyItem } from '../controllers/store.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authenticate, getMyStore)
router.post('/buy', authenticate, buyItem)

export default router

