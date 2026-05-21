import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Moon, Sun, Hash } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

function Settings() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const textSize = useStore((s) => s.textSize);
  const setTextSize = useStore((s) => s.setTextSize);
  const showPriority = useStore((s) => s.showCategoryPriority);
  const togglePriority = useStore((s) => s.toggleCategoryPriority);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Personnalise ton expérience.</p>
      </motion.div>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">Apparence</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`relative rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                theme === t ? "border-primary shadow-glow" : "border-border hover:border-foreground/20"
              }`}
            >
              {t === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="text-sm font-medium capitalize">{t === "light" ? "Clair" : "Sombre"}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">Taille du texte</h2>
        <div className="grid grid-cols-3 gap-3">
          {(["sm", "md", "lg"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTextSize(s)}
              className={`rounded-xl border-2 p-4 transition-all ${
                textSize === s ? "border-primary shadow-glow" : "border-border hover:border-foreground/20"
              }`}
            >
              <span
                className="font-display font-bold"
                style={{ fontSize: s === "sm" ? 14 : s === "md" ? 18 : 22 }}
              >
                Aa
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                {s === "sm" ? "Petit" : s === "md" ? "Moyen" : "Grand"}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">Affichage</h2>
        <button
          onClick={togglePriority}
          className="w-full flex items-center justify-between rounded-xl p-4 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-medium">Numéros de priorité</div>
              <div className="text-xs text-muted-foreground">Affiche 01, 02, 03… sur les catégories et tâches</div>
            </div>
          </div>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${showPriority ? "bg-gradient-brand" : "bg-muted"}`}
          >
            <motion.div
              animate={{ x: showPriority ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
            />
          </div>
        </button>
      </section>

      <p className="text-xs text-muted-foreground text-center pt-4">
        💾 Tes données sont sauvegardées localement. La synchronisation cloud et l'authentification arrivent bientôt.
      </p>
    </main>
  );
}
