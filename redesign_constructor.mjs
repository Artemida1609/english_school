import { readFileSync, writeFileSync } from 'fs';

const filePath = './apps/web/src/pages/ModuleConstructorPage.tsx';
let src = readFileSync(filePath, 'utf8');

// Normalize to \n for consistent matching
src = src.replace(/\r\n/g, '\n');

// ─── 1. Replace old header + info box (lines 578-614) ────────────────────────
const OLD_HEADER = `  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#030812] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Конструктор модулів
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Збирайте сценарій уроку: текст, таблиці, картки, зіставлення з лініями та пропуски для питань тесту.
          </p>
        </header>

        <div className="mb-6 rounded-2xl border border-sky-200/80 bg-sky-50/90 p-4 text-sm text-slate-700 dark:border-sky-500/25 dark:bg-sky-950/40 dark:text-slate-300">
          <p className="font-bold text-sky-900 dark:text-sky-100">Як зберегти</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5">
            <li>
              <strong>На сервер</strong> — оберіть <strong>курс</strong> (усі курси, включно з неопублікованими) і{" "}
              <strong>модуль</strong>: або «Новий модуль», або існуючий у цьому курсі для оновлення. Далі «Зберегти на сервері».
              Під списком курсу: <strong>Новий курс</strong>, <strong>Редагувати курс</strong>, <strong>Видалити курс</strong> (лише
              для викладача / адміна).
              Щоб <strong>створити ще один новий запис</strong> у тому ж курсі, оберіть знову «Новий модуль» у другому списку або
              натисніть «Новий модуль».
            </li>
            <li>
              <strong>Видалити модуль</strong> з курсу можна кнопкою «Видалити з сервера» (лише для поточного прив'язаного модуля).
            </li>
            <li>
              <strong>Перегляд</strong> — той самий екран, що й у студента (ModulePage): теорія, практика з картками та зіставленням; блок «Пропуски» формує лише питання тесту. Прогрес не зберігається.
            </li>
            <li>
              <strong>Чернетка в браузері</strong> — додатково зберігається локально (авто або кнопка «Зберегти чернетку»).
            </li>
            <li>
              Можна вручну скопіювати <strong>HTML</strong> / <strong>JSON</strong> або <strong>Завантажити JSON</strong>.
            </li>
          </ul>
        </div>`;

const NEW_HEADER = `  return (
    <div className="min-h-full pb-24 relative overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 dark:from-[#030812] dark:via-[#081020] dark:to-[#071a14]">
      {/* decorative orbs */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/8 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 -left-32 w-96 h-96 rounded-full bg-teal-300/10 dark:bg-teal-600/8 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">

        {/* ─── HERO HEADER ─── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-black text-emerald-600 dark:text-emerald-400 mb-1.5">
                Адмін · Конструктор
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-slate-900 dark:text-white">
                Конструктор{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  модулів
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Текст, таблиці, картки, зіставлення та тестові пропуски — все в одному редакторі.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(v => !v)}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-sky-200 dark:border-sky-800/50 bg-white/80 dark:bg-sky-950/40 backdrop-blur px-4 py-2.5 text-xs font-bold text-sky-700 dark:text-sky-300 shadow-sm hover:shadow-md transition-all"
            >
              <span>💡</span>{showHelp ? "Сховати" : "Інструкція"}
            </button>
          </div>
        </motion.header>

        {/* ─── COLLAPSIBLE HELP ─── */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              key="help"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border border-sky-200/60 dark:border-sky-700/30 bg-white/70 dark:bg-sky-950/25 backdrop-blur-xl p-5 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
                <p className="font-black text-sky-800 dark:text-sky-200 mb-3">📋 Інструкція</p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
                  {[
                    ["①","На сервер"," — оберіть курс та модуль, натисніть «Зберегти на сервері»."],
                    ["②","Новий модуль"," — оберіть «Новий модуль» або натисніть відповідну кнопку."],
                    ["③","Перегляд"," — як студент бачить: теорія, практика, тест."],
                    ["④","Чернетка"," — авто-збереження в браузері + ручна кнопка."],
                    ["⑤","HTML / JSON"," — копіювати або завантажити файл."],
                    ["⑥","Видалити"," — модуль/курс — дія незворотна."],
                  ].map(([n,b,t]) => (
                    <div key={n} className="flex gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">{n}</span>
                      <span><strong>{b}</strong>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>`;

if (src.includes(OLD_HEADER)) {
  src = src.replace(OLD_HEADER, NEW_HEADER);
  console.log('✅ Header replaced');
} else {
  console.log('⚠️ Header target not found — already replaced or mismatch');
}

// ─── 2. Fix unclosed motion.div for course panel ─────────────────────────────
// The script previously added the opening but not the closing.
// Find the course panel opener and add the closer after the </div>
const PANEL_OPENER = `        {/* ─── COURSE / MODULE PANEL ─── */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.08 }} className="mb-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-700/30 bg-white/80 dark:bg-emerald-950/20 backdrop-blur-xl p-5 shadow-sm">`;

if (src.includes(PANEL_OPENER)) {
  console.log('✅ Panel opener found');
} else {
  console.log('⚠️ Panel opener not found');
}

// Find the closing </div> of the course panel and add </motion.div> after it
// The course panel ends with the publishedModuleId link, then </div>
// followed by the OLD draft bar opener.
const PANEL_CLOSER_OLD = `        </div>\n\n        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">`;
const PANEL_CLOSER_NEW = `        </div>\n        </motion.div>\n\n        {/* ─── DRAFT BAR ─── */}\n        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur px-4 py-3">`;

if (src.includes(PANEL_CLOSER_OLD)) {
  src = src.replace(PANEL_CLOSER_OLD, PANEL_CLOSER_NEW);
  console.log('✅ Panel closer + draft bar replaced');
} else {
  console.log('⚠️ Panel closer not found');
}

// ─── 3. Replace draft bar inner content ──────────────────────────────────────
const OLD_DRAFT_INNER = `          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => persistDraft()}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              Зберегти чернетку
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lastSavedAt
                ? \`Останнє збереження: \${formatSavedTime(lastSavedAt)}\`
                : "Ще не зберігалось у цьому сеансі"}
            </span>
          </div>
        </div>`;

const NEW_DRAFT_INNER = `          <button
            type="button"
            onClick={() => persistDraft()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 dark:bg-slate-200 px-4 py-2 text-sm font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-700 dark:hover:bg-white transition-colors"
          >
            <span>💾</span> Зберегти чернетку
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {lastSavedAt ? \`Збережено: \${formatSavedTime(lastSavedAt)}\` : "Ще не збережено"}
          </span>
        </div>`;

if (src.includes(OLD_DRAFT_INNER)) {
  src = src.replace(OLD_DRAFT_INNER, NEW_DRAFT_INNER);
  console.log('✅ Draft bar content replaced');
} else {
  console.log('⚠️ Draft bar content not found');
}

// ─── 4. Replace scenario title + block buttons ───────────────────────────────
const OLD_TITLE = `        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-1 flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Назва сценарію</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <ToolBtn onClick={() => addBlock("text")} label="Текст" />
            <ToolBtn onClick={() => addBlock("table")} label="Таблиця" />
            <ToolBtn onClick={() => addBlock("cards")} label="Картки" />
            <ToolBtn onClick={() => addBlock("match")} label="Зіставлення" />
            <ToolBtn onClick={() => addBlock("cloze")} label="Пропуски (тест)" />
          </div>
        </div>`;

const NEW_TITLE = `        {/* ─── SCENARIO TITLE + BLOCK TYPES ─── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5 min-w-[220px]">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Назва сценарію</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition"
              placeholder="Назва модуля…"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <ToolBtn onClick={() => addBlock("text")} label="Текст" icon="📝" />
            <ToolBtn onClick={() => addBlock("table")} label="Таблиця" icon="📊" />
            <ToolBtn onClick={() => addBlock("cards")} label="Картки" icon="🃏" />
            <ToolBtn onClick={() => addBlock("match")} label="Зіставлення" icon="🔗" />
            <ToolBtn onClick={() => addBlock("cloze")} label="Пропуски" icon="✏️" />
          </div>
        </div>`;

if (src.includes(OLD_TITLE)) {
  src = src.replace(OLD_TITLE, NEW_TITLE);
  console.log('✅ Scenario title section replaced');
} else {
  console.log('⚠️ Scenario title section not found');
}

// ─── 5. Close outer div wrapper (add closing </div> for the max-w-7xl div) ───
// The original had 2 closing tags: one for inner wrapper, one for outer.
// Now we have 3 levels: outer page div, max-w-7xl div, and former content.
// Check if we need to fix the closing tags.
const OLD_CLOSING = `    </div>\n  );\n}`;
const NEW_CLOSING = `      </div>\n    </div>\n  );\n}`;

// Only replace if we introduced a new wrapper that needs closing
// Actually the script adds the max-w-7xl div wrapper but the old closing only had 2 </div>s.
// Check current state:
const closingCount = (src.match(/<\/div>\n  \);\n\}/g) || []).length;
console.log(`Closing pattern count: ${closingCount}`);

writeFileSync(filePath, src, 'utf8');
console.log('\n✅ All fixes applied!');
