import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Moon, Sun, Hash, Globe, Search, Check, ArrowLeft, Wallet, AlertTriangle } from "lucide-react";

import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export const Route = createFileRoute("/app/settings")({
  component: Settings,
});

function Settings() {
  const { t, i18n } = useTranslation();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const textSize = useStore((s) => s.textSize);
  const setTextSize = useStore((s) => s.setTextSize);
  const showPriority = useStore((s) => s.showCategoryPriority);
  const togglePriority = useStore((s) => s.toggleCategoryPriority);
  const showTotal = useStore((s) => s.showCategoryTotal);
  const toggleTotal = useStore((s) => s.toggleCategoryTotal);
  const resetAllData = useStore((s) => s.resetAllData);
  const [langQuery, setLangQuery] = useState("");


  const filteredLangs = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
    );
  }, [langQuery]);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ??
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language.split("-")[0]);

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        to="/app"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("header.back")}
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </motion.div>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" /> {t("settings.language")}
          </h2>
          {currentLang && (
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="text-lg leading-none">{currentLang.flag}</span>
              {currentLang.label}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("settings.languageDesc")}</p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={langQuery}
            onChange={(e) => setLangQuery(e.target.value)}
            placeholder={t("settings.language") + "…"}
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-border divide-y divide-border">
          {filteredLangs.map((l) => {
            const active = i18n.language === l.code;
            return (
              <button
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                  active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <span className="text-xl leading-none w-6 text-center">{l.flag}</span>
                <span className="flex-1 truncate">{l.label}</span>
                <span className="text-xs text-muted-foreground uppercase">{l.code}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
          {filteredLangs.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">—</div>
          )}
        </div>
      </section>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">{t("settings.appearance")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["light", "dark"] as const).map((tt) => (
            <button
              key={tt}
              onClick={() => setTheme(tt)}
              className={`relative rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                theme === tt ? "border-primary shadow-glow" : "border-border hover:border-foreground/20"
              }`}
            >
              {tt === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="text-sm font-medium">{tt === "light" ? t("settings.light") : t("settings.dark")}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">{t("settings.textSize")}</h2>
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
                {s === "sm" ? t("settings.small") : s === "md" ? t("settings.medium") : t("settings.large")}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl shadow-glass p-6 space-y-4">
        <h2 className="font-display font-semibold">{t("settings.display")}</h2>
        <button
          onClick={togglePriority}
          className="w-full flex items-center justify-between rounded-xl p-4 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-medium">{t("settings.priorityTitle")}</div>
              <div className="text-xs text-muted-foreground">{t("settings.priorityDesc")}</div>
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
        <button
          onClick={toggleTotal}
          className="w-full flex items-center justify-between rounded-xl p-4 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            <div className="text-left">
              <div className="text-sm font-medium">
                {t("settings.totalTitle", "Total financier sur les catégories")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t(
                  "settings.totalDesc",
                  "Affiche le total (vert/rouge) directement sur la ligne des catégories financières."
                )}
              </div>
            </div>
          </div>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${showTotal ? "bg-gradient-brand" : "bg-muted"}`}
          >
            <motion.div
              animate={{ x: showTotal ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
            />
          </div>
        </button>

      </section>
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 space-y-4">
        <h2 className="font-display font-semibold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {t("settings.dangerZone", { defaultValue: "Zone sensible" })}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("settings.resetAllDesc", {
            defaultValue:
              "Supprime toutes tes tâches, sous-catégories, vision boards et préférences. Cette action est irréversible.",
          })}
        </p>
        <button
          onClick={() => {
            const msg = t("settings.resetAllConfirm", {
              defaultValue:
                "Tout réinitialiser ? Toutes les tâches, catégories personnalisées, vision boards et préférences seront effacées définitivement.",
            });
            if (!confirm(msg)) return;
            const msg2 = t("settings.resetAllConfirm2", {
              defaultValue: "Es-tu vraiment sûr·e ? Cette action est définitive.",
            });
            if (!confirm(msg2)) return;
            resetAllData();
            try {
              ["stats:evoDays", "stats:evoCats", "stats:evoStatus", "stats:evoShowValues", "stats:evoShowTrend", "stats:evoCompare", "stats:evoNegBad"].forEach(
                (k) => window.localStorage.removeItem(k)
              );
            } catch {}
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <AlertTriangle className="h-4 w-4" />
          {t("settings.resetAll", { defaultValue: "Tout réinitialiser" })}
        </button>
      </section>

      <p className="text-xs text-muted-foreground text-center pt-4">
        {t("settings.localStorage")}
      </p>
    </main>
  );
}
