export type ScenarioBlock =
  | { id: string; type: "text"; body: string }
  | {
      id: string;
      type: "table";
      headers: string[];
      rows: string[][];
    }
  | {
      id: string;
      type: "cards";
      items: { title: string; body: string }[];
    }
  | {
      id: string;
      type: "connector";
      fromId: string;
      toId: string;
      label?: string;
    }
  | {
      id: string;
      type: "cloze";
      text: string;
      answers: string[];
    };

export type ScenarioDocument = {
  version: 1;
  title: string;
  blocks: ScenarioBlock[];
};

export function newBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultBlock(type: ScenarioBlock["type"]): ScenarioBlock {
  const id = newBlockId();
  switch (type) {
    case "text":
      return { id, type: "text", body: "Текст параграфу…" };
    case "table":
      return {
        id,
        type: "table",
        headers: ["Колонка 1", "Колонка 2"],
        rows: [
          ["", ""],
          ["", ""],
        ],
      };
    case "cards":
      return {
        id,
        type: "cards",
        items: [
          { title: "Картка 1", body: "Опис…" },
          { title: "Картка 2", body: "Опис…" },
        ],
      };
    case "connector":
      return { id, type: "connector", fromId: "", toId: "", label: "" };
    case "cloze":
      return {
        id,
        type: "cloze",
        text: "She ___ to the office every day.",
        answers: ["goes"],
      };
  }
}
