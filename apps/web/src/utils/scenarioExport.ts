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
    if (b.type === "cards" || b.type === "match" || b.type === "cloze") {
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
  const quizlet = blocks
    .filter((b): b is Extract<ScenarioBlock, { type: "cards" }> => b.type === "cards")
    .flatMap((b) => b.items.map((it) => ({ 
      term: it.title, 
      definition: it.body,
      transcription: it.transcription,
      category: it.category,
    })));
  const matching = blocks
    .filter((b): b is Extract<ScenarioBlock, { type: "match" }> => b.type === "match")
    .map((b) => ({ left: [...b.left], right: [...b.right] }));
  return { version: 1, quizlet, matching };
}

/** Дані для ручного перенесення в тест (пропущені слова) */
export function extractClozeTestPayload(blocks: ScenarioBlock[]) {
  return blocks
    .filter((b): b is Extract<ScenarioBlock, { type: "cloze" }> => b.type === "cloze")
    .map((b, i) => {
      const gapCount = (b.text.match(/___/g) ?? []).length;
      return {
        order: i + 1,
        questionText: b.text.replace(/___/g, "______"),
        gaps: gapCount,
        correctAnswersInOrder: b.answers,
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Питання для тесту (MCQ) з блоків cloze — для API та прев’ю */
export function buildTestQuestionsFromBlocks(
  blocks: ScenarioBlock[],
): { questionText: string; answers: { text: string; isCorrect: boolean }[] }[] {
  const clozeBlocks = blocks.filter(
    (b): b is Extract<ScenarioBlock, { type: "cloze" }> => b.type === "cloze",
  );
  const pool = clozeBlocks.flatMap((b) => b.answers.map((x) => x.trim()).filter(Boolean));
  const fillers = ["is", "are", "was", "were", "have", "has", "do", "does", "did"];
  const out: { questionText: string; answers: { text: string; isCorrect: boolean }[] }[] = [];

  for (const b of clozeBlocks) {
    const parts = b.text.split("___");
    const answers = b.answers.map((x) => x.trim());
    const dist = (b.distractors ?? []).map((x) => x.trim()).filter(Boolean);
    const numGaps = Math.max(0, parts.length - 1);
    for (let j = 0; j < numGaps; j++) {
      const correct = answers[j];
      if (!correct) continue;
      const before = parts.slice(0, j + 1).join(" ___ ");
      const after = parts.slice(j + 1).join(" ___ ");
      const questionText = `${before} ______ ${after}`.replace(/\s+/g, " ").trim();
      const wrongPool = [
        ...dist.filter((x) => x.toLowerCase() !== correct.toLowerCase()),
        ...pool.filter((x) => x.toLowerCase() !== correct.toLowerCase()),
      ];
      const wrongs: string[] = [];
      for (const w of wrongPool) {
        if (wrongs.length >= 3) break;
        if (!wrongs.includes(w)) wrongs.push(w);
      }
      let fi = 0;
      while (wrongs.length < 3) {
        wrongs.push(fillers[fi % fillers.length]);
        fi++;
      }
      const opts = shuffle([
        { text: correct, isCorrect: true },
        ...wrongs.slice(0, 3).map((t) => ({ text: t, isCorrect: false as boolean })),
      ]);
      out.push({ questionText, answers: opts });
    }
  }
  return out;
}
