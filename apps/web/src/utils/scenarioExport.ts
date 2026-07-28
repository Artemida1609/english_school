import type { ScenarioBlock, ScenarioDocument } from "../types/scenario";
import type { ConstructorPracticePayload } from "./constructorPractice";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Мінімальне очищення HTML з редактора (без повного sanitizer) */
export function sanitizeBasicHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

/** HTML для поля уроку (THEORY) — практика (картки, зіставлення, пропуски) лише у вкладці «Вправи» */
export function blocksToHtml(blocks: ScenarioBlock[]): string {
  const parts: string[] = [];
  let sectionIndex = 0;

  for (const b of blocks) {
    if (b.type === "cards" || b.type === "match" || b.type === "cloze" || b.type === "openCloze" || b.type === "letterOrder" || b.type === "quiz" || b.type === "wordBank" || b.type === "multiSelect") {
      continue;
    }

    sectionIndex += 1;
    const sid = `constructor-section-${b.id}`;

    switch (b.type) {
      case "text": {
        const useRich = b.richText !== false;
        const inner = useRich
          ? `<div class="constructor-rich prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">${sanitizeBasicHtml(b.body)}</div>`
          : b.body
              .split(/\n+/)
              .map((line) => line.trim())
              .filter(Boolean)
              .map(
                (line) =>
                  `<p class="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(line)}</p>`,
              )
              .join("");
        parts.push(
          `<section id="${sid}" class="constructor-text mb-8" data-section-index="${sectionIndex}">${inner || `<p class="text-slate-400">…</p>`}</section>`,
        );
        break;
      }
      case "table": {
        const th = b.headers.map((h) => `<th class="border border-slate-200 dark:border-slate-600 px-3 py-2 text-left font-semibold bg-slate-100 dark:bg-slate-800">${escapeHtml(h)}</th>`).join("");
        const tr = b.rows
          .map(
            (row) =>
              `<tr>${row.map((c) => `<td class="border border-slate-200 dark:border-slate-600 px-3 py-2">${escapeHtml(c)}</td>`).join("")}</tr>`,
          )
          .join("");
        parts.push(
          `<section id="${sid}" class="constructor-table mb-8 overflow-x-auto" data-section-index="${sectionIndex}"><table class="min-w-full border-collapse text-sm">${th ? `<thead><tr>${th}</tr></thead>` : ""}<tbody>${tr}</tbody></table></section>`,
        );
        break;
      }
      default:
        break;
    }
  }

  return parts.join("\n");
}

export function buildPracticeFromBlocks(blocks: ScenarioBlock[]): ConstructorPracticePayload {
  const cardBlocks = blocks.filter((b): b is Extract<ScenarioBlock, { type: "cards" }> => b.type === "cards");
  const matchBlocks = blocks.filter((b): b is Extract<ScenarioBlock, { type: "match" }> => b.type === "match");
  const clozeBlocks = blocks.filter((b): b is Extract<ScenarioBlock, { type: "cloze" }> => b.type === "cloze");
  const openClozeBlocks = blocks.filter((b): b is Extract<ScenarioBlock, { type: "openCloze" }> => b.type === "openCloze");
  const letterOrderBlocks = blocks.filter(
    (b): b is Extract<ScenarioBlock, { type: "letterOrder" }> => b.type === "letterOrder",
  );
  const quizlet = cardBlocks.flatMap((b) => b.items.map((it) => ({
    term: it.title,
    definition: it.body,
    transcription: it.transcription,
    category: it.category,
  })));
  const matching = matchBlocks.map((b) => ({ left: [...b.left], right: [...b.right] }));
  const sections: ConstructorPracticePayload["sections"] = [];
  let cardsIndex = 0;
  let matchIndex = 0;
  let letterIndex = 0;
  let openClozeIndex = 0;
  const totalCards = cardBlocks.length;
  const totalMatches = matchBlocks.length;
  const totalLetters = letterOrderBlocks.length;
  const totalOpenCloze = openClozeBlocks.length;

  for (const block of blocks) {
    if (block.type === "cards") {
      const currentIndex = cardsIndex++;
      sections.push({
        id: `practice-cards-${block.id}`,
        type: "cards",
        title: totalCards === 1 ? "Картки" : `Картки ${currentIndex + 1}`,
        items: block.items.map((it) => ({
          term: it.title,
          definition: it.body,
          transcription: it.transcription,
          category: it.category,
        })),
      });
      continue;
    }
    if (block.type === "match") {
      const currentIndex = matchIndex++;
      sections.push({
        id: `practice-match-${block.id}`,
        type: "match",
        title: totalMatches === 1 ? "Зіставлення" : `Зіставлення ${currentIndex + 1}`,
        left: [...block.left],
        right: [...block.right],
      });
      continue;
    }
    if (block.type === "cloze") {
      const currentIndex = clozeBlocks.findIndex((b) => b.id === block.id);
      sections.push({
        id: `practice-cloze-${block.id}`,
        type: "cloze",
        title: clozeBlocks.length === 1 ? "Пропуски" : `Пропуски ${currentIndex + 1}`,
        text: block.text,
        answers: [...block.answers],
        distractors: [...(block.distractors ?? [])],
      });
      continue;
    }
    if (block.type === "openCloze") {
      const answers = block.answers.map((a) => a.trim()).filter(Boolean);
      const text = block.text.trim();
      if (!text || !answers.length) continue;
      const currentIndex = openClozeIndex++;
      sections.push({
        id: `practice-open-cloze-${block.id}`,
        type: "openCloze",
        title: totalOpenCloze === 1 ? "Відкриті пропуски" : `Відкриті пропуски ${currentIndex + 1}`,
        text,
        answers,
      });
      continue;
    }
    if (block.type === "letterOrder") {
      const paragraphs = block.paragraphs.map((p) => p.trim()).filter(Boolean);
      if (paragraphs.length < 2) continue;
      const currentIndex = letterIndex++;
      sections.push({
        id: `practice-letter-${block.id}`,
        type: "letterOrder",
        title:
          block.title?.trim() ||
          (totalLetters === 1 ? "Лист" : `Лист ${currentIndex + 1}`),
        paragraphs,
      });
      continue;
    }
    if (block.type === "wordBank") {
      const items = block.items
        .map((item, idx) => ({
          id: item.id || `wb-item-${idx}`,
          text: item.text.trim(),
          answers: item.answers.map((a) => a.trim()).filter(Boolean),
        }))
        .filter((item) => item.text && item.answers.length);
      if (!items.length) continue;
      const wordBankCount = blocks.filter((b) => b.type === "wordBank").length;
      const wordBankIndex = blocks.filter((b) => b.type === "wordBank").findIndex((b) => b.id === block.id);
      sections.push({
        id: `practice-wordbank-${block.id}`,
        type: "wordBank",
        title: block.title?.trim() || (wordBankCount === 1 ? "Слова у пропуски" : `Слова у пропуски ${wordBankIndex + 1}`),
        items,
        distractors: (block.distractors ?? []).map((d) => d.trim()).filter(Boolean),
      });
      continue;
    }
    if (block.type === "multiSelect") {
      const questions = block.questions
        .map((q, qIdx) => ({
          id: q.id || `ms-q-${qIdx}`,
          questionText: q.questionText.trim(),
          options: q.options
            .map((opt) => ({ text: opt.text.trim(), isCorrect: Boolean(opt.isCorrect) }))
            .filter((opt) => opt.text.length > 0),
        }))
        .filter((q) => q.questionText && q.options.length > 0);
      if (!questions.length) continue;
      const msCount = blocks.filter((b) => b.type === "multiSelect").length;
      const msIndex = blocks.filter((b) => b.type === "multiSelect").findIndex((b) => b.id === block.id);
      sections.push({
        id: `practice-multiselect-${block.id}`,
        type: "multiSelect",
        title: block.title?.trim() || (msCount === 1 ? "Множинний вибір" : `Множинний вибір ${msIndex + 1}`),
        questions,
      });
    }
  }

  return { version: 2, quizlet, matching, sections };
}

/** Дані для ручного перенесення в вправу (пропущені слова) */
export function extractClozeExercisePayload(blocks: ScenarioBlock[]) {
  return blocks
    .filter((b): b is Extract<ScenarioBlock, { type: "cloze" }> => b.type === "cloze")
    .map((b, i) => {
      const gapCount = (b.text.match(/___/g) ?? []).length;
      return {
        order: i + 1,
        questionText: b.text,
        gaps: gapCount,
        answers: b.answers,
        distractors: b.distractors ?? [],
      };
    });
}

export function documentToJson(doc: ScenarioDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function parseScenarioJson(raw: string): ScenarioDocument | null {
  try {
    const o = JSON.parse(raw) as ScenarioDocument;
    if (o?.version === 1 && Array.isArray(o.blocks)) return o;
  } catch {
    /* ignore */
  }
  return null;
}

/** Питання для вкладки «Тест» з блоків quiz */
export function buildTestQuestionsFromBlocks(
  blocks: ScenarioBlock[],
): { questionText: string; answers: { text: string; isCorrect: boolean }[] }[] {
  const out: { questionText: string; answers: { text: string; isCorrect: boolean }[] }[] = [];

  for (const block of blocks) {
    if (block.type !== "quiz") continue;
    for (const q of block.questions) {
      const questionText = q.questionText.trim();
      const answers = q.answers
        .map((a) => ({ text: a.text.trim(), isCorrect: a.isCorrect }))
        .filter((a) => a.text.length > 0);
      const correctCount = answers.filter((a) => a.isCorrect).length;
      if (!questionText || answers.length < 2 || correctCount !== 1) continue;
      out.push({ questionText, answers });
    }
  }

  return out;
}
