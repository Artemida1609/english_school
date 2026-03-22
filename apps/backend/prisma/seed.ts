import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient()

const TENSE_VIDEO_URL = 'https://www.youtube.com/watch?v=3u1fuoe0kx0'

type TenseModuleSeed = {
  stage: number
  title: string
  description: string
  theory: string
  task: string
  questionText: string
  answers: { text: string; isCorrect: boolean }[]
}

async function seedTenseCourseModule(
  courseId: string,
  orderIndex: number,
  meta: TenseModuleSeed,
) {
  const mod = await prisma.module.create({
    data: {
      courseId,
      title: meta.title,
      description: meta.description,
      orderIndex,
      stage: meta.stage,
    },
  })

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: mod.id,
        title: `${meta.title} — відео`,
        type: 'VIDEO',
        videoUrl: TENSE_VIDEO_URL,
        orderIndex: 0,
      },
      {
        moduleId: mod.id,
        title: `${meta.title} — теорія`,
        type: 'THEORY',
        content: meta.theory,
        orderIndex: 1,
      },
      {
        moduleId: mod.id,
        title: `${meta.title} — практика`,
        type: 'TASK',
        content: meta.task,
        orderIndex: 2,
      },
    ],
  })

  const testLesson = await prisma.lesson.create({
    data: {
      moduleId: mod.id,
      title: `${meta.title} — тест`,
      type: 'TEST',
      orderIndex: 3,
    },
  })

  const test = await prisma.test.create({
    data: {
      lessonId: testLesson.id,
      title: `Тест: ${meta.title}`,
    },
  })

  const q = await prisma.question.create({
    data: {
      testId: test.id,
      questionText: meta.questionText,
      orderIndex: 0,
    },
  })

  await prisma.answer.createMany({
    data: meta.answers.map((a) => ({
      questionId: q.id,
      answerText: a.text,
      isCorrect: a.isCorrect,
    })),
  })
}

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

  // Course 3: Present & Past Tenses — 14 модулів × 4 уроки (VIDEO, THEORY, TASK, TEST)
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

  const tenseModules: TenseModuleSeed[] = [
    {
      stage: 1,
      title: 'Present Simple',
      description: 'Основи теперішнього простого: звички, факти, розклад.',
      theory: `## Present Simple\n\n**Форма:** V / V+s (he/she/it)\n\n### Приклади\n- I **work** here.\n- She **plays** tennis every week.`,
      task: `**Практика:** Утворіть Present Simple:\n1. Вона (жити) у Львові.\n2. Ми (не дивитися) телевізор щодня.`,
      questionText: 'Оберіть правильну форму: She ___ English twice a week.',
      answers: [
        { text: 'study', isCorrect: false },
        { text: 'studies', isCorrect: true },
        { text: 'is studying', isCorrect: false },
        { text: 'studied', isCorrect: false },
      ],
    },
    {
      stage: 1,
      title: 'Present Continuous',
      description: 'Дії «зараз» і тимчасові ситуації.',
      theory: `## Present Continuous\n\n**Форма:** am/is/are + V-ing\n\nВикористовується для дій, що відбуваються зараз або навколо теперішнього моменту.`,
      task: `**Практика:** Перекладіть: «Вони зараз готують вечерю».`,
      questionText: 'Оберіть правильне речення:',
      answers: [
        { text: 'I am understanding you now.', isCorrect: false },
        { text: 'She is reading a book at the moment.', isCorrect: true },
        { text: 'They know each other right now.', isCorrect: false },
        { text: 'He is liking coffee.', isCorrect: false },
      ],
    },
    {
      stage: 1,
      title: 'Present Simple vs Continuous',
      description: 'Коли який час обрати: звичка чи процес.',
      theory: `## Порівняння\n\n- **Simple** — звички, факти, розклад.\n- **Continuous** — дія в процесі, тимчасуваність.`,
      task: `**Практика:** У кожному реченні визначте: Simple чи Continuous.\n- I usually drink coffee at 9 AM.\n- Look — it is raining!`,
      questionText: 'What ___ you ___ right now?',
      answers: [
        { text: 'do / do', isCorrect: false },
        { text: 'are / doing', isCorrect: true },
        { text: 'does / do', isCorrect: false },
        { text: 'is / doing', isCorrect: false },
      ],
    },
    {
      stage: 2,
      title: 'Present Perfect',
      description: 'Досвід, результат, дії, що ще тривають.',
      theory: `## Present Perfect\n\n**Форма:** have/has + V3\n\nЗв'язок минулого з теперішнім: досвід, результат, незавершённість.`,
      task: `**Практика:** Складіть речення з **ever / never** про подорожі.`,
      questionText: 'I ___ never ___ to Paris.',
      answers: [
        { text: 'have / been', isCorrect: true },
        { text: 'was / been', isCorrect: false },
        { text: 'have / gone', isCorrect: false },
        { text: 'did / go', isCorrect: false },
      ],
    },
    {
      stage: 2,
      title: 'Present Perfect Continuous',
      description: 'Тривалість дії до теперішнього моменту.',
      theory: `## Present Perfect Continuous\n\n**Форма:** have/has been + V-ing\n\nАкцент на **тривалості** (for/since).`,
      task: `**Практика:** Утворіть речення: «Вона вчить іспанську два роки» (акцент на тривалості).`,
      questionText: 'She ___ for two hours.',
      answers: [
        { text: 'has worked', isCorrect: false },
        { text: 'has been working', isCorrect: true },
        { text: 'works', isCorrect: false },
        { text: 'is working', isCorrect: false },
      ],
    },
    {
      stage: 2,
      title: 'Present vs Past — контрасти',
      description: 'Present Perfect / Past Simple: ключові відмінності.',
      theory: `## Контрасти\n\n- **Past Simple** — дія в **закінченому** минулому (yesterday, in 2019).\n- **Present Perfect** — зв'язок з **тепер** (yet, already, ever).`,
      task: `**Практика:** Оберіть час: «I ___ (see) him yesterday» vs «I ___ (see) him today».`,
      questionText: 'I ___ my keys. I can\'t find them anywhere.',
      answers: [
        { text: 'lost', isCorrect: false },
        { text: 'have lost', isCorrect: true },
        { text: 'lose', isCorrect: false },
        { text: 'am losing', isCorrect: false },
      ],
    },
    {
      stage: 3,
      title: 'Past Simple',
      description: 'Завершені дії в минулому.',
      theory: `## Past Simple\n\n**Форма:** V2 / V2+ed для правильних дієслів.\n\nМаркери: yesterday, last week, ago, in 2010.`,
      task: `**Практика:** Утворіть Past Simple: go → ___, see → ___.`,
      questionText: 'They ___ to the cinema last night.',
      answers: [
        { text: 'go', isCorrect: false },
        { text: 'went', isCorrect: true },
        { text: 'gone', isCorrect: false },
        { text: 'going', isCorrect: false },
      ],
    },
    {
      stage: 3,
      title: 'Past Continuous',
      description: 'Тривала дія в минулому і фон для іншої події.',
      theory: `## Past Continuous\n\n**Форма:** was/were + V-ing\n\nЧасто з **when** + Past Simple: *I was reading when the phone rang.*`,
      task: `**Практика:** Сполучіть: While I ___, the lights ___.`,
      questionText: 'What ___ you ___ at 8 PM yesterday?',
      answers: [
        { text: 'did / do', isCorrect: false },
        { text: 'were / doing', isCorrect: true },
        { text: 'are / doing', isCorrect: false },
        { text: 'was / do', isCorrect: false },
      ],
    },
    {
      stage: 3,
      title: 'used to & would',
      description: 'Минулі звички та повторювані дії.',
      theory: `## used to / would\n\n- **used to + V** — минулі звички та стани.\n- **would + V** — повторювані дії в минулому (не для станів).`,
      task: `**Практика:** Утворіть речення про дитячу звичку з **used to**.`,
      questionText: 'When I was a child, I ___ afraid of dogs.',
      answers: [
        { text: 'used to be', isCorrect: true },
        { text: 'would be', isCorrect: false },
        { text: 'was be', isCorrect: false },
        { text: 'use to be', isCorrect: false },
      ],
    },
    {
      stage: 4,
      title: 'Past Perfect',
      description: 'Дія «раніше за іншу» в минулому.',
      theory: `## Past Perfect\n\n**Форма:** had + V3\n\nПоказує, що одна дія **завершилась до** іншої в минулому.`,
      task: `**Практика:** Сполучіть: After she ___ (finish) work, she ___ (go) home.`,
      questionText: 'By the time we arrived, the film ___.',
      answers: [
        { text: 'started', isCorrect: false },
        { text: 'had started', isCorrect: false },
        { text: 'had already started', isCorrect: true },
        { text: 'was starting', isCorrect: false },
      ],
    },
    {
      stage: 4,
      title: 'Past Perfect Continuous',
      description: 'Тривалість до певного моменту в минулому.',
      theory: `## Past Perfect Continuous\n\n**Форма:** had been + V-ing\n\nАкцент на **тривалості** до іншої події в минулому.`,
      task: `**Практика:** Утворіть: «Він три години чекав, перш ніж прийшов автобус».`,
      questionText: 'She was tired because she ___ all day.',
      answers: [
        { text: 'had been working', isCorrect: true },
        { text: 'has been working', isCorrect: false },
        { text: 'worked', isCorrect: false },
        { text: 'was working', isCorrect: false },
      ],
    },
    {
      stage: 4,
      title: 'Змішані часи в контексті',
      description: 'Past Simple / Continuous / Perfect у звичайних ситуаціях.',
      theory: `## Змішані часи\n\nПорівняйте: *He finished*, *he had finished*, *he was finishing* — різний фокус на часі.`,
      task: `**Практика:** У короткому тексті підкресліть дієслова й визначте час.`,
      questionText: 'While I ___ breakfast, the phone ___.',
      answers: [
        { text: 'had / rang', isCorrect: false },
        { text: 'was having / rang', isCorrect: true },
        { text: 'have / ringed', isCorrect: false },
        { text: 'am having / rings', isCorrect: false },
      ],
    },
    {
      stage: 5,
      title: 'Підсумок та типові помилки',
      description: 'Часті плутанини між часами та як їх уникати.',
      theory: `## Типові помилки\n\n- since/for з Present Perfect, не Past Simple.\n- Stative verbs (know, like) — обережно з Continuous.\n- Послідовність часів у reported speech.`,
      task: `**Практика:** Виправте помилку: *I am knowing him for years.*`,
      questionText: 'Which sentence is correct?',
      answers: [
        { text: 'I am knowing you since 2020.', isCorrect: false },
        { text: 'I have known you since 2020.', isCorrect: true },
        { text: 'I know you since 2020.', isCorrect: false },
        { text: 'I knew you since 2020.', isCorrect: false },
      ],
    },
    {
      stage: 5,
      title: 'Змішані часи в тексті',
      description: 'Довгі тексти: відстеження часових ліній.',
      theory: `## Тексти\n\nПозначайте маркери часу (when, before, while) і визначайте **точку відліку** для кожного часу.`,
      task: `**Практика:** Прочитайте абзац і випишіть усі дієслова з часом.`,
      questionText: 'Choose the best option: I ___ this book before, so I ___ the ending.',
      answers: [
        { text: 'read / had known', isCorrect: false },
        { text: 'had read / knew', isCorrect: true },
        { text: 'have read / knew', isCorrect: false },
        { text: 'read / knew', isCorrect: false },
      ],
    },
  ]

  for (let i = 0; i < tenseModules.length; i++) {
    await seedTenseCourseModule(course3.id, i, tenseModules[i])
  }

  console.log('✅ Course 3:', course3.title, '—', tenseModules.length, 'modules × 4 lessons')
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
