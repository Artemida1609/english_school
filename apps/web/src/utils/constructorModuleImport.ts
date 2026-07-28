import { coursesApi, type Lesson, type LessonDetail, type Module } from "../api/courses";
import { parsePracticeFromTaskContent } from "./constructorPractice";
import { newBlockId, normalizeScenarioBlocks, type ScenarioBlock } from "../types/scenario";
import { parseScenarioJson } from "./scenarioExport";

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
    if (!practice) continue;

    if (practice.sections?.length) {
      for (const section of practice.sections) {
        if (section.type === "cards") {
          blocks.push({
            id: newBlockId(),
            type: "cards",
            items: section.items.map((q) => ({
              title: q.term,
              body: q.definition,
            })),
          });
          continue;
        }
        if (section.type === "match") {
          blocks.push({
            id: newBlockId(),
            type: "match",
            left: [...section.left],
            right: [...section.right],
          });
          continue;
        }
        if (section.type === "cloze") {
          blocks.push({
            id: newBlockId(),
            type: "cloze",
            text: section.text,
            answers: [...section.answers],
            distractors: [...(section.distractors ?? [])],
          });
          continue;
        }
        if (section.type === "openCloze") {
          blocks.push({
            id: newBlockId(),
            type: "openCloze",
            text: section.text,
            answers: [...section.answers],
          });
          continue;
        }
        if (section.type === "letterOrder") {
          blocks.push({
            id: newBlockId(),
            type: "letterOrder",
            title: section.title,
            paragraphs: [...section.paragraphs],
          });
          continue;
        }
        if (section.type === "wordBank") {
          blocks.push({
            id: newBlockId(),
            type: "wordBank",
            title: section.title,
            items: section.items.map((it) => ({
              id: it.id || newBlockId(),
              text: it.text,
              answers: [...it.answers],
            })),
            distractors: [...(section.distractors ?? [])],
          });
          continue;
        }
        if (section.type === "multiSelect") {
          blocks.push({
            id: newBlockId(),
            type: "multiSelect",
            title: section.title,
            questions: section.questions.map((q) => ({
              id: q.id || newBlockId(),
              questionText: q.questionText,
              options: q.options.map((opt) => ({ text: opt.text, isCorrect: opt.isCorrect })),
            })),
          });
        }
      }
      continue;
    }

    if (practice.quizlet?.length) {
      blocks.push({
        id: newBlockId(),
        type: "cards",
        items: practice.quizlet.map((q) => ({
          title: q.term,
          body: q.definition,
        })),
      });
    }
    if (practice.matching?.length) {
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
      const quizQuestions = questions.flatMap((q) => {
        const answers = q.answers
          .map((a) => ({ text: a.answerText.trim(), isCorrect: a.isCorrect }))
          .filter((a) => a.text.length > 0);
        const correctCount = answers.filter((a) => a.isCorrect).length;
        const questionText = q.questionText.trim();
        if (!questionText || answers.length < 2 || correctCount !== 1) return [];
        return [{ questionText, answers }];
      });
      if (quizQuestions.length > 0) {
        blocks.push({
          id: newBlockId(),
          type: "quiz",
          title: detail.tests?.[0]?.title?.trim() || "Тест",
          questions: quizQuestions,
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
