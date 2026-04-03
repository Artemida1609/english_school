import type { ScenarioBlock, ScenarioDocument } from "../types/scenario";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML для поля уроку (THEORY / TASK) — як у сиді, через dangerouslySetInnerHTML */
export function blocksToHtml(blocks: ScenarioBlock[]): string {
  const parts: string[] = [];
  let sectionIndex = 0;

  for (const b of blocks) {
    if (b.type === "connector") {
      const from = blocks.find((x) => x.id === b.fromId);
      const to = blocks.find((x) => x.id === b.toId);
      const fromLabel = from ? sectionLabel(from, blocks) : "?";
      const toLabel = to ? sectionLabel(to, blocks) : "?";
      const label = b.label?.trim() ? escapeHtml(b.label.trim()) : "";
      parts.push(`
<div class="constructor-connector my-6 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-4 dark:border-emerald-500/30 dark:bg-emerald-950/40">
  <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${fromLabel}</span>
  <span class="flex items-center text-emerald-600 dark:text-emerald-400" aria-hidden="true">
    <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><path d="M2 12h28m0 0l-6-6m6 6l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </span>
  <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${toLabel}</span>
  ${label ? `<span class="w-full text-center text-xs text-slate-500 dark:text-slate-400">${label}</span>` : ""}
</div>`);
      continue;
    }

    sectionIndex += 1;
    const sid = `constructor-section-${b.id}`;

    switch (b.type) {
      case "text": {
        const paras = b.body
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `<p class="mb-3 text-slate-700 dark:text-slate-300 leading-relaxed">${escapeHtml(line)}</p>`)
          .join("");
        parts.push(
          `<section id="${sid}" class="constructor-text mb-8" data-section-index="${sectionIndex}">${paras || `<p class="text-slate-400">…</p>`}</section>`,
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
      case "cards": {
        const cards = b.items
          .map(
            (it) =>
              `<div class="rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 p-4 shadow-sm"><h4 class="font-bold text-slate-900 dark:text-white mb-2">${escapeHtml(it.title)}</h4><p class="text-sm text-slate-600 dark:text-slate-300">${escapeHtml(it.body)}</p></div>`,
          )
          .join("");
        parts.push(
          `<section id="${sid}" class="constructor-cards mb-8 grid gap-4 sm:grid-cols-2" data-section-index="${sectionIndex}">${cards}</section>`,
        );
        break;
      }
      case "cloze": {
        let i = 0;
        const html = b.text.replace(/___/g, () => {
          const ans = b.answers[i] ?? "";
          i += 1;
          return `<span class="cloze-gap inline-block min-w-[6rem] border-b-2 border-emerald-500/70 px-1 mx-0.5 align-bottom" data-answer="${escapeHtml(ans)}">______</span>`;
        });
        parts.push(
          `<section id="${sid}" class="constructor-cloze mb-8 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-500/25 dark:bg-amber-950/30" data-section-index="${sectionIndex}"><p class="text-slate-800 dark:text-slate-200 leading-relaxed">${html}</p><p class="mt-2 text-xs text-slate-500 dark:text-slate-400">Заповніть пропуски (для тесту див. експорт JSON).</p></section>`,
        );
        break;
      }
      default:
        break;
    }
  }

  return parts.join("\n");
}

function sectionLabel(block: ScenarioBlock, all: ScenarioBlock[]): string {
  const typeNames: Record<string, string> = {
    text: "Текст",
    table: "Таблиця",
    cards: "Картки",
    cloze: "Пропуски",
  };
  const nonConn = all.filter((b) => b.type !== "connector");
  const idx = nonConn.findIndex((b) => b.id === block.id);
  const n = idx >= 0 ? idx + 1 : 0;
  return `Секція ${n} (${typeNames[block.type] ?? block.type})`;
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
    const numGaps = Math.max(0, parts.length - 1);
    for (let j = 0; j < numGaps; j++) {
      const correct = answers[j];
      if (!correct) continue;
      const before = parts.slice(0, j + 1).join(" ___ ");
      const after = parts.slice(j + 1).join(" ___ ");
      const questionText = `${before} ______ ${after}`.replace(/\s+/g, " ").trim();
      const wrongPool = pool.filter((x) => x.toLowerCase() !== correct.toLowerCase());
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
