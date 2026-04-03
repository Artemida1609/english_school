// prisma/seeds/module1_extension.ts — викликається після seedModule1 з prisma/seed.ts

import type { PrismaClient } from '@prisma/client';

export async function seedModule1Extension(prisma: PrismaClient) {
  const moduleId = 'module-1-personal-work-identity';
  const lessonId = 'lesson-m1-vocab-jobs'; // той самий урок Lesson 5

  console.log('🌱 Seeding Module 1 extension: Roles, Departments, Industries...');

  // ─────────────────────────────────────────────
  // 1. Department Heads / Middle Management
  // ─────────────────────────────────────────────
  const departmentHeads = [
    { expression: 'marketing director', transcription: '/ˈmɑː.kɪ.tɪŋ dɪˈrek.tər/', translation: 'директор з маркетингу', example: 'The marketing director launched the new campaign.' },
    { expression: 'human resources director', transcription: '/ˈhjuː.mən rɪˈzɔːsɪz dɪˈrek.tər/', translation: 'директор з персоналу', example: 'The HR director hired new staff.' },
    { expression: 'IT director', transcription: '/aɪ-tiː dɪˈrek.tər/', translation: 'ІТ-директор', example: "The IT director updated the company's systems." },
    { expression: 'research director', transcription: '/rɪˈsɜːtʃ dɪˈrek.tər/', translation: 'директор з досліджень', example: 'The research director oversees all R&D projects.' },
    { expression: 'finance director', transcription: '/ˈfaɪ.næns dɪˈrek.tər/', translation: 'фінансовий директор', example: 'The finance director presented the budget.' },
    { expression: 'operations manager', transcription: '/ˌɒp.əˈreɪ.ʃənz ˈmæn.ɪ.dʒər/', translation: 'менеджер з операцій', example: 'The operations manager supervises day-to-day processes.' },
    { expression: 'production manager', transcription: '/prəˈdʌk.ʃən ˈmæn.ɪ.dʒər/', translation: 'менеджер виробництва', example: 'The production manager ensures timely product delivery.' },
    { expression: 'logistics manager', transcription: '/ləˈdʒɪs.tɪks ˈmæn.ɪ.dʒər/', translation: 'менеджер з логістики', example: 'The logistics manager coordinates shipping and inventory.' },
    { expression: 'procurement manager', transcription: '/prəˈkjʊə.mənt ˈmæn.ɪ.dʒər/', translation: 'менеджер з закупівель', example: 'The purchasing manager negotiates supplier contracts.' },
    { expression: 'quality control manager', transcription: '/ˈkwɒl.ɪ.ti kənˈtrəʊl ˈmæn.ɪ.dʒər/', translation: 'менеджер з контролю якості', example: 'The quality control manager inspects all products.' },
    { expression: 'PR manager', transcription: '/ˌpiːˈɑːr ˈmæn.ɪ.dʒər/', translation: 'менеджер з PR', example: 'The PR manager handles press releases and media.' },
    { expression: 'legal manager', transcription: '/ˈliː.ɡəl ˈmæn.ɪ.dʒər/', translation: 'юридичний менеджер', example: 'The legal manager ensures contracts meet regulations.' },
    { expression: 'branch manager', transcription: '/brɑːntʃ ˈmæn.ɪ.dʒər/', translation: 'керівник відділення', example: 'The branch manager oversees the local office.' },
    { expression: 'accounts department manager', transcription: '/əˈkaʊnts dɪˈpɑːt.mənt ˈmæn.ɪ.dʒər/', translation: 'менеджер бухгалтерії', example: 'The accounts manager prepared the monthly report.' },
    { expression: 'sales manager', transcription: '/seɪlz ˈmæn.ɪ.dʒər/', translation: 'менеджер з продажу', example: 'The sales manager set the sales targets.' },
    { expression: 'customer services manager', transcription: '/ˈkʌs.tə.mər ˈsɜː.vɪs.ɪz ˈmæn.ɪ.dʒər/', translation: 'менеджер служби підтримки', example: 'The customer services manager handled complaints.' },
  ];

  for (const item of departmentHeads) {
    await prisma.vocabulary.create({
      data: { ...item, category: 'roles', subcategory: 'Department Heads', lessonId, moduleId },
    });
  }
  console.log(`✅ Department Heads: ${departmentHeads.length} записів`);

  // ─────────────────────────────────────────────
  // 2. Lower / Operational Management
  // ─────────────────────────────────────────────
  const lowerManagement = [
    { expression: 'middle manager', transcription: '/ˈmɪd.əl ˈmæn.ɪ.dʒər/', translation: 'менеджер середньої ланки', example: 'Middle managers report to senior executives.' },
    { expression: 'line manager / team leader / supervisor', transcription: '/laɪn ˈmæn.ɪ.dʒər/', translation: 'безпосередній керівник / керівник групи / супервайзер', example: 'Employees report to their line manager or supervisor.' },
    { expression: 'assistant manager', transcription: '/əˈsɪs.tənt ˈmæn.ɪ.dʒər/', translation: 'заступник менеджера', example: 'The assistant manager supports the branch manager.' },
    { expression: 'coordinator / section head', transcription: '/kəʊˈɔː.dɪ.neɪ.tər/', translation: 'координатор / керівник секції', example: 'The coordinator organizes team schedules.' },
    { expression: 'shift manager', transcription: '/ʃɪft ˈmæn.ɪ.dʒər/', translation: 'черговий менеджер', example: 'The shift manager oversees staff during their shift.' },
  ];

  for (const item of lowerManagement) {
    await prisma.vocabulary.create({
      data: { ...item, category: 'roles', subcategory: 'Lower Management', lessonId, moduleId },
    });
  }
  console.log(`✅ Lower Management: ${lowerManagement.length} записів`);

  // ─────────────────────────────────────────────
  // 3. Departments
  // ─────────────────────────────────────────────
  const departments = [
    // Administrative
    { expression: 'Human Resources (HR)', transcription: '/ˈhjuːmən rɪˈzɔːrsɪz/', translation: 'Відділ кадрів', example: 'HR handles recruitment and employee benefits.', subcategory: 'Administrative' },
    { expression: 'Administration', transcription: '/ədˌmɪnɪˈstreɪʃən/', translation: 'Адміністративний відділ', example: 'Administration manages office resources and scheduling.', subcategory: 'Administrative' },
    { expression: 'Facilities / Office Management', transcription: '/fəˈsɪlɪtiz/', translation: 'Відділ управління офісом', example: 'Facilities takes care of office space and equipment.', subcategory: 'Administrative' },
    { expression: 'Procurement / Purchasing', transcription: '/prəˈkjʊərmənt/', translation: 'Закупівлі', example: 'Procurement negotiates with suppliers.', subcategory: 'Administrative' },
    { expression: 'Health, Safety & Environment (HSE)', transcription: '/hɛlθ ˈseɪfti ənd ɪnˈvaɪrənmənt/', translation: 'Відділ охорони праці та навколишнього середовища', example: 'HSE monitors workplace safety and environment.', subcategory: 'Administrative' },
    // Operations & Production
    { expression: 'Production / Operations', transcription: '/prəˈdʌkʃən/', translation: 'Виробництво / Операційний відділ', example: 'Production ensures all orders are fulfilled.', subcategory: 'Operations & Production' },
    { expression: 'Logistics / Supply Chain', transcription: '/ləˈdʒɪstɪks/', translation: 'Логістика / Ланцюг постачання', example: 'Logistics ensures timely delivery of goods.', subcategory: 'Operations & Production' },
    // Client-Facing / Market
    { expression: 'Marketing', transcription: '/ˈmɑːrkɪtɪŋ/', translation: 'Відділ маркетингу', example: 'Marketing launched a new campaign.', subcategory: 'Client-Facing' },
    { expression: 'Sales', transcription: '/seɪlz/', translation: 'Відділ продажів', example: "Sales exceeded this quarter's targets.", subcategory: 'Client-Facing' },
    { expression: 'Customer Service', transcription: '/ˈkʌstəmər ˈsɜːrvɪs/', translation: 'Відділ обслуговування клієнтів', example: 'Customer service handles inquiries and complaints.', subcategory: 'Client-Facing' },
    { expression: 'Customer Success', transcription: '/ˈkʌstəmər səkˈsɛs/', translation: 'Відділ успіху клієнтів', example: 'Customer success ensures client satisfaction.', subcategory: 'Client-Facing' },
    { expression: 'Public Relations (PR)', transcription: '/ˈpʌblɪk rɪˈleɪʃənz/', translation: "Відділ зв'язків з громадськістю", example: 'PR manages media and public image.', subcategory: 'Client-Facing' },
    { expression: 'Event Management', transcription: '/ɪˈvɛnt ˈmænɪdʒmənt/', translation: 'Відділ організації подій', example: 'Event management plans corporate events.', subcategory: 'Client-Facing' },
    // Technical & Innovation
    { expression: 'IT / Information Technology', transcription: '/ˌɪnfərˈmeɪʃən tɛkˈnɑːlədʒi/', translation: 'Відділ ІТ', example: 'IT supports all computer systems.', subcategory: 'Technical & Innovation' },
    { expression: 'Research & Development (R&D)', transcription: '/rɪˈsɜːrtʃ ənd dɪˈvɛləpmənt/', translation: 'Відділ досліджень та розробок', example: 'R&D develops new products.', subcategory: 'Technical & Innovation' },
    { expression: 'UX / UI Design', transcription: '/juː ˈɛks/ /juː ˈaɪ dɪˈzaɪn/', translation: 'Відділ дизайну інтерфейсу', example: 'UX/UI team designs apps and websites.', subcategory: 'Technical & Innovation' },
    { expression: 'Digital Marketing', transcription: '/ˈdɪdʒɪtl ˈmɑːrkɪtɪŋ/', translation: 'Відділ цифрового маркетингу', example: 'Digital marketing runs social media campaigns.', subcategory: 'Technical & Innovation' },
    { expression: 'Content / Media', transcription: '/ˈkɒntɛnt/ /ˈmiːdiə/', translation: 'Відділ контенту', example: 'Content creates videos, articles, and posts.', subcategory: 'Technical & Innovation' },
    // Strategy & Governance
    { expression: 'Finance / Accounting', transcription: '/ˈfaɪnæns/ /əˈkaʊntɪŋ/', translation: 'Фінанси / Бухгалтерія', example: 'Finance prepares the annual budget.', subcategory: 'Strategy & Governance' },
    { expression: 'Legal / Compliance', transcription: '/ˈliːgəl/ /kəmˈplaɪəns/', translation: 'Юридичний / Комплаєнс', example: 'Legal ensures company compliance with regulations.', subcategory: 'Strategy & Governance' },
    { expression: 'Strategy / Corporate Planning', transcription: '/ˈstrætədʒi/ /ˈplænɪŋ/', translation: 'Стратегічне планування', example: 'Strategy defines long-term company goals.', subcategory: 'Strategy & Governance' },
    { expression: 'Risk Management', transcription: '/rɪsk ˈmænɪdʒmənt/', translation: 'Управління ризиками', example: 'Risk management evaluates potential threats.', subcategory: 'Strategy & Governance' },
    { expression: 'Corporate Social Responsibility (CSR)', transcription: '/ˌkɔːrpərət ˌsoʊʃəl rɪˌspɒnsəˈbɪləti/', translation: 'Корпоративна соціальна відповідальність', example: 'CSR organizes community initiatives.', subcategory: 'Strategy & Governance' },
    { expression: 'Sustainability', transcription: '/səˌsteɪnəˈbɪləti/', translation: 'Відділ сталого розвитку', example: 'Sustainability reduces the company carbon footprint.', subcategory: 'Strategy & Governance' },
    { expression: 'Investor Relations', transcription: '/ɪnˈvɛstər rɪˈleɪʃənz/', translation: 'Відділ роботи з інвесторами', example: 'Investor relations communicates with shareholders.', subcategory: 'Strategy & Governance' },
    { expression: 'Business Development', transcription: '/ˈbɪznəs dɪˈvɛləpmənt/', translation: 'Відділ розвитку бізнесу', example: 'Business development seeks new opportunities.', subcategory: 'Strategy & Governance' },
  ];

  for (const item of departments) {
    await prisma.vocabulary.create({
      data: { ...item, category: 'departments', lessonId, moduleId },
    });
  }
  console.log(`✅ Departments: ${departments.length} записів`);

  // ─────────────────────────────────────────────
  // 4. Industries
  // ─────────────────────────────────────────────
  const industries = [
    // Primary — Natural Resources
    { expression: 'Agriculture', translation: 'Сільське господарство', example: 'The company operates in agriculture, exporting grain to Europe.', subcategory: 'Primary / Natural Resources' },
    { expression: 'Forestry', translation: 'Лісова промисловість', example: 'This business specializes in forestry, supplying sustainable timber.', subcategory: 'Primary / Natural Resources' },
    { expression: 'Fishing', translation: 'Рибальство', example: 'The region depends heavily on fishing for its economy.', subcategory: 'Primary / Natural Resources' },
    { expression: 'Mining', translation: 'Видобуток корисних копалин', example: 'Several international firms invest in mining projects here.', subcategory: 'Primary / Natural Resources' },
    // Secondary — Production
    { expression: 'Manufacturing', translation: 'Виробництво', example: 'The company is involved in manufacturing, producing consumer electronics.', subcategory: 'Secondary / Production' },
    { expression: 'Construction', translation: 'Будівництво', example: 'He has experience in construction, working on large infrastructure projects.', subcategory: 'Secondary / Production' },
    { expression: 'Automotive', translation: 'Автомобільна промисловість', example: 'She built her career in the automotive industry.', subcategory: 'Secondary / Production' },
    { expression: 'Aerospace', translation: 'Аерокосмічна промисловість', example: 'The country is developing its aerospace capabilities.', subcategory: 'Secondary / Production' },
    { expression: 'Energy', translation: 'Енергетика', example: 'Many investors are moving into the energy sector.', subcategory: 'Secondary / Production' },
    { expression: 'Oil & Gas', translation: 'Нафта і газ', example: 'The region is known for its oil and gas reserves.', subcategory: 'Secondary / Production' },
    { expression: 'Utilities', translation: 'Комунальні послуги', example: 'The government regulates the utilities sector closely.', subcategory: 'Secondary / Production' },
    // Tertiary — Technology
    { expression: 'Information Technology (IT)', translation: 'Інформаційні технології', example: 'He transitioned into IT after completing a coding course.', subcategory: 'Tertiary / Technology' },
    { expression: 'Software Development', translation: 'Розробка програмного забезпечення', example: 'She works in software development, focusing on mobile apps.', subcategory: 'Tertiary / Technology' },
    { expression: 'Cybersecurity', translation: 'Кібербезпека', example: 'There is growing demand for specialists in cybersecurity.', subcategory: 'Tertiary / Technology' },
    { expression: 'Artificial Intelligence', translation: 'Штучний інтелект', example: 'Many startups are entering the artificial intelligence field.', subcategory: 'Tertiary / Technology' },
    { expression: 'Telecommunications', translation: 'Телекомунікації', example: 'The company operates in telecommunications, offering 5G services.', subcategory: 'Tertiary / Technology' },
    // Tertiary — Healthcare & Science
    { expression: 'Healthcare', translation: 'Охорона здоров\'я', example: 'She has over 10 years of experience in healthcare.', subcategory: 'Tertiary / Healthcare & Science' },
    { expression: 'Pharmaceuticals', translation: 'Фармацевтика', example: 'The company invests heavily in pharmaceuticals research.', subcategory: 'Tertiary / Healthcare & Science' },
    { expression: 'Biotechnology', translation: 'Біотехнологія', example: 'He is involved in biotechnology, developing new treatments.', subcategory: 'Tertiary / Healthcare & Science' },
    { expression: 'Education', translation: 'Освіта', example: 'She is currently working in education as a lecturer.', subcategory: 'Tertiary / Healthcare & Science' },
    { expression: 'E-learning', translation: 'Електронне навчання', example: 'The startup focuses on e-learning solutions for professionals.', subcategory: 'Tertiary / Healthcare & Science' },
    // Tertiary — Finance & Business
    { expression: 'Finance', translation: 'Фінанси', example: 'He started his career in finance at a major bank.', subcategory: 'Tertiary / Finance & Business' },
    { expression: 'Banking', translation: 'Банківська справа', example: 'She has a background in banking and risk management.', subcategory: 'Tertiary / Finance & Business' },
    { expression: 'Insurance', translation: 'Страхування', example: 'The company provides services in insurance across Europe.', subcategory: 'Tertiary / Finance & Business' },
    { expression: 'FinTech', translation: 'Фінансові технології', example: 'The firm operates in FinTech, offering digital payment solutions.', subcategory: 'Tertiary / Finance & Business' },
    { expression: 'Consulting', translation: 'Консалтинг', example: 'He works in consulting, helping businesses improve performance.', subcategory: 'Tertiary / Finance & Business' },
    // Tertiary — Corporate Services
    { expression: 'Human Resources', translation: 'Управління персоналом', example: 'She works in human resources, focusing on recruitment.', subcategory: 'Tertiary / Corporate Services' },
    { expression: 'Legal Services', translation: 'Юридичні послуги', example: 'The firm specializes in legal services for startups.', subcategory: 'Tertiary / Corporate Services' },
    { expression: 'Public Relations', translation: 'Зв\'язки з громадськістю', example: 'He is building a career in public relations.', subcategory: 'Tertiary / Corporate Services' },
    // Tertiary — Trade & Commerce
    { expression: 'Retail', translation: 'Роздрібна торгівля', example: 'She manages operations in the retail sector.', subcategory: 'Tertiary / Trade & Commerce' },
    { expression: 'Wholesale', translation: 'Оптова торгівля', example: 'The company is engaged in wholesale distribution.', subcategory: 'Tertiary / Trade & Commerce' },
    { expression: 'E-commerce', translation: 'Електронна комерція', example: 'He launched a business in e-commerce last year.', subcategory: 'Tertiary / Trade & Commerce' },
    { expression: 'Real Estate', translation: 'Нерухомість', example: 'She invests in real estate in major cities.', subcategory: 'Tertiary / Trade & Commerce' },
    // Tertiary — Media & Marketing
    { expression: 'Marketing & Advertising', translation: 'Маркетинг і реклама', example: 'He works in marketing and advertising, leading campaigns.', subcategory: 'Tertiary / Media & Marketing' },
    { expression: 'Media', translation: 'Медіа', example: 'She has experience in media, producing digital content.', subcategory: 'Tertiary / Media & Marketing' },
    { expression: 'Entertainment', translation: 'Індустрія розваг', example: 'The company operates in the entertainment industry.', subcategory: 'Tertiary / Media & Marketing' },
    // Tertiary — Travel & Transport
    { expression: 'Tourism', translation: 'Туризм', example: 'The country is developing its tourism sector.', subcategory: 'Tertiary / Travel & Transport' },
    { expression: 'Hospitality', translation: 'Готельно-ресторанний бізнес', example: 'She has a strong background in hospitality management.', subcategory: 'Tertiary / Travel & Transport' },
    { expression: 'Transportation', translation: 'Транспорт', example: 'The business operates in transportation and logistics.', subcategory: 'Tertiary / Travel & Transport' },
    { expression: 'Logistics', translation: 'Логістика', example: 'He works in logistics, managing international shipments.', subcategory: 'Tertiary / Travel & Transport' },
    { expression: 'Supply Chain Management', translation: 'Управління ланцюгом постачання', example: 'She specializes in supply chain management.', subcategory: 'Tertiary / Travel & Transport' },
    // Tertiary — Environment & Safety
    { expression: 'Environmental Services', translation: 'Екологічні послуги', example: 'The company focuses on environmental services.', subcategory: 'Tertiary / Environment & Safety' },
    { expression: 'Security', translation: 'Безпека', example: 'He works in security, ensuring data protection.', subcategory: 'Tertiary / Environment & Safety' },
  ];

  for (const item of industries) {
    await prisma.vocabulary.create({
      data: { ...item, category: 'industries', transcription: null, lessonId, moduleId },
    });
  }
  console.log(`✅ Industries: ${industries.length} записів`);

  // ─────────────────────────────────────────────
  // Підсумок
  // ─────────────────────────────────────────────
  const total = departmentHeads.length + lowerManagement.length + departments.length + industries.length;
  console.log('\n🎉 Extension seed завершено!');
  console.log(`   📚 Нових vocabulary записів: ${total}`);
  console.log(`      - Department Heads:   ${departmentHeads.length}`);
  console.log(`      - Lower Management:   ${lowerManagement.length}`);
  console.log(`      - Departments:        ${departments.length}`);
  console.log(`      - Industries:         ${industries.length}`);
}