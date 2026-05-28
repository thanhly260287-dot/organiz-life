import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCategoryProgress, useStore } from "@/lib/store";
import type { Category } from "@/lib/categories";
import { IconRender } from "./IconRender";
import { useCategoryName } from "@/lib/useCategoryName";

export function CategoryCard({ category, index }: { category: Category; index: number }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const showPriority = useStore((s) => s.showCategoryPriority);
  const removeCategory = useStore((s) => s.removeCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const progress = getCategoryProgress(category);
  const nameFor = useCategoryName();
  const displayName = nameFor(category.id, category.name);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);

  const handleDelete = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(t("dashboard.confirmDeleteCategory", { name: displayName }))) {
      removeCategory(category.id);
    }
  };

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditName(displayName);
    setEditing(true);
  };

  const submitEdit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== displayName) {
      updateCategory(category.id, { name: trimmed });
    }
    setEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "manipulation" as const,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative group/card"
    >
      <Link
        to="/app/category/$id"
        params={{ id: category.id }}
        className="group relative block overflow-hidden rounded-2xl glass shadow-glass p-5 transition-all hover:shadow-elevated hover:-translate-y-1 select-none"
        draggable={false}
        {...attributes}
        {...listeners}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${category.color}22, transparent 60%)`,
          }}
        />
        <div className="relative flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-glow"
            style={{
              background: `linear-gradient(135deg, ${category.color}, ${category.color}aa)`,
            }}
          >
            <IconRender name={category.icon} className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {showPriority && (
                <span className="text-xs font-mono text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <h3 className="font-display font-semibold text-base truncate">{displayName}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("tasks.taskCount", { done: progress.done, total: progress.total })}
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress.pct}%`,
                  background: `linear-gradient(90deg, ${category.color}, var(--brand-violet))`,
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0 -mr-1 -my-1">
            <span
              aria-hidden
              className="p-1.5 rounded-md text-muted-foreground/60"
              title={t("dashboard.dragHint")}
            >
              <GripVertical className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        aria-label={t("dashboard.deleteCategoryAria", { name: displayName })}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-background/80 backdrop-blur text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
