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
        module: {
          include: { course: { select: { id: true, title: true } } },
        },
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

    // Flatten for API response (lesson.module.course)
    const lessonData = lesson ? {
      ...lesson,
      course: lesson.module?.course,
      module: lesson.module ? { id: lesson.module.id, title: lesson.module.title } : null,
    } : null

    if (!lessonData) {
      res.status(404).json({ message: 'Lesson not found' })
      return
    }

    res.json(lessonData)
  } catch (error) {
    console.error('GetLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/modules/:moduleId/lessons
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, content, videoUrl, orderIndex } = req.body
    const moduleId = getParam(req, 'moduleId')
    if (!moduleId) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    if (!title) {
      res.status(400).json({ message: 'Title is required' })
      return
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        type: (type as 'VIDEO' | 'THEORY' | 'TASK' | 'TEST') ?? 'THEORY',
        content,
        videoUrl,
        orderIndex: orderIndex ?? 0,
      },
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
      data: { title, type: req.body.type, content, videoUrl, orderIndex },
    })

    res.json(lesson)
  } catch (error) {
    console.error('UpdateLesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}