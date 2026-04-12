// prisma/seeds/module1.ts — викликається з prisma/seed.ts

import type { PrismaClient } from '@prisma/client';

export async function seedModule1(prisma: PrismaClient) {
  console.log('🌱 Seeding Module 1: Personal work identity...');

  await prisma.vocabulary.deleteMany({
    where: { moduleId: 'module-1-personal-work-identity' },
  });

  // ─────────────────────────────────────────────
  // 1. Знайти існуючий курс
  // ─────────────────────────────────────────────
  const course = await prisma.course.upsert({
    where: { id: 'course-level-1-business-english' },
    update: {},
    create: {
      id: 'course-level-1-business-english',
      title: 'Level 1 Business English',
      description: 'Business English for professionals',
      level: 'BEGINNER',
      isPublished: true,
    },
  });

  if (!course) {
    throw new Error(
      '❌ Курс не знайдено. Перевір назву курсу у фільтрі вище.'
    );
  }

  console.log(`✅ Знайдено курс: "${course.title}" (id: ${course.id})`);

  // ─────────────────────────────────────────────
  // 2. Створити Module 1
  // ─────────────────────────────────────────────
  const module1 = await prisma.module.upsert({
    where: { id: 'module-1-personal-work-identity' },
    update: {
      title: 'Personal work identity',
      description: 'Grammar, collocations, jobs & roles (Business English Level 1)',
      orderIndex: 0,
      stage: 1,
    },
    create: {
      id: 'module-1-personal-work-identity',
      title: 'Personal work identity',
      description: 'Grammar, collocations, jobs & roles (Business English Level 1)',
      orderIndex: 0,
      stage: 1,
      courseId: course.id,
    },
  });

  console.log(`✅ Модуль створено: "${module1.title}"`);

  // ─────────────────────────────────────────────
  // 3. Lesson 1 — THEORY: Grammar "to be"
  // ─────────────────────────────────────────────
  const lesson1Content = `
<h2>The verb "to be"</h2>

<p><strong>Definition:</strong> The verb <strong>"to be"</strong> is one of the most important and most frequently used verbs in English. It is used to describe:</p>
<ul>
  <li>people and things: <em>This is our new client.</em></li>
  <li>current states: <em>The team is under pressure.</em></li>
  <li>qualities (adjectives): <em>Our product is innovative.</em></li>
  <li>opinions: <em>I think that this strategy is effective.</em></li>
  <li>position/location and time: <em>The meeting is at 10 a.m.</em></li>
  <li>someone's job/position: <em>She is the CEO of the company.</em></li>
</ul>

<h3>Affirmative forms</h3>
<table>
  <thead><tr><th>Person</th><th>Verb</th><th>Short form</th></tr></thead>
  <tbody>
    <tr><td>I</td><td>am</td><td>I'm</td></tr>
    <tr><td>you</td><td>are</td><td>you're</td></tr>
    <tr><td>he</td><td>is</td><td>he's</td></tr>
    <tr><td>she</td><td>is</td><td>she's</td></tr>
    <tr><td>it</td><td>is</td><td>it's</td></tr>
    <tr><td>we</td><td>are</td><td>we're</td></tr>
    <tr><td>they</td><td>are</td><td>they're</td></tr>
  </tbody>
</table>

<h3>Negative forms</h3>
<table>
  <thead><tr><th>Person</th><th>Verb</th><th>Short form</th></tr></thead>
  <tbody>
    <tr><td>I</td><td>am not</td><td>I'm not</td></tr>
    <tr><td>you</td><td>are not</td><td>you aren't</td></tr>
    <tr><td>he</td><td>is not</td><td>he isn't</td></tr>
    <tr><td>she</td><td>is not</td><td>she isn't</td></tr>
    <tr><td>it</td><td>is not</td><td>it isn't</td></tr>
    <tr><td>we</td><td>are not</td><td>we aren't</td></tr>
    <tr><td>they</td><td>are not</td><td>they aren't</td></tr>
  </tbody>
</table>

<h3>Question forms</h3>
<table>
  <thead><tr><th>Person</th><th>Question</th><th>Negative answer</th><th>Affirmative answer</th></tr></thead>
  <tbody>
    <tr><td>I</td><td>Am I...?</td><td>No, I am not</td><td>Yes, I am</td></tr>
    <tr><td>you</td><td>Are you...?</td><td>No, you aren't</td><td>Yes, you are</td></tr>
    <tr><td>he</td><td>Is he...?</td><td>No, he isn't</td><td>Yes, he is</td></tr>
    <tr><td>she</td><td>Is she...?</td><td>No, she isn't</td><td>Yes, she is</td></tr>
    <tr><td>it</td><td>Is it...?</td><td>No, it isn't</td><td>Yes, it is</td></tr>
    <tr><td>we</td><td>Are we...?</td><td>No, we aren't</td><td>Yes, we are</td></tr>
    <tr><td>they</td><td>Are they...?</td><td>No, they aren't</td><td>Yes, they are</td></tr>
  </tbody>
</table>

<h3>Common fixed expressions</h3>
<ul>
  <li>there is / there are</li>
  <li>that is</li>
  <li>here is</li>
</ul>
      `.trim()

  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-grammar-to-be' },
    update: {
      title: 'Grammar: "to be"',
      type: 'THEORY',
      orderIndex: 0,
      moduleId: module1.id,
      content: lesson1Content,
    },
    create: {
      id: 'lesson-m1-grammar-to-be',
      title: 'Grammar: "to be"',
      type: 'THEORY',
      orderIndex: 0,
      moduleId: module1.id,
      content: lesson1Content,
    },
  })

  console.log(`✅ Lesson 1 створено: "${lesson1.title}"`);

  // ─────────────────────────────────────────────
  // 4. Lesson 2 — THEORY: Grammar "to have / have got"
  // ─────────────────────────────────────────────
  const lesson2Content = `
<h2>The verb "to have / have got"</h2>

<p><strong>Definition:</strong> The verb <strong>"have got"</strong> is used in English to show what someone possesses, owns, or has in their life. It can also describe:</p>
<ul>
  <li>relationships: He <strong>has got</strong> a strong partnership with the client.</li>
  <li>possessions: We <strong>have got</strong> all the necessary documents for the audit.</li>
  <li>features: Our office <strong>has got</strong> modern equipment.</li>
  <li>illnesses: He <strong>has got</strong> a cold, so he won't attend the meeting.</li>
  <li>appointments: We <strong>have got</strong> three deadlines to meet this week.</li>
</ul>

<p>We can also use <strong>have + noun</strong> (but not "have got") to talk about some activities:</p>
<ul>
  <li>hygiene and appearance: She <strong>has a professional haircut</strong> suitable for corporate events.</li>
  <li>food and drink: We <strong>have a coffee break</strong> at 10:30 a.m.</li>
  <li>experiences: They <strong>have a training session</strong> on project management.</li>
  <li>special events: She <strong>has a presentation</strong> scheduled for next week.</li>
  <li>activity (or lack of): He <strong>has no time</strong> for extra tasks this week.</li>
  <li>communication: I <strong>have a phone call</strong> with the client at 3 p.m.</li>
</ul>

<h3>Tense forms of "have got"</h3>
<table>
  <thead><tr><th>Tense</th><th>Positive</th><th>Negative</th><th>Question</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Present</strong></td>
      <td>I/you/we/they <strong>have got</strong> + object<br>He/she/it <strong>has got</strong> + object</td>
      <td>I/you/we/they <strong>have not got</strong> + object<br>He/she/it <strong>has not got</strong> + object</td>
      <td><strong>Have</strong> I/you/we/they <strong>got</strong> + object?<br><strong>Has</strong> he/she/it <strong>got</strong> + object?</td>
    </tr>
    <tr>
      <td><strong>Past</strong></td>
      <td>I/you/we/they <strong>had got</strong> + object<br>He/she/it <strong>had got</strong> + object</td>
      <td>I/you/we/they <strong>had not got</strong> + object<br>He/she/it <strong>had not got</strong> + object</td>
      <td><strong>Had</strong> I/you/we/they <strong>got</strong> + object?<br><strong>Had</strong> he/she/it <strong>got</strong> + object?</td>
    </tr>
    <tr>
      <td><strong>Future</strong></td>
      <td>I/you/we/they <strong>will have got</strong> + object<br>He/she/it <strong>will have got</strong> + object</td>
      <td>I/you/we/they <strong>will not have got</strong> + object<br>He/she/it <strong>will not have got</strong> + object</td>
      <td><strong>Will</strong> I/you/we/they <strong>have got</strong> + object?<br><strong>Will</strong> he/she/it <strong>have got</strong> + object?</td>
    </tr>
  </tbody>
</table>

<h3>Examples</h3>
<p><strong>Positive:</strong></p>
<ul>
  <li>I / You / We / They <strong>have got</strong> a meeting this afternoon.</li>
  <li>He / She / It <strong>has got</strong> the client's approval.</li>
</ul>
<p><strong>Negative:</strong></p>
<ul>
  <li>I / You / We / They <strong>haven't got</strong> the updated schedule yet.</li>
  <li>He / She / It <strong>hasn't got</strong> approval from the board.</li>
</ul>
<p><strong>Questions:</strong></p>
<ul>
  <li><strong>Have</strong> I / you / we / they <strong>got</strong> the contract ready?</li>
  <li><strong>Has</strong> he / she / it <strong>got</strong> the final report?</li>
</ul>
      `.trim()

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-grammar-to-have' },
    update: {
      title: 'Grammar: "to have / have got"',
      type: 'THEORY',
      orderIndex: 1,
      moduleId: module1.id,
      content: lesson2Content,
    },
    create: {
      id: 'lesson-m1-grammar-to-have',
      title: 'Grammar: "to have / have got"',
      type: 'THEORY',
      orderIndex: 1,
      moduleId: module1.id,
      content: lesson2Content,
    },
  })

  console.log(`✅ Lesson 2 створено: "${lesson2.title}"`);

  // ─────────────────────────────────────────────
  // 5. Lesson 3 — TASK: Vocabulary "to be" collocations
  // ─────────────────────────────────────────────
  const lesson3 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-vocab-to-be' },
    update: {},
    create: {
      id: 'lesson-m1-vocab-to-be',
      title: 'Vocabulary: "to be" collocations',
      type: 'TASK',
      orderIndex: 2,
      moduleId: module1.id,
      content: null,
    },
  });

  console.log(`✅ Lesson 3 створено: "${lesson3.title}"`);

  // ─────────────────────────────────────────────
  // 6. Lesson 4 — TASK: Vocabulary "to have" collocations
  // ─────────────────────────────────────────────
  const lesson4 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-vocab-to-have' },
    update: {},
    create: {
      id: 'lesson-m1-vocab-to-have',
      title: 'Vocabulary: "to have" collocations',
      type: 'TASK',
      orderIndex: 3,
      moduleId: module1.id,
      content: null,
    },
  });

  console.log(`✅ Lesson 4 створено: "${lesson4.title}"`);

  // ─────────────────────────────────────────────
  // 7. Lesson 5 — TASK: Jobs & Roles vocabulary
  // ─────────────────────────────────────────────
  const lesson5 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-vocab-jobs' },
    update: {},
    create: {
      id: 'lesson-m1-vocab-jobs',
      title: 'Vocabulary: Jobs, Roles & Industries',
      type: 'TASK',
      orderIndex: 4,
      moduleId: module1.id,
      content: null,
    },
  });

  console.log(`✅ Lesson 5 створено: "${lesson5.title}"`);

  console.log('ℹ️ Vocabulary-картки для Module 1 у цьому seed вимкнені.');
  console.log('\n🎉 Module 1 seed завершено!');
  console.log('   📘 Уроки: 5');
  console.log('   📚 Vocabulary записів: 0');
}