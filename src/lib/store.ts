import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Category, type Task, type Subcategory, type VisionItem, DEFAULT_CATEGORIES, DATETIME_DEFAULT_IDS, FINANCE_CATEGORY_IDS, NEGATIVE_FINANCE_IDS } from "./categories";


const uid = () => Math.random().toString(36).slice(2, 11);

interface AppState {
  categories: Category[];
  theme: "light" | "dark";
  textSize: "sm" | "md" | "lg";
  showCategoryPriority: boolean;
  showCategoryTotal: boolean;
  taskPriorityCategories: string[]; // category ids where task priority numbers are shown

  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  setTextSize: (s: "sm" | "md" | "lg") => void;
  toggleCategoryPriority: () => void;
  toggleCategoryTotal: () => void;
  toggleTaskPriorityFor: (categoryId: string) => void;


  addCategory: (data: { name: string; icon: string; color: string }) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  addTask: (categoryId: string, task: Partial<Task> & { title: string }, subId?: string) => void;
  updateTask: (categoryId: string, taskId: string, patch: Partial<Task>, subId?: string) => void;
  removeTask: (categoryId: string, taskId: string, subId?: string) => void;
  toggleTask: (categoryId: string, taskId: string, subId?: string) => void;
  reorderTasks: (categoryId: string, ids: string[], subId?: string) => void;

  addSubcategory: (categoryId: string, name: string) => void;
  removeSubcategory: (categoryId: string, subId: string) => void;

  addVisionItem: (categoryId: string, item: Omit<VisionItem, "id">, subId?: string) => void;
  updateVisionItem: (categoryId: string, itemId: string, patch: Partial<VisionItem>, subId?: string) => void;
  removeVisionItem: (categoryId: string, itemId: string, subId?: string) => void;
}


export const MAIN_VISION_ID = "__main__";

const seedCategories = (): Category[] => [
  ...DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    tasks: [],
    subcategories: [],
    vision: [],
    enableDateTime: DATETIME_DEFAULT_IDS.has(c.id),
  })),
  {
    id: MAIN_VISION_ID,
    name: "Vision principale",
    icon: "Sparkles",
    color: "#9B51E0",
    priority: 999,
    tasks: [],
    subcategories: [],
    vision: [],
    enableDateTime: false,
  },
];


export const useStore = create<AppState>()(
  persist(
    (set) => ({
      categories: seedCategories(),
      theme: "dark",
      textSize: "md",
      showCategoryPriority: false,
      showCategoryTotal: true,
      taskPriorityCategories: [],

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTextSize: (textSize) => set({ textSize }),
      toggleCategoryPriority: () => set((s) => ({ showCategoryPriority: !s.showCategoryPriority })),
      toggleCategoryTotal: () => set((s) => ({ showCategoryTotal: !s.showCategoryTotal })),

      toggleTaskPriorityFor: (categoryId) =>
        set((s) => ({
          taskPriorityCategories: s.taskPriorityCategories.includes(categoryId)
            ? s.taskPriorityCategories.filter((id) => id !== categoryId)
            : [...s.taskPriorityCategories, categoryId],
        })),

      addCategory: ({ name, icon, color }) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { id: uid(), name, icon, color, priority: s.categories.length + 1, tasks: [], subcategories: [], vision: [] },
          ],
        })),
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      removeCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
      reorderCategories: (ids) =>
        set((s) => {
          const map = new Map(s.categories.map((c) => [c.id, c]));
          return { categories: ids.map((id, i) => ({ ...map.get(id)!, priority: i + 1 })) };
        }),

      addTask: (categoryId, task, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const newTask: Task = {
              id: uid(),
              title: task.title,
              done: false,
              date: task.date,
              time: task.time,
              notes: task.notes,
              priority: task.priority,
              amount: task.amount,
              amountSign: task.amountSign,
              reminders: task.reminders,
              createdAt: Date.now(),
            };

            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) =>
                  sc.id === subId ? { ...sc, tasks: [...sc.tasks, newTask] } : sc
                ),
              };
            }
            return { ...c, tasks: [...c.tasks, newTask] };
          }),
        })),
      updateTask: (categoryId, taskId, patch, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const map = (tasks: Task[]) => tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) => (sc.id === subId ? { ...sc, tasks: map(sc.tasks) } : sc)),
              };
            }
            return { ...c, tasks: map(c.tasks) };
          }),
        })),
      removeTask: (categoryId, taskId, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) =>
                  sc.id === subId ? { ...sc, tasks: sc.tasks.filter((t) => t.id !== taskId) } : sc
                ),
              };
            }
            return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
          }),
        })),
      toggleTask: (categoryId, taskId, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const map = (tasks: Task[]) => tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) => (sc.id === subId ? { ...sc, tasks: map(sc.tasks) } : sc)),
              };
            }
            return { ...c, tasks: map(c.tasks) };
          }),
        })),
      reorderTasks: (categoryId, ids, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const sort = (tasks: Task[]) => {
              const map = new Map(tasks.map((t) => [t.id, t]));
              return ids.map((id) => map.get(id)!).filter(Boolean);
            };
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) => (sc.id === subId ? { ...sc, tasks: sort(sc.tasks) } : sc)),
              };
            }
            return { ...c, tasks: sort(c.tasks) };
          }),
        })),


      addSubcategory: (categoryId, name) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId
              ? { ...c, subcategories: [...c.subcategories, { id: uid(), name, tasks: [], vision: [] } as Subcategory] }
              : c
          ),
        })),
      removeSubcategory: (categoryId, subId) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === categoryId ? { ...c, subcategories: c.subcategories.filter((sc) => sc.id !== subId) } : c
          ),
        })),

      addVisionItem: (categoryId, item, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const newItem = { ...item, id: uid() };
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) =>
                  sc.id === subId ? { ...sc, vision: [...sc.vision, newItem] } : sc
                ),
              };
            }
            return { ...c, vision: [...c.vision, newItem] };
          }),
        })),
      updateVisionItem: (categoryId, itemId, patch, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            const map = (vs: VisionItem[]) => vs.map((v) => (v.id === itemId ? { ...v, ...patch } : v));
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) => (sc.id === subId ? { ...sc, vision: map(sc.vision) } : sc)),
              };
            }
            return { ...c, vision: map(c.vision) };
          }),
        })),
      removeVisionItem: (categoryId, itemId, subId) =>
        set((s) => ({
          categories: s.categories.map((c) => {
            if (c.id !== categoryId) return c;
            if (subId) {
              return {
                ...c,
                subcategories: c.subcategories.map((sc) =>
                  sc.id === subId ? { ...sc, vision: sc.vision.filter((v) => v.id !== itemId) } : sc
                ),
              };
            }
            return { ...c, vision: c.vision.filter((v) => v.id !== itemId) };
          }),
        })),
    }),
    {
      name: "organiz-life-v1",
      version: 15,
      migrate: (persisted: any) => {
        if (persisted?.categories) {
          // Rename "Sport et physique" → "Sport"
          persisted.categories = persisted.categories.map((c: any) => {
            if (c.id === "sport" && c.name === "Sport et physique") {
              return { ...c, name: "Sport" };
            }
            return c;
          });
          // Add "Physique" if missing
          if (!persisted.categories.find((c: any) => c.id === "physique")) {
            const sportIdx = persisted.categories.findIndex((c: any) => c.id === "sport");
            const insertAt = sportIdx >= 0 ? sportIdx + 1 : persisted.categories.length;
            persisted.categories.splice(insertAt, 0, {
              id: "physique",
              name: "Physique",
              icon: "PersonStanding",
              color: "#56CCF2",
              priority: 0,
              tasks: [],
              subcategories: [],
              vision: [],
              enableDateTime: false,
            });
          }
          // Add main vision board entry if missing
          if (!persisted.categories.find((c: any) => c.id === MAIN_VISION_ID)) {
            persisted.categories.push({
              id: MAIN_VISION_ID,
              name: "Vision principale",
              icon: "Sparkles",
              color: "#9B51E0",
              priority: 999,
              tasks: [],
              subcategories: [],
              vision: [],
              enableDateTime: false,
            });
          }
          // Move "needs" and "goals" right after "events"
          const eventsIdx = persisted.categories.findIndex((c: any) => c.id === "events");
          if (eventsIdx >= 0) {
            const needs = persisted.categories.find((c: any) => c.id === "needs");
            const goals = persisted.categories.find((c: any) => c.id === "goals");
            persisted.categories = persisted.categories.filter(
              (c: any) => c.id !== "needs" && c.id !== "goals"
            );
            const newEventsIdx = persisted.categories.findIndex((c: any) => c.id === "events");
            const insert: any[] = [];
            if (needs) insert.push(needs);
            if (goals) insert.push(goals);
            persisted.categories.splice(newEventsIdx + 1, 0, ...insert);
          }
          // Move "health" right after "physique"
          const health = persisted.categories.find((c: any) => c.id === "health");
          if (health) {
            persisted.categories = persisted.categories.filter((c: any) => c.id !== "health");
            const physIdx = persisted.categories.findIndex((c: any) => c.id === "physique");
            const at = physIdx >= 0 ? physIdx + 1 : persisted.categories.length;
            persisted.categories.splice(at, 0, health);
          }
          // Rename "Loisirs divers" → "Loisirs" and add "Divers" if missing
          const leisureCat = persisted.categories.find((c: any) => c.id === "leisure");
          if (leisureCat && leisureCat.name === "Loisirs divers") {
            leisureCat.name = "Loisirs";
          }
          if (!persisted.categories.find((c: any) => c.id === "misc")) {
            const leisureIdx = persisted.categories.findIndex((c: any) => c.id === "leisure");
            const insertAt = leisureIdx >= 0 ? leisureIdx + 1 : persisted.categories.length;
            persisted.categories.splice(insertAt, 0, {
              id: "misc",
              name: "Divers",
              icon: "Layers",
              color: "#56CCF2",
              priority: 0,
              tasks: [],
              subcategories: [],
              vision: [],
              enableDateTime: false,
            });
          }
          // Add "couts" category if missing (after couts-et-gains)
          if (!persisted.categories.find((c: any) => c.id === "couts")) {
            const cegIdx = persisted.categories.findIndex((c: any) => c.id === "couts-et-gains");
            const insertAt = cegIdx >= 0 ? cegIdx + 1 : persisted.categories.length;
            persisted.categories.splice(insertAt, 0, {
              id: "couts",
              name: "Couts",
              icon: "Receipt",
              color: "#56CCF2",
              priority: 0,
              tasks: [],
              subcategories: [],
              vision: [],
              enableDateTime: false,
            });
          }
          // Add "gains" category if missing (after couts)
          if (!persisted.categories.find((c: any) => c.id === "gains")) {
            const coutsIdx = persisted.categories.findIndex((c: any) => c.id === "couts");
            const insertAt = coutsIdx >= 0 ? coutsIdx + 1 : persisted.categories.length;
            persisted.categories.splice(insertAt, 0, {
              id: "gains",
              name: "Gains",
              icon: "TrendingUp",
              color: "#56CCF2",
              priority: 0,
              tasks: [],
              subcategories: [],
              vision: [],
              enableDateTime: false,
            });
          }
          // Add ACT categories if missing
          const ACT_CATS = [
            { id: "desires", name: "Ce que je désire dans ma vie", icon: "Heart", color: "#9B51E0" },
            { id: "rejections", name: "Ce que je ne veux plus dans ma vie", icon: "Ban", color: "#56CCF2" },
            { id: "accept", name: "Ce que je veux bien accepter", icon: "CheckCircle2", color: "#9B51E0" },
            { id: "no-accept", name: "Ce que je n'accepterai plus jamais", icon: "ShieldOff", color: "#56CCF2" },
          ];
          for (const act of ACT_CATS) {
            if (!persisted.categories.find((c: any) => c.id === act.id)) {
              const leisureIdx = persisted.categories.findIndex((c: any) => c.id === "leisure");
              const insertAt = leisureIdx >= 0 ? leisureIdx + 1 : persisted.categories.length;
              persisted.categories.splice(insertAt, 0, {
                id: act.id,
                name: act.name,
                icon: act.icon,
                color: act.color,
                priority: 0,
                tasks: [],
                subcategories: [],
                vision: [],
                enableDateTime: false,
              });
            }
          }
          // Move "misc" to the end (after no-accept)
          const miscIdx = persisted.categories.findIndex((c: any) => c.id === "misc");
          if (miscIdx >= 0) {
            const noAcceptIdx = persisted.categories.findIndex((c: any) => c.id === "no-accept");
            if (noAcceptIdx >= 0 && miscIdx < noAcceptIdx) {
              const [misc] = persisted.categories.splice(miscIdx, 1);
              const newNoAcceptIdx = persisted.categories.findIndex((c: any) => c.id === "no-accept");
              persisted.categories.splice(newNoAcceptIdx + 1, 0, misc);
            }
          }
          // Move "gains" right after "invest"
          const gains = persisted.categories.find((c: any) => c.id === "gains");
          if (gains) {
            persisted.categories = persisted.categories.filter((c: any) => c.id !== "gains");
            const investIdx = persisted.categories.findIndex((c: any) => c.id === "invest");
            const at = investIdx >= 0 ? investIdx + 1 : persisted.categories.length;
            persisted.categories.splice(at, 0, gains);
          }
          // Ensure "couts" is right before "income"
          const couts = persisted.categories.find((c: any) => c.id === "couts");
          if (couts) {
            persisted.categories = persisted.categories.filter((c: any) => c.id !== "couts");
            const incomeIdx = persisted.categories.findIndex((c: any) => c.id === "income");
            const at = incomeIdx >= 0 ? incomeIdx : persisted.categories.length;
            persisted.categories.splice(at, 0, couts);
          }
          // Snap colors to brand palette (skip the hidden main vision)

          const BRAND = ["#56CCF2", "#9B51E0"];
          let idx = 0;
          persisted.categories = persisted.categories.map((c: any) => {
            const isMain = c.id === MAIN_VISION_ID;
            const next = {
              ...c,
              color: isMain ? c.color ?? "#9B51E0" : BRAND[idx % 2],
              priority: isMain ? 999 : idx + 1,
              vision: c.vision ?? [],
              subcategories: (c.subcategories ?? []).map((sc: any) => ({ ...sc, vision: sc.vision ?? [] })),
              enableDateTime: c.enableDateTime ?? DATETIME_DEFAULT_IDS.has(c.id),
            };
            if (!isMain) idx++;
            return next;
          });
        }
        return persisted;
      },
    }
  )
);


export const getCategoryProgress = (c: Category) => {
  const all = [...c.tasks, ...c.subcategories.flatMap((s) => s.tasks)];
  if (all.length === 0) return { done: 0, total: 0, pct: 0 };
  const done = all.filter((t) => t.done).length;
  return { done, total: all.length, pct: Math.round((done / all.length) * 100) };
};


export const isFinanceCategory = (id: string) => FINANCE_CATEGORY_IDS.has(id);

export const getCategoryFinanceTotal = (c: Category): number | null => {
  if (!FINANCE_CATEGORY_IDS.has(c.id)) return null;
  const all = [...c.tasks, ...c.subcategories.flatMap((s) => s.tasks)];
  const defaultSign: 1 | -1 = NEGATIVE_FINANCE_IDS.has(c.id) ? -1 : 1;
  let any = false;
  const total = all.reduce((sum, t) => {
    if (t.amount == null) return sum;
    any = true;
    // Créances: once "tracée" (done), the amount is settled and removed
    // from the negative créance total (contribution = 0).
    if (c.id === "credits") {
      return sum + (t.done ? 0 : -t.amount);
    }
    const sign = (t.amountSign ?? defaultSign) as number;
    return sum + t.amount * sign;
  }, 0);
  return any ? total : null;
};
