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
}

export const coursesApi = {
  getCourses: (params?: { level?: string; search?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<Course[]>(`/api/courses${q ? `?${q}` : ""}`);
  },
  getCourseById: (id: string) => apiFetch<Course>(`/api/courses/${id}`),
  getModuleById: (id: string) => apiFetch<Module>(`/api/modules/${id}`),
  getLessonById: (id: string) => apiFetch<LessonDetail>(`/api/lessons/${id}`),
};
