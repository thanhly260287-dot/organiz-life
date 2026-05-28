import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStore, MAIN_VISION_ID } from "@/lib/store";
import { useCategoryName } from "@/lib/useCategoryName";
import { IconRender } from "@/components/IconRender";
import type { VisionItem } from "@/lib/categories";

export const Route = createFileRoute("/app/print")({
  component: PrintPage,
});

type Format = "A4" | "A3" | "A2";
type Orientation = "portrait" | "landscape";
type Mode = "all" | "categories" | "vision";

// Paper sizes in mm (portrait)
const PAPER: Record<Format, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  A2: { w: 420, h: 594 },
};

function PrintPage() {
  const { t } = useTranslation();
  const getName = useCategoryName();
  const categories = useStore((s) => s.categories);

  const [format, setFormat] = useState<Format>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [mode, setMode] = useState<Mode>("all");
  const [showDone, setShowDone] = useState(true);

  const mainVision = useMemo(
    () => categories.find((c) => c.id === MAIN_VISION_ID),
    [categories]
  );
  const visibleCategories = useMemo(
    () => categories.filter((c) => c.id !== MAIN_VISION_ID),
    [categories]
  );

  // Compute page size in mm based on orientation
  const paper = PAPER[format];
  const pageW = orientation === "portrait" ? paper.w : paper.h;
  const pageH = orientation === "portrait" ? paper.h : paper.w;

  // Vision board bounds for scaling
  const visionBounds = useMemo(() => {
    const items = mainVision?.vision ?? [];
    if (items.length === 0) return { w: 800, h: 600 };
    let maxX = 0,
      maxY = 0;
    items.forEach((i) => {
      maxX = Math.max(maxX, i.x + i.width);
      maxY = Math.max(maxY, i.y + i.height);
    });
    return { w: Math.max(800, maxX + 40), h: Math.max(600, maxY + 40) };
  }, [mainVision]);

  const handlePrint = () => window.print();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
      {/* Dynamic page size for print */}
      <style>{`
        @page { size: ${pageW}mm ${pageH}mm; margin: 10mm; }
        @media print {
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          .print-page {
            width: ${pageW - 20}mm;
            min-height: ${pageH - 20}mm;
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            background: white !important;
            color: #111 !important;
          }
          .print-page:last-child { page-break-after: auto; }
        }
      `}</style>

      {/* Controls */}
      <section className="no-print glass rounded-2xl shadow-glass p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Printer className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">{t("print.title", "Imprimer")}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            "print.subtitle",
            "Imprime toute ta vie sur une seule feuille ou choisis ce que tu veux imprimer. Format A4, A3 ou A2 en haute qualité."
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {t("print.format", "Format de papier")}
            </label>
            <div className="flex gap-2">
              {(["A4", "A3", "A2"] as Format[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === f
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "glass hover:bg-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              {t("print.orientation", "Orientation")}
            </label>
            <div className="flex gap-2">
              {(["portrait", "landscape"] as Orientation[]).map((o) => (
                <button
                  key={o}
                  onClick={() => setOrientation(o)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    orientation === o
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "glass hover:bg-accent"
                  }`}
                >
                  {o === "portrait"
                    ? t("print.portrait", "Portrait")
                    : t("print.landscape", "Paysage")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {t("print.content", "Contenu à imprimer")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(
              [
                { v: "all", label: t("print.modeAll", "Tout (vie + vision)") },
                { v: "categories", label: t("print.modeCategories", "Catégories & tâches") },
                { v: "vision", label: t("print.modeVision", "Tableau de vision") },
              ] as { v: Mode; label: string }[]
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setMode(o.v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === o.v
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "glass hover:bg-accent"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="h-4 w-4"
          />
          {t("print.showDone", "Inclure les tâches terminées")}
        </label>

        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-sm font-medium text-white shadow-glow hover:scale-105 transition-transform"
          >
            <Printer className="h-4 w-4" />
            {t("print.print", "Imprimer")}
          </button>
        </div>
      </section>

      {/* Preview / print area */}
      <section className="print-area space-y-6">
        <p className="no-print text-xs text-muted-foreground text-center">
          {t("print.preview", "Aperçu")} — {format} {orientation}
        </p>

        {(mode === "all" || mode === "categories") && (
          <CategoriesPage
            pageW={pageW}
            pageH={pageH}
            categories={visibleCategories}
            getName={getName}
            showDone={showDone}
          />
        )}

        {(mode === "all" || mode === "vision") && mainVision && (
          <VisionPage
            pageW={pageW}
            pageH={pageH}
            items={mainVision.vision}
            bounds={visionBounds}
          />
        )}
      </section>
    </main>
  );
}

function CategoriesPage({
  pageW,
  pageH,
  categories,
  getName,
  showDone,
}: {
  pageW: number;
  pageH: number;
  categories: ReturnType<typeof useStore.getState>["categories"];
  getName: (id: string, fallback: string) => string;
  showDone: boolean;
}) {
  return (
    <div
      className="print-page mx-auto bg-white text-neutral-900 shadow-elevated rounded-md p-6"
      style={{
        width: `${pageW}mm`,
        minHeight: `${pageH}mm`,
      }}
    >
      <header className="border-b border-neutral-300 pb-3 mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Organiz-Life</h1>
        <span className="text-xs text-neutral-500">
          {new Date().toLocaleDateString("fr-FR")}
        </span>
      </header>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${pageW > 250 ? 3 : 2}, minmax(0, 1fr))`,
        }}
      >
        {categories.map((c) => {
          const tasks = showDone ? c.tasks : c.tasks.filter((t) => !t.done);
          return (
            <div
              key={c.id}
              className="break-inside-avoid border border-neutral-200 rounded-md p-2"
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <IconRender name={c.icon} className="h-3.5 w-3.5" />
                <h2 className="text-[11px] font-semibold uppercase tracking-wide">
                  {getName(c.id, c.name)}
                </h2>
                <span className="ml-auto text-[10px] text-neutral-500">
                  {c.tasks.filter((t) => t.done).length}/{c.tasks.length}
                </span>
              </div>
              {tasks.length === 0 ? (
                <p className="text-[10px] text-neutral-400 italic">—</p>
              ) : (
                <ul className="space-y-0.5">
                  {tasks.slice(0, 14).map((t) => (
                    <li
                      key={t.id}
                      className="text-[10px] flex items-start gap-1 leading-tight"
                    >
                      <span className="inline-block w-2 h-2 mt-0.5 border border-neutral-400 rounded-sm flex-shrink-0 flex items-center justify-center">
                        {t.done && <span className="text-[8px] leading-none">✓</span>}
                      </span>
                      <span className={t.done ? "line-through text-neutral-400" : ""}>
                        {t.title}
                        {t.date && (
                          <span className="text-neutral-400 ml-1">
                            ({t.date}
                            {t.time ? ` ${t.time}` : ""})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                  {tasks.length > 14 && (
                    <li className="text-[9px] text-neutral-400 italic">
                      +{tasks.length - 14}…
                    </li>
                  )}
                </ul>
              )}
              {c.subcategories.length > 0 &&
                c.subcategories.map((s) => (
                  <div key={s.id} className="mt-1 pl-1">
                    <p className="text-[9px] font-semibold uppercase text-neutral-500">
                      {s.name}
                    </p>
                    <ul>
                      {(showDone ? s.tasks : s.tasks.filter((x) => !x.done))
                        .slice(0, 6)
                        .map((t) => (
                          <li
                            key={t.id}
                            className={`text-[10px] ${
                              t.done ? "line-through text-neutral-400" : ""
                            }`}
                          >
                            • {t.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VisionPage({
  pageW,
  pageH,
  items,
  bounds,
}: {
  pageW: number;
  pageH: number;
  items: VisionItem[];
  bounds: { w: number; h: number };
}) {
  // mm content area (after 10mm page margin handled by @page, plus 6mm interior)
  const contentW = pageW - 20;
  const contentH = pageH - 30;
  // scale px -> mm so the whole board fits
  const scale = Math.min(contentW / bounds.w, contentH / bounds.h);

  return (
    <div
      className="print-page mx-auto bg-white text-neutral-900 shadow-elevated rounded-md p-6"
      style={{ width: `${pageW}mm`, minHeight: `${pageH}mm` }}
    >
      <header className="border-b border-neutral-300 pb-3 mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Vision Board</h1>
        <span className="text-xs text-neutral-500">
          {new Date().toLocaleDateString("fr-FR")}
        </span>
      </header>
      <div
        className="relative mx-auto bg-white"
        style={{
          width: `${bounds.w * scale}mm`,
          height: `${bounds.h * scale}mm`,
        }}
      >
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute"
            style={{
              left: `${it.x * scale}mm`,
              top: `${it.y * scale}mm`,
              width: `${it.width * scale}mm`,
              height: `${it.height * scale}mm`,
              transform: `rotate(${it.rotation}deg)`,
              zIndex: it.zIndex ?? 0,
            }}
          >
            {it.type === "image" ? (
              <img
                src={it.content}
                alt=""
                className="w-full h-full object-cover rounded"
                style={{ imageRendering: "auto" }}
              />
            ) : (
              <div
                style={{
                  fontSize: `${(it.fontSize ?? 16) * scale * 3.78}pt`,
                  color: it.color ?? "#111",
                  fontFamily: it.fontFamily,
                  fontWeight: it.fontWeight,
                  fontStyle: it.fontStyle,
                  textDecoration: it.textDecoration,
                  textAlign: it.textAlign ?? "left",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {it.content}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-neutral-400 italic text-sm pt-10">
            (Vision Board vide)
          </p>
        )}
      </div>
    </div>
  );
}
