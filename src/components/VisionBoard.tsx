import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Type,
  Download,
  Trash2,
  RotateCw,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Eraser,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { VisionItem } from "@/lib/categories";
import { toPng } from "html-to-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FONT_FAMILIES = [
  { label: "Sans", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
  { label: "Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Cursive", value: "'Brush Script MT', cursive" },
  { label: "Fantasy", value: "Impact, fantasy" },
];

export function VisionBoard({
  categoryId,
  items,
  subId,
  compact = false,
}: {
  categoryId: string;
  items: VisionItem[];
  subId?: string;
  compact?: boolean;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pinchRef = useRef<Map<string, { dist: number; w: number; h: number; x: number; y: number; rot: number; angle: number }>>(new Map());
  const dragPointerRef = useRef<Map<string, { offsetX: number; offsetY: number }>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const addItem = useStore((s) => s.addVisionItem);
  const updateItem = useStore((s) => s.updateVisionItem);
  const removeItem = useStore((s) => s.removeVisionItem);
  const clearItems = useStore((s) => s.clearVisionItems);

  const maxZ = items.reduce((m, i) => Math.max(m, i.zIndex ?? 0), 0);
  const minZ = items.reduce((m, i) => Math.min(m, i.zIndex ?? 0), 0);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addItem(
        categoryId,
        {
          type: "image",
          content: reader.result as string,
          x: 40,
          y: 40,
          width: compact ? 160 : 220,
          height: compact ? 160 : 220,
          rotation: 0,
          zIndex: maxZ + 1,
        },
        subId
      );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addText = () => {
    addItem(
      categoryId,
      {
        type: "text",
        content: "Inspiration",
        x: 60,
        y: 60,
        width: 240,
        height: 80,
        rotation: 0,
        zIndex: maxZ + 1,
        fontSize: compact ? 22 : 28,
        color: "#9B51E0",
        fontFamily: FONT_FAMILIES[0].value,
        fontWeight: "bold",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: "center",
      },
      subId
    );
  };

  const exportPng = async () => {
    if (!boardRef.current) return;
    const dataUrl = await toPng(boardRef.current, { pixelRatio: 2, backgroundColor: "#0b0b14" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `vision-board-${categoryId}${subId ? "-" + subId : ""}.png`;
    a.click();
  };

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const onDragEnd = (id: string, pointX: number, pointY: number) => {
    const it = items.find((i) => i.id === id);
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!it || !boardRect) return;

    const pointerOffset = dragPointerRef.current.get(id);
    const fallbackOffsetX = it.width / 2;
    const fallbackOffsetY = it.height / 2;
    const nextX = clamp(
      pointX - boardRect.left - (pointerOffset?.offsetX ?? fallbackOffsetX),
      0,
      Math.max(0, boardRect.width - it.width)
    );
    const nextY = clamp(
      pointY - boardRect.top - (pointerOffset?.offsetY ?? fallbackOffsetY),
      0,
      Math.max(0, boardRect.height - it.height)
    );

    updateItem(categoryId, id, { x: nextX, y: nextY }, subId);
    dragPointerRef.current.delete(id);
  };

  const startResize = (
    e: React.PointerEvent,
    item: VisionItem,
    corner: "br" | "bl" | "tr" | "tl"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = item.width;
    const startH = item.height;
    const startLeft = item.x;
    const startTop = item.y;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let w = startW;
      let h = startH;
      let x = startLeft;
      let y = startTop;
      if (corner === "br") {
        w = Math.max(40, startW + dx);
        h = Math.max(30, startH + dy);
      } else if (corner === "bl") {
        w = Math.max(40, startW - dx);
        h = Math.max(30, startH + dy);
        x = startLeft + (startW - w);
      } else if (corner === "tr") {
        w = Math.max(40, startW + dx);
        h = Math.max(30, startH - dy);
        y = startTop + (startH - h);
      } else {
        w = Math.max(40, startW - dx);
        h = Math.max(30, startH - dy);
        x = startLeft + (startW - w);
        y = startTop + (startH - h);
      }
      updateItem(categoryId, item.id, { width: w, height: h, x, y }, subId);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };


  const startRotate = (e: React.PointerEvent, item: VisionItem) => {
    e.stopPropagation();
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).closest("[data-vb-item]") as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const move = (ev: PointerEvent) => {
      const angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
      updateItem(categoryId, item.id, { rotation: Math.round(angle) }, subId);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const selectedItem = items.find((i) => i.id === selected) || null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <span className="text-gradient">Vision Board</span>
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg glass shadow-glass hover:scale-105 transition-transform"
          >
            <ImageIcon className="h-3.5 w-3.5" /> Image
          </button>
          <button
            onClick={addText}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg glass shadow-glass hover:scale-105 transition-transform"
          >
            <Type className="h-3.5 w-3.5" /> Texte
          </button>
          <button
            onClick={exportPng}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gradient-brand text-white shadow-glow hover:scale-105 transition-transform"
          >
            <Download className="h-3.5 w-3.5" /> Exporter
          </button>
          {items.length > 0 && (
            <button
              onClick={() => setResetOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg glass shadow-glass hover:bg-amber-500/20 text-amber-500 transition-colors"
            >
              <Eraser className="h-3.5 w-3.5" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Floating toolbar for selected item */}
      {selectedItem && (
        <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl glass shadow-glass text-xs">
          {selectedItem.type === "text" && (
            <>
              <select
                value={selectedItem.fontFamily || FONT_FAMILIES[0].value}
                onChange={(e) =>
                  updateItem(categoryId, selectedItem.id, { fontFamily: e.target.value }, subId)
                }
                className="px-2 py-1 rounded bg-background border border-border"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={8}
                max={200}
                value={selectedItem.fontSize || 24}
                onChange={(e) =>
                  updateItem(categoryId, selectedItem.id, { fontSize: Number(e.target.value) }, subId)
                }
                className="w-16 px-2 py-1 rounded bg-background border border-border"
              />
              <input
                type="color"
                value={selectedItem.color || "#ffffff"}
                onChange={(e) =>
                  updateItem(categoryId, selectedItem.id, { color: e.target.value }, subId)
                }
                className="h-8 w-8 rounded cursor-pointer bg-transparent"
              />
              <button
                onClick={() =>
                  updateItem(
                    categoryId,
                    selectedItem.id,
                    { fontWeight: selectedItem.fontWeight === "bold" ? "normal" : "bold" },
                    subId
                  )
                }
                className={`p-1.5 rounded ${selectedItem.fontWeight === "bold" ? "bg-primary text-white" : "hover:bg-accent"}`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateItem(
                    categoryId,
                    selectedItem.id,
                    { fontStyle: selectedItem.fontStyle === "italic" ? "normal" : "italic" },
                    subId
                  )
                }
                className={`p-1.5 rounded ${selectedItem.fontStyle === "italic" ? "bg-primary text-white" : "hover:bg-accent"}`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateItem(
                    categoryId,
                    selectedItem.id,
                    {
                      textDecoration:
                        selectedItem.textDecoration === "underline" ? "none" : "underline",
                    },
                    subId
                  )
                }
                className={`p-1.5 rounded ${selectedItem.textDecoration === "underline" ? "bg-primary text-white" : "hover:bg-accent"}`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              {(["left", "center", "right"] as const).map((a) => {
                const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
                return (
                  <button
                    key={a}
                    onClick={() =>
                      updateItem(categoryId, selectedItem.id, { textAlign: a }, subId)
                    }
                    className={`p-1.5 rounded ${selectedItem.textAlign === a ? "bg-primary text-white" : "hover:bg-accent"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </>
          )}
          <div className="flex items-center gap-1">
            <span className="opacity-60">Rot</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={selectedItem.rotation}
              onChange={(e) =>
                updateItem(categoryId, selectedItem.id, { rotation: Number(e.target.value) }, subId)
              }
              className="w-24"
            />
          </div>
          <button
            onClick={() =>
              updateItem(categoryId, selectedItem.id, { zIndex: maxZ + 1 }, subId)
            }
            className="p-1.5 rounded hover:bg-accent"
            title="Avant"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() =>
              updateItem(categoryId, selectedItem.id, { zIndex: minZ - 1 }, subId)
            }
            className="p-1.5 rounded hover:bg-accent"
            title="Arrière"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              removeItem(categoryId, selectedItem.id, subId);
              setSelected(null);
            }}
            className="p-1.5 hover:bg-destructive/20 text-destructive rounded"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setSelected(null)}
            className="ml-1 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
          >
            Valider
          </button>
        </div>
      )}


      <div
        ref={boardRef}
        onClick={() => setSelected(null)}
        className={`relative w-full ${compact ? "h-[320px]" : "h-[520px]"} rounded-3xl overflow-hidden bg-aurora glass shadow-elevated`}
      >
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
            Ajoute des images et du texte pour créer ton tableau de vision ✨
          </div>
        )}
        {items.map((item) => (
          <motion.div
            key={item.id}
            data-vb-item
            drag={selected === item.id}
            dragMomentum={false}
            dragElastic={0}
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              dragPointerRef.current.set(item.id, {
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top,
              });
            }}
            onDragEnd={(_, info) => onDragEnd(item.id, info.point.x, info.point.y)}
            initial={false}
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              rotate: item.rotation,
              zIndex: item.zIndex ?? 0,
              cursor: selected === item.id ? "grab" : "pointer",
              touchAction: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(item.id);
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                e.stopPropagation();
                const [a, b] = [e.touches[0], e.touches[1]];
                const dx = b.clientX - a.clientX;
                const dy = b.clientY - a.clientY;
                pinchRef.current.set(item.id, {
                  dist: Math.hypot(dx, dy),
                  w: item.width,
                  h: item.height,
                  x: item.x,
                  y: item.y,
                  rot: item.rotation,
                  angle: (Math.atan2(dy, dx) * 180) / Math.PI,
                });
                setSelected(item.id);
              }
            }}
            onTouchMove={(e) => {
              const start = pinchRef.current.get(item.id);
              if (e.touches.length === 2 && start) {
                e.preventDefault();
                e.stopPropagation();
                const [a, b] = [e.touches[0], e.touches[1]];
                const dx = b.clientX - a.clientX;
                const dy = b.clientY - a.clientY;
                const dist = Math.hypot(dx, dy);
                const scale = dist / start.dist;
                const newW = Math.max(40, start.w * scale);
                const newH = Math.max(30, start.h * scale);
                const newX = start.x - (newW - start.w) / 2;
                const newY = start.y - (newH - start.h) / 2;
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                const rotation = Math.round(start.rot + (angle - start.angle));
                updateItem(categoryId, item.id, { width: newW, height: newH, x: newX, y: newY, rotation }, subId);
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) pinchRef.current.delete(item.id);
            }}
            className={`group ${selected === item.id ? "ring-2 ring-primary rounded-xl" : ""}`}
          >
            {item.type === "image" ? (
              <img
                src={item.content}
                alt=""
                draggable={false}
                className="h-full w-full object-cover rounded-xl shadow-elevated select-none pointer-events-none"
              />
            ) : (
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) =>
                  updateItem(
                    categoryId,
                    item.id,
                    { content: e.currentTarget.textContent || "" },
                    subId
                  )
                }
                style={{
                  fontSize: item.fontSize,
                  color: item.color,
                  fontFamily: item.fontFamily,
                  fontWeight: item.fontWeight,
                  fontStyle: item.fontStyle,
                  textDecoration: item.textDecoration,
                  textAlign: item.textAlign,
                }}
                className="h-full w-full flex items-center justify-center outline-none px-2"
              >
                {item.content}
              </div>
            )}
            {selected === item.id && (
              <>
                {/* Rotation handle (top center) */}
                <div
                  onPointerDown={(e) => startRotate(e, item)}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-card shadow-elevated cursor-grab border-2 border-primary touch-none"
                  title="Faire tourner"
                >
                  <RotateCw className="h-4 w-4" />
                </div>
                {/* Corner resize handles */}
                <div
                  onPointerDown={(e) => startResize(e, item, "tl")}
                  className="absolute -top-2.5 -left-2.5 h-6 w-6 rounded-full bg-primary border-2 border-card shadow-elevated cursor-nwse-resize touch-none"
                  title="Redimensionner"
                />
                <div
                  onPointerDown={(e) => startResize(e, item, "tr")}
                  className="absolute -top-2.5 -right-2.5 h-6 w-6 rounded-full bg-primary border-2 border-card shadow-elevated cursor-nesw-resize touch-none"
                  title="Redimensionner"
                />
                <div
                  onPointerDown={(e) => startResize(e, item, "bl")}
                  className="absolute -bottom-2.5 -left-2.5 h-6 w-6 rounded-full bg-primary border-2 border-card shadow-elevated cursor-nesw-resize touch-none"
                  title="Redimensionner"
                />
                <div
                  onPointerDown={(e) => startResize(e, item, "br")}
                  className="absolute -bottom-2.5 -right-2.5 h-6 w-6 rounded-full bg-primary border-2 border-card shadow-elevated cursor-nwse-resize touch-none"
                  title="Redimensionner"
                />
              </>
            )}

          </motion.div>
        ))}
      </div>

      {/* Dialog: reset vision board */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser le Vision Board</AlertDialogTitle>
            <AlertDialogDescription>
              {items.length === 1
                ? "1 élément va être supprimé du Vision Board. Cette action est irréversible et l'élément ne pourra pas être récupéré."
                : `${items.length} éléments vont être supprimés du Vision Board. Cette action est irréversible et aucun élément ne pourra être récupéré.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetOpen(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearItems(categoryId, subId);
                setSelected(null);
                setResetOpen(false);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
