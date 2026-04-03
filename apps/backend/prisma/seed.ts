import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

import { seedModule1 } from './seeds/module1'
import { seedModule1Extension } from './seeds/module1_extension'

dotenv.config()
const prisma = new PrismaClient()

const SEED_COURSE_IDS = ['seed-course-1', 'seed-course-2', 'seed-course-3'] as const
const BUSINESS_COURSE_ID = 'course-level-1-business-english'

async function main() {
  console.log('🌱 Seeding database...')

  const coursesToDelete = await prisma.course.findMany({
    where: { id: { in: [...SEED_COURSE_IDS] } },
    include: {
      modules: {
        include: {
          lessons: {
            include: { progress: true },
          },
        },
      },
    },
  })

  const hasStudentProgress = coursesToDelete.some((course) =>
    course.modules.some((mod) => mod.lessons.some((lesson) => lesson.progress.length > 0)),
  )

  if (hasStudentProgress) {
    console.log(
      '⚠️  Тестові курси мають прогрес студентів. Видалення курсів пропущено, щоб не втратити дані.',
    )
  } else {
    await prisma.enrollment.deleteMany({
      where: { courseId: { in: [...SEED_COURSE_IDS] } },
    })
    await prisma.course.deleteMany({
      where: { id: { in: [...SEED_COURSE_IDS] } },
    })
    console.log('✅ Видалено тестові курси:', SEED_COURSE_IDS.join(', '))
  }

  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      passwordHash: hashedPassword,
      name: 'Test Student',
      role: 'STUDENT',
    },
  })
  console.log('✅ User:', user.email)

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: { coins: 1000 },
    create: {
      userId: user.id,
      coins: 1000,
    },
  })

  await seedModule1(prisma)
  await seedModule1Extension(prisma)

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: BUSINESS_COURSE_ID } },
    update: {},
    create: { userId: user.id, courseId: BUSINESS_COURSE_ID },
  })
  console.log('✅ Тестовий студент записаний на курс:', BUSINESS_COURSE_ID)

  await prisma.storeItem.createMany({
    skipDuplicates: true,
    data: [
      {
        key: 'xp-boost-x2',
        title: 'XP Boost ×2',
        description: 'Подвій XP за всі завдання на 24 години',
        price: 50,
        icon: '⚡',
      },
      {
        key: 'freeze-streak',
        title: 'Заморозка стріку',
        description: 'Збережи свій стрік якщо пропустив день',
        price: 30,
        icon: '❄️',
      },
      {
        key: 'dark-theme',
        title: 'Темна тема',
        description: 'Переключи інтерфейс у темний режим',
        price: 100,
        icon: '🎨',
      },
      {
        key: 'gold-profile',
        title: 'Золотий профіль',
        description: 'Золота рамка та значок на профілі',
        price: 200,
        icon: '🏆',
      },
      {
        key: 'unlimited-hints',
        title: 'Безліміт підказок',
        description: 'Необмежені підказки протягом тижня',
        price: 80,
        icon: '📖',
      },
      {
        key: 'turbo-mode',
        title: 'Турбо режим',
        description: 'Пропускай рекламу та паузи між уроками',
        price: 120,
        icon: '🚀',
      },
      {
        key: 'avatar-reroll',
        title: 'Перегенерація аватарки',
        description: 'Зміни свій Multiavatar на новий випадковий стиль',
        price: 50,
        icon: '🙂',
      },
    ],
  })

  console.log('')
  console.log('🎉 Seed completed!')
  console.log('📧 Test user: student@test.com / password123')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
