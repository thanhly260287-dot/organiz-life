import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCategoryProgress, useStore } from "@/lib/store";
import type { Category } from "@/lib/categories";
import { IconRender } from "./IconRender";


export function CategoryCard({ category, index }: { category: Category; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });
  const showPriority = useStore((s) => s.showPriorityNumbers);
  const progress = getCategoryProgress(category);

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
      {...attributes}
      {...listeners}
    >
      <Link
        to="/app/category/$id"
        params={{ id: category.id }}
        className="group relative block overflow-hidden rounded-2xl glass shadow-glass p-5 transition-all hover:shadow-elevated hover:-translate-y-1 select-none"
        draggable={false}
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
              <h3 className="font-display font-semibold text-base truncate">{category.name}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {progress.done} / {progress.total} tâches
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
        </div>
      </Link>
    </motion.div>
  );
}
