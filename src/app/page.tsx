"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { GridState, Stroke } from "@/lib/types";
import { packColor } from "@/lib/color";
import { PALETTE_COLORS } from "@/lib/palette";
import { pixelateImageToGrid, outlineImageToGrid } from "@/lib/pixelate";
import { exportGridAsPNG, downloadBlob } from "@/lib/exportPng";
import { lightTheme, darkTheme } from "@/lib/theme";
import type { Theme } from "@/lib/theme";
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

const makeOutset = (t: Theme): React.CSSProperties => ({
  borderTop: `2px solid ${t.borderLight}`,
  borderLeft: `2px solid ${t.borderLight}`,
  borderBottom: `2px solid ${t.borderDark}`,
  borderRight: `2px solid ${t.borderDark}`,
});

const makeInset = (t: Theme): React.CSSProperties => ({
  borderTop: `2px solid ${t.borderMid}`,
  borderLeft: `2px solid ${t.borderMid}`,
  borderBottom: `2px solid ${t.borderLight}`,
  borderRight: `2px solid ${t.borderLight}`,
});

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
  const [activeTool, setActiveTool] = useState<"paint" | "eyedropper" | "eraser">("paint");
  const [paintedCells, setPaintedCells] = useState<Set<number>>(() => new Set());
  const [imageMode, setImageMode] = useState<"pixel" | "outline">("pixel");
  const [brushSize, setBrushSize] = useState(1);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [baseGrid, setBaseGrid] = useState<Uint32Array | null>(null);

  const theme = themeMode === "dark" ? darkTheme : lightTheme;
  const outset = useMemo(() => makeOutset(theme), [theme]);
  const inset = useMemo(() => makeInset(theme), [theme]);

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const baseGridRef = useRef(baseGrid);
  baseGridRef.current = baseGrid;

  const paintedCellsRef = useRef(paintedCells);
  paintedCellsRef.current = paintedCells;

  const uploadedFileRef = useRef(uploadedFile);
  uploadedFileRef.current = uploadedFile;

  const imageModeRef = useRef(imageMode);
  imageModeRef.current = imageMode;

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

  const handleErase = useCallback((idx: number) => {
    const base = baseGridRef.current;
    const restoreColor = base ? base[idx] : packColor(255, 255, 255, 255);
    setGrid((prev) => {
      const next = new Uint32Array(prev.colors);
      next[idx] = restoreColor;
      return { ...prev, colors: next };
    });
    setPaintedCells((prev) => {
      const next = new Set(prev);
      next.delete(idx);
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
      if (e.key === "e" || e.key === "E") setActiveTool("eraser");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  const processImage = useCallback(
    (file: File, w: number, mode: "pixel" | "outline") => {
      return mode === "outline" ? outlineImageToGrid(file, w) : pixelateImageToGrid(file, w);
    },
    []
  );

  const handleGridWChange = useCallback(
    async (w: number) => {
      setGridW(w);
      setBrushSize(w <= 32 ? 1 : w <= 64 ? 2 : 3);
      setUndoStack([]);
      setPaintedCells(new Set());
      const file = uploadedFileRef.current;
      if (file) {
        try {
          const result = await processImage(file, w, imageModeRef.current);
          setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
          setBaseGrid(new Uint32Array(result.colors));
          return;
        } catch {
          /* fall through to blank grid */
        }
      }
      setGrid(createBlankGrid(w, w));
      setBaseGrid(null);
    },
    [processImage]
  );

  const handleUploadImage = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      try {
        const result = await processImage(file, gridW, imageModeRef.current);
        setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
        setBaseGrid(new Uint32Array(result.colors));
        setUndoStack([]);
        setPaintedCells(new Set());
      } catch {
        setUploadedFile(null);
      }
    },
    [gridW, processImage]
  );

  const handleSelectSampleImage = useCallback(
    async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const name = url.split("/").pop() || "sample.png";
        const file = new File([blob], name, { type: blob.type });
        setUploadedFile(file);
        const result = await processImage(file, gridW, imageModeRef.current);
        setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
        setBaseGrid(new Uint32Array(result.colors));
        setUndoStack([]);
        setPaintedCells(new Set());
      } catch {
        /* noop */
      }
    },
    [gridW, processImage]
  );

  const handleRePixelate = useCallback(async () => {
    if (!uploadedFile) return;
    try {
      const result = await processImage(uploadedFile, gridW, imageModeRef.current);
      setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
      setBaseGrid(new Uint32Array(result.colors));
      setUndoStack([]);
      setPaintedCells(new Set());
    } catch {
      /* noop */
    }
  }, [uploadedFile, gridW, processImage]);

  const handleImageModeChange = useCallback(
    async (mode: "pixel" | "outline") => {
      setImageMode(mode);
      const file = uploadedFileRef.current;
      if (!file) return;
      try {
        const result = await processImage(file, gridW, mode);
        setGrid({ gridW: result.gridW, gridH: result.gridH, colors: result.colors });
        setBaseGrid(new Uint32Array(result.colors));
        setUndoStack([]);
        setPaintedCells(new Set());
      } catch {
        /* noop */
      }
    },
    [gridW, processImage]
  );

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
        backgroundColor: theme.bg,
        ...outset,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: theme.titleBarGradient,
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
                backgroundColor: theme.titleBtnBg,
                border: "none",
                ...outset,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                color: theme.text,
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
            width: 220,
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            borderRight: `1px solid ${theme.borderMid}`,
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
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            exportScale={exportScale}
            onExportScaleChange={setExportScale}
            onUploadImage={handleUploadImage}
            onSelectSampleImage={handleSelectSampleImage}
            onRePixelate={handleRePixelate}
            onExportPng={handleExportPng}
            onUndo={handleUndo}
            hasImage={uploadedFile !== null}
            canUndo={undoStack.length > 0}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            imageMode={imageMode}
            onImageModeChange={handleImageModeChange}
            theme={theme}
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
            backgroundColor: theme.canvasBg,
            ...inset,
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
            brushSize={brushSize}
            onPaint={handlePaint}
            onErase={handleErase}
            onStrokeEnd={handleStrokeEnd}
            onEyedrop={handleEyedrop}
          />
        </main>

        {/* Right sidebar - color palette */}
        <aside
          style={{
            width: 190,
            padding: 8,
            borderLeft: `1px solid ${theme.borderMid}`,
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <ColorPalette
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            theme={theme}
            themeMode={themeMode}
            onThemeModeChange={setThemeMode}
          />
        </aside>
      </div>

      {/* Status bar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: "2px 4px",
          borderTop: `1px solid ${theme.borderLight}`,
        }}
      >
        <div
          style={{
            flex: 1,
            ...inset,
            borderWidth: 1,
            padding: "2px 6px",
            fontSize: 14,
            color: theme.text,
          }}
        >
          {grid.gridW} &times; {grid.gridH} pixels &middot; Brush: {brushSize}px
        </div>
        <div
          style={{
            width: 140,
            ...inset,
            borderWidth: 1,
            padding: "2px 6px",
            fontSize: 14,
            color: theme.text,
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
