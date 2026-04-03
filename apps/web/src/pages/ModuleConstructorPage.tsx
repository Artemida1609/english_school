import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { defaultBlock, normalizeScenarioBlocks, type ScenarioBlock, type ScenarioDocument } from "../types/scenario";
import {
  CONSTRUCTOR_PREVIEW_MODULE_ID,
  writeConstructorPreview,
} from "../types/constructorPreview";
import { coursesApi, type Course } from "../api/courses";
import { constructorApi } from "../api/constructor";
import { appendPracticeToTaskMarkdown } from "../utils/constructorPractice";
import {
  blocksToHtml,
  buildPracticeFromBlocks,
  buildTestQuestionsFromBlocks,
  documentToJson,
  extractClozeTestPayload,
  parseScenarioJson,
} from "../utils/scenarioExport";
import { RichTextEditor } from "../components/constructor/RichTextEditor";

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
      setBlocks(
        doc.blocks.length ? normalizeScenarioBlocks(doc.blocks) : [defaultBlock("text")],
      );
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

  const addBlock = (type: ScenarioBlock["type"]) => {
    const nb: ScenarioBlock = defaultBlock(type);
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
    setBlocks(
      doc.blocks.length ? normalizeScenarioBlocks(doc.blocks) : [defaultBlock("text")],
    );
    setPublishedModuleId(doc.publishedModuleId ?? null);
    setCourseId(doc.courseId ?? "");
    showToast("Імпортовано");
  };

  const openModulePreview = () => {
    const practice = buildPracticeFromBlocks(blocks);
    writeConstructorPreview({
      title: title.trim() || "Перегляд",
      theoryHtml: htmlExport,
      taskMarkdown: TASK_FOR_PUBLISH,
      testQuestions: buildTestQuestionsFromBlocks(blocks),
      practice,
    });
    navigate(`/course/modules/${CONSTRUCTOR_PREVIEW_MODULE_ID}`);
  };

  const startNewServerModule = () => {
    setPublishedModuleId(null);
    try {
      const doc: ScenarioDocument = {
        version: 1,
        title,
        blocks,
        ...(courseId ? { courseId } : {}),
      };
      localStorage.setItem(LS_KEY, documentToJson(doc));
    } catch {
      /* ignore */
    }
    showToast("Наступне «Зберегти на сервері» створить новий модуль");
  };

  const deleteModuleFromServer = async () => {
    if (!publishedModuleId) return;
    if (
      !window.confirm(
        "Видалити цей модуль з курсу на сервері? Уроки та тест буде втрачено. Дію не скасувати.",
      )
    ) {
      return;
    }
    setPublishing(true);
    try {
      await constructorApi.remove(publishedModuleId);
      setPublishedModuleId(null);
      try {
        const doc: ScenarioDocument = {
          version: 1,
          title,
          blocks,
          ...(courseId ? { courseId } : {}),
        };
        localStorage.setItem(LS_KEY, documentToJson(doc));
      } catch {
        /* ignore */
      }
      showToast("Модуль видалено з сервера");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Не вдалося видалити");
    } finally {
      setPublishing(false);
    }
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
    const taskMarkdown = appendPracticeToTaskMarkdown(
      TASK_FOR_PUBLISH,
      buildPracticeFromBlocks(blocks),
    );
    const body = {
      title: title.trim(),
      description: "Створено в конструкторі модулів",
      theoryHtml: htmlExport,
      taskMarkdown,
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
            Збирайте сценарій уроку: текст, таблиці, картки, зіставлення з лініями та пропуски для питань тесту.
          </p>
        </header>

        <div className="mb-6 rounded-2xl border border-sky-200/80 bg-sky-50/90 p-4 text-sm text-slate-700 dark:border-sky-500/25 dark:bg-sky-950/40 dark:text-slate-300">
          <p className="font-bold text-sky-900 dark:text-sky-100">Як зберегти</p>
          <ul className="mt-2 list-inside list-disc space-y-1.5">
            <li>
              <strong>На сервер</strong> — оберіть курс і натисніть «Зберегти на сервері». Створюються уроки «Теорія», «Вправи» та
              «Тест» (якщо є блоки з пропусками). Поки прив’язаний збережений модуль, кнопка оновлює його. Щоб{" "}
              <strong>створити ще один модуль</strong>, натисніть «Новий модуль» — тоді наступне збереження зробить новий запис.
            </li>
            <li>
              <strong>Видалити модуль</strong> з курсу можна кнопкою «Видалити з сервера» (лише для поточного прив’язаного модуля).
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
                onClick={startNewServerModule}
                disabled={!publishedModuleId}
                className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-900 hover:bg-sky-100 disabled:opacity-40 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50"
              >
                Новий модуль
              </button>
              <button
                type="button"
                onClick={() => void deleteModuleFromServer()}
                disabled={publishing || !publishedModuleId}
                className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-900 hover:bg-rose-100 disabled:opacity-40 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-900/40"
              >
                Видалити з сервера
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
            <ToolBtn onClick={() => addBlock("match")} label="Зіставлення" />
            <ToolBtn onClick={() => addBlock("cloze")} label="Пропуски (тест)" />
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
                      <BlockFields block={b} onChange={(patch) => updateBlock(b.id, patch)} />
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
    case "match":
      return "Зіставлення (лінії)";
    case "cloze":
      return "Пропуски (питання тесту)";
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
  onChange,
}: {
  block: ScenarioBlock;
  onChange: (patch: Partial<ScenarioBlock>) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={block.richText !== false}
              onChange={(e) => onChange({ richText: e.target.checked ? true : false })}
              className="rounded border-slate-300"
            />
            Форматування (жирний, курсив, списки, заголовки)
          </label>
          {block.richText !== false ? (
            <RichTextEditor
              mountKey={block.id}
              value={block.body}
              onChange={(html) => onChange({ body: html })}
            />
          ) : (
            <textarea
              value={block.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
            />
          )}
        </div>
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
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Термін (лицева сторона)
              </p>
              <input
                value={it.title}
                placeholder="Термін"
                onChange={(e) => {
                  const items = block.items.map((x, j) =>
                    j === i ? { ...x, title: e.target.value } : x,
                  );
                  onChange({ items });
                }}
                className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1 font-bold dark:border-slate-600 dark:bg-slate-800"
              />
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Визначення (зворотна сторона)
              </p>
              <textarea
                value={it.body}
                placeholder="Визначення"
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
    case "match": {
      const setSide = (side: "left" | "right", lines: string[]) => {
        onChange(side === "left" ? { left: lines } : { right: lines });
      };
      const LineEditor = ({
        label,
        lines,
        onLines,
      }: {
        label: string;
        lines: string[];
        onLines: (next: string[]) => void;
      }) => (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500">{label}</label>
          <p className="text-[11px] text-slate-500">
            Порядок у стовпчиках може відрізнятися: перший елемент ліворуч відповідає першому
            праворуч, другий — другому тощо.
          </p>
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={line}
                onChange={(e) => {
                  const next = [...lines];
                  next[i] = e.target.value;
                  onLines(next);
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => onLines(lines.filter((_, j) => j !== i))}
                className="shrink-0 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                aria-label="Видалити рядок"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onLines([...lines, ""])}
            className="text-xs font-bold text-emerald-600"
          >
            + рядок
          </button>
        </div>
      );
      return (
        <div className="grid gap-6 md:grid-cols-2">
          <LineEditor label="Лівий стовпчик" lines={block.left} onLines={(l) => setSide("left", l)} />
          <LineEditor label="Правий стовпчик" lines={block.right} onLines={(r) => setSide("right", r)} />
        </div>
      );
    }
    case "cloze": {
      const gapCount = (block.text.match(/___/g) ?? []).length;
      const distractors = block.distractors ?? [];
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            З кожного пропуску будується питання з варіантами на вкладці <strong>Тест</strong> (не
            показується у «Вправах»). Використовуйте{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">___</code> як пропуск.
            Кількість: {gapCount}
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
          <label className="text-xs font-bold text-slate-500">
            Хибні варіанти для тесту (через кому; підмішуються до варіантів відповіді)
          </label>
          <input
            value={distractors.join(", ")}
            onChange={(e) => {
              const next = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ distractors: next });
            }}
            placeholder="наприклад: go, going, went"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      );
    }
    default:
      return null;
  }
}
