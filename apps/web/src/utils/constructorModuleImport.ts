import { coursesApi, type Lesson, type LessonDetail, type Module } from "../api/courses";
import { parsePracticeFromTaskContent } from "./constructorPractice";
import { newBlockId, normalizeScenarioBlocks, parseScenarioJson, type ScenarioBlock } from "../types/scenario";

export type ModuleWithConstructor = Module & { constructorJson?: string | null };

/** Підтягує текст уроку з відповіді модуля або через GET /lessons/:id (викладач залогінений). */
async function resolveLessonContent(lesson: Lesson): Promise<string> {
  const fromList = lesson.content?.trim() ?? "";
  if (fromList) return fromList;
  if (!lesson.id) return "";
  try {
    const detail: LessonDetail = await coursesApi.getLessonById(lesson.id);
    return detail.content?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * Відновлює title + blocks для конструктора з модуля API:
 * 1) поле constructorJson (повний сценарій після збереження з конструктора);
 * 2) інакше — евристика з уроків THEORY / TASK / TEST (усі теорії та всі таски з контентом).
 */
export async function loadConstructorDocumentFromServerModule(
  mod: ModuleWithConstructor,
): Promise<{ title: string; blocks: ScenarioBlock[]; fromStoredJson: boolean } | null> {
  const raw = mod.constructorJson?.trim();
  if (raw) {
    const doc = parseScenarioJson(raw);
    if (doc?.blocks?.length) {
      return {
        title: doc.title?.trim() || mod.title,
        blocks: normalizeScenarioBlocks(doc.blocks),
        fromStoredJson: true,
      };
    }
  }

  const legacy = await legacyBlocksFromModuleLessons(mod);
  if (!legacy) return null;
  return { ...legacy, fromStoredJson: false };
}

async function legacyBlocksFromModuleLessons(
  mod: ModuleWithConstructor,
): Promise<{ title: string; blocks: ScenarioBlock[] } | null> {
  const lessons = [...(mod.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
  if (lessons.length === 0) return null;

  const blocks: ScenarioBlock[] = [];

  const theoryLessons = lessons.filter((l) => l.type === "THEORY");
  for (const theory of theoryLessons) {
    const c = await resolveLessonContent(theory);
    if (!c) continue;
    blocks.push({
      id: newBlockId(),
      type: "text",
      body: c,
      richText: /<[a-z][\s\S]*>/i.test(c) ? true : false,
    });
  }

  const taskLessons = lessons.filter((l) => l.type === "TASK");
  for (const task of taskLessons) {
    const rawTask = await resolveLessonContent(task);
    if (!rawTask) continue;
    const { practice } = parsePracticeFromTaskContent(rawTask);
    if (practice?.quizlet?.length) {
      blocks.push({
        id: newBlockId(),
        type: "cards",
        items: practice.quizlet.map((q) => ({
          title: q.term,
          body: q.definition,
        })),
      });
    }
    if (practice?.matching?.length) {
      for (const m of practice.matching) {
        blocks.push({
          id: newBlockId(),
          type: "match",
          left: [...m.left],
          right: [...m.right],
        });
      }
    }
  }

  const testLesson = lessons.find((l) => l.type === "TEST");
  if (testLesson?.id) {
    try {
      const detail: LessonDetail = await coursesApi.getLessonById(testLesson.id);
      const questions = detail.tests?.[0]?.questions ?? [];
      for (const q of questions) {
        const correct = q.answers.find((a) => a.isCorrect);
        if (!correct) continue;
        const wrongs = q.answers.filter((a) => !a.isCorrect).map((a) => a.answerText.trim()).filter(Boolean);
        let text = q.questionText.trim();
        if (!/___|______/.test(text)) {
          text = `${text} ___`;
        } else {
          text = text.replace(/_{4,}/g, "___");
        }
        blocks.push({
          id: newBlockId(),
          type: "cloze",
          text,
          answers: [correct.answerText.trim()],
          distractors: wrongs,
        });
      }
    } catch {
      /* ignore */
    }
  }

  if (blocks.length === 0) {
    return {
      title: mod.title,
      blocks: normalizeScenarioBlocks([
        {
          id: newBlockId(),
          type: "text",
          richText: true,
          body: `<p>Модуль «${escapeHtml(mod.title)}» має ${lessons.length} урок(ів), але в БД немає тексту теорії/практики (або сид ще не оновив контент). На сервері виконайте повторний <strong>prisma db seed</strong> або відредагуйте уроки вручну.</p>`,
        },
      ]),
    };
  }

  return { title: mod.title, blocks: normalizeScenarioBlocks(blocks) };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
