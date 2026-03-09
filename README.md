# English School

Платформа для вивчення англійської мови з курсами, модулями, чатами та системою оплати.

---

## 🛠 Стек технологій

| Частина      | Технології |
|--------------|------------|
| **Фронтенд** | React 19, Vite 7, Tailwind CSS 4, i18next, Zustand, Socket.IO Client |
| **Бекенд**   | Node.js, Express 5, Socket.IO, Prisma |
| **БД**       | PostgreSQL (Neon) |

---

## 📁 Структура проекту

```
english_school/
├── apps/
│   ├── web/              # Фронтенд (Vite + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── hooks/     # useSocket, useScreenSize
│   │   │   ├── store/     # Zustand (theme, language)
│   │   │   └── i18n/      # Переклади (UK, EN)
│   │   └── package.json
│   │
│   └── backend/           # Бекенд (Express + Socket.IO + Prisma)
│       ├── src/
│       │   ├── socket.ts   # HTTP-сервер, Socket.IO, /health, /messages
│       │   └── prisma.ts  # Prisma Client
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
├── package.json           # Кореневі скрипти (prisma, backend)
├── tsconfig.json
└── .env                   # DATABASE_URL (не комітиться)
```

---

## 🚀 Швидкий старт

### 1. Клонування та встановлення

```bash
git clone https://github.com/Artemida1609/english_school.git
cd english_school
npm install
cd apps/web && npm install && cd ../..
```

### 2. База даних (PostgreSQL / Neon)

Створіть файл `.env` у корені проекту:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

URL можна отримати через [Neon](https://neon.tech) або інтеграцію Neon у Vercel.

Застосувати міграції:

```bash
npm run prisma:migrate
```

### 3. Запуск локально

**Бекенд** (термінал 1):

```bash
npm run backend:dev
```

Сервер слухатиме порт з `PORT` у `.env` (за замовчуванням 4000).

**Фронтенд** (термінал 2):

```bash
cd apps/web && npm run dev
```

У `apps/web/.env` обовʼязково задайте `VITE_API_URL` — URL бекенду (Render у production).

---

## 📡 API та Socket.IO

| Метод   | URL       | Опис |
|---------|-----------|------|
| `GET`   | `/health`  | Перевірка зʼєднання з БД → `{ "status": "ok" }` |
| `GET`   | `/messages`| Останні 50 повідомлень з чатів (JSON) |

**Socket.IO події:**

| Подія         | Опис |
|---------------|------|
| `join_chat`   | Підключення до кімнати чату |
| `send_message`| Відправка повідомлення (зберігається в БД) |
| `receive_message` | Отримання повідомлення в реальному часі |

---

## 🗄 База даних

Моделі: **User**, **Course**, **Lesson**, **Enrollment**, **Chat**, **Message**, **Payment**.

- **User** (STUDENT / TEACHER / ADMIN) — курси, записи на курс, повідомлення
- **Course** — уроки, зачислення, чати
- **Lesson** — контент уроку, чати
- **Enrollment** — запис студента на курс (ACTIVE / COMPLETED / CANCELLED)
- **Payment** — оплати за курс (PENDING / PAID / FAILED / REFUNDED)
- **Chat** — канали (курс, урок)
- **Message** — повідомлення в чаті

**Корисні команди:**

```bash
npm run prisma:studio   # Веб-інтерфейс для перегляду БД
npm run prisma:generate # Регенерація Prisma Client після зміни schema
```

---

## 📜 Скрипти (кореневий package.json)

| Скрипт            | Опис |
|-------------------|------|
| `backend:dev`     | Збірка TS → запуск бекенду на порту 4000 |
| `backend:build`   | Компіляція TypeScript в `dist/` |
| `backend:start`   | Запуск скомпільованого бекенду |
| `prisma:migrate`  | Застосування міграцій до БД |
| `prisma:studio`   | Відкрити Prisma Studio |
| `prisma:generate` | Згенерувати Prisma Client |

---

## 🌐 Деплой

- **Фронтенд**: Vercel (автоматично з `apps/web`)
- **БД**: Neon PostgreSQL (через інтеграцію Vercel або окремий акаунт)
- **Бекенд**: потрібен окремий хостинг (Railway, Render, Fly.io) — Socket.IO не підтримується у Vercel Serverless

Для продакшену потрібно:
1. Розгорнути бекенд і підключити його до Neon.
2. Додати `DATABASE_URL` в Environment Variables Vercel (для фронтенду, якщо потрібно).
3. У Vercel задати `VITE_API_URL` на URL Render-бекенда (наприклад `https://english-school-1izu.onrender.com`).

---

## 🔗 Посилання

- [Live site](https://englishschool-one.vercel.app)
- [GitHub](https://github.com/Artemida1609/english_school)
