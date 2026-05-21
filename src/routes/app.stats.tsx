import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, CheckCircle2, Layers } from "lucide-react";
import { useStore, getCategoryProgress, MAIN_VISION_ID } from "@/lib/store";
import { IconRender } from "@/components/IconRender";

export const Route = createFileRoute("/app/stats")({
  component: StatsPage,
});

function StatsPage() {
  const categories = useStore((s) => s.categories.filter((c) => c.id !== MAIN_VISION_ID));


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

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux catégories
      </Link>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl shadow-elevated p-6 sm:p-8"
      >
        <h1 className="font-display font-bold text-3xl sm:text-4xl">
          <span className="text-gradient">Statistiques</span> & progression
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Visualise ton évolution sur toutes les catégories de vie.
        </p>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Progression de vie
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
              <CheckCircle2 className="h-3.5 w-3.5" /> Tâches accomplies
            </div>
            <div className="mt-1 text-3xl font-display font-bold">
              {stats.done}
              <span className="text-base text-muted-foreground font-normal"> / {stats.total}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-card/50 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" /> Catégories actives
            </div>
            <div className="mt-1 text-3xl font-display font-bold">{categories.length}</div>
          </div>
        </div>
      </motion.section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-xl">Progression par catégorie</h2>
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
                    <h3 className="font-display font-semibold text-sm truncate">{c.name}</h3>
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
    </main>
  );
}
