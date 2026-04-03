import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

// GET /api/modules/:id — модуль з уроками
export const getModuleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    const module = await prisma.module.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            orderIndex: true,
            videoUrl: true,
            content: true,
          },
        },
        vocabulary: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!module) {
      res.status(404).json({ message: 'Module not found' })
      return
    }

    res.json(module)
  } catch (error) {
    console.error('GetModule error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// POST /api/courses/:courseId/modules
export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, orderIndex } = req.body
    const courseId = getParam(req, 'courseId')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    if (!title) {
      res.status(400).json({ message: 'Title is required' })
      return
    }

    const module = await prisma.module.create({
      data: { courseId, title, description, orderIndex: orderIndex ?? 0 },
    })

    res.status(201).json(module)
  } catch (error) {
    console.error('CreateModule error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// PUT /api/modules/:id
export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, orderIndex } = req.body
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    const module = await prisma.module.update({
      where: { id },
      data: { title, description, orderIndex },
    })

    res.json(module)
  } catch (error) {
    console.error('UpdateModule error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// DELETE /api/modules/:id
export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    const existing = await prisma.module.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ message: 'Module not found' })
      return
    }

    await prisma.module.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('DeleteModule error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
