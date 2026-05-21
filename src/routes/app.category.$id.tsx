import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useStore, getCategoryProgress } from "@/lib/store";
import { TaskList } from "@/components/TaskList";
import { VisionBoard } from "@/components/VisionBoard";
import { IconRender } from "@/components/IconRender";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/category/$id")({
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  const category = useStore((s) => s.categories.find((c) => c.id === id));
  const addSub = useStore((s) => s.addSubcategory);
  const removeSub = useStore((s) => s.removeSubcategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const [newSub, setNewSub] = useState("");

  if (!category) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-display font-bold">Catégorie introuvable</h1>
        <Link to="/app" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </main>
    );
  }

  const progress = getCategoryProgress(category);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Toutes les catégories
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl shadow-elevated p-6 sm:p-8"
      >
        <div className="flex items-start gap-4">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-glow shrink-0"
            style={{ background: `linear-gradient(135deg, ${category.color}, ${category.color}aa)` }}
          >
            <IconRender name={category.icon} className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-3xl truncate">{category.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {progress.done} / {progress.total} tâches accomplies — {progress.pct}%
            </p>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.pct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full"
                style={{ background: `linear-gradient(90deg, ${category.color}, var(--brand-violet))` }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm(`Supprimer la catégorie "${category.name}" ?`)) {
                removeCategory(category.id);
                window.history.back();
              }
            }}
            className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
            aria-label="Supprimer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </motion.section>

      <section className="space-y-4">
        <h2 className="font-display font-semibold text-xl">Tâches</h2>
        <TaskList categoryId={category.id} tasks={category.tasks} accent={category.color} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-xl">Sous-catégories</h2>
        </div>
        <div className="flex gap-2">
          <input
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newSub.trim()) {
                addSub(category.id, newSub.trim());
                setNewSub("");
              }
            }}
            placeholder="Ajouter une sous-catégorie…"
            className="flex-1 glass rounded-xl shadow-glass px-4 py-2.5 text-sm outline-none"
          />
          <button
            onClick={() => {
              if (newSub.trim()) {
                addSub(category.id, newSub.trim());
                setNewSub("");
              }
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-brand px-4 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-6">
          {category.subcategories.map((sc) => (
            <div key={sc.id} className="glass rounded-2xl shadow-glass p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold">{sc.name}</h3>
                <button
                  onClick={() => removeSub(category.id, sc.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <TaskList categoryId={category.id} subId={sc.id} tasks={sc.tasks} accent={category.color} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <VisionBoard categoryId={category.id} items={category.vision} />
      </section>
    </main>
  );
}
