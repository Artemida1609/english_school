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
│       │   ├── server.ts      # HTTP-сервер, Socket.IO, CORS
│       │   ├── config/        # Prisma Client
│       │   ├── routes/        # auth, courses, lessons, chat
│       │   ├── controllers/
│       │   ├── middleware/
│       │   └── sockets/       # chat.socket.ts
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

### Render: змінні середовища (обовʼязково)

| Змінна | Опис |
|--------|------|
| `DATABASE_URL` | PostgreSQL (Neon) |
| `JWT_SECRET` | Секрет для access token |
| `JWT_REFRESH_SECRET` | Секрет для refresh token |
| `CLIENT_URL` | URL фронтенду (Vercel) для CORS |

Якщо при реєстрації/логіні 500 — перевірте логи Render (Dashboard → Logs) та наявність `JWT_SECRET`, `JWT_REFRESH_SECRET`.

---

## 📡 API ендпоінти

Базовий URL: `/api` (окрім `/health`). Авторизація: Bearer JWT (крім публічних маршрутів).

### Загальні

| Метод | Шлях | Опис |
|-------|------|------|
| `GET` | `/health` | Стан сервера → `{ "status": "ok", "timestamp": "..." }` |

### Auth — `/api/auth`

| Метод | Шлях | Auth | Опис |
|-------|------|------|------|
| `POST` | `/register` | — | Реєстрація |
| `POST` | `/login` | — | Вхід |
| `POST` | `/refresh` | — | Оновлення токенів |
| `GET` | `/me` | JWT | Поточний користувач |

### Courses — `/api/courses`

| Метод | Шлях | Auth | Опис |
|-------|------|------|------|
| `GET` | `/` | — | Список курсів |
| `GET` | `/:id` | — | Курс за ID (з модулями та уроками) |
| `POST` | `/:id/enroll` | JWT | Записатись на курс |
| `GET` | `/:id/enrollments` | JWT, TEACHER/ADMIN | Записи на курс |
| `POST` | `/` | JWT, TEACHER/ADMIN | Створити курс |
| `PUT` | `/:id` | JWT, TEACHER/ADMIN | Оновити курс |
| `POST` | `/:courseId/modules` | JWT, TEACHER/ADMIN | Додати модуль |

### Modules — `/api/modules`

| Метод | Шлях | Auth | Опис |
|-------|------|------|------|
| `GET` | `/:id` | — | Модуль з уроками |
| `PUT` | `/:id` | JWT, TEACHER/ADMIN | Оновити модуль |
| `POST` | `/:moduleId/lessons` | JWT, TEACHER/ADMIN | Додати урок до модуля |

Створення модуля: `POST /api/courses/:courseId/modules`

### Lessons — `/api/lessons`

| Метод | Шлях | Auth | Опис |
|-------|------|------|------|
| `GET` | `/:id` | JWT | Урок за ID |
| `PUT` | `/:id` | JWT, TEACHER/ADMIN | Оновити урок |

Типи уроків: `VIDEO`, `THEORY`, `TASK`, `TEST` (відповідно: відео, теорія, завдання, тест).

### Chat — `/api/chat`

| Метод | Шлях | Auth | Опис |
|-------|------|------|------|
| `GET` | `/rooms` | JWT | Список чат-кімнат |
| `GET` | `/rooms/:roomId/messages` | JWT | Повідомлення кімнати |
| `POST` | `/rooms` | JWT, TEACHER/ADMIN | Створити кімнату |

---

## 📡 Socket.IO (WebSocket)

Підключення з JWT: `auth: { token }`.

**Події (клієнт → сервер):**

| Подія | Payload | Опис |
|-------|---------|------|
| `join_room` | `roomId: string` | Приєднатися до кімнати |
| `leave_room` | `roomId: string` | Покинути кімнату |
| `send_message` | `{ roomId, message }` | Надіслати повідомлення |
| `typing_start` | `roomId: string` | Початок набору |
| `typing_stop` | `roomId: string` | Кінець набору |

**Події (сервер → клієнт):**

| Подія | Опис |
|-------|------|
| `receive_message` | Нове повідомлення у кімнаті |
| `user_joined` | Користувач приєднався |
| `user_left` | Користувач вийшов |
| `user_typing` | Користувач набирає текст |
| `user_stopped_typing` | Користувач перестав набирати |
| `error` | Помилка (наприклад, room not found) |

---

## 🗄 База даних

Моделі: **User**, **UserProfile**, **Course**, **Lesson**, **Enrollment**, **Test**, **Question**, **Answer**, **UserProgress**, **ChatRoom**, **Message**.

- **User** (Role: STUDENT / TEACHER / ADMIN) — профіль, прогрес, повідомлення, записи на курси
- **UserProfile** — аватар, рівень, bio, XP, streak
- **Course** — модулі, записи (enrollments)
- **Module** — уроки всередині курсу
- **Lesson** — тип: VIDEO / THEORY / TASK / TEST; контент, відео, тести (для типу TEST), прогрес
- **Enrollment** — запис студента на курс
- **Test** / **Question** / **Answer** — тести до уроків
- **UserProgress** — прогрес студента по уроках (completed, score)
- **ChatRoom** (RoomType: PUBLIC / PRIVATE / GROUP) — чат-кімнати
- **Message** — повідомлення в чаті

**Корисні команди:**

```bash
npm run prisma:studio   # Веб-інтерфейс для перегляду БД
npm run prisma:generate # Регенерація Prisma Client після зміни schema
npm run prisma:seed    # Seed: курси, модулі, уроки + тестовий юзер
```

**Тестовий користувач (після seed):** `student@test.com` / `password123`

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


TO DO:

Paths:
courses -> courses/courseId -> courses/courseId/modules -> courses/courseId/modules/moduleId -> courses/courseId/modules/moduleId/taskId

Databases:

1. Store
2. Achievements
3. (Fix) user_profile and user_progress


---

## 🔗 Посилання

- [Live site](https://englishschool-one.vercel.app)
- [GitHub](https://github.com/Artemida1609/english_school)
