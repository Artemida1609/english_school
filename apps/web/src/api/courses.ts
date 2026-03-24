import { apiFetch } from "./client";

export interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "THEORY" | "TASK" | "TEST";
  orderIndex: number;
  videoUrl?: string;
  content?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  stage?: number;
  lessons?: Lesson[];
  _count?: { lessons: number };
  course?: { id: string; title: string };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  modules?: Module[];
  _count?: { modules: number; enrollments: number };
}

export interface LessonDetail extends Lesson {
  module?: { id: string; title: string };
  course?: { id: string; title: string };
  tests?: {
    id: string;
    title: string;
    questions: {
      id: string;
      questionText: string;
      orderIndex: number;
      answers: { id: string; answerText: string; isCorrect: boolean }[];
    }[];
  }[];
  vocabulary?: VocabularyItem[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score?: number | null;
  completedAt?: string | null;
}

export interface VocabularyItem {
  id: string
  expression: string
  transcription?: string | null
  translation?: string | null
  example?: string | null
  category?: string | null
  subcategory?: string | null
}

export interface ModuleProgressResponse {
  lessons: (Lesson & { progress: LessonProgress | null })[];
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const coursesApi = {
  getCourses: (params?: { level?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<Course[]>(`/api/courses${q ? `?${q}` : ""}`);
  },
  getCourseById: (id: string) => apiFetch<Course>(`/api/courses/${id}`),
  getModuleById: (id: string) => apiFetch<Module>(`/api/modules/${id}`),
  getLessonById: (id: string) => apiFetch<LessonDetail>(`/api/lessons/${id}`),

  // Progress
  getModuleProgress: (moduleId: string) =>
    apiFetch<ModuleProgressResponse>(`/api/progress/module/${moduleId}`),
  saveProgress: (data: { lessonId: string; completed: boolean; score?: number }) =>
    apiFetch<LessonProgress>(`/api/progress`, { method: "POST", body: JSON.stringify(data) }),
  getMyProgress: () =>
    apiFetch<{ progress: LessonProgress[]; stats: object }>(`/api/progress/me`),
};