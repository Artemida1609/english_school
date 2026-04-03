import { coursesApi, type LessonDetail, type Module } from "../api/courses";
import { parsePracticeFromTaskContent } from "./constructorPractice";
import { newBlockId, normalizeScenarioBlocks, parseScenarioJson, type ScenarioBlock } from "../types/scenario";

export type ModuleWithConstructor = Module & { constructorJson?: string | null };

/**
 * Відновлює title + blocks для конструктора з модуля API:
 * 1) поле constructorJson (повний сценарій після збереження з конструктора);
 * 2) інакше — евристика з уроків THEORY / TASK / TEST.
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

  const theory = lessons.find((l) => l.type === "THEORY");
  if (theory?.content?.trim()) {
    const c = theory.content.trim();
    blocks.push({
      id: newBlockId(),
      type: "text",
      body: c,
      richText: /<[a-z][\s\S]*>/i.test(c) ? true : false,
    });
  }

  const task = lessons.find((l) => l.type === "TASK");
  if (task?.content?.trim()) {
    const { practice } = parsePracticeFromTaskContent(task.content);
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

  if (blocks.length === 0) return null;
  return { title: mod.title, blocks: normalizeScenarioBlocks(blocks) };
}
