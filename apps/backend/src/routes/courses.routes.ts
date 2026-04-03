import { Router } from 'express'
import {
  getCourses,
  getCoursesCatalogForStaff,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getCourseEnrollments,
} from '../controllers/courses.controller'
import { createModule } from '../controllers/modules.controller'
import { publishFromConstructor } from '../controllers/constructor.controller'
import { authenticate, requireRole } from '../middleware/auth.middleware'

const router = Router()

router.get(
  '/catalog/all',
  authenticate,
  requireRole('TEACHER', 'ADMIN'),
  getCoursesCatalogForStaff,
)
router.get('/', getCourses)
router.get('/:id', getCourseById)
router.post('/:id/enroll', authenticate, enrollCourse)
router.get('/:id/enrollments', authenticate, requireRole('TEACHER', 'ADMIN'), getCourseEnrollments)
router.post('/', authenticate, requireRole('TEACHER', 'ADMIN'), createCourse)
router.put('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), updateCourse)
router.delete('/:id', authenticate, requireRole('TEACHER', 'ADMIN'), deleteCourse)
router.post(
  '/:courseId/modules/constructor',
  authenticate,
  requireRole('TEACHER', 'ADMIN'),
  publishFromConstructor,
)
router.post('/:courseId/modules', authenticate, requireRole('TEACHER', 'ADMIN'), createModule)

export default router