import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'

// GET /api/lessons/:id
export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        course: { select: { id: true, title: true } },
        tests: {
          include: {
            questions: {
              include: { answers: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' })
      return
    }

    res.json(lesson)
  } catch (error) {
    console.error('GetLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/courses/:courseId/lessons
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, videoUrl, orderIndex } = req.body
    const courseId = req.params.courseId

    if (!title) {
      res.status(400).json({ message: 'Title is required' })
      return
    }

    const lesson = await prisma.lesson.create({
      data: { courseId, title, content, videoUrl, orderIndex: orderIndex ?? 0 },
    })

    res.status(201).json(lesson)
  } catch (error) {
    console.error('CreateLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// PUT /api/lessons/:id
export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, videoUrl, orderIndex } = req.body

    const lesson = await prisma.lesson.update({
      where: { id: req.params.id },
      data: { title, content, videoUrl, orderIndex },
    })

    res.json(lesson)
  } catch (error) {
    console.error('UpdateLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}