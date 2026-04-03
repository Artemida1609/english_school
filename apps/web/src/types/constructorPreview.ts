import type { ConstructorPracticePayload } from "../utils/constructorPractice";

export type ConstructorPreviewPayload = {
  title: string;
  theoryHtml: string;
  taskMarkdown: string;
  testQuestions: {
    questionText: string;
    answers: { text: string; isCorrect: boolean }[];
  }[];
  practice?: ConstructorPracticePayload;
};

export const CONSTRUCTOR_PREVIEW_SESSION_KEY = "constructorPreviewV1";

/** Зарезервований id модуля — той самий UI, що й ModulePage */
export const CONSTRUCTOR_PREVIEW_MODULE_ID = "__constructor_preview__";

export function writeConstructorPreview(payload: ConstructorPreviewPayload) {
  sessionStorage.setItem(CONSTRUCTOR_PREVIEW_SESSION_KEY, JSON.stringify(payload));
}

export function readConstructorPreview(): ConstructorPreviewPayload | null {
  try {
    const raw = sessionStorage.getItem(CONSTRUCTOR_PREVIEW_SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as ConstructorPreviewPayload;
    if (o?.title && typeof o.theoryHtml === "string") return o;
  } catch {
    /* ignore */
  }
  return null;
}
