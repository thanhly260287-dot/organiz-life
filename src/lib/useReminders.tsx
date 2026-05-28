import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStore } from "./store";
import type { Task } from "./categories";

export const REMINDER_OPTIONS = [15, 30, 60, 1440] as const;

export function reminderLabel(m: number) {
  if (m >= 60) return `${m / 60}h`;
  return `${m} min`;
}

function taskDueAt(t: Task): number | null {
  if (!t.date || !t.time) return null;
  const d = new Date(`${t.date}T${t.time}`);
  const ts = d.getTime();
  return Number.isFinite(ts) ? ts : null;
}

export function useReminders() {
  const categories = useStore((s) => s.categories);
  const updateTask = useStore((s) => s.updateTask);
  const toggleTask = useStore((s) => s.toggleTask);
  const firedRef = useRef<Set<string>>(new Set());

  // Request notification permission once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const c of categories) {
        const buckets: Array<{ subId?: string; tasks: Task[] }> = [
          { tasks: c.tasks },
          ...c.subcategories.map((sc) => ({ subId: sc.id, tasks: sc.tasks })),
        ];
        for (const b of buckets) {
          for (const t of b.tasks) {
            if (t.done || !t.reminders?.length) continue;
            const due = taskDueAt(t);
            if (due == null) continue;
            for (const m of t.reminders) {
              const fireAt = due - m * 60_000;
              const key = `${t.id}:${m}`;
              if (firedRef.current.has(key)) continue;
              if (t.notifiedAt?.[String(m)]) {
                firedRef.current.add(key);
                continue;
              }
              if (now >= fireAt && now - fireAt < 24 * 3600_000) {
                firedRef.current.add(key);
                updateTask(
                  c.id,
                  t.id,
                  { notifiedAt: { ...(t.notifiedAt ?? {}), [String(m)]: now } },
                  b.subId
                );
                const body = `Dans ${reminderLabel(m)} · ${t.time}`;
                toast(t.title, {
                  description: body,
                  duration: 30000,
                  action: {
                    label: "C'est fait",
                    onClick: () => toggleTask(c.id, t.id, b.subId),
                  },
                });
                if (
                  typeof window !== "undefined" &&
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  try {
                    const n = new Notification(t.title, { body, tag: key });
                    n.onclick = () => {
                      toggleTask(c.id, t.id, b.subId);
                      n.close();
                      window.focus();
                    };
                  } catch {}
                }
              }
            }
          }
        }
      }
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [categories, updateTask, toggleTask]);
}

export function RemindersRunner() {
  useReminders();
  return null;
}
