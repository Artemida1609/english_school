export type ScenarioBlock =
  | {
    id: string;
    type: "text";
    /** HTML з редактора або простий текст (див. richText) */
    body: string;
    /** false = розбивка по рядках як раніше; true/undefined = body як HTML */
    richText?: boolean;
  }
  | {
    id: string;
    type: "table";
    headers: string[];
    rows: string[][];
  }
  | {
    id: string;
    type: "cards";
    items: {
      title: string; body: string;
      transcription?: string; category?: string;
    }[];
  }
  /** Зіставлення лівий / правий стовпчик (як на робочому аркуші) */
  | {
    id: string;
    type: "match";
    left: string[];
    right: string[];
  }
  | {
    id: string;
    type: "cloze";
    text: string;
    answers: string[];
    /** Хибні варіанти для вибору зі списку */
    distractors?: string[];
  }
  /** Пропуски з відкритим введенням (без варіантів) */
  | {
    id: string;
    type: "openCloze";
    text: string;
    answers: string[];
  }
  /** Параграфи листа в правильному порядку (зверху → донизу) */
  | {
    id: string;
    type: "letterOrder";
    /** Назва вправи для студента */
    title?: string;
    paragraphs: string[];
  }
  /** Тестові завдання (MCQ) — вкладка «Тест» */
  | {
    id: string;
    type: "quiz";
    /** Назва блоку тесту (необовʼязково) */
    title?: string;
    questions: {
      questionText: string;
      answers: { text: string; isCorrect: boolean }[];
    }[];
  }
  /** Банк слів (перетягування у пропуски в реченнях) */
  | {
    id: string;
    type: "wordBank";
    title?: string;
    items: {
      id: string;
      text: string;
      answers: string[];
    }[];
    distractors?: string[];
  }
  /** Множинний вибір (чекбокси — кілька правильних відповідей) */
  | {
    id: string;
    type: "multiSelect";
    title?: string;
    questions: {
      id: string;
      questionText: string;
      options: { text: string; isCorrect: boolean }[];
    }[];
  };

export type ScenarioDocument = {
  version: 1;
  title: string;
  blocks: ScenarioBlock[];
  /** Після публікації на сервер */
  publishedModuleId?: string;
  courseId?: string;
};

export function newBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultBlock(type: ScenarioBlock["type"]): ScenarioBlock {
  const id = newBlockId();
  switch (type) {
    case "text":
      return { id, type: "text", body: "<p>Текст параграфу…</p>", richText: true };
    case "table":
      return {
        id,
        type: "table",
        headers: ["Колонка 1", "Колонка 2"],
        rows: [
          ["", ""],
          ["", ""],
        ],
      };
    case "cards":
      return {
        id,
        type: "cards",
        items: [
          { title: "Новий термін", body: "", transcription: "", category: "" },
        ],
      };
    case "match":
      return {
        id,
        type: "match",
        left: ["Елемент A", "Елемент B", "Елемент C"],
        right: ["Відповідь 1", "Відповідь 2", "Відповідь 3"],
      };
    case "cloze":
      return {
        id,
        type: "cloze",
        text: "She ___ to the office every day.",
        answers: ["goes"],
        distractors: ["go", "going", "went"],
      };
    case "openCloze":
      return {
        id,
        type: "openCloze",
        text: "I usually ___ breakfast at seven o'clock.",
        answers: ["have"],
      };
    case "letterOrder":
      return {
        id,
        type: "letterOrder",
        title: "Лист",
        paragraphs: [
          "Dear Sir or Madam,",
          "I am writing to apply for the position advertised on your website.",
          "I look forward to hearing from you.",
          "Yours faithfully,\nAnna Kovalenko",
        ],
      };
    case "quiz":
      return {
        id,
        type: "quiz",
        title: "Тест",
        questions: [
          {
            questionText: "She ___ to the office every day.",
            answers: [
              { text: "goes", isCorrect: true },
              { text: "go", isCorrect: false },
              { text: "going", isCorrect: false },
              { text: "went", isCorrect: false },
            ],
          },
        ],
      };
    case "wordBank":
      return {
        id,
        type: "wordBank",
        title: "Слова у пропуски",
        items: [
          {
            id: `wb-${Date.now()}-1`,
            text: "She ___ to the store yesterday and bought some ___.",
            answers: ["went", "apples"],
          },
          {
            id: `wb-${Date.now()}-2`,
            text: "They usually ___ football on Sundays in the ___.",
            answers: ["play", "park"],
          },
        ],
        distractors: ["cat", "running"],
      };
    case "multiSelect":
      return {
        id,
        type: "multiSelect",
        title: "Множинний вибір",
        questions: [
          {
            id: `msq-${Date.now()}-1`,
            questionText: "Choose all the openings that are appropriate for an application letter.",
            options: [
              { text: "I am writing to apply for the position of Marketing Manager advertised in The Guardian.", isCorrect: true },
              { text: "I am writing in connection with the vacancy for Marketing Manager.", isCorrect: true },
              { text: "I would like to apply for the post of Marketing Manager.", isCorrect: true },
              { text: "I saw your advertisement and thought the job looked interesting.", isCorrect: false },
            ],
          },
        ],
      };
  }
}

/** Нормалізація блоків після імпорту старого JSON */
export function normalizeScenarioBlocks(blocks: ScenarioBlock[]): ScenarioBlock[] {
  const withoutLegacy = blocks.filter(
    (b) => (b as { type: string }).type !== "connector",
  ) as ScenarioBlock[];
  return withoutLegacy.map((b) => {
    if (b.type === "cloze" && !b.distractors) {
      return { ...b, distractors: [] };
    }
    if (b.type === "multiSelect") {
      const questions = Array.isArray(b.questions)
        ? b.questions.map((q, qIdx) => ({
            id: typeof q.id === "string" && q.id ? q.id : `ms-q-${qIdx}`,
            questionText: typeof q.questionText === "string" ? q.questionText : "",
            options: Array.isArray(q.options)
              ? q.options.map((opt) => ({
                  text: typeof opt.text === "string" ? opt.text : "",
                  isCorrect: Boolean(opt.isCorrect),
                }))
              : [],
          }))
        : [];
      return { ...b, questions };
    }
    if (b.type === "wordBank") {
      const items = Array.isArray(b.items)
        ? b.items.map((item, idx) => ({
            id: typeof item.id === "string" && item.id ? item.id : `wb-item-${idx}`,
            text: typeof item.text === "string" ? item.text : "",
            answers: Array.isArray(item.answers)
              ? item.answers.map((a) => (typeof a === "string" ? a : ""))
              : [],
          }))
        : [];
      const distractors = Array.isArray(b.distractors)
        ? b.distractors.map((d) => (typeof d === "string" ? d : ""))
        : [];
      return { ...b, items, distractors };
    }
    if (b.type === "openCloze" && !Array.isArray(b.answers)) {
      return { ...b, answers: [] };
    }
    if (b.type === "openCloze" && typeof b.text !== "string") {
      return { ...b, text: "" };
    }
    if (b.type === "text" && b.richText === undefined && !b.body.includes("<")) {
      return { ...b, richText: false };
    }
    if (b.type === "letterOrder" && !Array.isArray(b.paragraphs)) {
      return { ...b, paragraphs: [] };
    }
    if (b.type === "quiz" && !Array.isArray(b.questions)) {
      return { ...b, questions: [] };
    }
    if (b.type === "quiz") {
      return {
        ...b,
        questions: b.questions.map((q) => ({
          questionText: typeof q.questionText === "string" ? q.questionText : "",
          answers: Array.isArray(q.answers)
            ? q.answers.map((a) => ({
              text: typeof a.text === "string" ? a.text : "",
              isCorrect: Boolean(a.isCorrect),
            }))
            : [],
        })),
      };
    }
    return b;
  });
}