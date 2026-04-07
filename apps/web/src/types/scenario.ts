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
    /** Хибні варіанти для тесту (MCQ) */
    distractors?: string[];
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
    if (b.type === "text" && b.richText === undefined && !b.body.includes("<")) {
      return { ...b, richText: false };
    }
    return b;
  });
}