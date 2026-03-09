import { Router } from 'express'
import {
  getCourses, getCourseById, createCourse, updateCourse,
  enrollCourse, getCourseEnrollments,
} from '../controllers/courses.controller'
import { createLesson } from '../controllers/lessons.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get('/', getCourses)
router.get('/:id', getCourseById)
router.post('/:id/enroll', authenticate, enrollCourse)
router.get('/:id/enrollments', authenticate, requireRole('TEACHER', 'ADMIN'), getCourseEnrollments)
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), createCourse)
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), updateCourse)
router.post('/:courseId/lessons', authenticate, requireRole('TEACHER', 'ADMIN'), createLesson)

export default router