export const CONSTRUCTOR_PRACTICE_MARKER = "___CONSTRUCTOR_PRACTICE_V1___";

export type ConstructorPracticeCard = {
  term: string;
  definition: string;
  transcription?: string;
  category?: string;
};

export type ConstructorPracticeMatching = {
  left: string[];
  right: string[];
};

export type ConstructorPracticeCloze = {
  text: string;
  answers: string[];
  distractors?: string[];
};

export type ConstructorPracticeSection =
  | {
    id: string;
    type: "cards";
    title: string;
    items: ConstructorPracticeCard[];
  }
  | {
    id: string;
    type: "match";
    title: string;
    left: string[];
    right: string[];
  }
  | {
    id: string;
    type: "cloze";
    title: string;
    text: string;
    answers: string[];
    distractors?: string[];
  };

export type ConstructorPracticePayload = {
  version: 2;
  quizlet: ConstructorPracticeCard[];
  matching: ConstructorPracticeMatching[];
  sections: ConstructorPracticeSection[];
};

type LegacyConstructorPracticePayload = {
  version: 1;
  quizlet: ConstructorPracticeCard[];
  matching: ConstructorPracticeMatching[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCards(items: unknown): ConstructorPracticeCard[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!isRecord(item)) return [];
    const term = typeof item.term === "string" ? item.term : "";
    const definition = typeof item.definition === "string" ? item.definition : "";
    if (!term || !definition) return [];
    return [{
      term,
      definition,
      transcription: typeof item.transcription === "string" ? item.transcription : undefined,
      category: typeof item.category === "string" ? item.category : undefined,
    }];
  });
}

function normalizeMatching(items: unknown): ConstructorPracticeMatching[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!isRecord(item)) return [];
    const left = Array.isArray(item.left) ? item.left.filter((x): x is string => typeof x === "string") : [];
    const right = Array.isArray(item.right) ? item.right.filter((x): x is string => typeof x === "string") : [];
    if (!left.length || !right.length) return [];
    return [{ left: [...left], right: [...right] }];
  });
}

function normalizeSections(payload: Record<string, unknown>, quizlet: ConstructorPracticeCard[], matching: ConstructorPracticeMatching[]): ConstructorPracticeSection[] {
  if (Array.isArray(payload.sections) && payload.sections.length > 0) {
    const sections: ConstructorPracticeSection[] = [];
    for (const [index, section] of payload.sections.entries()) {
      if (!isRecord(section) || typeof section.id !== "string" || typeof section.type !== "string") continue;
      if (section.type === "cards") {
        const items = normalizeCards(section.items);
        if (!items.length) continue;
        sections.push({
          id: section.id,
          type: "cards",
          title: typeof section.title === "string" && section.title.trim() ? section.title : `Картки ${index + 1}`,
          items,
        });
        continue;
      }
      if (section.type === "match") {
        const left = Array.isArray(section.left) ? section.left.filter((item): item is string => typeof item === "string") : [];
        const right = Array.isArray(section.right) ? section.right.filter((item): item is string => typeof item === "string") : [];
        if (!left.length || !right.length) continue;
        sections.push({
          id: section.id,
          type: "match",
          title: typeof section.title === "string" && section.title.trim() ? section.title : `Зіставлення ${index + 1}`,
          left: [...left],
          right: [...right],
        });
        continue;
      }
      if (section.type === "cloze") {
        const answers = Array.isArray(section.answers) ? section.answers.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
        const text = typeof section.text === "string" && section.text.trim() ? section.text : "";
        if (!text || !answers.length) continue;
        sections.push({
          id: section.id,
          type: "cloze",
          title: typeof section.title === "string" && section.title.trim() ? section.title : `Пропуски ${index + 1}`,
          text,
          answers,
          distractors: Array.isArray(section.distractors)
            ? section.distractors.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
            : [],
        });
      }
    }

    if (sections.length > 0) {
      return sections;
    }
  }

  const fallback: ConstructorPracticeSection[] = [];
  if (quizlet.length > 0) {
    fallback.push({
      id: "legacy-cards",
      type: "cards",
      title: "Картки",
      items: quizlet.map((item) => ({ ...item })),
    });
  }
  if (matching.length > 0) {
    matching.forEach((item, index) => {
      fallback.push({
        id: index === 0 ? "legacy-matching" : `legacy-matching-${index + 1}`,
        type: "match",
        title: matching.length === 1 ? "Зіставлення" : `Зіставлення ${index + 1}`,
        left: [...item.left],
        right: [...item.right],
      });
    });
  }
  return fallback;
}

export function normalizeConstructorPracticePayload(
  payload: ConstructorPracticePayload | LegacyConstructorPracticePayload | null | undefined,
): ConstructorPracticePayload | null {
  if (!payload) return null;
  if (!isRecord(payload)) return null;

  const quizlet = normalizeCards((payload as Record<string, unknown>).quizlet);
  const matching = normalizeMatching((payload as Record<string, unknown>).matching);
  const sections = normalizeSections(payload as Record<string, unknown>, quizlet, matching);

  return {
    version: 2,
    quizlet: sections.flatMap((section) => (section.type === "cards" ? section.items : [])),
    matching: sections.flatMap((section) => (section.type === "match" ? [{ left: [...section.left], right: [...section.right] }] : [])),
    sections,
  };
}

export function extractClozeExercisePayload(blocks: ScenarioBlock[]) {
  return blocks
    .filter((b): b is Extract<ScenarioBlock, { type: "cloze" }> => b.type === "cloze")
    .map((b, i) => {
      const gapCount = (b.text.match(/___/g) ?? []).length;
      return {
        order: i + 1,
        questionText: b.text,
        gaps: gapCount,
        answers: [...b.answers],
        distractors: [...(b.distractors ?? [])],
      };
    });
}

export function parsePracticeFromTaskContent(content: string | null | undefined): {
  markdown: string;
  practice: ConstructorPracticePayload | null;
} {
  if (!content?.trim()) return { markdown: "", practice: null };
  const idx = content.indexOf(CONSTRUCTOR_PRACTICE_MARKER);
  if (idx === -1) return { markdown: content.trim(), practice: null };
  const md = content.slice(0, idx).trim();
  const jsonPart = content.slice(idx + CONSTRUCTOR_PRACTICE_MARKER.length).trim();
  try {
    const o = JSON.parse(jsonPart) as ConstructorPracticePayload | LegacyConstructorPracticePayload;
    const practice = normalizeConstructorPracticePayload(o);
    if (practice) return { markdown: md, practice };
  } catch {
    /* ignore */
  }
  return { markdown: content.trim(), practice: null };
}

export function appendPracticeToTaskMarkdown(
  markdown: string,
  practice: ConstructorPracticePayload,
): string {
  return `${markdown.trim()}\n\n${CONSTRUCTOR_PRACTICE_MARKER}\n${JSON.stringify(practice)}`;
}
