import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check, Trash2, Calendar, Clock, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/lib/store";
import { REMINDER_OPTIONS, reminderLabel } from "@/lib/useReminders";
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
  requireDate = false,
  requireTime = false,
  enableAmount = false,
  amountSign = 1,
}: {
  categoryId: string;
  subId?: string;
  tasks: Task[];
  accent: string;
  enableDateTime?: boolean;
  requireDate?: boolean;
  requireTime?: boolean;
  enableAmount?: boolean;
  amountSign?: 1 | -1;
}) {
  const { t: tr } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [reminders, setReminders] = useState<number[]>([]);

  const showPriority = useStore((s) => s.taskPriorityCategories.includes(categoryId));
  const toggleTaskPriorityFor = useStore((s) => s.toggleTaskPriorityFor);
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

  const canSubmit =
    !!title.trim() && (!enableDateTime || ((!requireDate || !!date) && (!requireTime || !!time)));

  const submit = () => {
    if (!canSubmit) return;
    const amt = amount ? Math.abs(parseFloat(amount)) : undefined;
    addTask(
      categoryId,
      {
        title: title.trim(),
        date: date || undefined,
        time: time || undefined,
        amount: amt,
        reminders: enableDateTime && time && reminders.length ? [...reminders].sort((a, b) => a - b) : undefined,
      },
      subId
    );
    setTitle("");
    setDate("");
    setTime("");
    setAmount("");
    setReminders([]);
    setAdding(false);
  };




  const total = enableAmount
    ? tasks.reduce((sum, t) => sum + (t.amount ?? 0), 0) * amountSign
    : 0;

  return (
    <div className="space-y-2">
      {tasks.length > 0 && (
        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPriority}
            onChange={() => toggleTaskPriorityFor(categoryId)}
            className="accent-primary"
          />
          {tr("tasks.showPriority")}
        </label>
      )}
      {enableAmount && tasks.some((t) => t.amount != null) && (
        <div className="glass rounded-xl shadow-glass px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{tr("tasks.total")}</span>
          <span
            className={`text-base font-display font-bold ${total < 0 ? "text-destructive" : ""}`}
            style={{ color: total >= 0 ? accent : undefined }}
          >
            {total.toLocaleString(tr("common.year") ? "fr-FR" : "fr-FR", { style: "currency", currency: "EUR" })}
          </span>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((t, i) => (
              <SortableTaskRow
                key={t.id}
                task={t}
                index={i}
                accent={accent}
                showPriority={showPriority}
                enableDateTime={enableDateTime}
                enableAmount={enableAmount}
                amountSign={amountSign}
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
            placeholder={tr("tasks.newTask")}
            className="w-full bg-transparent outline-none text-lg placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap gap-2">
            {enableDateTime && (
              <>
                <div className="flex flex-col">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`text-xs bg-muted rounded-md px-2 py-1 outline-none ${requireDate && !date ? "ring-1 ring-destructive" : ""}`}
                  />
                  {requireDate && <span className="text-[10px] text-muted-foreground mt-0.5">{tr("tasks.dateRequired")}</span>}
                </div>
                <div className="flex flex-col">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`text-xs bg-muted rounded-md px-2 py-1 outline-none ${requireTime && !time ? "ring-1 ring-destructive" : ""}`}
                  />
                  {requireTime ? (
                    <span className="text-[10px] text-muted-foreground mt-0.5">{tr("tasks.timeRequired")}</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground mt-0.5">{tr("tasks.timeOptional")}</span>
                  )}
                </div>
              </>
            )}
            {enableAmount && (
              <input
                type="number"
                step="0.01"
                min={0}
                placeholder={amountSign < 0 ? tr("tasks.amountNeg") : tr("tasks.amount")}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-xs bg-muted rounded-md px-2 py-1 outline-none w-28"
              />
            )}
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setAdding(false)}
                className="text-xs px-3 py-1 rounded-md hover:bg-muted"
              >
                {tr("tasks.cancel")}
              </button>
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="text-xs px-3 py-1 rounded-md bg-gradient-brand text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {tr("tasks.add")}
              </button>
            </div>
          </div>
          {enableDateTime && time && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Bell className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mr-1">Rappel :</span>
              {REMINDER_OPTIONS.map((m) => {
                const active = reminders.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setReminders((r) => (r.includes(m) ? r.filter((x) => x !== m) : [...r, m]))
                    }
                    className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {reminderLabel(m)} avant
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 text-base text-muted-foreground hover:text-foreground rounded-xl border-2 border-dashed py-3 transition-colors hover:border-foreground/30"
        >
          <Plus className="h-5 w-5" /> {tr("tasks.add")}
        </button>
      )}
    </div>
  );
}

function SortableTaskRow({
  task: t,
  index,
  accent,
  showPriority,
  enableDateTime,
  enableAmount,
  amountSign,
  onToggle,
  onRemove,
}: {
  task: Task;
  index: number;
  accent: string;
  showPriority: boolean;
  enableDateTime: boolean;
  enableAmount: boolean;
  amountSign: 1 | -1;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { t: tr } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
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
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="group flex items-center gap-3 rounded-xl glass shadow-glass p-3 select-none"
      {...attributes}
      {...listeners}
    >
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onToggle}
        className="shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: t.done ? accent : "var(--border)",
          background: t.done ? accent : "transparent",
        }}
        aria-label={tr("tasks.complete")}
      >
        {t.done && <Check className="h-3.5 w-3.5 text-white" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {showPriority && (
            <span
              className="shrink-0 inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded text-[10px] font-mono font-bold tabular-nums"
              style={{ background: `${accent}33`, color: accent }}
            >
              {index + 1}
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
      {enableAmount && t.amount != null && (
        <span
          className={`shrink-0 text-sm font-display font-semibold tabular-nums ${amountSign < 0 ? "text-destructive" : ""}`}
          style={{ color: amountSign > 0 ? accent : undefined }}
        >
          {(t.amount * amountSign).toLocaleString(tr("common.year") ? "fr-FR" : "fr-FR", { style: "currency", currency: "EUR" })}
        </span>
      )}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-all"
        aria-label={tr("tasks.delete")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
