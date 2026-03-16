import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const THEORY_PRESENT_SIMPLE = `## Present Simple

**Present Simple** використовується для опису:
- Регулярних дій та звичок
- Загальних істин та фактів
- Розкладів та програм

### Стверджувальна форма
| Особа | Форма |
|-------|-------|
| I / You / We / They | **work** |
| He / She / It | **works** (+s) |

### Приклади
- I **go** to school every day.
- She **works** at a hospital.
- They **play** football on weekends.

### Маркери часу
*always, usually, often, sometimes, never, every day*`

const THEORY_IRREGULAR_VERBS = `## Неправильні дієслова (Irregular Verbs)

Деякі дієслова не додають -ed у минулому часі. Їх потрібно запам'ятовувати.

### Топ-10 неправильних дієслів
- go → went → gone
- see → saw → seen
- come → came → come
- take → took → taken
- make → made → made
- get → got → gotten
- know → knew → known
- think → thought → thought
- find → found → found
- give → gave → given`

async function main() {
  console.log('🌱 Seeding database...')

  // Remove previous seed data (cascade deletes modules, lessons, tests, etc.)
  const seedCourseIds = ['seed-course-1', 'seed-course-2', 'seed-course-3']
  await prisma.storePurchase.deleteMany()
  await prisma.storeItem.deleteMany()
  await prisma.enrollment.deleteMany({ where: { courseId: { in: seedCourseIds } } })
  await prisma.course.deleteMany({ where: { id: { in: seedCourseIds } } })

  // Test user
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

  // Ensure profile with 1000 coins for test user
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: { coins: 1000 },
    create: {
      userId: user.id,
      coins: 1000,
    },
  })

  // Course 1: English IELTS from zero
  const course1 = await prisma.course.upsert({
    where: { id: 'seed-course-1' },
    update: {},
    create: {
      id: 'seed-course-1',
      title: 'English IELTS from zero to hero',
      description: 'Повний курс англійської для підготовки до IELTS. Від основ граматики до академічного письма.',
      level: 'BEGINNER',
      isPublished: true,
    },
  })

  const module1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'Основи граматики',
      description: 'Вивчи базові граматичні структури: часи, артиклі, прийменники.',
      orderIndex: 0,
    },
  })

  await prisma.lesson.createMany({
    data: [
      { moduleId: module1.id, title: 'Вступ до граматики', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', orderIndex: 0 },
      { moduleId: module1.id, title: 'Часи в англійській', type: 'THEORY', content: THEORY_PRESENT_SIMPLE, orderIndex: 1 },
      { moduleId: module1.id, title: 'Present Simple — відео', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=3u1fuoe0kx0', orderIndex: 2 },
      { moduleId: module1.id, title: 'Практика часів', type: 'TASK', content: '**Завдання:**\n\nПерекладіть речення англійською:\n- Я ходжу до школи щодня.\n- Вона працює в лікарні.', orderIndex: 3 },
      { moduleId: module1.id, title: 'Past Simple', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=0Ri1Tf6prOo', orderIndex: 4 },
      { moduleId: module1.id, title: 'Неправильні дієслова', type: 'THEORY', content: THEORY_IRREGULAR_VERBS, orderIndex: 5 },
    ],
  })

  const lessonTest = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Фінальний тест з граматики',
      type: 'TEST',
      orderIndex: 6,
    },
  })

  const test = await prisma.test.create({
    data: {
      lessonId: lessonTest.id,
      title: 'Present Simple Quiz',
    },
  })

  const q1 = await prisma.question.create({
    data: {
      testId: test.id,
      questionText: 'Оберіть правильну форму дієслова: She ___ to school every day.',
      orderIndex: 0,
    },
  })
  await prisma.answer.createMany({
    data: [
      { questionId: q1.id, answerText: 'go', isCorrect: false },
      { questionId: q1.id, answerText: 'goes', isCorrect: true },
      { questionId: q1.id, answerText: 'going', isCorrect: false },
      { questionId: q1.id, answerText: 'went', isCorrect: false },
    ],
  })

  const q2 = await prisma.question.create({
    data: {
      testId: test.id,
      questionText: 'They ___ football on weekends.',
      orderIndex: 1,
    },
  })
  await prisma.answer.createMany({
    data: [
      { questionId: q2.id, answerText: 'plays', isCorrect: false },
      { questionId: q2.id, answerText: 'play', isCorrect: true },
      { questionId: q2.id, answerText: 'played', isCorrect: false },
    ],
  })

  console.log('✅ Course 1:', course1.title, '— 7 lessons')

  // Course 2: Базова лексика
  const course2 = await prisma.course.upsert({
    where: { id: 'seed-course-2' },
    update: {},
    create: {
      id: 'seed-course-2',
      title: 'Базова лексика',
      description: 'Опануй 500 найуживаніших слів для повсякденного спілкування та побутових ситуацій.',
      level: 'BEGINNER',
      isPublished: true,
    },
  })

  const module2 = await prisma.module.create({
    data: {
      courseId: course2.id,
      title: 'Повсякденні слова',
      description: 'Лексика для щоденного спілкування.',
      orderIndex: 0,
    },
  })

  await prisma.lesson.createMany({
    data: [
      { moduleId: module2.id, title: 'Привітання та знайомство', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=2BHzFjLnJYo', orderIndex: 0 },
      { moduleId: module2.id, title: 'Числа та кольори', type: 'THEORY', content: '## Numbers 1-20\n\none, two, three, four, five, six, seven, eight, nine, ten...\n\n## Colours\n\nred, blue, green, yellow, black, white', orderIndex: 1 },
      { moduleId: module2.id, title: 'Сім\'я та друзі', type: 'TASK', content: 'Завдання: назвіть членів своєї сім\'ї англійською.', orderIndex: 2 },
    ],
  })

  console.log('✅ Course 2:', course2.title)

  // Course 3: Intermediate
  const course3 = await prisma.course.upsert({
    where: { id: 'seed-course-3' },
    update: {},
    create: {
      id: 'seed-course-3',
      title: 'Present & Past Tenses',
      description: 'Детальне вивчення теперішніх та минулих часів з практичними вправами.',
      level: 'INTERMEDIATE',
      isPublished: true,
    },
  })

  const module3 = await prisma.module.create({
    data: {
      courseId: course3.id,
      title: 'Складні часи',
      description: 'Perfect tenses, conditionals.',
      orderIndex: 0,
    },
  })

  await prisma.lesson.createMany({
    data: [
      { moduleId: module3.id, title: 'Present Perfect', type: 'THEORY', content: '## Present Perfect\n\nhas/have + V3\n\nВикористовується для дій, які відбулись у минулому, але пов\'язані з теперішнім.', orderIndex: 0 },
      { moduleId: module3.id, title: 'Past Perfect', type: 'VIDEO', videoUrl: 'https://www.youtube.com/watch?v=0Ri1Tf6prOo', orderIndex: 1 },
    ],
  })

  console.log('✅ Course 3:', course3.title)
  console.log('')
  // Store items
  await prisma.storeItem.createMany({
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
