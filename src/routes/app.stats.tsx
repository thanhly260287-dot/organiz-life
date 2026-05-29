import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, CheckCircle2, Layers, PieChart as PieIcon, BarChart3, CalendarDays, LayoutGrid, LineChart as LineIcon, Download, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore, getCategoryProgress, MAIN_VISION_ID } from "@/lib/store";
import { NEGATIVE_FINANCE_IDS } from "@/lib/categories";

const FINANCE_SUMMARY_IDS = ["couts-et-gains", "couts", "costs", "income", "invest", "gains", "savings", "debts", "credits"] as const;
const fmtEUR = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
import { IconRender } from "@/components/IconRender";
import { useCategoryName } from "@/lib/useCategoryName";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, Legend } from "recharts";

export const Route = createFileRoute("/app/stats")({
  component: StatsPage,
});

type View = "overview" | "distribution" | "ranking" | "activity" | "evolution";

function StatsPage() {
  const { t } = useTranslation();
  const nameFor = useCategoryName();
  const allCategories = useStore((s) => s.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => c.id !== MAIN_VISION_ID),
    [allCategories]
  );
  const [view, setView] = useState<View>("overview");

  const exportEvolutionCSV = () => {
    const showCreated = evoStatus === "all" || evoStatus === "created";
    const showDone = evoStatus === "all" || evoStatus === "done";
    const showPct = evoStatus === "all";
    const headers = ["Date"];
    if (showCreated) headers.push("Créées", "Total créées");
    if (showDone) headers.push("Terminées", "Total terminées");
    if (showPct) headers.push("Taux %");
    const rows = filteredEvolution.map((d) => {
      const r: (string | number)[] = [d.label];
      if (showCreated) r.push(d.created, d.cumCreated);
      if (showDone) r.push(d.done, d.cumDone);
      if (showPct) r.push(d.pct);
      return r;
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evolution-${evoDays}j-${evoStatus}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEvolutionPDF = () => {
    const showCreated = evoStatus === "all" || evoStatus === "created";
    const showDone = evoStatus === "all" || evoStatus === "done";
    const showPct = evoStatus === "all";
    const headers: string[] = ["Date"];
    if (showCreated) headers.push("Créées", "Total créées");
    if (showDone) headers.push("Terminées", "Total terminées");
    if (showPct) headers.push("Taux %");
    const rowsHtml = filteredEvolution
      .map((d) => {
        const cells: (string | number)[] = [d.label];
        if (showCreated) cells.push(d.created, d.cumCreated);
        if (showDone) cells.push(d.done, d.cumDone);
        if (showPct) cells.push(d.pct + "%");
        return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
      })
      .join("");
    const title = `Évolution — ${evoDays} jours (${
      evoStatus === "all" ? "toutes" : evoStatus === "created" ? "créées" : "terminées"
    })`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px;color:#111}
  h1{font-size:18px;margin:0 0 16px}
  table{border-collapse:collapse;width:100%;font-size:12px}
  th,td{border:1px solid #ddd;padding:6px 8px;text-align:right}
  th:first-child,td:first-child{text-align:left}
  thead{background:#f3f4f6}
  tr:nth-child(even) td{background:#fafafa}
  @media print{body{padding:0}}
</style></head><body>
<h1>${title}</h1>
<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rowsHtml}</tbody></table>
<script>window.onload=()=>{setTimeout(()=>{window.print();},250);};</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };
  const [evoCats, setEvoCats] = useState<string[]>(["all"]);
  const evoAll = evoCats.includes("all");
  const [evoDays, setEvoDays] = useState<number>(30);
  const [evoStatus, setEvoStatus] = useState<"all" | "created" | "done">("all");
  // Per-row selection in the Bilan financier: undefined = included with natural sign,
  // +1 = forced added, -1 = forced subtracted, 0 = excluded. Click cycles through.
  const [financeSel, setFinanceSel] = useState<Record<string, 1 | -1 | 0>>({});


  const stats = useMemo(() => {
    let done = 0;
    let total = 0;
    categories.forEach((c) => {
      const p = getCategoryProgress(c);
      done += p.done;
      total += p.total;
    });
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [categories]);

  const ranked = useMemo(
    () =>
      categories
        .map((c) => ({ c, p: getCategoryProgress(c) }))
        .sort((a, b) => b.p.pct - a.p.pct),
    [categories]
  );

  const distribution = useMemo(
    () =>
      categories
        .map((c) => {
          const p = getCategoryProgress(c);
          return { id: c.id, name: nameFor(c.id, c.name), value: p.total, done: p.done, color: c.color };
        })
        .filter((d) => d.value > 0),
    [categories, nameFor]
  );

  const activity = useMemo(() => {
    const days: { label: string; date: string; done: number; created: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" }),
        date: key,
        done: 0,
        created: 0,
      });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    categories.forEach((c) => {
      const all = [...c.tasks, ...c.subcategories.flatMap((s) => s.tasks)];
      all.forEach((t) => {
        if (t.createdAt) {
          const k = new Date(t.createdAt).toISOString().slice(0, 10);
          const e = map.get(k);
          if (e) e.created++;
        }
        if (t.done && t.date) {
          const e = map.get(t.date);
          if (e) e.done++;
        }
      });
    });
    return days;
  }, [categories]);

  // Précalcule, une seule fois par changement de catégories, les dates (YYYY-MM-DD)
  // de création et de complétion par catégorie. Évite de re-parcourir toutes les
  // tâches et de réallouer/reparser les dates à chaque changement de filtre.
  const taskDatesByCategory = useMemo(() => {
    const result = new Map<string, { created: string[]; done: (string | null)[] }>();
    const toKey = (v: string | number | Date) => {
      const d = new Date(v);
      // toISOString peut être coûteux ; construit la clé manuellement (UTC)
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    categories.forEach((c) => {
      const created: string[] = [];
      const done: (string | null)[] = [];
      const collect = (tasks: typeof c.tasks) => {
        for (const t of tasks) {
          if (t.createdAt) created.push(toKey(t.createdAt));
          if (t.done) {
            if (t.date) done.push(t.date);
            else if (t.createdAt) done.push(toKey(t.createdAt));
            else done.push(null);
          }
        }
      };
      collect(c.tasks);
      for (const s of c.subcategories) collect(s.tasks);
      result.set(c.id, { created, done });
    });
    return result;
  }, [categories]);

  const evolution = useMemo(() => {
    const DAYS = evoDays;
    const today = new Date();
    const days: { label: string; date: string; created: number; done: number; cumCreated: number; cumDone: number; pct: number }[] = new Array(DAYS);
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (DAYS - 1 - i));
      days[i] = {
        label: d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" }),
        date: d.toISOString().slice(0, 10),
        created: 0,
        done: 0,
        cumCreated: 0,
        cumDone: 0,
        pct: 0,
      };
    }
    const firstDay = days[0].date;
    // Index direct par date pour éviter une Map
    const indexByDate: Record<string, number> = {};
    for (let i = 0; i < DAYS; i++) indexByDate[days[i].date] = i;
    let baseCreated = 0;
    let baseDone = 0;
    const ids = evoAll ? null : new Set(evoCats);
    taskDatesByCategory.forEach((buckets, catId) => {
      if (ids !== null && !ids.has(catId)) return;
      const { created, done } = buckets;
      for (let i = 0; i < created.length; i++) {
        const k = created[i];
        if (k < firstDay) baseCreated++;
        else {
          const idx = indexByDate[k];
          if (idx !== undefined) days[idx].created++;
        }
      }
      for (let i = 0; i < done.length; i++) {
        const k = done[i];
        if (k === null) { baseDone++; continue; }
        if (k < firstDay) baseDone++;
        else {
          const idx = indexByDate[k];
          if (idx !== undefined) days[idx].done++;
        }
      }
    });
    let cc = baseCreated;
    let cd = baseDone;
    for (let i = 0; i < DAYS; i++) {
      const d = days[i];
      cc += d.created;
      cd += d.done;
      d.cumCreated = cc;
      d.cumDone = cd;
      d.pct = cc === 0 ? 0 : Math.round((cd / cc) * 100);
    }
    return days;
  }, [taskDatesByCategory, evoCats, evoDays]);

  // Données filtrées selon le statut pour l'affichage
  const filteredEvolution = useMemo(() => {
    if (evoStatus === "all") return evolution;
    return evolution.map((d) => ({
      ...d,
      cumCreated: evoStatus === "created" ? d.cumCreated : 0,
      cumDone: evoStatus === "done" ? d.cumDone : 0,
      created: evoStatus === "created" ? d.created : 0,
      pct: 0,
    }));
  }, [evolution, evoStatus]);



  const finance = useMemo(() => {
    const rows = FINANCE_SUMMARY_IDS.map((id) => {
      const c = categories.find((cat) => cat.id === id);
      if (!c) return null;
      const all = [...c.tasks, ...c.subcategories.flatMap((s) => s.tasks)];
      const defaultSign: 1 | -1 = NEGATIVE_FINANCE_IDS.has(id) ? -1 : 1;
      let total = 0;
      let pos = 0;
      let neg = 0;
      let countPos = 0;
      let countNeg = 0;
      all.forEach((t) => {
        if (t.amount == null) return;
        let v: number;
        if (id === "credits") {
          // Créance tracée (done) → soustraite du total négatif (contribution = 0)
          if (t.done) return;
          v = -t.amount;
        } else {
          const sign = (t.amountSign ?? defaultSign) as number;
          v = t.amount * sign;
        }
        total += v;
        if (v >= 0) {
          pos += v;
          countPos++;
        } else {
          neg += v;
          countNeg++;
        }
      });
      return { id, name: nameFor(c.id, c.name), color: c.color, icon: c.icon, total, pos, neg, countPos, countNeg, count: countPos + countNeg };
    }).filter(Boolean) as {
      id: string; name: string; color: string; icon: string;
      total: number; pos: number; neg: number; countPos: number; countNeg: number; count: number;
    }[];
    const grand = rows.reduce((s, r) => s + r.total, 0);
    const totalPos = rows.reduce((s, r) => s + r.pos, 0);
    const totalNeg = rows.reduce((s, r) => s + r.neg, 0);
    const selectedTotal = rows.reduce((s, r) => {
      const mode = financeSel[r.id];
      if (mode === 0) return s;
      if (mode === 1) return s + Math.abs(r.total);
      if (mode === -1) return s - Math.abs(r.total);
      return s + r.total;
    }, 0);
    return { rows, grand, totalPos, totalNeg, selectedTotal };
  }, [categories, nameFor, financeSel]);

  const cycleFinanceSel = (id: string) =>
    setFinanceSel((prev) => {
      const cur = prev[id];
      const next: 1 | -1 | 0 | undefined =
        cur === undefined ? 1 : cur === 1 ? -1 : cur === -1 ? 0 : undefined;
      const copy = { ...prev };
      if (next === undefined) delete copy[id];
      else copy[id] = next;
      return copy;
    });


  const views: { id: View; label: string; icon: any }[] = [
    { id: "overview", label: t("stats.viewOverview", "Vue d'ensemble"), icon: LayoutGrid },
    { id: "distribution", label: t("stats.viewDistribution", "Répartition"), icon: PieIcon },
    { id: "ranking", label: t("stats.viewRanking", "Classement"), icon: BarChart3 },
    { id: "activity", label: t("stats.viewActivity", "Activité"), icon: CalendarDays },
    { id: "evolution", label: t("stats.viewEvolution", "Évolution"), icon: LineIcon },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("stats.backCategories")}
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl shadow-elevated p-6 sm:p-8"
      >
        <h1 className="font-display font-bold text-3xl sm:text-4xl">
          <span className="text-gradient">{t("stats.title")}</span> {t("stats.andProgress")}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">{t("stats.subtitle")}</p>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> {t("stats.lifeProgress")}
            </div>
            <div className="mt-1 text-3xl font-display font-bold text-gradient">{stats.pct}%</div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-brand"
              />
            </div>
          </div>
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t("stats.tasksDone")}
            </div>
            <div className="mt-1 text-3xl font-display font-bold">
              {stats.done}
              <span className="text-base text-muted-foreground font-normal"> / {stats.total}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" /> {t("stats.activeCategories")}
            </div>
            <div className="mt-1 text-3xl font-display font-bold">{categories.length}</div>
          </div>
        </div>
      </motion.section>

      {/* View switcher */}
      <div className="flex flex-wrap gap-2">
        {views.map((v) => {
          const Icon = v.icon;
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all ${
                active
                  ? "bg-gradient-brand text-white shadow-elevated"
                  : "glass hover:shadow-elevated text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === "overview" && (
            <section className="space-y-6">
              {finance.rows.length > 0 && (
                <div className="glass rounded-3xl shadow-elevated p-6 sm:p-8">
                  <h2 className="font-display font-semibold text-xl">
                    {t("stats.globalBalance", "Vue globale financière")}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {t("stats.globalBalanceHint", "Agrégation de toutes tes catégories financières.")}
                  </p>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t("stats.totalPos", "Total positif")}
                      </div>
                      <div className="text-lg sm:text-xl font-display font-bold tabular-nums text-green-500">
                        {fmtEUR(finance.totalPos)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t("stats.totalNeg", "Total négatif")}
                      </div>
                      <div className="text-lg sm:text-xl font-display font-bold tabular-nums text-red-500">
                        {fmtEUR(finance.totalNeg)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-card/50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t("stats.netBalance", "Solde net")}
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-display font-bold tabular-nums ${
                          finance.grand < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {fmtEUR(finance.grand)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-card/50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {t("stats.ratio", "Ratio +/−")}
                      </div>
                      <div className="text-lg sm:text-xl font-display font-bold tabular-nums">
                        {finance.totalNeg === 0
                          ? "∞"
                          : (finance.totalPos / Math.abs(finance.totalNeg)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {(finance.totalPos > 0 || finance.totalNeg < 0) && (
                    <div className="mt-4">
                      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                        {(() => {
                          const denom = finance.totalPos + Math.abs(finance.totalNeg);
                          if (denom === 0) return null;
                          const posPct = (finance.totalPos / denom) * 100;
                          return (
                            <>
                              <div className="h-full bg-green-500" style={{ width: `${posPct}%` }} />
                              <div className="h-full bg-red-500" style={{ width: `${100 - posPct}%` }} />
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>+ {fmtEUR(finance.totalPos)}</span>
                        <span>{fmtEUR(finance.totalNeg)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {finance.rows.length > 0 && (
                <div className="glass rounded-3xl shadow-elevated p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="font-display font-semibold text-xl">
                        {t("stats.financeTitle", "Bilan financier")}
                      </h2>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t(
                          "stats.financeClickHint",
                          "Clique sur une catégorie pour cycler : + (addition) → − (soustraction) → exclure → naturel."
                        )}
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {t("stats.financeSelected", "Total sélectionné")}
                        </div>
                        <div
                          className={`text-2xl sm:text-3xl font-display font-bold tabular-nums ${
                            finance.selectedTotal < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {fmtEUR(finance.selectedTotal)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {t("stats.financeGrand", "Total global")}
                        </div>
                        <div
                          className={`text-xl sm:text-2xl font-display font-bold tabular-nums opacity-80 ${
                            finance.grand < 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {fmtEUR(finance.grand)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {finance.rows.map((r) => {
                      const mode = financeSel[r.id];
                      const ring =
                        mode === 1
                          ? "ring-2 ring-green-500"
                          : mode === -1
                            ? "ring-2 ring-red-500"
                            : mode === 0
                              ? "opacity-50 ring-1 ring-border"
                              : "";
                      const badge =
                        mode === 1
                          ? { txt: "+", cls: "bg-green-500 text-white" }
                          : mode === -1
                            ? { txt: "−", cls: "bg-red-500 text-white" }
                            : mode === 0
                              ? { txt: "∅", cls: "bg-muted text-muted-foreground" }
                              : { txt: "=", cls: "bg-card text-muted-foreground border border-border" };
                      const denom = r.pos + Math.abs(r.neg);
                      const posPct = denom === 0 ? 0 : (r.pos / denom) * 100;
                      return (
                        <div
                          key={r.id}
                          className={`rounded-2xl bg-card/50 p-4 flex flex-col gap-3 transition-all ${ring}`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => cycleFinanceSel(r.id)}
                              className="flex-1 flex items-center gap-3 text-left hover:opacity-90"
                              aria-label="toggle inclusion in selected total"
                            >
                              <div
                                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}aa)` }}
                              >
                                <IconRender name={r.icon} className="h-5 w-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-display font-semibold truncate">{r.name}</span>
                                  <span
                                    className={`shrink-0 inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[11px] font-bold ${badge.cls}`}
                                  >
                                    {badge.txt}
                                  </span>
                                </div>
                                <div
                                  className={`text-base font-bold tabular-nums ${
                                    r.total < 0 ? "text-red-500" : "text-green-500"
                                  }`}
                                >
                                  {fmtEUR(r.total)}
                                </div>
                              </div>
                            </button>
                            <Link
                              to="/app/category/$id"
                              params={{ id: r.id }}
                              className="shrink-0 text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                            >
                              {t("stats.open", "Ouvrir")}
                            </Link>
                          </div>
                          {denom > 0 && (
                            <div className="space-y-1">
                              <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
                                <div className="h-full bg-green-500" style={{ width: `${posPct}%` }} />
                                <div className="h-full bg-red-500" style={{ width: `${100 - posPct}%` }} />
                              </div>
                              <div className="flex justify-between text-[10px] tabular-nums">
                                <span className="text-green-500">
                                  +{fmtEUR(r.pos)} <span className="text-muted-foreground">({r.countPos})</span>
                                </span>
                                <span className="text-red-500">
                                  {fmtEUR(r.neg)} <span className="text-muted-foreground">({r.countNeg})</span>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {t(
                      "stats.creditsHint",
                      "Créances : comptées en négatif tant qu'elles ne sont pas réglées, en positif une fois cochées."
                    )}
                  </p>
                </div>
              )}


              <h2 className="font-display font-semibold text-xl">{t("stats.byCategory")}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {ranked.map(({ c, p }) => (
                  <Link
                    key={c.id}
                    to="/app/category/$id"
                    params={{ id: c.id }}
                    className="glass rounded-2xl shadow-glass p-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)` }}
                      >
                        <IconRender name={c.icon} className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display font-semibold text-sm truncate">
                            {nameFor(c.id, c.name)}
                          </h3>
                          <span className="text-xs font-mono tabular-nums text-muted-foreground">
                            {p.done}/{p.total} · {p.pct}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${p.pct}%`,
                              background: `linear-gradient(90deg, ${c.color}, var(--brand-violet))`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {view === "distribution" && (
            <section className="glass rounded-3xl shadow-elevated p-6 sm:p-8">
              <h2 className="font-display font-semibold text-xl mb-4">
                {t("stats.viewDistribution", "Répartition")} —{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  {t("stats.distributionHint", "tâches par catégorie")}
                </span>
              </h2>
              {distribution.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  {t("stats.empty", "Aucune donnée pour le moment.")}
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {distribution.map((d) => (
                            <Cell key={d.id} fill={d.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-auto pr-2">
                    {distribution
                      .slice()
                      .sort((a, b) => b.value - a.value)
                      .map((d) => (
                        <div key={d.id} className="flex items-center gap-3 text-sm">
                          <span
                            className="h-3 w-3 rounded-sm shrink-0"
                            style={{ background: d.color }}
                          />
                          <span className="flex-1 truncate">{d.name}</span>
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {d.done}/{d.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {view === "ranking" && (
            <section className="glass rounded-3xl shadow-elevated p-6 sm:p-8">
              <h2 className="font-display font-semibold text-xl mb-4">
                {t("stats.viewRanking", "Classement")} —{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  {t("stats.rankingHint", "% de progression")}
                </span>
              </h2>
              {ranked.length === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">
                  {t("stats.empty", "Aucune donnée pour le moment.")}
                </p>
              ) : (
                <div style={{ height: Math.max(240, ranked.length * 32) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ranked.map(({ c, p }) => ({
                        name: nameFor(c.id, c.name),
                        pct: p.pct,
                        color: c.color,
                      }))}
                      layout="vertical"
                      margin={{ left: 10, right: 24, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                        }}
                        formatter={(v: any) => [`${v}%`, t("stats.lifeProgress")]}
                      />
                      <Bar dataKey="pct" radius={[0, 8, 8, 0]}>
                        {ranked.map(({ c }) => (
                          <Cell key={c.id} fill={c.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          )}

          {view === "activity" && (
            <section className="glass rounded-3xl shadow-elevated p-6 sm:p-8">
              <h2 className="font-display font-semibold text-xl mb-4">
                {t("stats.viewActivity", "Activité")} —{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  {t("stats.activityHint", "14 derniers jours")}
                </span>
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                    />
                    <Bar dataKey="created" name={t("stats.created", "Créées")} fill="var(--brand-blue, #56CCF2)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="done" name={t("stats.done", "Terminées")} fill="var(--brand-violet, #9B51E0)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-3 rounded-sm" style={{ background: "#56CCF2" }} />
                  {t("stats.created", "Créées")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-3 rounded-sm" style={{ background: "#9B51E0" }} />
                  {t("stats.done", "Terminées")}
                </span>
              </div>
            </section>
          )}

          {view === "evolution" && (
            <section className="glass rounded-3xl shadow-elevated p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display font-semibold text-xl">
                  {t("stats.viewEvolution", "Évolution")} —{" "}
                  <span className="text-muted-foreground text-sm font-normal">
                    {t("stats.evolutionHint", "progression cumulée sur")} {evoDays} {t("stats.days", "jours")}
                  </span>
                </h2>
                <div className="flex flex-col gap-2">
                  {/* Sélecteur de période */}
                  <div className="flex gap-1">
                    {[7, 30, 90].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEvoDays(n)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all border ${
                          evoDays === n
                            ? "bg-gradient-brand text-white border-transparent shadow-sm"
                            : "bg-card/60 border-border hover:bg-card text-foreground"
                        }`}
                      >
                        {n}j
                      </button>
                    ))}
                  </div>
                  {/* Filtre statut */}
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: t("stats.filterAll", "Toutes") },
                      { key: "created", label: t("stats.filterCreated", "Créées") },
                      { key: "done", label: t("stats.filterDone", "Terminées") },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setEvoStatus(opt.key as "all" | "created" | "done")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all border ${
                          evoStatus === opt.key
                            ? "bg-gradient-brand text-white border-transparent shadow-sm"
                            : "bg-card/60 border-border hover:bg-card text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Filtre catégories */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEvoCats(["all"])}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all border ${
                        evoAll
                          ? "bg-gradient-brand text-white border-transparent shadow-sm"
                          : "bg-card/60 border-border hover:bg-card text-foreground"
                      }`}
                    >
                      {t("stats.allCategories", "Toutes les catégories")}
                    </button>
                    {categories.map((c) => {
                      const active = !evoAll && evoCats.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setEvoCats((prev) => {
                              const next = prev.filter((x) => x !== "all");
                              if (next.includes(c.id)) {
                                const filtered = next.filter((x) => x !== c.id);
                                return filtered.length === 0 ? ["all"] : filtered;
                              }
                              return [...next, c.id];
                            })
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all border ${
                            active
                              ? "bg-gradient-brand text-white border-transparent shadow-sm"
                              : "bg-card/60 border-border hover:bg-card text-foreground"
                          }`}
                        >
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ background: c.color }}
                          />
                          {nameFor(c.id, c.name)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredEvolution} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="evoCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#56CCF2" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#56CCF2" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="evoDone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9B51E0" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#9B51E0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    {(evoStatus === "all" || evoStatus === "created") && (
                      <Area
                        type="monotone"
                        dataKey="cumCreated"
                        name={t("stats.cumCreated", "Total créées")}
                        stroke="#56CCF2"
                        strokeWidth={2}
                        fill="url(#evoCreated)"
                      />
                    )}
                    {(evoStatus === "all" || evoStatus === "done") && (
                      <Area
                        type="monotone"
                        dataKey="cumDone"
                        name={t("stats.cumDone", "Total terminées")}
                        stroke="#9B51E0"
                        strokeWidth={2}
                        fill="url(#evoDone)"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {evoStatus === "all" && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    {t("stats.evolutionPct", "Taux de complétion (%)")}
                  </h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredEvolution} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                        <defs>
                          <linearGradient id="evoPct" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                          }}
                          formatter={(v: any) => [`${v}%`, t("stats.lifeProgress")]}
                        />
                        <Area
                          type="monotone"
                          dataKey="pct"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#evoPct)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Tableau récapitulatif */}
              <div className="glass rounded-2xl shadow-glass overflow-hidden">
                <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                  <h3 className="text-sm font-semibold">
                    {t("stats.evolutionTableTitle", "Récapitulatif quotidien")}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-card/50 text-muted-foreground text-xs uppercase tracking-wide">
                        <th className="px-3 py-2 text-left font-medium sticky left-0 bg-card/50 backdrop-blur-sm z-10">
                          {t("stats.date", "Date")}
                        </th>
                        {(evoStatus === "all" || evoStatus === "created") && (
                          <th className="px-3 py-2 text-right font-medium">{t("stats.created", "Créées")}</th>
                        )}
                        {(evoStatus === "all" || evoStatus === "done") && (
                          <th className="px-3 py-2 text-right font-medium">{t("stats.done", "Terminées")}</th>
                        )}
                        {(evoStatus === "all" || evoStatus === "created") && (
                          <th className="px-3 py-2 text-right font-medium">{t("stats.cumCreated", "Total créées")}</th>
                        )}
                        {(evoStatus === "all" || evoStatus === "done") && (
                          <th className="px-3 py-2 text-right font-medium">{t("stats.cumDone", "Total terminées")}</th>
                        )}
                        {evoStatus === "all" && (
                          <th className="px-3 py-2 text-right font-medium">{t("stats.evolutionPctShort", "Taux %")}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvolution.map((d, i) => {
                        const isLast = i === filteredEvolution.length - 1;
                        return (
                          <tr
                            key={d.date}
                            className={`border-b border-border/30 transition-colors hover:bg-primary/5 ${
                              isLast ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-3 py-2 font-medium sticky left-0 bg-background/80 backdrop-blur-sm z-10">
                              {d.label}
                            </td>
                            {(evoStatus === "all" || evoStatus === "created") && (
                              <td className="px-3 py-2 text-right tabular-nums">
                                {d.created > 0 ? (
                                  <span className="text-[#56CCF2] font-medium">+{d.created}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )}
                            {(evoStatus === "all" || evoStatus === "done") && (
                              <td className="px-3 py-2 text-right tabular-nums">
                                {d.done > 0 ? (
                                  <span className="text-[#9B51E0] font-medium">+{d.done}</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                            )}
                            {(evoStatus === "all" || evoStatus === "created") && (
                              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                                {d.cumCreated}
                              </td>
                            )}
                            {(evoStatus === "all" || evoStatus === "done") && (
                              <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                                {d.cumDone}
                              </td>
                            )}
                            {evoStatus === "all" && (
                              <td className="px-3 py-2 text-right tabular-nums">
                                <span
                                  className={`inline-flex items-center justify-end font-medium ${
                                    d.pct >= 80
                                      ? "text-green-500"
                                      : d.pct >= 50
                                        ? "text-yellow-500"
                                        : d.pct > 0
                                          ? "text-orange-400"
                                          : "text-muted-foreground"
                                  }`}
                                >
                                  {d.pct}%
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
