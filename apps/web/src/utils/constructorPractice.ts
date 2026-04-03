export const CONSTRUCTOR_PRACTICE_MARKER = "___CONSTRUCTOR_PRACTICE_V1___";

export type ConstructorPracticePayload = {
  version: 1;
  quizlet: { term: string; definition: string }[];
  matching: { left: string[]; right: string[] }[];
};

export function parsePracticeFromTaskContent(content: string | null | undefined): {
  markdown: string;
  practice: ConstructorPracticePayload | null;
} {
  if (!content?.trim()) return { markdown: "", practice: null };
  const idx = content.indexOf(CONSTRUCTOR_PRACTICE_MARKER);
  if (idx === -1) return { markdown: content.trim(), practice: null };
  const md = content.slice(0, idx).trim();
  const jsonPart = content.slice(idx + CONSTRUCTOR_PRACTICE_MARKER.length).trim();
  try {
    const o = JSON.parse(jsonPart) as ConstructorPracticePayload;
    if (o?.version === 1 && Array.isArray(o.quizlet) && Array.isArray(o.matching)) {
      return { markdown: md, practice: o as ConstructorPracticePayload };
    }
  } catch {
    /* ignore */
  }
  return { markdown: content.trim(), practice: null };
}

export function appendPracticeToTaskMarkdown(
  markdown: string,
  practice: ConstructorPracticePayload,
): string {
  return `${markdown.trim()}\n\n${CONSTRUCTOR_PRACTICE_MARKER}\n${JSON.stringify(practice)}`;
}
