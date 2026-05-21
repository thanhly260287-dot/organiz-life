import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useStore, getCategoryProgress } from "@/lib/store";
import { TaskList } from "@/components/TaskList";
import { VisionBoard } from "@/components/VisionBoard";
import { IconRender } from "@/components/IconRender";
import { ArrowLeft, Trash2, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/app/category/$id")({
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  const category = useStore((s) => s.categories.find((c) => c.id === id));
  const removeCategory = useStore((s) => s.removeCategory);
  const updateCategory = useStore((s) => s.updateCategory);

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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-xl">Tâches</h2>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none glass rounded-full px-3 py-1.5 shadow-glass">
            <CalendarClock className="h-3.5 w-3.5" />
            Date &amp; heure
            <input
              type="checkbox"
              checked={!!category.enableDateTime}
              onChange={(e) => updateCategory(category.id, { enableDateTime: e.target.checked })}
              className="ml-1 accent-primary"
            />
          </label>
        </div>
        <TaskList
          categoryId={category.id}
          tasks={category.tasks}
          accent={category.color}
          enableDateTime={!!category.enableDateTime}
        />
      </section>

      <section className="space-y-4">
        <VisionBoard categoryId={category.id} items={category.vision} />
      </section>
    </main>
  );
}
