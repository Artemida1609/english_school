import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { defaultBlock, type ScenarioBlock, type ScenarioDocument } from "../types/scenario";
import { writeConstructorPreview } from "../types/constructorPreview";
import { coursesApi, type Course } from "../api/courses";
import { constructorApi } from "../api/constructor";
import {
  blocksToHtml,
  buildTestQuestionsFromBlocks,
  documentToJson,
  extractClozeTestPayload,
  parseScenarioJson,
} from "../utils/scenarioExport";

const LS_KEY = "moduleConstructorDraft";

/** Текст уроку «Вправи» при публікації на сервер */
const TASK_FOR_PUBLISH = "## Вправа\n\nЗакріпіть матеріал з теорії та пройдіть тест нижче.";

function formatSavedTime(d: Date): string {
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export function ModuleConstructorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Новий модуль");
  const [blocks, setBlocks] = useState<ScenarioBlock[]>([defaultBlock("text")]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [publishedModuleId, setPublishedModuleId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const skipNextAutosave = useRef(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const persistDraft = useCallback(
    (opts?: { silent?: boolean }) => {
      const doc: ScenarioDocument = {
        version: 1,
        title,
        blocks,
        ...(publishedModuleId ? { publishedModuleId } : {}),
        ...(courseId ? { courseId } : {}),
      };
      try {
        localStorage.setItem(LS_KEY, documentToJson(doc));
        setLastSavedAt(new Date());
        if (!opts?.silent) {
          showToast("Чернетку збережено в браузері");
        }
      } catch {
        showToast("Не вдалося зберегти (пам’ять браузера)");
      }
    },
    [title, blocks, publishedModuleId, courseId, showToast],
  );

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const doc = parseScenarioJson(raw);
    if (doc) {
      skipNextAutosave.current = true;
      setTitle(doc.title);
      setBlocks(doc.blocks.length ? doc.blocks : [defaultBlock("text")]);
      if (doc.publishedModuleId) setPublishedModuleId(doc.publishedModuleId);
      if (doc.courseId) setCourseId(doc.courseId);
      setLastSavedAt(new Date());
    }
  }, []);

  useEffect(() => {
    coursesApi
      .getCourses()
      .then((list) => setCourses(list))
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (courseId || courses.length === 0) return;
    const preferred =
      courses.find((c) => c.id === "course-level-1-business-english") ?? courses[0];
    setCourseId(preferred.id);
  }, [courses, courseId]);

  useEffect(() => {
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const doc: ScenarioDocument = {
        version: 1,
        title,
        blocks,
        ...(publishedModuleId ? { publishedModuleId } : {}),
        ...(courseId ? { courseId } : {}),
      };
      try {
        localStorage.setItem(LS_KEY, documentToJson(doc));
        setLastSavedAt(new Date());
      } catch {
        /* ignore silent autosave errors */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [title, blocks, publishedModuleId, courseId]);

  const htmlExport = useMemo(() => blocksToHtml(blocks), [blocks]);
  const testPayload = useMemo(() => extractClozeTestPayload(blocks), [blocks]);

  const sectionOptions = useMemo(
    () => blocks.filter((b) => b.type !== "connector"),
    [blocks],
  );

  const addBlock = (type: ScenarioBlock["type"]) => {
    let nb: ScenarioBlock = defaultBlock(type);
    if (type === "connector" && sectionOptions.length >= 2) {
      nb = {
        id: nb.id,
        type: "connector",
        fromId: sectionOptions[0].id,
        toId: sectionOptions[1].id,
        label: "",
      };
    }
    setBlocks((prev) => [...prev, nb]);
    setExpandedId(nb.id);
  };

  const updateBlock = (id: string, patch: Partial<ScenarioBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as ScenarioBlock) : b)),
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.length ? next : [defaultBlock("text")];
    });
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label);
    } catch {
      showToast("Не вдалося скопіювати");
    }
  };

  const importJson = () => {
    const raw = window.prompt("Вставте JSON сценарію (version: 1):");
    if (!raw) return;
    const doc = parseScenarioJson(raw.trim());
    if (!doc) {
      showToast("Некоректний JSON");
      return;
    }
    setTitle(doc.title);
    setBlocks(doc.blocks.length ? doc.blocks : [defaultBlock("text")]);
    setPublishedModuleId(doc.publishedModuleId ?? null);
    setCourseId(doc.courseId ?? "");
    showToast("Імпортовано");
  };

  const openModulePreview = () => {
    writeConstructorPreview({
      title: title.trim() || "Перегляд",
      theoryHtml: htmlExport,
      taskMarkdown: TASK_FOR_PUBLISH,
      testQuestions: buildTestQuestionsFromBlocks(blocks),
    });
    navigate("/constructor/preview");
  };

  const publishToServer = async () => {
    if (!title.trim()) {
      showToast("Вкажіть назву модуля");
      return;
    }
    if (!courseId) {
      showToast("Оберіть курс або дочекайтесь завантаження списку");
      return;
    }
    const testQuestions = buildTestQuestionsFromBlocks(blocks);
    const body = {
      title: title.trim(),
      description: "Створено в конструкторі модулів",
      theoryHtml: htmlExport,
      taskMarkdown: TASK_FOR_PUBLISH,
      ...(testQuestions.length ? { testQuestions } : {}),
    };
    setPublishing(true);
    try {
      let moduleIdAfter = publishedModuleId;
      if (publishedModuleId) {
        await constructorApi.sync(publishedModuleId, body);
        showToast("Модуль оновлено на сервері");
      } else {
        const mod = await constructorApi.publish(courseId, body);
        moduleIdAfter = mod.id;
        setPublishedModuleId(mod.id);
        showToast("Модуль збережено на сервері");
      }
      if (moduleIdAfter) {
        try {
          localStorage.setItem(
            LS_KEY,
            documentToJson({
              version: 1,
              title,
              blocks,
              publishedModuleId: moduleIdAfter,
              courseId,
            }),
          );
          setLastSavedAt(new Date());
        } catch {
          /* ignore */
        }
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка збереження");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#030812] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
            Конструктор модулів
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Збирайте сценарій уроку: текст, таблиці, картки, конектори між секціями та блоки з пропусками для тесту.
          </p>
        </header>

        <div className="mb-6 rounded-2xl border border-sky-200/80 bg-sky-50/90 p-4 text-sm text-slate-700 dark:border-sky-500/25 dark:bg-sky-950/40 dark:text-slate-300">
          <p className="font-bold text-sky-900 dark:text-sky-100">Як зберегти</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5">
            <li>
              <strong>На сервер</strong> — оберіть курс і натисніть «Зберегти на сервері». Створються уроки «Теорія», «Вправи» та
              «Тест» (якщо є блоки з пропусками). Повторне натискання оновлює той самий модуль.
            </li>
            <li>
              <strong>Перегляд</strong> — «Як виглядатиме модуль» відкриває повноекранний перегляд без збереження прогресу.
            </li>
            <li>
              <strong>Чернетка в браузері</strong> — додатково зберігається локально (авто або кнопка «Зберегти чернетку»).
            </li>
            <li>
              Можна вручну скопіювати <strong>HTML</strong> / <strong>JSON</strong> або <strong>Завантажити JSON</strong>.
            </li>
          </ul>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[200px] flex-1 flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Курс на сервері
              </span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={courses.length === 0}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-emerald-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
              >
                {courses.length === 0 ? (
                  <option value="">Завантаження курсів…</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openModulePreview}
                className="rounded-xl border-2 border-violet-400 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-900 shadow-sm hover:bg-violet-100 dark:border-violet-500 dark:bg-violet-950/50 dark:text-violet-100 dark:hover:bg-violet-900/40"
              >
                Як виглядатиме модуль
              </button>
              <button
                type="button"
                onClick={() => void publishToServer()}
                disabled={publishing || !courseId}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow hover:bg-emerald-500 disabled:opacity-50"
              >
                {publishing ? "Збереження…" : publishedModuleId ? "Оновити на сервері" : "Зберегти на сервері"}
              </button>
            </div>
          </div>
          {publishedModuleId && (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Модуль на сервері:{" "}
              <Link
                to={`/course/modules/${publishedModuleId}`}
                className="font-bold text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400"
              >
                відкрити в додатку (як студент)
              </Link>
            </p>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => persistDraft()}
              className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              Зберегти чернетку
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lastSavedAt
                ? `Останнє збереження: ${formatSavedTime(lastSavedAt)}`
                : "Ще не зберігалось у цьому сеансі"}
            </span>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
            <ToolBtn
              onClick={() => addBlock("connector")}
              label="Конектор"
              disabled={sectionOptions.length < 2}
            />
            <ToolBtn onClick={() => addBlock("cloze")} label="Пропуски" />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyText(htmlExport, "HTML скопійовано в буфер")}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-emerald-500"
          >
            Копіювати HTML (для уроку)
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(
                documentToJson({
                  version: 1,
                  title,
                  blocks,
                  ...(publishedModuleId ? { publishedModuleId } : {}),
                  ...(courseId ? { courseId } : {}),
                }),
                "JSON сценарію скопійовано",
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
          >
            Копіювати JSON
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(JSON.stringify(testPayload, null, 2), "JSON тесту скопійовано")
            }
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 dark:border-amber-600/50 dark:bg-amber-950/50 dark:text-amber-100"
            disabled={!testPayload.length}
          >
            JSON пропусків ({testPayload.length})
          </button>
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([
                documentToJson({
                  version: 1,
                  title,
                  blocks,
                  ...(publishedModuleId ? { publishedModuleId } : {}),
                  ...(courseId ? { courseId } : {}),
                }),
              ], {
                type: "application/json;charset=utf-8",
              });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              const safe = title.replace(/[^\w\u0400-\u04FF\-]+/g, "_").slice(0, 40) || "scenario";
              a.download = `${safe}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
              showToast("Файл JSON завантажено");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            Завантажити JSON
          </button>
          <button
            type="button"
            onClick={importJson}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-300"
          >
            Імпорт JSON
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(280px,380px)]">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {blocks.map((b, index) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                      className="flex flex-1 items-center gap-2 text-left text-sm font-bold text-slate-800 dark:text-slate-200"
                    >
                      <span className="text-slate-400">#{index + 1}</span>
                      {blockTitle(b)}
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <IconBtn
                        aria-label="Вгору"
                        onClick={() => setBlocks((prev) => moveItem(prev, index, index - 1))}
                        disabled={index === 0}
                      >
                        ↑
                      </IconBtn>
                      <IconBtn
                        aria-label="Вниз"
                        onClick={() => setBlocks((prev) => moveItem(prev, index, index + 1))}
                        disabled={index === blocks.length - 1}
                      >
                        ↓
                      </IconBtn>
                      <IconBtn
                        aria-label="Видалити"
                        onClick={() => removeBlock(b.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        ×
                      </IconBtn>
                    </div>
                  </div>
                  {expandedId === b.id && (
                    <div className="p-4">
                      <BlockFields
                        block={b}
                        sectionOptions={sectionOptions}
                        onChange={(patch) => updateBlock(b.id, patch)}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit space-y-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Перегляд</h2>
            <div
              className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-950"
              dangerouslySetInnerHTML={{ __html: htmlExport }}
            />
            {testPayload.length > 0 && (
              <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 text-xs text-emerald-200">
                {JSON.stringify(testPayload, null, 2)}
              </pre>
            )}
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function blockTitle(b: ScenarioBlock): string {
  switch (b.type) {
    case "text":
      return "Текст";
    case "table":
      return "Таблиця";
    case "cards":
      return "Картки";
    case "connector":
      return "Конектор (стрілка)";
    case "cloze":
      return "Пропуски для тесту";
    default: {
      const _ex: never = b;
      return _ex;
    }
  }
}

function ToolBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 disabled:opacity-40 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100"
    >
      + {label}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  className = "",
  "aria-label": aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-2 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 ${className}`}
    >
      {children}
    </button>
  );
}

function BlockFields({
  block,
  sectionOptions,
  onChange,
}: {
  block: ScenarioBlock;
  sectionOptions: ScenarioBlock[];
  onChange: (patch: Partial<ScenarioBlock>) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <textarea
          value={block.body}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
      );
    case "table": {
      const setHeader = (i: number, v: string) => {
        const headers = [...block.headers];
        headers[i] = v;
        onChange({ headers });
      };
      const setCell = (r: number, c: number, v: string) => {
        const rows = block.rows.map((row) => [...row]);
        if (!rows[r]) return;
        rows[r][c] = v;
        onChange({ rows });
      };
      const addRow = () => {
        const cols = block.headers.length || 2;
        onChange({ rows: [...block.rows, Array(cols).fill("")] });
      };
      const addCol = () => {
        onChange({
          headers: [...block.headers, `Колонка ${block.headers.length + 1}`],
          rows: block.rows.map((row) => [...row, ""]),
        });
      };
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addCol}
              className="text-xs font-bold text-emerald-600"
            >
              + колонка
            </button>
            <button type="button" onClick={addRow} className="text-xs font-bold text-emerald-600">
              + рядок
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={`h-${i}`} className="p-1">
                      <input
                        value={h}
                        onChange={(e) => setHeader(i, e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="p-1">
                        <input
                          value={cell}
                          onChange={(e) => setCell(ri, ci, e.target.value)}
                          className="w-full rounded border border-slate-200 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    case "cards":
      return (
        <div className="space-y-3">
          {block.items.map((it, i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
              <input
                value={it.title}
                placeholder="Заголовок"
                onChange={(e) => {
                  const items = block.items.map((x, j) =>
                    j === i ? { ...x, title: e.target.value } : x,
                  );
                  onChange({ items });
                }}
                className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-800"
              />
              <textarea
                value={it.body}
                placeholder="Текст картки"
                onChange={(e) => {
                  const items = block.items.map((x, j) =>
                    j === i ? { ...x, body: e.target.value } : x,
                  );
                  onChange({ items });
                }}
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ items: [...block.items, { title: "Нова", body: "" }] })}
            className="text-xs font-bold text-emerald-600"
          >
            + картка
          </button>
        </div>
      );
    case "connector":
      return (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500">Від секції</label>
          <select
            value={block.fromId}
            onChange={(e) => onChange({ fromId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">—</option>
            {sectionOptions.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === block.toId}>
                {blockTitle(s)} ({s.id.slice(0, 8)}…)
              </option>
            ))}
          </select>
          <label className="block text-xs font-bold text-slate-500">До секції</label>
          <select
            value={block.toId}
            onChange={(e) => onChange({ toId: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="">—</option>
            {sectionOptions.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === block.fromId}>
                {blockTitle(s)} ({s.id.slice(0, 8)}…)
              </option>
            ))}
          </select>
          <label className="block text-xs font-bold text-slate-500">Підпис (необов’язково)</label>
          <input
            value={block.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="наприклад: логіка уроку"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      );
    case "cloze": {
      const gapCount = (block.text.match(/___/g) ?? []).length;
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Використовуйте <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">___</code> як
            пропуск. Кількість пропусків: {gapCount}
          </p>
          <textarea
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <label className="text-xs font-bold text-slate-500">Відповіді по порядку (через кому)</label>
          <input
            value={block.answers.join(", ")}
            onChange={(e) => {
              const answers = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ answers });
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      );
    }
    default:
      return null;
  }
}
