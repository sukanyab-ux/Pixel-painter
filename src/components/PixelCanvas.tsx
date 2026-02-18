"use client";

import { useRef, useEffect, useCallback } from "react";
import type { GridState, Stroke, StrokeDiff } from "@/lib/types";
import { unpackColor, packColor } from "@/lib/color";

const WHITE = packColor(255, 255, 255, 255);

type PixelCanvasProps = {
  grid: GridState;
  cellSize: number;
  showGrid: boolean;
  selectedColor: number;
  activeTool: "paint" | "eyedropper" | "eraser";
  paintedCells: Set<number>;
  hasImage: boolean;
  brushSize: number;
  onPaint: (idx: number, color: number) => void;
  onErase: (idx: number) => void;
  onStrokeEnd: (stroke: Stroke) => void;
  onEyedrop: (color: number) => void;
};

const PixelCanvas = ({
  grid,
  cellSize,
  showGrid,
  selectedColor,
  activeTool,
  paintedCells,
  hasImage,
  brushSize,
  onPaint,
  onErase,
  onStrokeEnd,
  onEyedrop,
}: PixelCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const currentStrokeRef = useRef<StrokeDiff[]>([]);
  const strokePaintedRef = useRef<Set<number>>(new Set());

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { gridW, gridH, colors } = grid;
    const w = gridW * cellSize;
    const h = gridH * cellSize;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    if (hasImage && paintedCells.size > 0) {
      ctx.globalAlpha = 0.45;
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const idx = y * gridW + x;
          if (paintedCells.has(idx)) continue;
          const argb = colors[idx];
          const { r, g, b, a } = unpackColor(argb);
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }

      ctx.globalAlpha = 1.0;
      for (const idx of paintedCells) {
        const x = idx % gridW;
        const y = Math.floor(idx / gridW);
        const argb = colors[idx];
        const { r, g, b, a } = unpackColor(argb);
        ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    } else {
      const alpha = hasImage ? 0.45 : 1.0;
      ctx.globalAlpha = alpha;
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const argb = colors[y * gridW + x];
          const { r, g, b, a } = unpackColor(argb);
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    if (showGrid && cellSize >= 4) {
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= gridW; x++) {
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, h);
      }
      for (let y = 0; y <= gridH; y++) {
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(w, y * cellSize);
      }
      ctx.stroke();
    }
  }, [grid, cellSize, showGrid, paintedCells, hasImage]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const getCellFromEvent = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number; idx: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const x = Math.floor(px / cellSize);
      const y = Math.floor(py / cellSize);
      if (x < 0 || x >= grid.gridW || y < 0 || y >= grid.gridH) return null;
      return { x, y, idx: y * grid.gridW + x };
    },
    [cellSize, grid.gridW, grid.gridH]
  );

  const paintSingleCell = useCallback(
    (idx: number) => {
      if (strokePaintedRef.current.has(idx)) return;
      const before = grid.colors[idx];
      if (before === selectedColor && paintedCells.has(idx)) return;

      strokePaintedRef.current.add(idx);
      currentStrokeRef.current.push({ idx, before, after: selectedColor });
      onPaint(idx, selectedColor);
    },
    [grid.colors, selectedColor, onPaint, paintedCells]
  );

  const eraseSingleCell = useCallback(
    (idx: number) => {
      if (strokePaintedRef.current.has(idx)) return;
      if (!paintedCells.has(idx)) return;

      const before = grid.colors[idx];
      strokePaintedRef.current.add(idx);
      currentStrokeRef.current.push({ idx, before, after: before });
      onErase(idx);
    },
    [grid.colors, paintedCells, onErase]
  );

  const paintBlock = useCallback(
    (centerX: number, centerY: number) => {
      const half = Math.floor(brushSize / 2);
      for (let dy = -half; dy < brushSize - half; dy++) {
        for (let dx = -half; dx < brushSize - half; dx++) {
          const nx = centerX + dx;
          const ny = centerY + dy;
          if (nx < 0 || nx >= grid.gridW || ny < 0 || ny >= grid.gridH) continue;
          const cellIdx = ny * grid.gridW + nx;
          if (activeTool === "eraser") {
            eraseSingleCell(cellIdx);
          } else {
            paintSingleCell(cellIdx);
          }
        }
      }
    },
    [brushSize, grid.gridW, grid.gridH, paintSingleCell, eraseSingleCell, activeTool]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== null) return;

      const cell = getCellFromEvent(e);
      if (!cell) return;

      if (activeTool === "eyedropper") {
        onEyedrop(grid.colors[cell.idx]);
        return;
      }


      activePointerRef.current = e.pointerId;
      currentStrokeRef.current = [];
      strokePaintedRef.current.clear();

      const canvas = canvasRef.current;
      if (canvas) canvas.setPointerCapture(e.pointerId);

      paintBlock(cell.x, cell.y);
    },
    [getCellFromEvent, paintBlock, activeTool, onEyedrop, grid.colors]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== e.pointerId) return;
      const cell = getCellFromEvent(e);
      if (cell) paintBlock(cell.x, cell.y);
    },
    [getCellFromEvent, paintBlock]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== e.pointerId) return;
      activePointerRef.current = null;

      if (currentStrokeRef.current.length > 0) {
        onStrokeEnd({ diffs: [...currentStrokeRef.current] });
      }
      currentStrokeRef.current = [];
      strokePaintedRef.current.clear();
    },
    [onStrokeEnd]
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== e.pointerId) return;
      activePointerRef.current = null;
      currentStrokeRef.current = [];
      strokePaintedRef.current.clear();
    },
    []
  );

  const cursor = activeTool === "eyedropper" ? "copy" : activeTool === "eraser" ? "cell" : "crosshair";

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        cursor,
        imageRendering: "pixelated",
        touchAction: "none",
        backgroundColor: "#fff",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-label="Pixel painting canvas"
      role="img"
      tabIndex={0}
    />
  );
};

export default PixelCanvas;
