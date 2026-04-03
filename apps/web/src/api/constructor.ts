import { apiFetch } from "./client";

export type ConstructorPublishBody = {
  title: string;
  description?: string;
  orderIndex?: number;
  stage?: number;
  theoryHtml: string;
  taskMarkdown?: string;
  /** JSON сценарію конструктора (version, title, blocks) для повторного відкриття */
  scenarioJson?: string | null;
  testQuestions?: {
    questionText: string;
    answers: { text: string; isCorrect: boolean }[];
  }[];
};

export interface ModuleRow {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  stage: number;
  courseId: string;
}

export const constructorApi = {
  publish: (courseId: string, body: ConstructorPublishBody) =>
    apiFetch<ModuleRow>(`/api/courses/${courseId}/modules/constructor`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  sync: (moduleId: string, body: ConstructorPublishBody) =>
    apiFetch<ModuleRow>(`/api/modules/${moduleId}/constructor`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (moduleId: string) =>
    apiFetch<void>(`/api/modules/${moduleId}`, { method: "DELETE" }),
};
