import modulesData from "../data/modules.json";


export interface Module {
  title: string;
  description: string;
  img: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  xp: number;
  duration: string;
}

export const modules = modulesData as Module[];
