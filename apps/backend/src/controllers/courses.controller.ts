import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

type CourseLevelType = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'UPPER_INTERMEDIATE' | 'ADVANCED'

/** До 5 рядків для підписів етапів; порожнє → null */
function normalizeStageTitlesInput(input: unknown): string[] | null | undefined {
  if (input === undefined) return undefined
  if (input === null) return null
  if (!Array.isArray(input)) return undefined
  const out = input
    .slice(0, 5)
    .map((x) => (typeof x === 'string' ? x.trim().slice(0, 160) : ''))
  while (out.length > 0 && out[out.length - 1] === '') out.pop()
  return out.length > 0 ? out : null
}

// GET /api/courses
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { level, search } = req.query

    // За замовчуванням показуємо лише опубліковані. Якщо таких немає (наприклад після db push
    // без seed), повертаємо всі курси — інакше каталог і /course порожні при is_published=false.
    const publishedCount = await prisma.course.count({ where: { isPublished: true } })
    const visibility =
      publishedCount > 0 ? { isPublished: true } : {}

    const courses = await prisma.course.findMany({
      where: {
        ...visibility,
        ...(level && { level: level as CourseLevelType }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: { _count: { select: { modules: true, enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    } as any)

    res.json(courses)
  } catch (error) {
    console.error('GetCourses error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** Усі курси (включно з неопублікованими) — для конструктора / кабінету викладача */
export const getCoursesCatalogForStaff = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ isPublished: 'desc' }, { title: 'asc' }],
      include: { _count: { select: { modules: true, enrollments: true } } },
    } as any)

    res.json(courses)
  } catch (error) {
    console.error('GetCoursesCatalogForStaff error:', error)
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
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            _count: { select: { lessons: true } },
            lessons: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, title: true, type: true, orderIndex: true },
            },
          },
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
    const body = req.body as Record<string, unknown>
    const title = body.title
    const description = body.description
    const level = body.level
    const thumbnail = body.thumbnail
    const stageTitlesRaw = body.stageTitles

    if (typeof title !== 'string' || typeof description !== 'string' || !title || !description) {
      res.status(400).json({ message: 'Title and description are required' })
      return
    }

    const st = normalizeStageTitlesInput(stageTitlesRaw)
    const thumb =
      typeof thumbnail === 'string' && thumbnail.trim() !== '' ? thumbnail.trim() : null

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level: (level as CourseLevelType) ?? 'BEGINNER',
        thumbnail: thumb,
        ...(st !== undefined ? { stageTitles: st } : {}),
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
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    const body = req.body as Record<string, unknown>
    const data: Record<string, unknown> = {}
    if (typeof body.title === 'string') data.title = body.title
    if (typeof body.description === 'string') data.description = body.description
    if (typeof body.level === 'string' && body.level) data.level = body.level as CourseLevelType
    if ('thumbnail' in body) {
      if (typeof body.thumbnail === 'string') {
        data.thumbnail = body.thumbnail.trim() === '' ? null : body.thumbnail.trim()
      }
    }
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
    if ('stageTitles' in body) {
      const st = normalizeStageTitlesInput(body.stageTitles)
      data.stageTitles = st === undefined ? null : st
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({ message: 'No fields to update' })
      return
    }

    const course = await prisma.course.update({
      where: { id },
      data: data as any,
    })

    res.json(course)
  } catch (error) {
    console.error('UpdateCourse error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// DELETE /api/courses/:id — модулі та enrollments каскадом
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    await prisma.course.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('DeleteCourse error:', error)
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