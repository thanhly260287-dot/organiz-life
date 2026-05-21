import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Calendar, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/categories";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const reorderTasks = useStore((s) => s.reorderTasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 350, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 350, tolerance: 8 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = tasks.map((t) => t.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    reorderTasks(categoryId, arrayMove(ids, oldIdx, newIdx), subId);
  };

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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((t) => (
              <SortableTaskRow
                key={t.id}
                task={t}
                accent={accent}
                showPriority={showPriority}
                enableDateTime={enableDateTime}
                onToggle={() => toggleTask(categoryId, t.id, subId)}
                onRemove={() => removeTask(categoryId, t.id, subId)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>


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
            {enableDateTime && (
              <>
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
              </>
            )}
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
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      )}
    </div>
  );
}
