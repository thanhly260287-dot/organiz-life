import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Smartphone, Wifi, BatteryFull, Signal, Home, BarChart3, Settings as SettingsIcon, Printer, ChevronLeft, MoreVertical, Plus, Search } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useStore, MAIN_VISION_ID } from "@/lib/store";

export const Route = createFileRoute("/app/preview")({
  component: NativePreview,
});

type Screen = "home" | "stats" | "settings";

function NativePreview() {
  const [screen, setScreen] = useState<Screen>("home");
  const categories = useStore((s) => s.categories).filter((c) => c.id !== MAIN_VISION_ID).slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        to="/app/settings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux paramètres
      </Link>

      <header className="space-y-2">
        <h1 className="font-display font-bold text-3xl flex items-center gap-3">
          <Smartphone className="h-7 w-7 text-primary" /> Prévisualisation app native
        </h1>
        <p className="text-sm text-muted-foreground">
          Aperçu visuel de l'app sur iOS et Android avant la publication sur l'App Store et Google Play. Choisis un écran pour le voir dans les deux maquettes.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["home", "stats", "settings"] as Screen[]).map((s) => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              screen === s
                ? "bg-gradient-brand text-white shadow-glow"
                : "glass hover:bg-accent"
            }`}
          >
            {s === "home" ? "Accueil" : s === "stats" ? "Statistiques" : "Paramètres"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 justify-items-center pt-4">
        <DeviceFrame platform="ios">
          <PhoneScreen platform="ios" screen={screen} categories={categories} />
        </DeviceFrame>
        <DeviceFrame platform="android">
          <PhoneScreen platform="android" screen={screen} categories={categories} />
        </DeviceFrame>
      </div>

      <div className="grid md:grid-cols-2 gap-8 text-center text-sm font-medium">
        <div>iOS — Style San Francisco, barre arrondie</div>
        <div>Android — Style Material 3, Dynamic Color</div>
      </div>
    </main>
  );
}

function DeviceFrame({ platform, children }: { platform: "ios" | "android"; children: React.ReactNode }) {
  const isIOS = platform === "ios";
  return (
    <div
      className={`relative bg-neutral-900 p-3 shadow-2xl ${
        isIOS ? "rounded-[3rem]" : "rounded-[2rem]"
      }`}
      style={{ width: 320, height: 660 }}
    >
      {/* Side buttons */}
      <div className="absolute -left-1 top-24 w-1 h-12 bg-neutral-700 rounded-l" />
      <div className="absolute -left-1 top-44 w-1 h-20 bg-neutral-700 rounded-l" />
      <div className="absolute -right-1 top-32 w-1 h-16 bg-neutral-700 rounded-r" />

      <div
        className={`relative w-full h-full overflow-hidden bg-background ${
          isIOS ? "rounded-[2.4rem]" : "rounded-[1.5rem]"
        }`}
      >
        {/* Notch / Punch hole */}
        {isIOS ? (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30" />
        ) : (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-30" />
        )}
        {children}
      </div>
    </div>
  );
}

function StatusBar({ platform }: { platform: "ios" | "android" }) {
  const isIOS = platform === "ios";
  return (
    <div
      className={`flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold ${
        isIOS ? "" : ""
      }`}
    >
      <span className={isIOS ? "" : "tracking-tight"}>{isIOS ? "9:41" : "9:41"}</span>
      <div className="flex items-center gap-1">
        <Signal className="h-3 w-3" />
        <Wifi className="h-3 w-3" />
        <BatteryFull className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

function PhoneScreen({
  platform,
  screen,
  categories,
}: {
  platform: "ios" | "android";
  screen: Screen;
  categories: ReturnType<typeof useStore.getState>["categories"];
}) {
  const isIOS = platform === "ios";

  return (
    <div className="flex flex-col h-full bg-background">
      <StatusBar platform={platform} />

      {/* App header */}
      <div
        className={`flex items-center justify-between px-4 ${
          isIOS ? "h-11 mt-1" : "h-14 mt-1 border-b border-border"
        }`}
      >
        {screen === "home" ? (
          <>
            <Logo size={isIOS ? 22 : 24} />
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-5 w-5" />
              <span className={`font-semibold ${isIOS ? "text-base" : "text-lg"}`}>
                {screen === "stats" ? "Statistiques" : "Paramètres"}
              </span>
            </div>
            {!isIOS && <MoreVertical className="h-5 w-5 text-muted-foreground" />}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-3 py-3 space-y-3">
        {screen === "home" && <HomeContent isIOS={isIOS} categories={categories} />}
        {screen === "stats" && <StatsContent isIOS={isIOS} />}
        {screen === "settings" && <SettingsContent isIOS={isIOS} />}
      </div>

      {/* Bottom nav */}
      <BottomNav platform={platform} screen={screen} />

      {/* Home indicator / nav bar */}
      {isIOS ? (
        <div className="flex justify-center pb-1.5 pt-1">
          <div className="w-28 h-1 rounded-full bg-foreground/70" />
        </div>
      ) : (
        <div className="flex items-center justify-around h-6 bg-background border-t border-border">
          <div className="w-3 h-3 border-2 border-foreground/60 rotate-45" />
          <div className="w-3 h-3 rounded-full bg-foreground/60" />
          <div className="w-3 h-3 border-2 border-foreground/60" />
        </div>
      )}
    </div>
  );
}

function HomeContent({ isIOS, categories }: { isIOS: boolean; categories: ReturnType<typeof useStore.getState>["categories"] }) {
  return (
    <>
      <div className={`flex items-center gap-2 px-3 py-2 ${isIOS ? "bg-muted rounded-xl" : "bg-muted rounded-full"}`}>
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Rechercher…</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {categories.slice(0, 4).map((c) => (
          <div
            key={c.id}
            className={`p-3 ${isIOS ? "rounded-2xl" : "rounded-xl"}`}
            style={{ background: `${c.color}22`, border: `1px solid ${c.color}55` }}
          >
            <div
              className="w-7 h-7 rounded-lg mb-2"
              style={{ background: c.color }}
            />
            <div className="text-xs font-semibold truncate">{c.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {c.subcategories?.length ?? 0} sous-cat.
            </div>
          </div>
        ))}
      </div>
      <button
        className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
          isIOS
            ? "bg-primary text-primary-foreground rounded-xl"
            : "bg-primary text-primary-foreground rounded-full uppercase tracking-wide"
        }`}
      >
        <Plus className="h-3.5 w-3.5" /> Ajouter
      </button>
    </>
  );
}

function StatsContent({ isIOS }: { isIOS: boolean }) {
  return (
    <>
      <div className={`p-3 ${isIOS ? "rounded-2xl bg-muted" : "rounded-xl bg-muted"}`}>
        <div className="text-[10px] text-muted-foreground">Cette semaine</div>
        <div className="text-xl font-bold">+24 tâches</div>
      </div>
      <div className={`p-3 h-32 flex items-end gap-1.5 ${isIOS ? "rounded-2xl" : "rounded-xl"} bg-muted/50`}>
        {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-brand rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-2 ${isIOS ? "rounded-xl" : "rounded-lg"} bg-muted text-center`}>
          <div className="text-lg font-bold text-green-500">+12%</div>
          <div className="text-[10px] text-muted-foreground">vs période préc.</div>
        </div>
        <div className={`p-2 ${isIOS ? "rounded-xl" : "rounded-lg"} bg-muted text-center`}>
          <div className="text-lg font-bold">87%</div>
          <div className="text-[10px] text-muted-foreground">complétion</div>
        </div>
      </div>
    </>
  );
}

function SettingsContent({ isIOS }: { isIOS: boolean }) {
  const rows = [
    { label: "Langue", value: "Français" },
    { label: "Thème", value: "Sombre" },
    { label: "Taille du texte", value: "Moyen" },
    { label: "Notifications", value: "Activé" },
  ];
  return (
    <div
      className={`${isIOS ? "rounded-2xl bg-muted divide-y divide-border/60" : "rounded-xl bg-muted divide-y divide-border/60"}`}
    >
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between px-3 py-3 text-xs">
          <span className="font-medium">{r.label}</span>
          <span className="text-muted-foreground">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function BottomNav({ platform, screen }: { platform: "ios" | "android"; screen: Screen }) {
  const isIOS = platform === "ios";
  const items = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "stats", icon: BarChart3, label: "Stats" },
    { key: "print", icon: Printer, label: "Export" },
    { key: "settings", icon: SettingsIcon, label: "Réglages" },
  ];
  return (
    <div
      className={`flex items-center justify-around ${
        isIOS
          ? "h-14 border-t border-border bg-background/95 backdrop-blur"
          : "h-16 bg-background border-t border-border"
      }`}
    >
      {items.map((it) => {
        const active = it.key === screen || (it.key === "home" && screen === "home");
        const Icon = it.icon;
        return (
          <div
            key={it.key}
            className={`flex flex-col items-center gap-0.5 ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {!isIOS && active && (
              <div className="absolute -mt-1 w-10 h-6 rounded-full bg-primary/15" />
            )}
            <Icon className={`${isIOS ? "h-5 w-5" : "h-5 w-5"} relative`} />
            <span className={`text-[9px] ${isIOS ? "" : "font-medium"} relative`}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
