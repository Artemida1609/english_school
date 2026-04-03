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
  /** Зберігається при публікації з конструктора */
  constructorJson?: string | null;
  lessons?: Lesson[];
  vocabulary?: VocabularyItem[];
  _count?: { lessons: number };
  course?: { id: string; title: string };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  thumbnail?: string;
  /** Лише в каталозі для викладача */
  isPublished?: boolean;
  modules?: Module[];
  _count?: { modules: number; enrollments: number };
}

export type StaffCourseCreateBody = {
  title: string;
  description: string;
  level?: string;
  thumbnail?: string;
};

export type StaffCourseUpdateBody = Partial<{
  title: string;
  description: string;
  level: string;
  thumbnail: string;
  isPublished: boolean;
}>;

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
  /** Усі курси (опубліковані та ні); потрібні права TEACHER/ADMIN */
  getCoursesCatalogForStaff: () => apiFetch<Course[]>("/api/courses/catalog/all"),
  getCourseById: (id: string) => apiFetch<Course>(`/api/courses/${id}`),
  getModuleById: (id: string) => apiFetch<Module>(`/api/modules/${id}`),
  getLessonById: (id: string) => apiFetch<LessonDetail>(`/api/lessons/${id}`),

  /** TEACHER/ADMIN */
  createStaffCourse: (body: StaffCourseCreateBody) =>
    apiFetch<Course>("/api/courses", { method: "POST", body: JSON.stringify(body) }),
  updateStaffCourse: (id: string, body: StaffCourseUpdateBody) =>
    apiFetch<Course>(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteStaffCourse: (id: string) =>
    apiFetch<void>(`/api/courses/${id}`, { method: "DELETE" }),

  // Progress
  getModuleProgress: (moduleId: string) =>
    apiFetch<ModuleProgressResponse>(`/api/progress/module/${moduleId}`),
  saveProgress: (data: { lessonId: string; completed: boolean; score?: number }) =>
    apiFetch<LessonProgress>(`/api/progress`, { method: "POST", body: JSON.stringify(data) }),
  getMyProgress: () =>
    apiFetch<{ progress: LessonProgress[]; stats: object }>(`/api/progress/me`),
};