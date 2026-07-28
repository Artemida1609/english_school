import { Response } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'
import { AuthRequest } from '../middleware/auth.middleware'
import { getParam } from '../utils/params'

type AnswerDto = { text: string; isCorrect: boolean }
type QuestionDto = { questionText: string; answers: AnswerDto[] }

type ConstructorBody = {
  title: string
  description?: string
  orderIndex?: number
  stage?: number
  theoryHtml: string
  taskMarkdown?: string
  testQuestions?: QuestionDto[]
  /** JSON документа конструктора (version, title, blocks) для повторного відкриття в редакторі */
  scenarioJson?: string | null
}

function clampCourseStage(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(x)) return 1
  return Math.min(5, Math.max(1, Math.round(x)))
}

const EMPTY_THEORY_PLACEHOLDER =
  '<p class="text-slate-500">Практичний модуль — теорія відсутня.</p>'

function validateConstructorBody(body: ConstructorBody): string | null {
  if (!body.title?.trim()) return 'Title is required'
  if (body.theoryHtml == null) return 'theoryHtml is required'
  if (body.scenarioJson != null && body.scenarioJson.length > 2_500_000) {
    return 'scenarioJson is too large'
  }
  if (body.testQuestions) {
    for (const q of body.testQuestions) {
      if (!q.questionText?.trim()) return 'Each test question needs questionText'
      if (!q.answers?.length) return 'Each question needs answers'
      const correct = q.answers.filter((a) => a.isCorrect)
      if (correct.length !== 1) return 'Each question must have exactly one correct answer'
    }
  }
  return null
}

async function createLessonsForModule(
  tx: Prisma.TransactionClient,
  moduleId: string,
  moduleTitle: string,
  data: ConstructorBody,
  startOrder: number,
): Promise<void> {
  let oi = startOrder
  const theoryContent = data.theoryHtml?.trim() || EMPTY_THEORY_PLACEHOLDER
  await tx.lesson.create({
    data: {
      moduleId,
      title: 'Теорія',
      type: 'THEORY',
      content: theoryContent,
      orderIndex: oi++,
    },
  })

  const task = data.taskMarkdown?.trim()
  if (task) {
    await tx.lesson.create({
      data: {
        moduleId,
        title: 'Вправи',
        type: 'TASK',
        content: task,
        orderIndex: oi++,
      },
    })
  }

  const questions = data.testQuestions?.filter((q) => q.answers?.length) ?? []
  if (questions.length > 0) {
    const testLesson = await tx.lesson.create({
      data: {
        moduleId,
        title: 'Тест',
        type: 'TEST',
        orderIndex: oi++,
      },
    })
    const test = await tx.test.create({
      data: { lessonId: testLesson.id, title: `Тест: ${moduleTitle}` },
    })
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const question = await tx.question.create({
        data: { testId: test.id, questionText: q.questionText.trim(), orderIndex: i },
      })
      for (const a of q.answers) {
        await tx.answer.create({
          data: {
            questionId: question.id,
            answerText: a.text.trim(),
            isCorrect: a.isCorrect,
          },
        })
      }
    }
  }
}

/** POST /api/courses/:courseId/modules/constructor */
export const publishFromConstructor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = getParam(req, 'courseId')
    if (!courseId) {
      res.status(400).json({ message: 'Course ID required' })
      return
    }

    const body = req.body as ConstructorBody
    const err = validateConstructorBody(body)
    if (err) {
      res.status(400).json({ message: err })
      return
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const last = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    })
    const nextOrder =
      typeof body.orderIndex === 'number' ? body.orderIndex : (last?.orderIndex ?? -1) + 1

    const moduleRow = await prisma.$transaction(async (tx) => {
      const mod = await tx.module.create({
        data: {
          courseId,
          title: body.title.trim(),
          description: body.description?.trim() ?? '',
          orderIndex: nextOrder,
          stage: clampCourseStage(body.stage ?? 1),
          constructorJson: body.scenarioJson?.trim() || null,
        },
      })
      await createLessonsForModule(tx, mod.id, mod.title, body, 0)
      return mod
    })

    res.status(201).json(moduleRow)
  } catch (error) {
    console.error('publishFromConstructor:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** PUT /api/modules/:id/constructor — замінити уроки модуля (теорія / вправи / тест) */
export const syncConstructorModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParam(req, 'id')
    if (!id) {
      res.status(400).json({ message: 'Module ID required' })
      return
    }

    const body = req.body as ConstructorBody
    const err = validateConstructorBody(body)
    if (err) {
      res.status(400).json({ message: err })
      return
    }

    const existing = await prisma.module.findUnique({ where: { id } })
    if (!existing) {
      res.status(404).json({ message: 'Module not found' })
      return
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({ where: { moduleId: id } })
      const mod = await tx.module.update({
        where: { id },
        data: {
          title: body.title.trim(),
          description: body.description?.trim() ?? existing.description ?? '',
          constructorJson: body.scenarioJson != null ? body.scenarioJson.trim() || null : undefined,
          ...(typeof body.orderIndex === 'number' ? { orderIndex: body.orderIndex } : {}),
          ...(typeof body.stage === 'number' ? { stage: clampCourseStage(body.stage) } : {}),
        },
      })
      await createLessonsForModule(tx, mod.id, mod.title, body, 0)
      return mod
    })

    res.json(updated)
  } catch (error) {
    console.error('syncConstructorModule:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
