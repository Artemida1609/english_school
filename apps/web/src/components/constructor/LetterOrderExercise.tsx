import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (n > 1 && arr.every((v, i) => v === i)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

function SortableParagraph({
  id,
  index,
  text,
  checked,
  isCorrectPosition,
  disabled,
}: {
  id: string;
  index: number;
  text: string;
  checked: boolean;
  isCorrectPosition: boolean;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-3 rounded-xl border-2 px-3 py-3 text-left transition-colors touch-none ${
        isDragging ? "opacity-60 shadow-lg ring-2 ring-emerald-400/50" : ""
      } ${
        checked
          ? isCorrectPosition
            ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-900/25"
            : "border-rose-400 bg-rose-50/90 dark:bg-rose-900/20"
          : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#06121D]"
      }`}
    >
      <button
        type="button"
        className="mt-0.5 shrink-0 cursor-grab text-slate-300 active:cursor-grabbing dark:text-slate-600"
        aria-label="Перетягнути параграф"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="shrink-0 text-[11px] font-black uppercase tracking-widest text-slate-400">
        {index + 1}
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}

type Props = {
  paragraphs: string[];
  exerciseIndex: number;
  title?: string;
  completed?: boolean;
  onComplete?: () => void;
};

/** Розставити параграфи у правильному порядку (лист). */
export function LetterOrderExercise({
  paragraphs,
  exerciseIndex,
  title,
  completed = false,
  onComplete,
}: Props) {
  const cleaned = useMemo(
    () => paragraphs.map((p) => p.trim()).filter(Boolean),
    [paragraphs],
  );

  const solvedOrder = useMemo(
    () => Array.from({ length: cleaned.length }, (_, i) => i),
    [cleaned.length],
  );

  const [order, setOrder] = useState<number[]>(() =>
    completed ? solvedOrder : shuffleIndices(cleaned.length),
  );
  const [checked, setChecked] = useState(completed);
  const completionNotifiedRef = useRef(false);

  useEffect(() => {
    if (completed) {
      setOrder(solvedOrder);
      setChecked(true);
    }
  }, [completed, solvedOrder]);

  useEffect(() => {
    setOrder(completed ? solvedOrder : shuffleIndices(cleaned.length));
    setChecked(completed);
    completionNotifiedRef.current = false;
  }, [cleaned, completed, solvedOrder]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const ids = useMemo(() => order.map((orig) => `p-${orig}`), [order]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (checked || completed) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setOrder((prev) => {
        const oldIndex = prev.findIndex((orig) => `p-${orig}` === active.id);
        const newIndex = prev.findIndex((orig) => `p-${orig}` === over.id);
        if (oldIndex < 0 || newIndex < 0) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [checked, completed],
  );

  const isFullyCorrect = order.every((origIdx, pos) => origIdx === pos);

  const handleCheck = () => {
    const ok = order.every((origIdx, pos) => origIdx === pos);
    setChecked(true);
    if (ok && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.();
    }
  };

  const handleRetry = () => {
    setOrder(shuffleIndices(cleaned.length));
    setChecked(false);
    completionNotifiedRef.current = false;
  };

  if (cleaned.length < 2) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Додайте щонайменше 2 параграфи в конструкторі.
      </p>
    );
  }

  const heading = title?.trim() || `Лист ${exerciseIndex + 1}`;

  return (
    <div className="mb-10">
      <h3 className="text-sm font-black uppercase tracking-widest text-sky-800 dark:text-sky-200 mb-2">
        {heading}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
        Перетягніть параграфи, щоб зібрати лист у правильному порядку зверху донизу.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {order.map((origIdx, displayIndex) => (
              <SortableParagraph
                key={`p-${origIdx}`}
                id={`p-${origIdx}`}
                index={displayIndex}
                text={cleaned[origIdx] ?? ""}
                checked={checked}
                isCorrectPosition={origIdx === displayIndex}
                disabled={checked || completed}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!checked && !completed && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheck}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow hover:bg-emerald-500"
          >
            Перевірити
          </motion.button>
        )}
        {checked && !isFullyCorrect && !completed && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 dark:border-white/15 dark:text-slate-200"
          >
            Спробувати ще
          </motion.button>
        )}
        {checked && (
          <p
            className={`text-sm font-bold ${
              isFullyCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isFullyCorrect
              ? "Чудово! Лист зібрано правильно."
              : "Ще не вірно — переставте параграфи та перевірте знову."}
          </p>
        )}
      </div>
    </div>
  );
}
