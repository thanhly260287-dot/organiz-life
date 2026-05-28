export interface Task {
  id: string;
  title: string;
  done: boolean;
  date?: string;
  time?: string;
  notes?: string;
  priority?: number;
  amount?: number;
  createdAt: number;
}

export const FINANCE_CATEGORY_IDS = new Set(["income", "debts", "invest", "credits"]);
export const NEGATIVE_FINANCE_IDS = new Set(["debts"]);


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
  zIndex?: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline";
  textAlign?: "left" | "center" | "right";
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

const BRAND_BLUE = "#56CCF2";
const BRAND_VIOLET = "#9B51E0";

export const DEFAULT_CATEGORIES: Omit<Category, "tasks" | "subcategories" | "vision">[] = [
  { id: "rdv", name: "Rendez-vous", icon: "CalendarClock", color: BRAND_BLUE, priority: 1 },
  { id: "today", name: "Tâches du jour", icon: "Sun", color: BRAND_VIOLET, priority: 2 },
  { id: "week", name: "Tâches de la semaine", icon: "CalendarDays", color: BRAND_BLUE, priority: 3 },
  { id: "month", name: "Tâches du mois", icon: "Calendar", color: BRAND_VIOLET, priority: 4 },
  { id: "events", name: "Événements", icon: "Sparkles", color: BRAND_BLUE, priority: 5 },
  { id: "needs", name: "Besoins", icon: "ShoppingBag", color: BRAND_VIOLET, priority: 6 },
  { id: "goals", name: "Objectifs", icon: "Target", color: BRAND_BLUE, priority: 7 },
  { id: "ideas", name: "Idées", icon: "Lightbulb", color: BRAND_VIOLET, priority: 8 },
  { id: "sport", name: "Sport", icon: "Dumbbell", color: BRAND_BLUE, priority: 9 },
  { id: "physique", name: "Physique", icon: "PersonStanding", color: BRAND_VIOLET, priority: 10 },
  { id: "health", name: "Santé", icon: "HeartPulse", color: BRAND_BLUE, priority: 11 },
  { id: "savings", name: "Économies", icon: "PiggyBank", color: BRAND_VIOLET, priority: 12 },
  { id: "invest", name: "Placement", icon: "TrendingUp", color: BRAND_BLUE, priority: 13 },
  { id: "income", name: "Revenus", icon: "Wallet", color: BRAND_VIOLET, priority: 14 },
  { id: "income-res", name: "Ressources revenu", icon: "Coins", color: BRAND_BLUE, priority: 15 },
  { id: "income-sol", name: "Solutions revenu", icon: "Rocket", color: BRAND_VIOLET, priority: 16 },
  { id: "problems", name: "Problèmes", icon: "AlertCircle", color: BRAND_BLUE, priority: 17 },
  { id: "problems-res", name: "Ressources problèmes", icon: "BookOpen", color: BRAND_VIOLET, priority: 18 },
  { id: "problems-sol", name: "Solutions problèmes", icon: "Wrench", color: BRAND_BLUE, priority: 19 },
  { id: "flaws", name: "Défauts", icon: "Minus", color: BRAND_VIOLET, priority: 20 },
  { id: "qualities", name: "Qualités", icon: "Star", color: BRAND_BLUE, priority: 21 },
  { id: "good-habits", name: "Bonnes habitudes", icon: "ThumbsUp", color: BRAND_VIOLET, priority: 22 },
  { id: "bad-habits", name: "Mauvaises habitudes", icon: "ThumbsDown", color: BRAND_BLUE, priority: 23 },
  { id: "debts", name: "Dettes", icon: "TrendingDown", color: BRAND_VIOLET, priority: 24 },
  { id: "credits", name: "Créances", icon: "HandCoins", color: BRAND_BLUE, priority: 25 },
  { id: "leisure", name: "Loisirs", icon: "Gamepad2", color: BRAND_VIOLET, priority: 26 },
  { id: "misc", name: "Divers", icon: "Layers", color: BRAND_BLUE, priority: 27 },
];
