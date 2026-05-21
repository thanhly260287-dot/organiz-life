import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { Plus, Search } from "lucide-react";
import { useStore, MAIN_VISION_ID } from "@/lib/store";
import { CategoryCard } from "@/components/CategoryCard";
import { IconRender } from "@/components/IconRender";
import { VisionBoard } from "@/components/VisionBoard";




const ICON_CHOICES = ["Star", "Heart", "Zap", "Rocket", "Target", "Flame", "Trophy", "Compass", "BookOpen", "Brain"];
const COLOR_CHOICES = ["#56CCF2", "#9B51E0"];

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  );

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.id !== MAIN_VISION_ID),
    [categories]
  );
  const mainVision = useMemo(
    () => categories.find((c) => c.id === MAIN_VISION_ID),
    [categories]
  );
  const filtered = useMemo(
    () => visibleCategories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [visibleCategories, query]
  );


  


  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = visibleCategories.map((c) => c.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    reorder([...arrayMove(ids, oldIdx, newIdx), MAIN_VISION_ID]);
  };


  const submitNew = () => {
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), icon: newIcon, color: newColor });
    setNewName("");
    setCreating(false);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-4">
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
          <Plus className="h-4 w-4" /> Ajouter
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
          <div className="flex flex-col gap-2">
            {filtered.map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}

