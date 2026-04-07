/* eslint-disable react-hooks/static-components */
import { useCallback, useEffect, useRef } from "react";

type Props = {
  /** Зміна ключа скидає вміст (наприклад id блоку) */
  mountKey: string;
  value: string;
  onChange: (html: string) => void;
  className?: string;
};

function exec(cmd: string, valueArg?: string) {
  try {
    document.execCommand(cmd, false, valueArg);
  } catch {
    /* ignore */
  }
}

export function RichTextEditor({ mountKey, value, onChange, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const next = value?.trim() ? value : "<p><br></p>";
    if (el.innerHTML === next) return;
    el.innerHTML = next;
  }, [mountKey, value]);

  const onInput = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const Btn = ({
    label,
    cmd,
    arg,
  }: {
    label: string;
    cmd: string;
    arg?: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        ref.current?.focus();
        exec(cmd, arg);
        if (ref.current) onChange(ref.current.innerHTML);
      }}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {label}
    </button>
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-900/80">
        <Btn label="Ж" cmd="bold" />
        <Btn label="К" cmd="italic" />
        <Btn label="П" cmd="underline" />
        <Btn label="Закреслити" cmd="strikeThrough" />
        <span className="mx-1 w-px self-stretch bg-slate-300 dark:bg-slate-600" />
        <Btn label="H2" cmd="formatBlock" arg="h2" />
        <Btn label="H3" cmd="formatBlock" arg="h3" />
        <span className="mx-1 w-px self-stretch bg-slate-300 dark:bg-slate-600" />
        <Btn label="• Список" cmd="insertUnorderedList" />
        <Btn label="1. Список" cmd="insertOrderedList" />
        <Btn label="Цитата" cmd="formatBlock" arg="blockquote" />
        <Btn label="—" cmd="insertHorizontalRule" />
        <span className="mx-1 w-px self-stretch bg-slate-300 dark:bg-slate-600" />
        <Btn label="Зліва" cmd="justifyLeft" />
        <Btn label="Центр" cmd="justifyCenter" />
        <Btn label="Справа" cmd="justifyRight" />
        <span className="mx-1 w-px self-stretch bg-slate-300 dark:bg-slate-600" />
        <Btn label="Зняти формат" cmd="removeFormat" />
        <span className="mx-1 w-px self-stretch bg-slate-300 dark:bg-slate-600" />
        <Btn label="↶" cmd="undo" />
        <Btn label="↷" cmd="redo" />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        onInput={onInput}
        onBlur={onInput}
      />
    </div>
  );
}
