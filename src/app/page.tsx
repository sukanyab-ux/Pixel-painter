"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { GridState, Stroke } from "@/lib/types";
import { packColor } from "@/lib/color";
import { PALETTE_COLORS } from "@/lib/palette";
import { pixelateImageToGrid } from "@/lib/pixelate";
import { exportGridAsPNG, downloadBlob } from "@/lib/exportPng";
import PixelCanvas from "@/components/PixelCanvas";
import ColorPalette from "@/components/ColorPalette";
import ControlPanel from "@/components/ControlPanel";

const DEFAULT_GRID_W = 32;
const DEFAULT_GRID_H = 32;
const DEFAULT_CELL_SIZE = 12;

const createBlankGrid = (w: number, h: number): GridState => {
  const colors = new Uint32Array(w * h);
  const white = packColor(255, 255, 255, 255);
  colors.fill(white);
  return { gridW: w, gridH: h, colors };
};

const win95Outset: React.CSSProperties = {
  borderTop: "2px solid #fff",
  borderLeft: "2px solid #fff",
  borderBottom: "2px solid #404040",
  borderRight: "2px solid #404040",
};

const win95Inset: React.CSSProperties = {
  borderTop: "2px solid #808080",
  borderLeft: "2px solid #808080",
  borderBottom: "2px solid #fff",
  borderRight: "2px solid #fff",
};

const Page = () => {
  const [grid, setGrid] = useState<GridState>(() =>
    createBlankGrid(DEFAULT_GRID_W, DEFAULT_GRID_H)
  );
  const [selectedColor, setSelectedColor] = useState<number>(PALETTE_COLORS[0]);
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
  const [showGrid, setShowGrid] = useState(true);
  const [gridW, setGridW] = useState(DEFAULT_GRID_W);
  const [exportScale, setExportScale] = useState(16);
  const [undoStack, setUndoStack] = useState<Stroke[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTool, setActiveTool] = useState<"paint" | "eyedropper">("paint");
  const [paintedCells, setPaintedCells] = useState<Set<number>>(() => new Set());

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const paintedCellsRef = useRef(paintedCells);
  paintedCellsRef.current = paintedCells;

  const uploadedFileRef = useRef(uploadedFile);
  uploadedFileRef.current = uploadedFile;

  const handleEyedrop = useCallback((color: number) => {
    setSelectedColor(color);
    setActiveTool("paint");
  }, []);

  const handlePaint = useCallback((idx: number, color: number) => {
    setGrid((prev) => {
      const next = new Uint32Array(prev.colors);
      next[idx] = color;
      return { ...prev, colors: next };
    });
    setPaintedCells((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  const handleStrokeEnd = useCallback((stroke: Stroke) => {
    setUndoStack((prev) => [...prev, stroke]);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setGrid((g) => {
        const next = new Uint32Array(g.colors);
        for (const diff of last.diffs) {
          next[diff.idx] = diff.before;
        }
        return { ...g, colors: next };
      });
      setPaintedCells((pc) => {
        const next = new Set(pc);
        for (const diff of last.diffs) {
          next.delete(diff.idx);
        }
        return next;
      });
      return prev.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "p" || e.key === "P") setActiveTool("paint");
      if (e.key === "v" || e.key === "V") setActiveTool("eyedropper");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  const handleGridWChange = useCallback(
    async (w: number) => {
      setGridW(w);
      setUndoStack([]);
      setPaintedCells(new Set());
      const file = uploadedFileRef.current;
      if (file) {
        try {
          const result = await pixelateImageToGrid(file, w);
          setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
          return;
        } catch {
          /* fall through to blank grid */
        }
      }
      setGrid(createBlankGrid(w, w));
    },
    []
  );

  const handleUploadImage = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      try {
        const result = await pixelateImageToGrid(file, gridW);
        setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
        setUndoStack([]);
        setPaintedCells(new Set());
      } catch {
        setUploadedFile(null);
      }
    },
    [gridW]
  );

  const handleRePixelate = useCallback(async () => {
    if (!uploadedFile) return;
    try {
      const result = await pixelateImageToGrid(uploadedFile, gridW);
      setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
      setUndoStack([]);
      setPaintedCells(new Set());
    } catch {
      /* noop */
    }
  }, [uploadedFile, gridW]);

  const handleExportPng = useCallback(async () => {
    const g = gridRef.current;
    const pc = paintedCellsRef.current;
    try {
      const blob = await exportGridAsPNG({
        gridW: g.gridW,
        gridH: g.gridH,
        colors: g.colors,
        scale: exportScale,
        paintedCells: pc.size > 0 ? pc : undefined,
      });
      downloadBlob(blob, `pixel-painter-${Date.now()}.png`);
    } catch {
      /* noop */
    }
  }, [exportScale]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#c0c0c0",
        ...win95Outset,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: "linear-gradient(90deg, #000080, #1084d0)",
          padding: "3px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" fill="#ff0000" />
              <rect x="8" y="1" width="5" height="5" fill="#ffff00" />
              <rect x="1" y="8" width="5" height="5" fill="#00ff00" />
              <rect x="8" y="8" width="5" height="5" fill="#0000ff" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
            Pixel Painter
          </span>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {["_", "□", "×"].map((label, i) => (
            <button
              key={i}
              tabIndex={0}
              aria-label={["Minimize", "Maximize", "Close"][i]}
              style={{
                width: 16,
                height: 14,
                backgroundColor: "#c0c0c0",
                border: "none",
                ...win95Outset,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                color: "#000",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Left sidebar - controls */}
        <aside
          style={{
            width: 196,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            borderRight: "1px solid #808080",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <ControlPanel
            gridW={gridW}
            onGridWChange={handleGridWChange}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((p) => !p)}
            exportScale={exportScale}
            onExportScaleChange={setExportScale}
            onUploadImage={handleUploadImage}
            onRePixelate={handleRePixelate}
            onExportPng={handleExportPng}
            onUndo={handleUndo}
            hasImage={uploadedFile !== null}
            canUndo={undoStack.length > 0}
            activeTool={activeTool}
            onToolChange={setActiveTool}
          />
        </aside>

        {/* Center - canvas */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            padding: 8,
            backgroundColor: "#808080",
            ...win95Inset,
          }}
        >
          <PixelCanvas
            grid={grid}
            cellSize={cellSize}
            showGrid={showGrid}
            selectedColor={selectedColor}
            activeTool={activeTool}
            paintedCells={paintedCells}
            hasImage={uploadedFile !== null}
            onPaint={handlePaint}
            onStrokeEnd={handleStrokeEnd}
            onEyedrop={handleEyedrop}
          />
        </main>
      </div>

      {/* Bottom color palette bar */}
      <div
        style={{
          borderTop: "1px solid #808080",
          padding: "4px 6px",
          backgroundColor: "#c0c0c0",
        }}
      >
        <ColorPalette
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      </div>

      {/* Status bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: "2px 4px",
          borderTop: "1px solid #fff",
        }}
      >
        <div
          style={{
            flex: 1,
            ...win95Inset,
            borderWidth: 1,
            padding: "2px 6px",
            fontSize: 11,
            color: "#000",
          }}
        >
          {grid.gridW} &times; {grid.gridH} pixels
        </div>
        <div
          style={{
            width: 140,
            ...win95Inset,
            borderWidth: 1,
            padding: "2px 6px",
            fontSize: 11,
            color: "#000",
            textAlign: "center",
          }}
        >
          Zoom: {cellSize}px
        </div>
      </div>
    </div>
  );
};

export default Page;
