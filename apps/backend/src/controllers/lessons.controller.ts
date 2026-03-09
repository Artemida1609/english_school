import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

// GET /api/lessons/:id
export const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Lesson ID required' })
      return
    }
    const lesson = await prisma.lesson.findUnique({
      where: { id },
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
    const courseId = getParam(req, 'courseId')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

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
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Lesson ID required' })
      return
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data: { title, content, videoUrl, orderIndex },
    })

    res.json(lesson)
  } catch (error) {
    console.error('UpdateLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}