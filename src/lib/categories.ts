export interface Task {
  id: string;
  title: string;
  done: boolean;
  date?: string;
  time?: string;
  notes?: string;
  priority?: number;
  createdAt: number;
}

export interface Subcategory {
  id: string;
  name: string;
  tasks: Task[];
  vision: VisionItem[];
}

export interface VisionItem {
  id: string;
  type: "image" | "text";
  content: string; // dataURL for image, text for text
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  priority: number;
  tasks: Task[];
  subcategories: Subcategory[];
  vision: VisionItem[];
  enableDateTime?: boolean;
}

export const DATETIME_DEFAULT_IDS = new Set(["rdv", "events", "today", "week", "month"]);

export const DEFAULT_CATEGORIES: Omit<Category, "tasks" | "subcategories" | "vision">[] = [
  { id: "rdv", name: "Rendez-vous", icon: "CalendarClock", color: "#56CCF2", priority: 1 },
  { id: "today", name: "Tâches du jour", icon: "Sun", color: "#F2C94C", priority: 2 },
  { id: "week", name: "Tâches de la semaine", icon: "CalendarDays", color: "#56CCF2", priority: 3 },
  { id: "month", name: "Tâches du mois", icon: "Calendar", color: "#9B51E0", priority: 4 },
  { id: "events", name: "Événements", icon: "Sparkles", color: "#EB5757", priority: 5 },
  { id: "ideas", name: "Idées", icon: "Lightbulb", color: "#F2994A", priority: 6 },
  { id: "health", name: "Santé", icon: "HeartPulse", color: "#27AE60", priority: 7 },
  { id: "sport", name: "Sport et physique", icon: "Dumbbell", color: "#EB5757", priority: 8 },
  { id: "savings", name: "Économies", icon: "PiggyBank", color: "#27AE60", priority: 9 },
  { id: "invest", name: "Placement", icon: "TrendingUp", color: "#9B51E0", priority: 10 },
  { id: "income", name: "Revenus", icon: "Wallet", color: "#27AE60", priority: 11 },
  { id: "income-res", name: "Ressources revenu", icon: "Coins", color: "#F2C94C", priority: 12 },
  { id: "income-sol", name: "Solutions revenu", icon: "Rocket", color: "#56CCF2", priority: 13 },
  { id: "problems", name: "Problèmes", icon: "AlertCircle", color: "#EB5757", priority: 14 },
  { id: "problems-res", name: "Ressources problèmes", icon: "BookOpen", color: "#F2994A", priority: 15 },
  { id: "problems-sol", name: "Solutions problèmes", icon: "Wrench", color: "#56CCF2", priority: 16 },
  { id: "goals", name: "Objectifs", icon: "Target", color: "#9B51E0", priority: 17 },
  { id: "needs", name: "Besoins", icon: "ShoppingBag", color: "#F2994A", priority: 18 },
  { id: "flaws", name: "Défauts", icon: "Minus", color: "#EB5757", priority: 19 },
  { id: "qualities", name: "Qualités", icon: "Star", color: "#F2C94C", priority: 20 },
  { id: "good-habits", name: "Bonnes habitudes", icon: "ThumbsUp", color: "#27AE60", priority: 21 },
  { id: "bad-habits", name: "Mauvaises habitudes", icon: "ThumbsDown", color: "#EB5757", priority: 22 },
  { id: "debts", name: "Dettes", icon: "TrendingDown", color: "#EB5757", priority: 23 },
  { id: "credits", name: "Créances", icon: "HandCoins", color: "#27AE60", priority: 24 },
  { id: "leisure", name: "Loisirs divers", icon: "Gamepad2", color: "#9B51E0", priority: 25 },
];
