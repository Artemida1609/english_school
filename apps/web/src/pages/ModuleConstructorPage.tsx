import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { defaultBlock, normalizeScenarioBlocks, type ScenarioBlock, type ScenarioDocument } from "../types/scenario";
import {
  CONSTRUCTOR_PREVIEW_MODULE_ID,
  writeConstructorPreview,
} from "../types/constructorPreview";
import { coursesApi, type Course, type Module } from "../api/courses";
import { constructorApi } from "../api/constructor";
import { appendPracticeToTaskMarkdown } from "../utils/constructorPractice";
import { loadConstructorDocumentFromServerModule } from "../utils/constructorModuleImport";
import {
  blocksToHtml,
  buildPracticeFromBlocks,
  buildTestQuestionsFromBlocks,
  documentToJson,
  extractClozeExercisePayload,
  parseScenarioJson,
} from "../utils/scenarioExport";
import { RichTextEditor } from "../components/constructor/RichTextEditor";
import { ModulePreviewPanel } from "../components/constructor/ModulePreviewPanel";

const LS_KEY = "moduleConstructorDraft";

/** Текст уроку «Вправи» при публікації на сервер */
const TASK_FOR_PUBLISH = "## Вправа\n\nЗакріпіть матеріал з теорії та виконайте вправи нижче.";

/** Placeholder, якщо в сценарії лише вправи без text/table */
const EMPTY_THEORY_HTML =
  '<p class="text-slate-500">Практичний модуль — теорія відсутня.</p>';

const COURSE_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: "BEGINNER", label: "Початковий (A1)" },
  { value: "ELEMENTARY", label: "Елементарний (A2)" },
  { value: "INTERMEDIATE", label: "Середній (B1)" },
  { value: "UPPER_INTERMEDIATE", label: "Вище середнього (B2)" },
  { value: "ADVANCED", label: "Просунутий (C1+)" },
];

const STAGE_SLOT_COUNT = 5;

function packStageTitles(rows: string[]): string[] | undefined {
  const cleaned = rows.slice(0, STAGE_SLOT_COUNT).map((s) => s.trim().slice(0, 160));
  while (cleaned.length > 0 && cleaned[cleaned.length - 1] === "") cleaned.pop();
  return cleaned.length > 0 ? cleaned : undefined;
}

function stageTitlesFromCourse(c: Course): string[] {
  const out = Array.from({ length: STAGE_SLOT_COUNT }, () => "");
  const raw = c.stageTitles;
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < STAGE_SLOT_COUNT; i++) {
    out[i] = typeof raw[i] === "string" ? raw[i] : "";
  }
  return out;
}

type CourseDialogState = {
  mode: "create" | "edit";
  editingId?: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  thumbnail: string;
  stageTitles: string[];
};

function formatSavedTime(d: Date): string {
  return d.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}



function stageDropId(stage: number): string {
  return `stage-drop-${stage}`;
}

function parseStageDropId(id: string): number | null {
  const match = /^stage-drop-(\d+)$/.exec(id);
  if (!match) return null;
  const stage = Number(match[1]);
  return Number.isFinite(stage) ? stage : null;
}

function groupModulesByStage(modules: Module[]): Module[][] {
  const grouped = Array.from({ length: STAGE_SLOT_COUNT }, () => [] as Module[]);
  const sorted = [...modules].sort((a, b) => {
    const stageDiff = (a.stage ?? 1) - (b.stage ?? 1);
    if (stageDiff !== 0) return stageDiff;
    return a.orderIndex - b.orderIndex;
  });
  for (const mod of sorted) {
    const stage = Math.min(STAGE_SLOT_COUNT, Math.max(1, Math.round(mod.stage ?? 1)));
    grouped[stage - 1].push(mod);
  }
  return grouped;
}

function flattenStageGroups(groups: Module[][]): Module[] {
  return groups.flatMap((list, stageIndex) =>
    list.map((mod, orderIndex) => ({
      ...mod,
      stage: stageIndex + 1,
      orderIndex,
    })),
  );
}

function findModuleStage(groups: Module[][], moduleId: string): number | null {
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].some((mod) => mod.id === moduleId)) return i + 1;
  }
  return null;
}

function SortableModuleCard({
  mod,
  index,
  disabled,
  onDelete,
}: {
  mod: Module;
  index: number;
  disabled?: boolean;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mod.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-3 py-2.5 touch-none ${
        isDragging ? "opacity-40 shadow-lg ring-2 ring-emerald-400/50" : ""
      } ${disabled ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-grab items-center gap-2 active:cursor-grabbing text-left"
        aria-label={`Перетягнути модуль ${mod.title}`}
        {...attributes}
        {...listeners}
      >
        <span className="shrink-0 text-slate-300 dark:text-slate-600 text-sm leading-none select-none" aria-hidden>
          ⠿
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
            #{index + 1}
          </span>
          <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {mod.title}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(mod.id)}
        disabled={disabled}
        aria-label={`Видалити модуль ${mod.title}`}
        title="Видалити модуль"
        className="shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-sm font-black leading-none text-rose-700 hover:bg-rose-100 disabled:opacity-35 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40"
      >
        ×
      </button>
    </div>
  );
}

function StageModulesDropZone({
  stageNum,
  children,
  isEmpty,
}: {
  stageNum: number;
  children: ReactNode;
  isEmpty: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageDropId(stageNum) });
  return (
    <div
      ref={setNodeRef}
      className={`mt-4 min-h-[3.5rem] space-y-2 rounded-xl transition-colors ${
        isOver ? "bg-emerald-50/80 ring-2 ring-emerald-400/40 dark:bg-emerald-950/30" : ""
      } ${isEmpty ? "border border-dashed border-slate-200 dark:border-slate-700 p-1" : ""}`}
    >
      {children}
    </div>
  );
}

const THEORY_TYPES = ["text", "table"];
const PRACTICE_TYPES = ["cards", "match", "cloze", "openCloze", "letterOrder", "wordBank"];
const TEST_TYPES = ["multiSelect", "quiz"];

const getCategory = (type: string) => {
  if (THEORY_TYPES.includes(type)) return "theory";
  if (PRACTICE_TYPES.includes(type)) return "practice";
  if (TEST_TYPES.includes(type)) return "test";
  return "theory";
};

export function ModuleConstructorPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Новий модуль");
  const [blocks, setBlocks] = useState<ScenarioBlock[]>([defaultBlock("text")]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [courseModules, setCourseModules] = useState<Module[]>([]);
  const [publishedModuleId, setPublishedModuleId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [structureBusy, setStructureBusy] = useState(false);
  const [courseBusy, setCourseBusy] = useState(false);
  const [courseDialog, setCourseDialog] = useState<CourseDialogState | null>(null);
  const [modulePublishStage, setModulePublishStage] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [activeDragModuleId, setActiveDragModuleId] = useState<string | null>(null);
  const [activeDragBlockId, setActiveDragBlockId] = useState<string | null>(null);
  const skipNextAutosave = useRef(false);
  const lastFetchedConstructorModuleRef = useRef<string | null>(null);
  const structureDragSnapshotRef = useRef<Module[] | null>(null);

  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

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
        showToast("Не вдалося зберегти (пам'ять браузера)");
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

  const reloadCoursesCatalog = useCallback(async () => {
    try {
      const list = await coursesApi.getCoursesCatalogForStaff();
      setCourses(list);
      return list;
    } catch {
      try {
        const list = await coursesApi.getCourses();
        setCourses(list);
        return list;
      } catch {
        setCourses([]);
        return [];
      }
    }
  }, []);

  useEffect(() => {
    void reloadCoursesCatalog();
  }, [reloadCoursesCatalog]);

  useEffect(() => {
    if (courseId || courses.length === 0) return;
    const preferred =
      courses.find((c) => c.id === "course-level-1-business-english") ?? courses[0];
    setCourseId(preferred.id);
  }, [courses, courseId]);

  useEffect(() => {
    if (!courseId) {
      setCourseModules([]);
      return;
    }
    let cancelled = false;
    coursesApi
      .getCourseById(courseId)
      .then((c) => {
        if (!cancelled) setCourseModules(c.modules ?? []);
      })
      .catch(() => {
        if (!cancelled) setCourseModules([]);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    if (!publishedModuleId || courseModules.length === 0) return;
    if (!courseModules.some((m) => m.id === publishedModuleId)) {
      setPublishedModuleId(null);
    }
  }, [courseId, courseModules, publishedModuleId]);

  useEffect(() => {
    if (!publishedModuleId) {
      lastFetchedConstructorModuleRef.current = null;
      return;
    }
    if (lastFetchedConstructorModuleRef.current === publishedModuleId) return;

    const mid = publishedModuleId;
    let cancelled = false;

    void (async () => {
      try {
        const mod = await coursesApi.getModuleById(mid);
        if (cancelled) return;
        if (typeof mod.stage === "number") {
          const s = Math.min(5, Math.max(1, Math.round(mod.stage)));
          setModulePublishStage(s);
        } else {
          setModulePublishStage(1);
        }
        const result = await loadConstructorDocumentFromServerModule(mod);
        if (cancelled) return;
        if (result) {
          lastFetchedConstructorModuleRef.current = mid;
          skipNextAutosave.current = true;
          setTitle(result.title);
          setBlocks(result.blocks);
          setExpandedId(null);
          showToast(
            result.fromStoredJson
              ? "Сценарій завантажено з сервера"
              : "Відновлено з уроків (збережіть модуль, щоб з'явився повний JSON конструктора)",
          );
        } else {
          showToast("У модулі немає даних для конструктора");
        }
      } catch {
        if (!cancelled) showToast("Не вдалося завантажити модуль");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publishedModuleId, showToast]);

  const sortedCourseModules = useMemo(
    () => [...courseModules].sort((a, b) => a.orderIndex - b.orderIndex),
    [courseModules],
  );

  const moduleSelectRows = useMemo(() => {
    const rows = sortedCourseModules.map((m) => ({ id: m.id, title: m.title }));
    if (
      publishedModuleId &&
      !rows.some((r) => r.id === publishedModuleId)
    ) {
      rows.push({
        id: publishedModuleId,
        title: `Прив'язаний модуль (${publishedModuleId.slice(0, 8)}…)`,
      });
    }
    return rows;
  }, [sortedCourseModules, publishedModuleId]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === courseId) ?? null,
    [courses, courseId],
  );

  const stageTitles = useMemo(
    () => (selectedCourse ? stageTitlesFromCourse(selectedCourse) : Array.from({ length: STAGE_SLOT_COUNT }, () => "")),
    [selectedCourse],
  );

  const modulesByStage = useMemo(() => groupModulesByStage(courseModules), [courseModules]);

  const activeDragModule = useMemo(
    () => (activeDragModuleId ? courseModules.find((m) => m.id === activeDragModuleId) ?? null : null),
    [activeDragModuleId, courseModules],
  );

  const structureSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const refreshCourseModules = useCallback(async () => {
    if (!courseId) {
      setCourseModules([]);
      return;
    }
    try {
      const c = await coursesApi.getCourseById(courseId);
      setCourseModules(c.modules ?? []);
    } catch {
      setCourseModules([]);
    }
  }, [courseId]);

  const persistModuleStructure = useCallback(
    async (nextModules: Module[], baseline: Module[]) => {
      const prevById = new Map(baseline.map((m) => [m.id, m]));
      const changed = nextModules.filter((m) => {
        const prev = prevById.get(m.id);
        if (!prev) return true;
        return (prev.stage ?? 1) !== (m.stage ?? 1) || prev.orderIndex !== m.orderIndex;
      });
      if (changed.length === 0) return;

      setStructureBusy(true);
      try {
        await Promise.all(
          changed.map((item) =>
            coursesApi.updateModule(item.id, {
              stage: item.stage ?? 1,
              orderIndex: item.orderIndex,
            }),
          ),
        );
        await refreshCourseModules();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Не вдалося змінити порядок модуля");
        await refreshCourseModules();
      } finally {
        setStructureBusy(false);
      }
    },
    [refreshCourseModules, showToast],
  );

  const handleStructureDragStart = useCallback(
    (event: DragStartEvent) => {
      if (structureBusy) return;
      structureDragSnapshotRef.current = courseModules;
      setActiveDragModuleId(String(event.active.id));
    },
    [courseModules, structureBusy],
  );

  const handleStructureDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    setCourseModules((prev) => {
      const groups = groupModulesByStage(prev);
      const fromStage = findModuleStage(groups, activeId);
      const overStageDrop = parseStageDropId(overId);
      const toStage = overStageDrop ?? findModuleStage(groups, overId);
      if (!fromStage || !toStage) return prev;

      const fromIdx = fromStage - 1;
      const toIdx = toStage - 1;

      if (fromStage === toStage) {
        if (overStageDrop) return prev;
        const list = [...groups[fromIdx]];
        const oldIndex = list.findIndex((m) => m.id === activeId);
        const newIndex = list.findIndex((m) => m.id === overId);
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;
        groups[fromIdx] = arrayMove(list, oldIndex, newIndex);
        return flattenStageGroups(groups);
      }

      const fromList = [...groups[fromIdx]];
      const toList = [...groups[toIdx]];
      const activeIndex = fromList.findIndex((m) => m.id === activeId);
      if (activeIndex < 0) return prev;

      const [moved] = fromList.splice(activeIndex, 1);
      let insertAt = toList.length;
      if (!overStageDrop) {
        const overIndex = toList.findIndex((m) => m.id === overId);
        if (overIndex >= 0) insertAt = overIndex;
      }
      toList.splice(insertAt, 0, moved);
      groups[fromIdx] = fromList;
      groups[toIdx] = toList;
      return flattenStageGroups(groups);
    });
  }, []);

  const handleStructureDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragModuleId(null);
      const snapshot = structureDragSnapshotRef.current;
      structureDragSnapshotRef.current = null;

      if (!over) {
        if (snapshot) setCourseModules(snapshot);
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);
      const groups = groupModulesByStage(courseModules);
      const stage = findModuleStage(groups, activeId);
      if (!stage) {
        if (snapshot) setCourseModules(snapshot);
        return;
      }

      const list = [...groups[stage - 1]];
      const oldIndex = list.findIndex((m) => m.id === activeId);
      if (oldIndex < 0) {
        if (snapshot) setCourseModules(snapshot);
        return;
      }

      let newIndex = oldIndex;
      const overStageDrop = parseStageDropId(overId);
      if (overStageDrop === stage) {
        newIndex = list.length - 1;
      } else {
        const overIndex = list.findIndex((m) => m.id === overId);
        if (overIndex >= 0) newIndex = overIndex;
      }

      if (oldIndex !== newIndex) {
        groups[stage - 1] = arrayMove(list, oldIndex, newIndex);
      }

      const next = flattenStageGroups(groups);
      setCourseModules(next);
      void persistModuleStructure(next, snapshot ?? courseModules);
    },
    [courseModules, persistModuleStructure],
  );

  const handleStructureDragCancel = useCallback(() => {
    const snapshot = structureDragSnapshotRef.current;
    structureDragSnapshotRef.current = null;
    setActiveDragModuleId(null);
    if (snapshot) setCourseModules(snapshot);
  }, []);

  const shiftStage = useCallback(
    async (stage: number, direction: -1 | 1) => {
      const targetStage = stage + direction;
      if (targetStage < 1 || targetStage > STAGE_SLOT_COUNT || !selectedCourse || !courseId) return;

      const nextTitles = [...stageTitles];
      [nextTitles[stage - 1], nextTitles[targetStage - 1]] = [nextTitles[targetStage - 1], nextTitles[stage - 1]];

      const sourceModules = modulesByStage[stage - 1] ?? [];
      const targetModules = modulesByStage[targetStage - 1] ?? [];
      setStructureBusy(true);
      try {
        await Promise.all([
          ...sourceModules.map((item) => coursesApi.updateModule(item.id, { stage: targetStage })),
          ...targetModules.map((item) => coursesApi.updateModule(item.id, { stage })),
          coursesApi.updateStaffCourse(selectedCourse.id, {
            stageTitles: packStageTitles(nextTitles) ?? null,
          }),
        ]);
        await Promise.all([refreshCourseModules(), reloadCoursesCatalog()]);
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Не вдалося змінити порядок рівнів");
      } finally {
        setStructureBusy(false);
      }
    },
    [courseId, modulesByStage, refreshCourseModules, reloadCoursesCatalog, selectedCourse, stageTitles, showToast],
  );

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
  const theoryHtmlForPublish = useMemo(
    () => (htmlExport.trim() ? htmlExport : EMPTY_THEORY_HTML),
    [htmlExport],
  );
  const testPayload = useMemo(() => extractClozeExercisePayload(blocks), [blocks]);

  const addBlock = (type: ScenarioBlock["type"]) => {
    const nb = defaultBlock(type);
    setBlocks((prev) => [...prev, nb]);
    setExpandedId(nb.id);
    setTimeout(() => {
      document.getElementById(`block-${nb.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
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
      theoryHtml: theoryHtmlForPublish,
      taskMarkdown: TASK_FOR_PUBLISH,
      testQuestions: buildTestQuestionsFromBlocks(blocks),
      practice,
    });
    navigate(`/course/modules/${CONSTRUCTOR_PREVIEW_MODULE_ID}`);
  };

  const startNewServerModule = () => {
    setPublishedModuleId(null);
    setModulePublishStage(1);
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

  const deleteModuleFromServer = async (moduleId?: string) => {
    const targetId = moduleId ?? publishedModuleId;
    if (!targetId) return;
    const targetTitle =
      courseModules.find((m) => m.id === targetId)?.title?.trim() || "цей модуль";
    if (
      !window.confirm(
        `Видалити модуль «${targetTitle}» з курсу на сервері? Уроки та тест буде втрачено. Дію не скасувати.`,
      )
    ) {
      return;
    }
    setPublishing(true);
    setStructureBusy(true);
    try {
      await constructorApi.remove(targetId);
      if (publishedModuleId === targetId) {
        setPublishedModuleId(null);
        lastFetchedConstructorModuleRef.current = null;
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
      }
      await refreshCourseModules();
      showToast("Модуль видалено з сервера");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Не вдалося видалити");
    } finally {
      setPublishing(false);
      setStructureBusy(false);
    }
  };

  const openCreateCourseDialog = () => {
    setCourseDialog({
      mode: "create",
      title: "",
      description: "",
      level: "BEGINNER",
      isPublished: false,
      thumbnail: "",
      stageTitles: Array.from({ length: STAGE_SLOT_COUNT }, () => ""),
    });
  };

  const openEditCourseDialog = () => {
    if (!courseId) {
      showToast("Спочатку оберіть курс у списку");
      return;
    }
    const c = courses.find((x) => x.id === courseId);
    if (!c) {
      showToast("Курс не знайдено — оновіть список");
      return;
    }
    setCourseDialog({
      mode: "edit",
      editingId: c.id,
      title: c.title,
      description: c.description ?? "",
      level: c.level ?? "BEGINNER",
      isPublished: Boolean(c.isPublished),
      thumbnail: c.thumbnail ?? "",
      stageTitles: stageTitlesFromCourse(c),
    });
  };

  const submitCourseDialog = async () => {
    if (!courseDialog) return;
    const t = courseDialog.title.trim();
    const d = courseDialog.description.trim();
    if (!t || !d) {
      showToast("Вкажіть назву та опис курсу");
      return;
    }
    setCourseBusy(true);
    try {
      if (courseDialog.mode === "create") {
        const packedStages = packStageTitles(courseDialog.stageTitles);
        const created = await coursesApi.createStaffCourse({
          title: t,
          description: d,
          level: courseDialog.level,
          ...(courseDialog.thumbnail.trim() ? { thumbnail: courseDialog.thumbnail.trim() } : {}),
          ...(packedStages ? { stageTitles: packedStages } : {}),
        });
        await reloadCoursesCatalog();
        setCourseId(created.id);
        setPublishedModuleId(null);
        lastFetchedConstructorModuleRef.current = null;
        skipNextAutosave.current = true;
        showToast("Курс створено");
      } else if (courseDialog.editingId) {
        await coursesApi.updateStaffCourse(courseDialog.editingId, {
          title: t,
          description: d,
          level: courseDialog.level,
          isPublished: courseDialog.isPublished,
          thumbnail: courseDialog.thumbnail.trim() === "" ? null : courseDialog.thumbnail.trim(),
          stageTitles: packStageTitles(courseDialog.stageTitles) ?? null,
        });
        await reloadCoursesCatalog();
        showToast("Курс оновлено");
      }
      setCourseDialog(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка збереження курсу");
    } finally {
      setCourseBusy(false);
    }
  };

  const deleteCourseFromServer = async () => {
    if (!courseId) {
      showToast("Немає обраного курсу");
      return;
    }
    const c = courses.find((x) => x.id === courseId);
    const name = c?.title ?? courseId;
    if (
      !window.confirm(
        `Видалити курс «${name}» повністю? Зникнуть усі модулі, уроки та записи студентів на цей курс. Дію не можна скасувати.`,
      )
    ) {
      return;
    }
    setCourseBusy(true);
    try {
      await coursesApi.deleteStaffCourse(courseId);
      setPublishedModuleId(null);
      lastFetchedConstructorModuleRef.current = null;
      setCourseId("");
      setCourseModules([]);
      await reloadCoursesCatalog();
      try {
        const doc: ScenarioDocument = {
          version: 1,
          title,
          blocks,
        };
        localStorage.setItem(LS_KEY, documentToJson(doc));
      } catch {
        /* ignore */
      }
      showToast("Курс видалено");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Не вдалося видалити курс");
    } finally {
      setCourseBusy(false);
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
    const scenarioJson = documentToJson({
      version: 1,
      title: title.trim(),
      blocks,
    });
    const body = {
      title: title.trim(),
      description: "Створено в конструкторі модулів",
      theoryHtml: theoryHtmlForPublish,
      taskMarkdown,
      scenarioJson,
      stage: modulePublishStage,
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
                Текст, таблиці, картки, зіставлення та вправи з пропусками — все в одному редакторі.
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
        <AnimatePresence initial={false}>
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
                    ["①", "На сервер", " — оберіть курс та модуль, натисніть «Зберегти на сервері"],
                    ["②", "Новий модуль", " — оберіть «Новий модуль» або натисніть відповідну кнопку"],
                    ["③", "Перегляд", " — як студент бачить: теорія, практика, тест"],
                    ["④", "Чернетка", " — авто-збереження в браузері + ручна кнопка"],
                    ["⑤", "HTML / JSON", " — копіювати або завантажити файл"],
                    ["⑥", "Видалити", " — модуль/курс — дія незворотна"],
                    ["⑦", "Лист (порядок)", " — параграфи листа; студент розставляє їх drag-and-drop"],
                    ["⑧", "Тестові завдання", " — питання з варіантами відповіді на вкладці «Тест»"],
                    ["⑨", "Пропуски (відкриті)", " — студент вписує відповідь самостійно, без варіантів"],
                  ].map(([n, b, t]) => (
                    <div key={n} className="flex gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">{n}</span>
                      <span><strong>{b}</strong>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── COURSE / MODULE PANEL ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="mb-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-700/30 bg-white/80 dark:bg-emerald-950/20 backdrop-blur-xl p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
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
                        {c.isPublished === false ? " (не опубліковано)" : ""}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  Для викладачів показуються всі курси, не лише опубліковані в каталозі.
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={openCreateCourseDialog}
                    disabled={courseBusy}
                    className="rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-emerald-500 disabled:opacity-40 dark:border-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    + Новий курс
                  </button>
                  <button
                    type="button"
                    onClick={openEditCourseDialog}
                    disabled={courseBusy || !courseId}
                    className="rounded-lg border border-emerald-400 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                    Редагувати курс
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCourseFromServer()}
                    disabled={courseBusy || !courseId}
                    className="rounded-lg border border-rose-400 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 hover:bg-rose-100 disabled:opacity-40 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-900/40"
                  >
                    Видалити курс
                  </button>
                </div>
              </label>
              <label className="flex min-w-[200px] flex-1 flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Модуль для збереження
                </span>
                <select
                  value={publishedModuleId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPublishedModuleId(v ? v : null);
                    if (!v) setModulePublishStage(1);
                  }}
                  disabled={!courseId}
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-emerald-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="">
                    Новий модуль (наступне збереження створить запис у курсі)
                  </option>
                  {moduleSelectRows.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  Оберіть існуючий модуль — теорія та практика підтягнуться з сервера. Збережіть чернетку перед
                  зміною, якщо потрібно не втратити поточні правки.
                </span>
              </label>
              <label className="flex min-w-[140px] flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Етап курсу (1–5)
                </span>
                <select
                  value={modulePublishStage}
                  onChange={(e) => setModulePublishStage(Number(e.target.value))}
                  disabled={!courseId}
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-emerald-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Етап {n}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  У курсі лише п'ять етапів; модуль відображається на сторінці курсу в обраному етапі.
                </span>
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
            {courseId && (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-slate-50/90 dark:bg-slate-950/40 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Структура курсу
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Перетягуйте модулі всередині етапу або між етапами. Рівні можна міняти місцями кнопками ↑↓.
                    </p>
                  </div>
                  {structureBusy && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Оновлення…
                    </span>
                  )}
                </div>
                <DndContext
                  sensors={structureSensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleStructureDragStart}
                  onDragOver={handleStructureDragOver}
                  onDragEnd={handleStructureDragEnd}
                  onDragCancel={handleStructureDragCancel}
                >
                  <div className="grid gap-3 xl:grid-cols-2">
                    {modulesByStage.map((stageModules, stageIndex) => {
                      const stageNum = stageIndex + 1;
                      const stageLabel = stageTitles[stageIndex]?.trim();
                      return (
                        <section key={stageNum} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                                Етап {stageNum}
                              </p>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                {stageLabel || `Рівень ${stageNum}`}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {stageModules.length} модулів
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => void shiftStage(stageNum, -1)}
                                disabled={structureBusy || stageNum === 1 || Boolean(activeDragModuleId)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                              >
                                ↑ рівень
                              </button>
                              <button
                                type="button"
                                onClick={() => void shiftStage(stageNum, 1)}
                                disabled={structureBusy || stageNum === STAGE_SLOT_COUNT || Boolean(activeDragModuleId)}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-35 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                              >
                                ↓ рівень
                              </button>
                            </div>
                          </div>

                          <StageModulesDropZone stageNum={stageNum} isEmpty={stageModules.length === 0}>
                            <SortableContext
                              items={stageModules.map((mod) => mod.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {stageModules.length > 0 ? (
                                stageModules.map((mod, index) => (
                                  <SortableModuleCard
                                    key={mod.id}
                                    mod={mod}
                                    index={index}
                                    disabled={structureBusy || publishing}
                                    onDelete={(id) => void deleteModuleFromServer(id)}
                                  />
                                ))
                              ) : (
                                <p className="rounded-xl px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                                  Перетягніть модуль сюди
                                </p>
                              )}
                            </SortableContext>
                          </StageModulesDropZone>
                        </section>
                      );
                    })}
                  </div>
                  <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
                    {activeDragModule ? (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3 py-2.5 shadow-2xl dark:border-emerald-600 dark:bg-slate-900">
                        <span className="text-slate-300 dark:text-slate-600" aria-hidden>⠿</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                            {activeDragModule.title}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            )}
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
        </motion.div>

        {/* ─── DRAFT BAR ─── */}
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/70 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur px-4 py-3">
          <button
            type="button"
            onClick={() => persistDraft()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 dark:bg-slate-200 px-4 py-2 text-sm font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-700 dark:hover:bg-white transition-colors"
          >
            <span>💾</span> Зберегти чернетку
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {lastSavedAt ? `Збережено: ${formatSavedTime(lastSavedAt)}` : "Ще не збережено"}
          </span>
        </div>

        {/* ─── SCENARIO TITLE + BLOCK TYPES ─── */}
        <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-start">
          <label className="flex flex-1 flex-col gap-1.5 min-w-[220px]">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Назва сценарію</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition"
              placeholder="Назва модуля…"
            />
          </label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">📖 Теорія</span>
              <div className="flex flex-wrap gap-2">
                <ToolBtn onClick={() => addBlock("text")} label="Текст" icon="📝" />
                <ToolBtn onClick={() => addBlock("table")} label="Таблиця" icon="📊" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">✏️ Вправи</span>
              <div className="flex flex-wrap gap-2">
                <ToolBtn onClick={() => addBlock("cards")} label="Картки" icon="🃏" />
                <ToolBtn onClick={() => addBlock("match")} label="Зіставлення" icon="🔗" />
                <ToolBtn onClick={() => addBlock("cloze")} label="Пропуски" icon="✏️" />
                <ToolBtn onClick={() => addBlock("openCloze")} label="Пропуски (відкриті)" icon="✍️" />
                <ToolBtn onClick={() => addBlock("letterOrder")} label="Лист (порядок)" icon="✉️" />
                <ToolBtn onClick={() => addBlock("wordBank")} label="Слова у пропуски" icon="🧩" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">📝 Тести</span>
              <div className="flex flex-wrap gap-2">
                <ToolBtn onClick={() => addBlock("multiSelect")} label="Множинний вибір" icon="☑️" />
                <ToolBtn onClick={() => addBlock("quiz")} label="Тестові завдання" icon="📝" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── EXPORT TOOLBAR ─── */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => copyText(htmlExport, "HTML скопійовано в буфер")}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            📋 Копіювати HTML
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
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-white shadow-sm transition-colors"
          >
            📄 Копіювати JSON
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(JSON.stringify(testPayload, null, 2), "JSON вправи скопійовано")
            }
            className="rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 shadow-sm transition-colors disabled:opacity-40"
            disabled={!testPayload.length}
          >
            🧩 Пропуски ({testPayload.length})
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
              const safe = title.replace(/[^\w\u0400-\u04FF-]+/g, "_").slice(0, 40) || "scenario";
              a.download = `${safe}.json`;
              a.click();
              URL.revokeObjectURL(a.href);
              showToast("Файл JSON завантажено");
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
          >
            ⬇ Завантажити JSON
          </button>
          <button
            type="button"
            onClick={importJson}
            className="rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
          >
            ⬆ Імпорт JSON
          </button>
        </div>

        {/* ─── MAIN EDITOR GRID ─── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(300px,360px)]">
          <div className="w-full">
            <DndContext
              sensors={blockSensors}
              collisionDetection={closestCorners}
              onDragStart={(e) => setActiveDragBlockId(e.active.id as string)}
              onDragEnd={(event: DragEndEvent) => {
                setActiveDragBlockId(null);
                const { active, over } = event;
                if (!over || active.id === over.id) return;
                
                const activeBlock = blocks.find((b) => b.id === active.id);
                const overBlock = blocks.find((b) => b.id === over.id);
                
                if (activeBlock && overBlock && getCategory(activeBlock.type) === getCategory(overBlock.type)) {
                  const oldIndex = blocks.findIndex((b) => b.id === active.id);
                  const newIndex = blocks.findIndex((b) => b.id === over.id);
                  setBlocks((prev) => arrayMove(prev, oldIndex, newIndex));
                }
              }}
            >
              {blocks.filter(b => getCategory(b.type) === "theory").length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2">
                    <span className="text-base">📖</span> Теорія
                  </h4>
                  <SortableContext items={blocks.filter(b => getCategory(b.type) === "theory").map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {blocks.filter(b => getCategory(b.type) === "theory").map((b) => (
                        <SortableBlockItem
                          key={b.id}
                          block={b}
                          index={blocks.findIndex(x => x.id === b.id)}
                          expanded={expandedId === b.id}
                          onToggle={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                          onRemove={() => removeBlock(b.id)}
                          onChange={(patch) => updateBlock(b.id, patch)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              {blocks.filter(b => getCategory(b.type) === "practice").length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2">
                    <span className="text-base">✏️</span> Вправи
                  </h4>
                  <SortableContext items={blocks.filter(b => getCategory(b.type) === "practice").map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {blocks.filter(b => getCategory(b.type) === "practice").map((b) => (
                        <SortableBlockItem
                          key={b.id}
                          block={b}
                          index={blocks.findIndex(x => x.id === b.id)}
                          expanded={expandedId === b.id}
                          onToggle={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                          onRemove={() => removeBlock(b.id)}
                          onChange={(patch) => updateBlock(b.id, patch)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              {blocks.filter(b => getCategory(b.type) === "test").length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2 flex items-center gap-2">
                    <span className="text-base">📝</span> Тести
                  </h4>
                  <SortableContext items={blocks.filter(b => getCategory(b.type) === "test").map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {blocks.filter(b => getCategory(b.type) === "test").map((b) => (
                        <SortableBlockItem
                          key={b.id}
                          block={b}
                          index={blocks.findIndex(x => x.id === b.id)}
                          expanded={expandedId === b.id}
                          onToggle={() => setExpandedId((id) => (id === b.id ? null : b.id))}
                          onRemove={() => removeBlock(b.id)}
                          onChange={(patch) => updateBlock(b.id, patch)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}

              <DragOverlay>
                {activeDragBlockId ? (() => {
                  const b = blocks.find(x => x.id === activeDragBlockId);
                  if (!b) return null;
                  const idx = blocks.findIndex(x => x.id === activeDragBlockId);
                  return (
                    <BlockCard
                      block={b}
                      index={idx}
                      expanded={expandedId === b.id}
                      onToggle={() => {}}
                      onRemove={() => {}}
                      onChange={() => {}}
                      isOverlay
                    />
                  );
                })() : null}
              </DragOverlay>
            </DndContext>
          </div>

          <ModulePreviewPanel
            title={title}
            htmlExport={htmlExport}
            blocks={blocks}
            testPayload={testPayload}
          />
        </div>
      </div>

      {courseDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-dialog-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCourseDialog(null);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200/80 dark:border-slate-600/50 bg-white dark:bg-slate-900 p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2
              id="course-dialog-title"
              className="text-lg font-black text-slate-900 dark:text-white"
            >
              {courseDialog.mode === "create" ? "Новий курс" : "Редагувати курс"}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-slate-500">Назва</span>
                <input
                  value={courseDialog.title}
                  onChange={(e) =>
                    setCourseDialog((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                  placeholder="Наприклад: Business English Level 2"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-slate-500">Опис</span>
                <textarea
                  value={courseDialog.description}
                  onChange={(e) =>
                    setCourseDialog((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev,
                    )
                  }
                  rows={4}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                  placeholder="Короткий опис для каталогу та картки курсу"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-slate-500">Рівень (CEFR)</span>
                <select
                  value={courseDialog.level}
                  onChange={(e) =>
                    setCourseDialog((prev) => (prev ? { ...prev, level: e.target.value } : prev))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                >
                  {COURSE_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-slate-500">
                  URL обкладинки курсу
                </span>
                <input
                  value={courseDialog.thumbnail}
                  onChange={(e) =>
                    setCourseDialog((prev) =>
                      prev ? { ...prev, thumbnail: e.target.value } : prev,
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
                  placeholder="https://… або /images/…"
                />
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-950/50">
                <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                  Підписи етапів (макс. 5)
                </p>
                <p className="mb-3 text-[11px] text-slate-500 dark:text-slate-400">
                  Відображаються на сторінці курсу у вкладках етапів. Якщо поле порожнє — показується «Рівень» і
                  номер.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {courseDialog.stageTitles.map((st, i) => (
                    <label key={i} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-500">Етап {i + 1}</span>
                      <input
                        value={st}
                        onChange={(e) =>
                          setCourseDialog((prev) => {
                            if (!prev) return prev;
                            const next = [...prev.stageTitles];
                            next[i] = e.target.value;
                            return { ...prev, stageTitles: next };
                          })
                        }
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                        placeholder={`Наприклад: Граматика ${i + 1}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
              {courseDialog.mode === "edit" && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={courseDialog.isPublished}
                    onChange={(e) =>
                      setCourseDialog((prev) =>
                        prev ? { ...prev, isPublished: e.target.checked } : prev,
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  <span>Опубліковано в каталозі (видно студентам у списку курсів)</span>
                </label>
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setCourseDialog(null)}
                disabled={courseBusy}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => void submitCourseDialog()}
                disabled={courseBusy}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white shadow hover:bg-emerald-500 disabled:opacity-50"
              >
                {courseBusy ? "Збереження…" : "Зберегти"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/95 dark:bg-white/10 backdrop-blur border border-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
        >
          {toast}
        </motion.div>
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
      return "Пропуски (варіанти)";
    case "openCloze":
      return "Пропуски (відкриті)";
    case "letterOrder":
      return "Лист — порядок параграфів";
    case "wordBank":
      return "Слова у пропуски (перетягування)";
    case "multiSelect":
      return "Множинний вибір (чекбокси)";
    case "quiz":
      return "Тестові завдання";
    default: {
      const _ex: never = b;
      return _ex;
    }
  }
}

function ToolBtn({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 px-3 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 disabled:opacity-40 transition-colors shadow-sm"
    >
      {icon && <span>{icon}</span>}
      <span>+ {label}</span>
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
  children: ReactNode;
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
      className={`rounded-lg px-2 py-1 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function BlockCard({
  block,
  index,
  expanded,
  onToggle,
  onRemove,
  onChange,
  isOverlay = false,
  dragListeners,
  dragAttributes,
  setNodeRef,
  style,
}: {
  block: ScenarioBlock;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<ScenarioBlock>) => void;
  isOverlay?: boolean;
  dragListeners?: Record<string, any>;
  dragAttributes?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={!isOverlay}
      initial={!isOverlay ? { opacity: 0, y: 10 } : undefined}
      animate={!isOverlay ? { opacity: 1, y: 0 } : undefined}
      exit={!isOverlay ? { opacity: 0, height: 0, marginBottom: 0 } : undefined}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border bg-white/90 dark:bg-slate-900/70 backdrop-blur shadow-sm hover:shadow-md transition-shadow relative ${
        isOverlay ? "border-emerald-400 shadow-xl scale-[1.02] cursor-grabbing z-50" : "border-slate-200/80 dark:border-slate-700/60 z-10"
      }`}
      id={!isOverlay ? `block-${block.id}` : undefined}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 px-4 py-2.5">
        <button
          type="button"
          className={`text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors py-1 pr-2 ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
          {...dragAttributes}
          {...dragListeners}
          aria-label="Перетягнути блок"
          title="Перетягнути"
        >
          ⋮⋮
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-black text-emerald-700 dark:text-emerald-300 shrink-0">{index + 1}</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{blockTitle(block)}</span>
          <span className="ml-auto text-slate-300 dark:text-slate-600 text-xs">{expanded ? "▲" : "▼"}</span>
        </button>
        <div className="flex shrink-0 gap-0.5 ml-2">
          <IconBtn aria-label="Видалити" onClick={onRemove} className="text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50">×</IconBtn>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <BlockFields block={block} onChange={onChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SortableBlockItem({
  block,
  index,
  expanded,
  onToggle,
  onRemove,
  onChange,
}: {
  block: ScenarioBlock;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (patch: Partial<ScenarioBlock>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        className="h-[68px] rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20"
      />
    );
  }

  return (
    <BlockCard
      block={block}
      index={index}
      expanded={expanded}
      onToggle={onToggle}
      onRemove={onRemove}
      onChange={onChange}
      setNodeRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
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
        <div className="space-y-4">

          {block.items.map((it, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 space-y-3 relative group"
            >
              {/* ── Card number badge ── */}
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const items = block.items.filter((_, j) => j !== i);
                    onChange({ items: items.length ? items : [{ title: "", body: "", transcription: "", category: "" }] });
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded-lg px-2 py-1 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                  aria-label="Видалити картку"
                >
                  × Видалити
                </button>
              </div>

              {/* ── Row 1: Term + Transcription ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Термін / Слово (лицева сторона)
                  </span>
                  <input
                    value={it.title}
                    placeholder="напр. to be responsible for"
                    onChange={(e) => {
                      const items = block.items.map((x, j) =>
                        j === i ? { ...x, title: e.target.value } : x,
                      );
                      onChange({ items });
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Транскрипція (необов'язково)
                  </span>
                  <input
                    value={(it as { transcription?: string }).transcription ?? ""}
                    placeholder="напр. /tə bi rɪˈspɒnsəbl fɔːr/"
                    onChange={(e) => {
                      const items = block.items.map((x, j) =>
                        j === i ? { ...x, transcription: e.target.value } : x,
                      );
                      onChange({ items });
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />
                </label>
              </div>

              {/* ── Row 2: Translation + Category ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Переклад / Визначення (зворотна сторона)
                  </span>
                  <textarea
                    value={it.body}
                    placeholder="напр. відповідати за щось"
                    onChange={(e) => {
                      const items = block.items.map((x, j) =>
                        j === i ? { ...x, body: e.target.value } : x,
                      );
                      onChange({ items });
                    }}
                    rows={2}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition resize-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Категорія (фільтр, необов'язково)
                  </span>
                  <input
                    value={(it as { category?: string }).category ?? ""}
                    placeholder="напр. To Be Collocations"
                    onChange={(e) => {
                      const items = block.items.map((x, j) =>
                        j === i ? { ...x, category: e.target.value } : x,
                      );
                      onChange({ items });
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />
                  <span className="text-[10px] text-slate-400">
                    Однакова категорія = одна вкладка-фільтр у словнику
                  </span>
                </label>
              </div>
            </div>
          ))}

          {/* ── Add card button ── */}
          <button
            type="button"
            onClick={() =>
              onChange({
                items: [
                  ...block.items,
                  { title: "", body: "", transcription: "", category: "" },
                ],
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-4 py-2.5 text-xs font-black text-emerald-700 dark:text-emerald-300 transition-colors w-full justify-center"
          >
            + Додати картку
          </button>

          {/* ── Category hint ── */}
          {block.items.some((it) => (it as { category?: string }).category) && (
            <div className="rounded-xl border border-sky-200 dark:border-sky-700/40 bg-sky-50 dark:bg-sky-950/30 px-4 py-3 text-xs text-sky-700 dark:text-sky-300 font-medium">
              💡 Категорії, знайдені в картках:{" "}
              <strong>
                {Array.from(
                  new Set(
                    block.items
                      .map((it) => (it as { category?: string }).category)
                      .filter(Boolean),
                  ),
                ).join(", ")}
              </strong>
              {" "}— стануть вкладками-фільтрами у студента.
            </div>
          )}
        </div>
      );
    case "match": {
      const setSide = (side: "left" | "right", lines: string[]) => {
        onChange(side === "left" ? { left: lines } : { right: lines });
      };
      const renderLineEditor = (
        label: string,
        lines: string[],
        onLines: (next: string[]) => void,
      ) => (
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
          {renderLineEditor("Лівий стовпчик", block.left, (l) => setSide("left", l))}
          {renderLineEditor("Правий стовпчик", block.right, (r) => setSide("right", r))}
        </div>
      );
    }
    case "cloze": {
      const distractors = block.distractors ?? [];
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Використовуйте{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">___</code> як пропуск у
            реченні. Студент обирає відповідь зі списку (правильна + хибні варіанти).
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
              // Не фільтруємо порожні сегменти під час введення — інакше кома зникає
              onChange({
                answers: e.target.value.split(",").map((s) => s.trim()),
              });
            }}
            onBlur={() => {
              onChange({
                answers: block.answers.map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <label className="text-xs font-bold text-slate-500">
            Хибні варіанти (через кому; показуються разом із правильною відповіддю)
          </label>
          <input
            value={distractors.join(", ")}
            onChange={(e) => {
              onChange({
                distractors: e.target.value.split(",").map((s) => s.trim()),
              });
            }}
            onBlur={() => {
              onChange({
                distractors: distractors.map((s) => s.trim()).filter(Boolean),
              });
            }}
            placeholder="наприклад: go, going, went"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      );
    }
    case "openCloze": {
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Використовуйте{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">___</code> як пропуск у
            реченні. Студент <strong>самостійно вписує</strong> відповідь — без варіантів на вибір.
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
              onChange({
                answers: e.target.value.split(",").map((s) => s.trim()),
              });
            }}
            onBlur={() => {
              onChange({
                answers: block.answers.map((s) => s.trim()).filter(Boolean),
              });
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      );
    }
    case "letterOrder": {
      const paragraphs = block.paragraphs.length ? block.paragraphs : [""];
      const setParagraph = (index: number, value: string) => {
        const next = [...paragraphs];
        next[index] = value;
        onChange({ paragraphs: next });
      };
      return (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Введіть параграфи листа <strong>у правильному порядку</strong> (зверху — початок листа,
            знизу — підпис). Студент побачить їх упереміш і має розставити правильно.
          </p>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Назва вправи (необовʼязково)</span>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Наприклад: Formal letter"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
          <div className="space-y-2">
            {paragraphs.map((para, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-2 w-6 shrink-0 text-[11px] font-black text-slate-400">{i + 1}.</span>
                <textarea
                  value={para}
                  onChange={(e) => setParagraph(i, e.target.value)}
                  rows={2}
                  placeholder={`Параграф ${i + 1}`}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => onChange({ paragraphs: paragraphs.filter((_, j) => j !== i) })}
                  className="shrink-0 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  aria-label="Видалити параграф"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onChange({ paragraphs: [...paragraphs, ""] })}
            className="text-xs font-bold text-emerald-600"
          >
            + параграф
          </button>
        </div>
      );
    }
    case "quiz": {
      const questions = block.questions.length
        ? block.questions
        : [{ questionText: "", answers: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }] }];

      const setQuestionText = (qi: number, value: string) => {
        const next = questions.map((q, i) => (i === qi ? { ...q, questionText: value } : q));
        onChange({ questions: next });
      };

      const setAnswerText = (qi: number, ai: number, value: string) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          const answers = q.answers.map((a, j) => (j === ai ? { ...a, text: value } : a));
          return { ...q, answers };
        });
        onChange({ questions: next });
      };

      const setCorrectAnswer = (qi: number, ai: number) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          return {
            ...q,
            answers: q.answers.map((a, j) => ({ ...a, isCorrect: j === ai })),
          };
        });
        onChange({ questions: next });
      };

      const addAnswer = (qi: number) => {
        const next = questions.map((q, i) =>
          i === qi ? { ...q, answers: [...q.answers, { text: "", isCorrect: false }] } : q,
        );
        onChange({ questions: next });
      };

      const removeAnswer = (qi: number, ai: number) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          const answers = q.answers.filter((_, j) => j !== ai);
          if (!answers.some((a) => a.isCorrect) && answers.length > 0) {
            answers[0] = { ...answers[0], isCorrect: true };
          }
          return { ...q, answers };
        });
        onChange({ questions: next });
      };

      const addQuestion = () => {
        onChange({
          questions: [
            ...questions,
            {
              questionText: "",
              answers: [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
              ],
            },
          ],
        });
      };

      const removeQuestion = (qi: number) => {
        onChange({ questions: questions.filter((_, i) => i !== qi) });
      };

      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Питання з варіантами відповіді зʼявляться на вкладці <strong>Тест</strong> у модулі.
            Позначте одну правильну відповідь на кожне питання.
          </p>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Назва тесту (необовʼязково)</span>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Наприклад: Grammar check"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>
          {questions.map((q, qi) => (
            <div
              key={qi}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Питання {qi + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qi)}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Видалити питання
                  </button>
                )}
              </div>
              <textarea
                value={q.questionText}
                onChange={(e) => setQuestionText(qi, e.target.value)}
                rows={2}
                placeholder="Текст питання"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500">Варіанти відповіді</p>
                {q.answers.map((ans, ai) => (
                  <div key={ai} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`quiz-correct-${block.id}-${qi}`}
                      checked={ans.isCorrect}
                      onChange={() => setCorrectAnswer(qi, ai)}
                      className="shrink-0"
                      aria-label={`Правильна відповідь ${ai + 1}`}
                    />
                    <input
                      value={ans.text}
                      onChange={(e) => setAnswerText(qi, ai, e.target.value)}
                      placeholder={`Варіант ${ai + 1}`}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                    />
                    {q.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(qi, ai)}
                        className="shrink-0 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        aria-label="Видалити варіант"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addAnswer(qi)}
                className="text-xs font-bold text-emerald-600"
              >
                + варіант відповіді
              </button>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="text-xs font-bold text-emerald-600">
            + питання
          </button>
        </div>
      );
    }
    case "wordBank": {
      const items = block.items.length
        ? block.items
        : [{ id: `wb-initial-1`, text: "", answers: [] }];
      const distractors = block.distractors ?? [];

      const setItemText = (idx: number, text: string) => {
        const next = [...items];
        next[idx] = { ...next[idx], text };
        onChange({ items: next });
      };

      const setItemAnswers = (idx: number, answersStr: string) => {
        const answers = answersStr.split(",").map((s) => s.trim());
        const next = [...items];
        next[idx] = { ...next[idx], answers };
        onChange({ items: next });
      };

      const addItem = () => {
        onChange({
          items: [
            ...items,
            { id: `wb-${Date.now()}-${items.length + 1}`, text: "", answers: [] },
          ],
        });
      };

      const removeItem = (idx: number) => {
        onChange({ items: items.filter((_, i) => i !== idx) });
      };

      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Використовуйте <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">___</code> як пропуски в кожному реченні (1-2 шт). Студент бачитиме загальний банк слів і перетягуватиме їх у пропуски.
          </p>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Назва вправи (необовʼязково)</span>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Слова у пропуски"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Список речень</p>
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-400">Речення {idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                  )}
                </div>
                <textarea
                  value={item.text}
                  onChange={(e) => setItemText(idx, e.target.value)}
                  rows={2}
                  placeholder="Наприклад: She ___ to school and bought some ___."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
                <div>
                  <label className="text-[11px] font-bold text-slate-500">
                    Правильні відповіді для речення (через кому по порядку пропусків)
                  </label>
                  <input
                    value={item.answers.join(", ")}
                    onChange={(e) => setItemAnswers(idx, e.target.value)}
                    placeholder="went, apples"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            + додати речення
          </button>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              Додаткові хибні слова в банк (через кому, не обовʼязково)
            </label>
            <input
              value={distractors.join(", ")}
              onChange={(e) => {
                onChange({
                  distractors: e.target.value.split(",").map((s) => s.trim()),
                });
              }}
              onBlur={() => {
                onChange({
                  distractors: distractors.map((s) => s.trim()).filter(Boolean),
                });
              }}
              placeholder="наприклад: running, dog"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </div>
        </div>
      );
    }
    case "multiSelect": {
      const questions = block.questions.length
        ? block.questions
        : [
            {
              id: `msq-initial-1`,
              questionText: "",
              options: [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
              ],
            },
          ];

      const setQuestionText = (qi: number, value: string) => {
        const next = questions.map((q, i) => (i === qi ? { ...q, questionText: value } : q));
        onChange({ questions: next });
      };

      const setOptionText = (qi: number, oi: number, value: string) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          const options = q.options.map((opt, j) => (j === oi ? { ...opt, text: value } : opt));
          return { ...q, options };
        });
        onChange({ questions: next });
      };

      const toggleOptionIsCorrect = (qi: number, oi: number) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          const options = q.options.map((opt, j) =>
            j === oi ? { ...opt, isCorrect: !opt.isCorrect } : opt,
          );
          return { ...q, options };
        });
        onChange({ questions: next });
      };

      const addOption = (qi: number) => {
        const next = questions.map((q, i) =>
          i === qi ? { ...q, options: [...q.options, { text: "", isCorrect: false }] } : q,
        );
        onChange({ questions: next });
      };

      const removeOption = (qi: number, oi: number) => {
        const next = questions.map((q, i) => {
          if (i !== qi) return q;
          return { ...q, options: q.options.filter((_, j) => j !== oi) };
        });
        onChange({ questions: next });
      };

      const addQuestion = () => {
        onChange({
          questions: [
            ...questions,
            {
              id: `msq-${Date.now()}-${questions.length + 1}`,
              questionText: "",
              options: [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
              ],
            },
          ],
        });
      };

      const removeQuestion = (qi: number) => {
        onChange({ questions: questions.filter((_, i) => i !== qi) });
      };

      return (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Створіть завдання з <strong>кількома правильними відповідями</strong> (чекбоксами). Відмітьте прапорцями всі варіанти, які є правильними.
          </p>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Назва блоку (необовʼязково)</span>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Множинний вибір"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            />
          </label>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div
                key={q.id || qi}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Питання / Завдання {qi + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                  )}
                </div>
                <textarea
                  value={q.questionText}
                  onChange={(e) => setQuestionText(qi, e.target.value)}
                  rows={2}
                  placeholder="Текст питання або інструкція (наприклад: Choose all the openings that are appropriate...)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500">
                    Варіанти відповідей (відмітьте всі правильні прапорцями)
                  </p>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={() => toggleOptionIsCorrect(qi, oi)}
                        className="shrink-0 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        title="Позначити як правильний варіант"
                      />
                      <input
                        value={opt.text}
                        onChange={(e) => setOptionText(qi, oi, e.target.value)}
                        placeholder={`Варіант ${oi + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qi, oi)}
                          className="shrink-0 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs font-bold text-emerald-600"
                >
                  + варіант відповіді
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addQuestion} className="text-xs font-bold text-emerald-600">
            + додати питання
          </button>
        </div>
      );
    }
    default:
      return null;
  }
}