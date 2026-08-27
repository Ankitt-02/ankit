export interface DeveloperStack {
  identity: string;
  frontend: string[];
  backend: string[];
  ai_ml: string[];
  databases: string[];
  languages: string[];
  fundamentals: string[];
  tools: string[];
}

export const DEVELOPER_STACK: DeveloperStack = {
  identity: "Ankit",
  frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  backend: ["Node.js", "Next.js Server Actions"],
  ai_ml: ["Python", "PyTorch", "Transformers", "LLM / SLM Development"],
  databases: ["PostgreSQL", "SQL", "Supabase"],
  languages: ["Python", "C++", "TypeScript", "JavaScript", "Java"],
  fundamentals: ["DSA", "System Design", "Software Engineering", "Computer Science"],
  tools: ["Git", "GitHub", "Linux", "Supabase CLI"],
};
