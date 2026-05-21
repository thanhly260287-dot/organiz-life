import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Type, Download, Trash2, RotateCw } from "lucide-react";
import { useStore } from "@/lib/store";
import type { VisionItem } from "@/lib/categories";
import { toPng } from "html-to-image";

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
  const [selected, setSelected] = useState<string | null>(null);
  const addItem = useStore((s) => s.addVisionItem);
  const updateItem = useStore((s) => s.updateVisionItem);
  const removeItem = useStore((s) => s.removeVisionItem);

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
        fontSize: compact ? 22 : 28,
        color: "#9B51E0",
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

  const onDrag = (id: string, dx: number, dy: number) => {
    const it = items.find((i) => i.id === id);
    if (!it) return;
    updateItem(categoryId, id, { x: it.x + dx, y: it.y + dy }, subId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <span className="text-gradient">Vision Board</span>
        </h3>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

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
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => onDrag(item.id, info.offset.x, info.offset.y)}
            initial={false}
            style={{
              position: "absolute",
              left: item.x,
              top: item.y,
              width: item.width,
              height: item.height,
              rotate: item.rotation,
              cursor: "grab",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(item.id);
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
                onBlur={(e) => updateItem(categoryId, item.id, { content: e.currentTarget.textContent || "" }, subId)}
                style={{ fontSize: item.fontSize, color: item.color }}
                className="h-full w-full flex items-center justify-center text-center font-display font-bold outline-none"
              >
                {item.content}
              </div>
            )}
            {selected === item.id && (
              <div className="absolute -top-10 left-0 flex gap-1 bg-card shadow-elevated rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateItem(categoryId, item.id, { rotation: item.rotation + 15 }, subId);
                  }}
                  className="p-1.5 hover:bg-accent rounded"
                  aria-label="Rotation"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min={60}
                  max={500}
                  value={item.width}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    updateItem(categoryId, item.id, { width: w, height: item.type === "image" ? w : item.height }, subId);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-24"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(categoryId, item.id);
                  }}
                  className="p-1.5 hover:bg-destructive/20 text-destructive rounded"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
