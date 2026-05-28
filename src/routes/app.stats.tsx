import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, CheckCircle2, Layers, PieChart as PieIcon, BarChart3, CalendarDays, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore, getCategoryProgress, MAIN_VISION_ID } from "@/lib/store";
import { NEGATIVE_FINANCE_IDS } from "@/lib/categories";

const FINANCE_SUMMARY_IDS = ["couts-et-gains", "gains", "costs", "income", "invest", "savings", "debts", "credits"] as const;
const fmtEUR = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
import { IconRender } from "@/components/IconRender";
import { useCategoryName } from "@/lib/useCategoryName";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/app/stats")({
  component: StatsPage,
});

type View = "overview" | "distribution" | "ranking" | "activity";

function StatsPage() {
  const { t } = useTranslation();
  const nameFor = useCategoryName();
  const categories = useStore((s) => s.categories.filter((c) => c.id !== MAIN_VISION_ID));
  const [view, setView] = useState<View>("overview");
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

  const finance = useMemo(() => {
    const rows = FINANCE_SUMMARY_IDS.map((id) => {
      const c = categories.find((cat) => cat.id === id);
      if (!c) return null;
      const all = [...c.tasks, ...c.subcategories.flatMap((s) => s.tasks)];
      const defaultSign: 1 | -1 = NEGATIVE_FINANCE_IDS.has(id) ? -1 : 1;
      const total = all.reduce((sum, t) => {
        if (t.amount == null) return sum;
        // Credits (créances): négatif tant que non réglé, positif quand réglé
        const sign: number =
          id === "credits" ? (t.done ? 1 : -1) : ((t.amountSign ?? defaultSign) as number);
        return sum + t.amount * sign;
      }, 0);
      return { id, name: nameFor(c.id, c.name), color: c.color, icon: c.icon, total };
    }).filter(Boolean) as { id: string; name: string; color: string; icon: string; total: number }[];
    const grand = rows.reduce((s, r) => s + r.total, 0);
    return { rows, grand };
  }, [categories, nameFor]);

  const views: { id: View; label: string; icon: any }[] = [
    { id: "overview", label: t("stats.viewOverview", "Vue d'ensemble"), icon: LayoutGrid },
    { id: "distribution", label: t("stats.viewDistribution", "Répartition"), icon: PieIcon },
    { id: "ranking", label: t("stats.viewRanking", "Classement"), icon: BarChart3 },
    { id: "activity", label: t("stats.viewActivity", "Activité"), icon: CalendarDays },
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
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="font-display font-semibold text-xl">
                      {t("stats.financeTitle", "Bilan financier")}
                    </h2>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t("stats.financeGrand", "Total global")}
                      </div>
                      <div
                        className={`text-2xl sm:text-3xl font-display font-bold tabular-nums ${
                          finance.grand < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {fmtEUR(finance.grand)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {finance.rows.map((r) => (
                      <Link
                        key={r.id}
                        to="/app/category/$id"
                        params={{ id: r.id }}
                        className="rounded-2xl bg-card/50 p-4 hover:shadow-elevated hover:-translate-y-0.5 transition-all flex items-center gap-3"
                      >
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}aa)` }}
                        >
                          <IconRender name={r.icon} className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-display font-semibold truncate">{r.name}</div>
                          <div
                            className={`text-base font-bold tabular-nums ${
                              r.total < 0 ? "text-red-500" : "text-green-500"
                            }`}
                          >
                            {fmtEUR(r.total)}
                          </div>
                        </div>
                      </Link>
                    ))}
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
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
