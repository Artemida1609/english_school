export type ConstructorPreviewPayload = {
  title: string;
  theoryHtml: string;
  taskMarkdown: string;
  testQuestions: {
    questionText: string;
    answers: { text: string; isCorrect: boolean }[];
  }[];
};

export const CONSTRUCTOR_PREVIEW_SESSION_KEY = "constructorPreviewV1";

export function writeConstructorPreview(payload: ConstructorPreviewPayload) {
  sessionStorage.setItem(CONSTRUCTOR_PREVIEW_SESSION_KEY, JSON.stringify(payload));
}
