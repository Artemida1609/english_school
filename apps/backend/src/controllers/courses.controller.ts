import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

type CourseLevelType = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE' | 'ADVANCED'

// GET /api/courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, search } = req.query

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(level && { level: level as CourseLevelType }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: { _count: { select: { lessons: true, enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    } as any)

    res.json(courses)
  } catch (error) {
    console.error('GetCourses error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/courses/:id
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, orderIndex: true, videoUrl: true },
        },
        _count: { select: { enrollments: true } },
      },
    } as any)

    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    res.json(course)
  } catch (error) {
    console.error('GetCourseById error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/courses (TEACHER/ADMIN)
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, level, thumbnail } = req.body

    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required' })
      return
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level: (level as CourseLevelType) ?? 'BEGINNER',
        thumbnail,
      },
    } as any)

    res.status(201).json(course)
  } catch (error) {
    console.error('CreateCourse error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// PUT /api/courses/:id
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, level, thumbnail, isPublished } = req.body
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        ...(level && { level: level as CourseLevelType }),
        thumbnail,
        isPublished,
      },
    })

    res.json(course)
  } catch (error) {
    console.error('UpdateCourse error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/courses/:id/enroll
export const enrollCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const courseId = getParam(req, 'id')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    } as any)

    if (existing) {
      res.status(409).json({ message: 'Already enrolled' })
      return
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    } as any)

    res.status(201).json({ message: 'Enrolled successfully', enrollment })
  } catch (error) {
    console.error('Enroll error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/courses/:id/enrollments (TEACHER/ADMIN)
export const getCourseEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = getParam(req, 'id')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    } as any)

    res.json(enrollments)
  } catch (error) {
    console.error('GetEnrollments error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}