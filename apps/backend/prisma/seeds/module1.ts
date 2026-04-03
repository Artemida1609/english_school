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
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-grammar-to-be' },
    update: {},
    create: {
      id: 'lesson-m1-grammar-to-be',
      title: 'Grammar: "to be"',
      type: 'THEORY',
      orderIndex: 0,
      moduleId: module1.id,
      content: `
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
      `.trim(),
    },
  });

  console.log(`✅ Lesson 1 створено: "${lesson1.title}"`);

  // ─────────────────────────────────────────────
  // 4. Lesson 2 — THEORY: Grammar "to have / have got"
  // ─────────────────────────────────────────────
  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-m1-grammar-to-have' },
    update: {},
    create: {
      id: 'lesson-m1-grammar-to-have',
      title: 'Grammar: "to have / have got"',
      type: 'THEORY',
      orderIndex: 1,
      moduleId: module1.id,
      content: `
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
      `.trim(),
    },
  });

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

  // ─────────────────────────────────────────────
  // 8. Vocabulary — "to be" collocations (50 виразів)
  // ─────────────────────────────────────────────
  console.log('📚 Seeding vocabulary: "to be" collocations...');

  const toBeCollocations = [
    { expression: 'to be responsible for', transcription: '/tə bi rɪˈspɒnsəbl fɔːr/', translation: 'бути відповідальним за', example: 'She is responsible for the marketing strategy.' },
    { expression: 'to be in charge of', transcription: '/tə bi ɪn ʧɑːʤ ɒv/', translation: 'керувати, відповідати за', example: 'He is in charge of the sales department.' },
    { expression: 'to be committed to', transcription: '/tə bi kəˈmɪtɪd tuː/', translation: 'бути відданим чомусь', example: 'The company is committed to sustainable growth.' },
    { expression: 'to be focused on', transcription: '/tə bi ˈfəʊkəst ɒn/', translation: 'зосереджуватися на', example: 'The team is focused on increasing productivity.' },
    { expression: 'to be entitled to', transcription: '/tə bi ɪnˈtaɪtld tuː/', translation: 'мати право на', example: 'Employees are entitled to annual leave.' },
    { expression: 'to be available for', transcription: '/tə bi əˈveɪləbl fɔːr/', translation: 'бути доступним для', example: 'She is available for a meeting at 3 PM.' },
    { expression: 'to be based in', transcription: '/tə bi beɪst ɪn/', translation: 'базуватися у', example: 'The headquarters is based in London.' },
    { expression: 'to be subject to', transcription: '/tə bi ˈsʌbdʒɪkt tuː/', translation: 'підлягати чомусь', example: 'All contracts are subject to approval.' },
    { expression: 'to be known for', transcription: '/tə bi nəʊn fɔːr/', translation: 'бути відомим за', example: 'Our firm is known for excellent customer support.' },
    { expression: 'to be open to', transcription: '/tə bi ˈəʊpən tuː/', translation: 'бути відкритим до', example: 'The company is open to new partnerships.' },
    { expression: 'to be interested in', transcription: '/tə bi ˈɪntrəstɪd ɪn/', translation: 'цікавитися', example: 'We are interested in investing in new technologies.' },
    { expression: 'to be suitable for', transcription: '/tə bi ˈsuːtəbl fɔːr/', translation: 'підходити для', example: 'This software is suitable for large corporations.' },
    { expression: 'to be dependent on', transcription: '/tə bi dɪˈpɛndənt ɒn/', translation: 'залежати від', example: 'Our profits are dependent on market conditions.' },
    { expression: 'to be consistent with', transcription: '/tə bi kənˈsɪstənt wɪð/', translation: 'відповідати чомусь', example: 'Our strategy must be consistent with company values.' },
    { expression: 'to be concerned with', transcription: '/tə bi kənˈsɜːnd wɪð/', translation: 'мати справу з', example: 'The manager is concerned with budget allocation.' },
    { expression: 'to be effective in', transcription: '/tə bi ɪˈfɛktɪv ɪn/', translation: 'бути ефективним у', example: 'He is effective in managing client relations.' },
    { expression: 'to be influential in', transcription: '/tə bi ɪnˈfluːənʃəl ɪn/', translation: 'мати вплив на', example: 'She is influential in decision-making processes.' },
    { expression: 'to be flexible with', transcription: '/tə bi ˈflɛksəbl wɪð/', translation: 'бути гнучким у', example: 'We are flexible with deadlines.' },
    { expression: 'to be compatible with', transcription: '/tə bi kəmˈpætəbl wɪð/', translation: 'сумісний з', example: 'This software is compatible with most operating systems.' },
    { expression: 'to be aligned with', transcription: '/tə bi əˈlaɪnd wɪð/', translation: 'узгоджений з', example: 'Our goals must be aligned with the corporate vision.' },
    { expression: 'to be relevant to', transcription: '/tə bi ˈrɛlɪvənt tuː/', translation: 'бути актуальним для', example: 'This report is relevant to the current market trends.' },
    { expression: 'to be efficient in', transcription: '/tə bi ɪˈfɪʃənt ɪn/', translation: 'бути ефективним у', example: 'She is efficient in handling multiple projects.' },
    { expression: 'to be capable of', transcription: '/tə bi ˈkeɪpəbl ɒv/', translation: 'бути здатним на', example: 'He is capable of managing large teams.' },
    { expression: 'to be proactive in', transcription: '/tə bi ˈprəʊæktɪv ɪn/', translation: 'бути активним у', example: 'The team is proactive in solving customer issues.' },
    { expression: 'to be accountable for', transcription: '/tə bi əˈkaʊntəbl fɔːr/', translation: 'нести відповідальність за', example: 'Managers are accountable for results.' },
    { expression: 'to be adaptable to', transcription: '/tə bi əˈdæptəbl tuː/', translation: 'бути здатним адаптуватися до', example: 'The team is adaptable to new market trends.' },
    { expression: 'to be reliable in', transcription: '/tə bi rɪˈlaɪəbl ɪn/', translation: 'бути надійним у', example: 'He is reliable in meeting deadlines.' },
    { expression: 'to be innovative in', transcription: '/tə bi ˈɪnəveɪtɪv ɪn/', translation: 'бути інноваційним у', example: 'The company is innovative in product design.' },
    { expression: 'to be strategic in', transcription: '/tə bi strəˈtiːʤɪk ɪn/', translation: 'бути стратегічним у', example: 'She is strategic in planning company growth.' },
    { expression: 'to be decisive in', transcription: '/tə bi dɪˈsaɪsɪv ɪn/', translation: 'бути рішучим у', example: 'He is decisive in business negotiations.' },
    { expression: 'to be motivated by', transcription: '/tə bi ˈməʊtɪveɪtɪd baɪ/', translation: 'бути мотивованим чимось', example: 'Employees are motivated by recognition and rewards.' },
    { expression: 'to be supportive of', transcription: '/tə bi səˈpɔːtɪv ɒv/', translation: 'підтримувати', example: 'She is supportive of new initiatives.' },
    { expression: 'to be transparent about', transcription: '/tə bi trænsˈpærənt əˈbaʊt/', translation: 'бути прозорим щодо', example: 'The company is transparent about its financials.' },
    { expression: 'to be ethical in', transcription: '/tə bi ˈɛθɪkəl ɪn/', translation: 'діяти етично', example: 'Leaders must be ethical in all business practices.' },
    { expression: 'to be credible in', transcription: '/tə bi ˈkrɛdɪbl ɪn/', translation: 'бути авторитетним у', example: 'She is credible in financial forecasting.' },
    { expression: 'to be influential with', transcription: '/tə bi ɪnˈfluːənʃəl wɪð/', translation: 'мати вплив на', example: 'He is influential with key stakeholders.' },
    { expression: 'to be attentive to', transcription: '/tə bi əˈtɛntɪv tuː/', translation: 'уважно ставитися до', example: 'Managers are attentive to employee needs.' },
    { expression: 'to be competitive in', transcription: '/tə bi kəmˈpɛtɪtɪv ɪn/', translation: 'бути конкурентоспроможним у', example: 'The company is competitive in the software market.' },
    { expression: 'to be reliable for', transcription: '/tə bi rɪˈlaɪəbl fɔː/', translation: 'бути надійним для', example: 'The vendor is reliable for timely deliveries.' },
    { expression: 'to be ambitious in', transcription: '/tə bi æmˈbɪʃəs ɪn/', translation: 'бути амбітним у', example: 'She is ambitious in achieving sales targets.' },
    { expression: 'to be cautious about', transcription: '/tə bi ˈkɔːʃəs əˈbaʊt/', translation: 'обережно ставитися до', example: 'The manager is cautious about financial risks.' },
    { expression: 'to be consistent in', transcription: '/tə bi kənˈsɪstənt ɪn/', translation: 'послідовний у', example: 'He is consistent in his communication with clients.' },
    { expression: 'to be resourceful in', transcription: '/tə bi rɪˈsɔːsfʊl ɪn/', translation: 'винахідливий у', example: 'The team is resourceful in solving problems.' },
    { expression: 'to be innovative with', transcription: '/tə bi ˈɪnəveɪtɪv wɪð/', translation: 'інноваційний у використанні', example: 'He is innovative with marketing techniques.' },
    { expression: 'to be accountable to', transcription: '/tə bi əˈkaʊntəbl tuː/', translation: 'підзвітний перед', example: 'The manager is accountable to the board of directors.' },
    { expression: 'to be ambitious for', transcription: '/tə bi æmˈbɪʃəs fɔːr/', translation: 'прагнути до', example: 'She is ambitious for career growth.' },
    { expression: 'to be adaptable in', transcription: '/tə bi əˈdæptəbl ɪn/', translation: 'здатний адаптуватися у', example: 'He is adaptable in changing market conditions.' },
    { expression: 'to be proficient in', transcription: '/tə bi prəˈfɪʃənt ɪn/', translation: 'володіти майстерністю у', example: 'She is proficient in financial analysis.' },
    { expression: 'to be resilient in', transcription: '/tə bi rɪˈzɪliənt ɪn/', translation: 'стійкий у', example: 'The team is resilient in handling setbacks.' },
    { expression: 'to be forward-looking', transcription: '/tə bi ˈfɔːwəd ˈlʊkɪŋ/', translation: 'орієнтований на майбутнє', example: 'The company is forward-looking in its strategies.' },
  ];

  for (const item of toBeCollocations) {
    await prisma.vocabulary.create({
      data: {
        ...item,
        category: 'to_be_collocations',
        lessonId: lesson3.id,
        moduleId: module1.id,
      },
    });
  }

  console.log(`✅ "to be" collocations: ${toBeCollocations.length} записів`);

  // ─────────────────────────────────────────────
  // 9. Vocabulary — "to have" collocations (30 виразів)
  // ─────────────────────────────────────────────
  console.log('📚 Seeding vocabulary: "to have" collocations...');

  const toHaveCollocations = [
    { expression: 'to have access to', transcription: '/tə hæv ˈæksɛs tuː/', translation: 'мати доступ до', example: 'Employees have access to internal systems.' },
    { expression: 'to have experience in', transcription: '/tə hæv ɪkˈspɪəriəns ɪn/', translation: 'мати досвід у', example: 'She has experience in project management.' },
    { expression: 'to have control over', transcription: '/tə hæv kənˈtrəʊl ˈəʊvə/', translation: 'контролювати', example: 'Managers have control over the budget.' },
    { expression: 'to have responsibility for', transcription: '/tə hæv rɪˌspɒnsəˈbɪləti fɔː/', translation: 'нести відповідальність за', example: 'He has responsibility for the team.' },
    { expression: 'to have confidence in', transcription: '/tə hæv ˈkɒnfɪdəns ɪn/', translation: 'мати впевненість у', example: 'We have confidence in our strategy.' },
    { expression: 'to have influence on', transcription: '/tə hæv ˈɪnfluəns ɒn/', translation: 'мати вплив на', example: 'This decision has influence on sales.' },
    { expression: 'to have the ability to', transcription: '/tə hæv ði əˈbɪləti tuː/', translation: 'мати здатність', example: 'She has the ability to lead a team.' },
    { expression: 'to have the authority to', transcription: '/tə hæv ði ɔːˈθɒrɪti tuː/', translation: 'мати повноваження', example: 'He has the authority to approve changes.' },
    { expression: 'to have the opportunity to', transcription: '/tə hæv ði ˌɒpəˈtjuːnɪti tuː/', translation: 'мати можливість', example: 'We have the opportunity to expand.' },
    { expression: 'to have the resources to', transcription: '/tə hæv ðə rɪˈzɔːsɪz tuː/', translation: 'мати ресурси', example: 'The company has the resources to grow.' },
    { expression: 'to have the right to', transcription: '/tə hæv ðə raɪt tuː/', translation: 'мати право', example: 'Employees have the right to feedback.' },
    { expression: 'to have a reputation for', transcription: '/tə hæv ə ˌrɛpjʊˈteɪʃən fɔː/', translation: 'мати репутацію', example: 'The company has a reputation for quality.' },
    { expression: 'to have a background in', transcription: '/tə hæv ə ˈbækɡraʊnd ɪn/', translation: 'мати досвід', example: 'He has a background in finance.' },
    { expression: 'to have an understanding of', transcription: '/tə hæv ən ˌʌndəˈstændɪŋ ɒv/', translation: 'мати розуміння', example: 'She has an understanding of the market.' },
    { expression: 'to have knowledge of', transcription: '/tə hæv ˈnɒlɪdʒ ɒv/', translation: 'мати знання', example: 'He has knowledge of business law.' },
    { expression: 'to have expertise in', transcription: '/tə hæv ˌɛkspɜːˈtiːz ɪn/', translation: 'мати експертизу', example: 'She has expertise in HR management.' },
    { expression: 'to have support from', transcription: '/tə hæv səˈpɔːt frɒm/', translation: 'мати підтримку', example: 'The project has support from leadership.' },
    { expression: 'to have approval from', transcription: '/tə hæv əˈpruːvəl frɒm/', translation: 'мати схвалення', example: 'The plan has approval from the director.' },
    { expression: 'to have trust in', transcription: '/tə hæv trʌst ɪn/', translation: 'довіряти', example: 'Clients have trust in our services.' },
    { expression: 'to have interest in', transcription: '/tə hæv ˈɪntrəst ɪn/', translation: 'мати інтерес', example: 'The company has interest in new markets.' },
    { expression: 'to have a role in', transcription: '/tə hæv ə roʊl ɪn/', translation: 'відігравати роль', example: 'She has a role in decision-making.' },
    { expression: 'to have an effect on', transcription: '/tə hæv ən ɪˈfɛkt ɒn/', translation: 'мати вплив', example: 'This change has an effect on productivity.' },
    { expression: 'to have an impact on', transcription: '/tə hæv ən ˈɪmpækt ɒn/', translation: 'мати вплив', example: 'The policy has an impact on employees.' },
    { expression: 'to have a chance to', transcription: '/tə hæv ə ʧɑːns tuː/', translation: 'мати шанс', example: 'He has a chance to present his idea.' },
    { expression: 'to have a reason to', transcription: '/tə hæv ə ˈriːzn tuː/', translation: 'мати причину', example: 'We have a reason to reconsider the plan.' },
    { expression: 'to have a need for', transcription: '/tə hæv ə niːd fɔː/', translation: 'мати потребу', example: 'The company has a need for innovation.' },
    { expression: 'to have a demand for', transcription: '/tə hæv ə dɪˈmɑːnd fɔː/', translation: 'мати попит', example: 'There is a demand for skilled workers.' },
    { expression: 'to have a problem with', transcription: '/tə hæv ə ˈprɒbləm wɪð/', translation: 'мати проблему', example: 'We have a problem with delivery times.' },
    { expression: 'to have a relationship with', transcription: '/tə hæv ə rɪˈleɪʃənʃɪp wɪð/', translation: 'мати відносини', example: 'The company has a relationship with suppliers.' },
    { expression: 'to have an advantage over', transcription: '/tə hæv ən ədˈvɑːntɪdʒ ˈəʊvə/', translation: 'мати перевагу', example: 'We have an advantage over competitors.' },
  ];

  for (const item of toHaveCollocations) {
    await prisma.vocabulary.create({
      data: {
        ...item,
        category: 'to_have_collocations',
        lessonId: lesson4.id,
        moduleId: module1.id,
      },
    });
  }

  console.log(`✅ "to have" collocations: ${toHaveCollocations.length} записів`);

  // ─────────────────────────────────────────────
  // 10. Vocabulary — Jobs (загальні професії)
  // ─────────────────────────────────────────────
  console.log('📚 Seeding vocabulary: Jobs...');

  const jobs = [
    { expression: 'doctor', transcription: '/ˈdɒk.tər/', translation: 'лікар', example: 'The doctor examines patients and prescribes treatment.' },
    { expression: 'nurse', transcription: '/nɜːs/', translation: 'медсестра', example: 'The nurse takes care of patients and gives injections.' },
    { expression: 'teacher', transcription: '/ˈtiː.tʃər/', translation: 'вчитель', example: 'The teacher explains grammar and checks homework.' },
    { expression: 'student', transcription: '/ˈstjuː.dənt/', translation: 'студент', example: 'The student attends classes and studies for exams.' },
    { expression: 'engineer', transcription: '/ˌen.dʒɪˈnɪər/', translation: 'інженер', example: 'The engineer designs systems and solves problems.' },
    { expression: 'software developer', transcription: '/ˈsɒft.weə dɪˈvel.ə.pər/', translation: 'розробник ПЗ', example: 'The software developer builds applications and improves performance.' },
    { expression: 'programmer', transcription: '/ˈprəʊ.ɡræm.ər/', translation: 'програміст', example: 'The programmer writes code and fixes bugs.' },
    { expression: 'QA engineer', transcription: '/ˌkjuːˈeɪ ˌen.dʒɪˈnɪər/', translation: 'тестувальник', example: 'The QA engineer tests products and identifies bugs.' },
    { expression: 'data analyst', transcription: '/ˈdeɪ.tə ˈæn.əl.ɪst/', translation: 'аналітик даних', example: 'The data analyst interprets data and creates reports.' },
    { expression: 'UX/UI designer', transcription: '/ˌjuːˈeks ˌjuːˈaɪ dɪˈzaɪ.nər/', translation: 'UX/UI дизайнер', example: 'The UX/UI designer improves user experience and interface design.' },
    { expression: 'cybersecurity specialist', transcription: '/ˌsaɪ.bə.sɪˈkjʊə.rə.ti ˈspeʃ.əl.ɪst/', translation: 'кібербезпека', example: 'The cybersecurity specialist protects systems from cyber threats.' },
    { expression: 'DevOps engineer', transcription: '/ˈdev.ɒps ˌen.dʒɪˈnɪər/', translation: 'DevOps інженер', example: 'The DevOps engineer automates workflows and manages infrastructure.' },
    { expression: 'designer', transcription: '/dɪˈzaɪ.nər/', translation: 'дизайнер', example: 'The designer creates visual concepts and layouts.' },
    { expression: 'manager', transcription: '/ˈmæn.ɪ.dʒər/', translation: 'менеджер', example: 'The manager leads the team and makes decisions.' },
    { expression: 'project manager', transcription: '/ˈprɒdʒ.ekt ˈmæn.ɪ.dʒər/', translation: 'проєктний менеджер', example: 'The project manager plans tasks and leads the team.' },
    { expression: 'HR manager', transcription: '/ˌeɪtʃ ˈɑː ˌmæn.ɪ.dʒər/', translation: 'HR-менеджер', example: 'The HR manager hires employees and manages staff.' },
    { expression: 'recruiter', transcription: '/rɪˈkruː.tər/', translation: 'рекрутер', example: 'The recruiter interviews candidates and hires employees.' },
    { expression: 'business analyst', transcription: '/ˈbɪz.nɪs əˈnæl.ɪst/', translation: 'бізнес-аналітик', example: 'The analyst evaluates processes and suggests improvements.' },
    { expression: 'accountant', transcription: '/əˈkaʊn.tənt/', translation: 'бухгалтер', example: 'The accountant prepares financial reports.' },
    { expression: 'lawyer', transcription: '/ˈlɔː.jər/', translation: 'юрист', example: 'The lawyer represents clients and gives advice.' },
    { expression: 'marketer', transcription: '/ˈmɑː.kɪ.tər/', translation: 'маркетолог', example: 'The marketer promotes products and analyzes trends.' },
    { expression: 'copywriter', transcription: '/ˈkɒp.iˌraɪ.tər/', translation: 'копірайтер', example: 'The copywriter writes advertising texts.' },
    { expression: 'journalist', transcription: '/ˈdʒɜː.nə.lɪst/', translation: 'журналіст', example: 'The journalist writes articles and reports news.' },
  ];

  for (const item of jobs) {
    await prisma.vocabulary.create({
      data: {
        ...item,
        category: 'jobs',
        lessonId: lesson5.id,
        moduleId: module1.id,
      },
    });
  }

  console.log(`✅ Jobs: ${jobs.length} записів`);

  // ─────────────────────────────────────────────
  // 11. Vocabulary — C-Suite / Board
  // ─────────────────────────────────────────────
  console.log('📚 Seeding vocabulary: C-Suite roles...');

  const cSuite = [
    { expression: 'chief executive officer (CEO)', transcription: '/tʃiːf ɪɡˈzek.jʊ.tɪv ˈɒf.ɪ.sər/', translation: 'генеральний директор', example: 'The CEO set the company\'s long-term strategy.' },
    { expression: 'chief operating officer (COO)', transcription: '/tʃiːf ˈɒp.ər.eɪ.tɪŋ ˈɒf.ɪ.sər/', translation: 'операційний директор', example: 'The COO ensures smooth operations across all departments.' },
    { expression: 'chief financial officer (CFO)', transcription: '/tʃiːf faɪˈnæn.ʃəl ˈɒf.ɪ.sər/', translation: 'фінансовий директор', example: 'The CFO presented the quarterly financial report.' },
    { expression: 'chief marketing officer (CMO)', transcription: '/tʃiːf ˈmɑː.kɪ.tɪŋ ˈɒf.ɪ.sər/', translation: 'директор з маркетингу', example: 'The CMO launched the new advertising campaign.' },
    { expression: 'chief technology officer (CTO)', transcription: '/tʃiːf tɛkˈnɒl.ə.dʒi ˈɒf.ɪ.sər/', translation: 'технічний директор', example: 'The CTO oversees all IT and technology strategy.' },
    { expression: 'chief human resources officer (CHRO)', transcription: '/tʃiːf ˈhjuː.mən rɪˈzɔːsɪz ˈɒf.ɪ.sər/', translation: 'директор з персоналу', example: 'The CHRO introduced new employee benefits.' },
    { expression: 'managing director', transcription: '/ˈmæn.ɪ.dʒɪŋ dɪˈrek.tər/', translation: 'керуючий директор', example: 'The managing director oversees daily operations.' },
    { expression: 'chairman / chairwoman', transcription: '/ˈtʃɛər.mən/ /ˈtʃɛər.wʊm.ən/', translation: 'голова правління', example: 'The chairman opened the board meeting.' },
    { expression: 'non-executive director', transcription: '/ˌnɒn ɪɡˈzek.jʊ.tɪv dɪˈrek.tər/', translation: 'незалежний директор', example: 'Non-executive directors provide independent advice.' },
  ];

  for (const item of cSuite) {
    await prisma.vocabulary.create({
      data: {
        ...item,
        category: 'c_suite',
        subcategory: 'Board / C-Suite',
        lessonId: lesson5.id,
        moduleId: module1.id,
      },
    });
  }

  console.log(`✅ C-Suite roles: ${cSuite.length} записів`);

  // ─────────────────────────────────────────────
  // 12. Підсумок
  // ─────────────────────────────────────────────
  const totalVocab =
    toBeCollocations.length +
    toHaveCollocations.length +
    jobs.length +
    cSuite.length;

  console.log('\n🎉 Module 1 seed завершено!');
  console.log(`   📘 Уроки: 5`);
  console.log(`   📚 Vocabulary записів: ${totalVocab}`);
  console.log(`      - "to be" collocations: ${toBeCollocations.length}`);
  console.log(`      - "to have" collocations: ${toHaveCollocations.length}`);
  console.log(`      - Jobs: ${jobs.length}`);
  console.log(`      - C-Suite roles: ${cSuite.length}`);
}