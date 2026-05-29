import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useStore, getCategoryProgress } from "@/lib/store";
import { TaskList } from "@/components/TaskList";
import { IconRender } from "@/components/IconRender";
import { ArrowLeft, Trash2, CalendarClock, Eraser } from "lucide-react";
import { FINANCE_CATEGORY_IDS, NEGATIVE_FINANCE_IDS, FORCED_SIGN_IDS } from "@/lib/categories";
import { useCategoryName } from "@/lib/useCategoryName";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/app/category/$id")({
  component: CategoryPage,
});

function CategoryPage() {
  const { t } = useTranslation();
  const nameFor = useCategoryName();
  const { id } = Route.useParams();
  const category = useStore((s) => s.categories.find((c) => c.id === id));
  const removeCategory = useStore((s) => s.removeCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const clearCategoryTasks = useStore((s) => s.clearCategoryTasks);

  const [clearOpen, setClearOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!category) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-display font-bold">{t("category.notFound")}</h1>
        <Link to="/app" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> {t("header.back")}
        </Link>
      </main>
    );
  }

  const progress = getCategoryProgress(category);
  const displayName = nameFor(category.id, category.name);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("category.all")}
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
            <h1 className="font-display font-bold text-3xl truncate">{displayName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("category.tasksProgress", { done: progress.done, total: progress.total, pct: progress.pct })}
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
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                const count =
                  category.tasks.length +
                  category.subcategories.reduce((acc, sc) => acc + sc.tasks.length, 0);
                if (count === 0) return;
                if (
                  confirm(
                    t("category.confirmClearTasks", {
                      name: displayName,
                      count,
                      defaultValue: `Supprimer les ${count} tâche(s) de « ${displayName} » ? Cette action est irréversible.`,
                    })
                  )
                ) {
                  clearCategoryTasks(category.id);
                }
              }}
              className="p-2 rounded-lg hover:bg-amber-500/20 text-amber-500 transition-colors"
              aria-label={t("category.clearTasks", { defaultValue: "Effacer toutes les tâches" })}
              title={t("category.clearTasks", { defaultValue: "Effacer toutes les tâches" })}
            >
              <Eraser className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                if (confirm(t("category.confirmDelete", { name: displayName }))) {
                  removeCategory(category.id);
                  window.history.back();
                }
              }}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
              aria-label={t("category.delete")}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold text-xl">{t("category.tasks")}</h2>
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none glass rounded-full px-3 py-1.5 shadow-glass">
            <CalendarClock className="h-3.5 w-3.5" />
            {t("category.dateTime")}
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
          requireDate={category.id === "rdv" || category.id === "events"}
          requireTime={category.id === "rdv"}
          enableAmount={FINANCE_CATEGORY_IDS.has(category.id)}
          amountSign={NEGATIVE_FINANCE_IDS.has(category.id) ? -1 : 1}
          lockSign={FORCED_SIGN_IDS.has(category.id)}
        />
      </section>
    </main>
  );
}
