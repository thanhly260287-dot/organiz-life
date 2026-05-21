import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Category, type Task, type Subcategory, type VisionItem, DEFAULT_CATEGORIES, DATETIME_DEFAULT_IDS } from "./categories";

const uid = () => Math.random().toString(36).slice(2, 11);

interface AppState {
  categories: Category[];
  theme: "light" | "dark";
  textSize: "sm" | "md" | "lg";
  showPriorityNumbers: boolean;

  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  setTextSize: (s: "sm" | "md" | "lg") => void;
  togglePriorityNumbers: () => void;

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


const seedCategories = (): Category[] =>
  DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    tasks: [],
    subcategories: [],
    vision: [],
    enableDateTime: DATETIME_DEFAULT_IDS.has(c.id),
  }));

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      categories: seedCategories(),
      theme: "dark",
      textSize: "md",
      showPriorityNumbers: true,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setTextSize: (textSize) => set({ textSize }),
      togglePriorityNumbers: () => set((s) => ({ showPriorityNumbers: !s.showPriorityNumbers })),

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
      version: 3,
      migrate: (persisted: any) => {
        if (persisted?.categories) {
          persisted.categories = persisted.categories.map((c: any) => ({
            ...c,
            vision: c.vision ?? [],
            subcategories: (c.subcategories ?? []).map((sc: any) => ({ ...sc, vision: sc.vision ?? [] })),
            enableDateTime: c.enableDateTime ?? DATETIME_DEFAULT_IDS.has(c.id),
          }));
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
