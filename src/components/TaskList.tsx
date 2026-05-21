import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Calendar, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/categories";

export function TaskList({
  categoryId,
  subId,
  tasks,
  accent,
  enableDateTime = true,
}: {
  categoryId: string;
  subId?: string;
  tasks: Task[];
  accent: string;
  enableDateTime?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<number | "">("");
  const showPriority = useStore((s) => s.showPriorityNumbers);
  const addTask = useStore((s) => s.addTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const removeTask = useStore((s) => s.removeTask);

  const submit = () => {
    if (!title.trim()) return;
    addTask(
      categoryId,
      { title: title.trim(), date: date || undefined, time: time || undefined, priority: priority || undefined },
      subId
    );
    setTitle("");
    setDate("");
    setTime("");
    setPriority("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {tasks.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="group flex items-center gap-3 rounded-xl glass shadow-glass p-3"
          >
            <button
              onClick={() => toggleTask(categoryId, t.id, subId)}
              className="shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: t.done ? accent : "var(--border)",
                background: t.done ? accent : "transparent",
              }}
              aria-label="Terminer"
            >
              {t.done && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {showPriority && t.priority && (
                  <span
                    className="shrink-0 inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded text-[10px] font-mono font-bold"
                    style={{ background: `${accent}33`, color: accent }}
                  >
                    {t.priority}
                  </span>
                )}
                <span className={`text-sm truncate ${t.done ? "line-through text-muted-foreground" : ""}`}>
                  {t.title}
                </span>
              </div>
              {((enableDateTime && (t.date || t.time)) || t.notes) && (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  {enableDateTime && t.date && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {t.date}
                    </span>
                  )}
                  {enableDateTime && t.time && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {t.time}
                    </span>
                  )}
                  {t.notes && <span className="truncate">{t.notes}</span>}
                </div>
              )}
            </div>
            <button
              onClick={() => removeTask(categoryId, t.id, subId)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {adding ? (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl glass shadow-glass p-3 space-y-2"
        >
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nouvelle tâche…"
            className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs bg-muted rounded-md px-2 py-1 outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="text-xs bg-muted rounded-md px-2 py-1 outline-none"
            />
            <input
              type="number"
              min={1}
              max={99}
              placeholder="Priorité"
              value={priority}
              onChange={(e) => setPriority(e.target.value ? Number(e.target.value) : "")}
              className="text-xs bg-muted rounded-md px-2 py-1 outline-none w-20"
            />
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setAdding(false)}
                className="text-xs px-3 py-1 rounded-md hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                className="text-xs px-3 py-1 rounded-md bg-gradient-brand text-white font-medium"
              >
                Ajouter
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground rounded-xl border-2 border-dashed py-3 transition-colors hover:border-foreground/30"
        >
          <Plus className="h-4 w-4" /> Ajouter une tâche
        </button>
      )}
    </div>
  );
}
