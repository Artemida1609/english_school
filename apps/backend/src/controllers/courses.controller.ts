import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { CourseLevel } from '@prisma/client'

// GET /api/courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, search } = req.query

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(level && { level: level as CourseLevel }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(courses)
  } catch (error) {
    console.error('GetCourses error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/courses/:id
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, title: true, orderIndex: true, videoUrl: true },
        },
        _count: { select: { enrollments: true } },
      },
    })

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
        level: level as CourseLevel ?? CourseLevel.BEGINNER,
        thumbnail,
      },
    })

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

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        ...(level && { level: level as CourseLevel }),
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
    const courseId = req.params.id

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    if (existing) {
      res.status(409).json({ message: 'Already enrolled' })
      return
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
    })

    res.status(201).json({ message: 'Enrolled successfully', enrollment })
  } catch (error) {
    console.error('Enroll error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// GET /api/courses/:id/enrollments (TEACHER/ADMIN)
export const getCourseEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    res.json(enrollments)
  } catch (error) {
    console.error('GetEnrollments error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}