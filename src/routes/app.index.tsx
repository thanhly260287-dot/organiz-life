import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Search, Sparkles } from "lucide-react";
import { useStore, getCategoryProgress } from "@/lib/store";
import { CategoryCard } from "@/components/CategoryCard";
import { IconRender } from "@/components/IconRender";

const QUOTES = [
  "Chaque petit pas te rapproche d'une grande vie.",
  "Discipline aujourd'hui, liberté demain.",
  "Ta vie idéale se construit une habitude à la fois.",
  "Sois le héros de ta propre histoire.",
  "Progrès > perfection.",
];

const ICON_CHOICES = ["Star", "Heart", "Zap", "Rocket", "Target", "Flame", "Trophy", "Compass", "BookOpen", "Brain"];
const COLOR_CHOICES = ["#56CCF2", "#9B51E0", "#27AE60", "#F2C94C", "#EB5757", "#F2994A"];

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const categories = useStore((s) => s.categories);
  const reorder = useStore((s) => s.reorderCategories);
  const addCategory = useStore((s) => s.addCategory);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_CHOICES[0]);
  const [newColor, setNewColor] = useState(COLOR_CHOICES[1]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const filtered = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [categories, query]
  );

  const stats = useMemo(() => {
    let done = 0;
    let total = 0;
    categories.forEach((c) => {
      const p = getCategoryProgress(c);
      done += p.done;
      total += p.total;
    });
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [categories]);

  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = categories.map((c) => c.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    reorder(arrayMove(ids, oldIdx, newIdx));
  };

  const submitNew = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), icon: newIcon, color: newColor });
    setNewName("");
    setCreating(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl shadow-elevated p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{quote}</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl">
          Bienvenue dans <span className="text-gradient">Organiz-Life</span>
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">Ta progression globale, en un coup d'œil.</p>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Progression de vie</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-display font-bold text-gradient">{stats.pct}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-brand"
              />
            </div>
          </div>
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Tâches accomplies</div>
            <div className="mt-1 text-3xl font-display font-bold">{stats.done}</div>
          </div>
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">Catégories actives</div>
            <div className="mt-1 text-3xl font-display font-bold">{categories.length}</div>
          </div>
        </div>
      </motion.section>

      <section className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="w-full glass rounded-xl shadow-glass pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-primary"
          />
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-medium text-white shadow-glow hover:scale-105 transition-transform"
        >
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </section>

      {creating && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass rounded-2xl shadow-glass p-4 space-y-3"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitNew()}
            placeholder="Nom de la catégorie"
            className="w-full bg-transparent outline-none text-base"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">Icône :</span>
            {ICON_CHOICES.map((ic) => (
              <button
                key={ic}
                onClick={() => setNewIcon(ic)}
                className={`p-2 rounded-lg transition-all ${newIcon === ic ? "bg-gradient-brand text-white" : "hover:bg-muted"}`}
              >
                <IconRender name={ic} className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">Couleur :</span>
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`h-7 w-7 rounded-full transition-all ${newColor === c ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="text-sm px-4 py-2 rounded-lg hover:bg-muted">
              Annuler
            </button>
            <button onClick={submitNew} className="text-sm px-4 py-2 rounded-lg bg-gradient-brand text-white font-medium">
              Créer
            </button>
          </div>
        </motion.div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={filtered.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
