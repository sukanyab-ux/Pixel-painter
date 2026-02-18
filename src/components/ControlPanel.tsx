"use client";

import { useRef } from "react";
import type { Theme } from "@/lib/theme";

const SAMPLE_IMAGES = [
  { src: "/samples/groww-logo.png", label: "Logo" },
  { src: "/samples/no-face.png", label: "No Face" },
  { src: "/samples/jiji-cat.png", label: "Jiji" },
  { src: "/samples/wave.png", label: "Wave" },
  { src: "/samples/last-supper.png", label: "Painting" },
];

type ControlPanelProps = {
  gridW: number;
  onGridWChange: (w: number) => void;
  cellSize: number;
  onCellSizeChange: (size: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  exportScale: number;
  onExportScaleChange: (scale: number) => void;
  onUploadImage: (file: File) => void;
  onSelectSampleImage: (url: string) => void;
  onRePixelate: () => void;
  onExportPng: () => void;
  onUndo: () => void;
  hasImage: boolean;
  canUndo: boolean;
  activeTool: "paint" | "eyedropper";
  onToolChange: (tool: "paint" | "eyedropper") => void;
  imageMode: "pixel" | "outline";
  onImageModeChange: (mode: "pixel" | "outline") => void;
  theme: Theme;
};

const EXPORT_SCALES = [8, 12, 16, 24, 32];

const ControlPanel = ({
  gridW,
  onGridWChange,
  cellSize,
  onCellSizeChange,
  showGrid,
  onToggleGrid,
  brushSize,
  onBrushSizeChange,
  exportScale,
  onExportScaleChange,
  onUploadImage,
  onSelectSampleImage,
  onRePixelate,
  onExportPng,
  onUndo,
  hasImage,
  canUndo,
  activeTool,
  onToolChange,
  imageMode,
  onImageModeChange,
  theme: t,
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const outset: React.CSSProperties = {
    borderTop: `2px solid ${t.borderLight}`,
    borderLeft: `2px solid ${t.borderLight}`,
    borderBottom: `2px solid ${t.borderDark}`,
    borderRight: `2px solid ${t.borderDark}`,
  };

  const insetBorder: React.CSSProperties = {
    borderTop: `1px solid ${t.borderMid}`,
    borderLeft: `1px solid ${t.borderMid}`,
    borderBottom: `1px solid ${t.borderLight}`,
    borderRight: `1px solid ${t.borderLight}`,
  };

  const btnStyle: React.CSSProperties = {
    padding: "3px 12px",
    backgroundColor: t.bg,
    ...outset,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 400,
    textAlign: "center",
    color: t.text,
    minWidth: 0,
  };

  const groupBoxStyle: React.CSSProperties = {
    border: `1px solid ${t.groupBorder}`,
    padding: "10px 8px 8px",
    position: "relative",
    marginTop: 0,
  };

  const groupLabelStyle: React.CSSProperties = {
    position: "absolute",
    top: -7,
    left: 8,
    backgroundColor: t.groupLabelBg,
    padding: "0 4px",
    fontSize: 14,
    color: t.text,
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    fontSize: 14,
    color: t.text,
  };

  const selectStyle: React.CSSProperties = {
    padding: "2px 4px",
    backgroundColor: t.selectBg,
    color: t.text,
    fontSize: 14,
    ...insetBorder,
  };

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    ...btnStyle,
    flex: 1,
    whiteSpace: "nowrap",
    padding: "3px 4px",
    borderTop: active ? `2px solid ${t.borderDark}` : `2px solid ${t.borderLight}`,
    borderLeft: active ? `2px solid ${t.borderDark}` : `2px solid ${t.borderLight}`,
    borderBottom: active ? `2px solid ${t.borderLight}` : `2px solid ${t.borderDark}`,
    borderRight: active ? `2px solid ${t.borderLight}` : `2px solid ${t.borderDark}`,
    backgroundColor: active ? t.bgActive : t.bg,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Image group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Image</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            aria-label="Upload image file"
          />
          <button
            style={btnStyle}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload image"
            tabIndex={0}
          >
            Upload Image...
          </button>

          {/* Sample images rail */}
          <div
            style={{
              display: "flex",
              gap: 4,
              overflowX: "auto",
              paddingBottom: 2,
            }}
          >
            {SAMPLE_IMAGES.map((img) => (
              <button
                key={img.src}
                onClick={() => onSelectSampleImage(img.src)}
                aria-label={`Load sample: ${img.label}`}
                tabIndex={0}
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  padding: 0,
                  cursor: "pointer",
                  borderTop: `1px solid ${t.borderMid}`,
                  borderLeft: `1px solid ${t.borderMid}`,
                  borderBottom: `1px solid ${t.borderLight}`,
                  borderRight: `1px solid ${t.borderLight}`,
                  borderRadius: 0,
                  overflow: "hidden",
                  backgroundColor: t.bg,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button
              style={toggleBtn(imageMode === "pixel")}
              onClick={() => onImageModeChange("pixel")}
              aria-label="Pixel mode"
              tabIndex={0}
            >
              Pixel
            </button>
            <button
              style={toggleBtn(imageMode === "outline")}
              onClick={() => onImageModeChange("outline")}
              aria-label="Outline mode"
              tabIndex={0}
            >
              Outline
            </button>
          </div>

          {hasImage && (
            <button
              style={btnStyle}
              onClick={onRePixelate}
              aria-label="Re-pixelate uploaded image"
              tabIndex={0}
            >
              Re-pixelate
            </button>
          )}
        </div>
      </div>

      {/* Tools group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Tools</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={toggleBtn(activeTool === "paint")}
            onClick={() => onToolChange("paint")}
            aria-label="Paint tool"
            tabIndex={0}
          >
            ✏️ Paint (P)
          </button>
          <button
            style={toggleBtn(activeTool === "eyedropper")}
            onClick={() => onToolChange("eyedropper")}
            aria-label="Eyedropper tool (V)"
            tabIndex={0}
          >
            👁️ Picker (V)
          </button>
        </div>
      </div>

      {/* Canvas group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Canvas</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>
            Resolution: {gridW}
            <input
              type="range"
              min={16}
              max={128}
              step={8}
              value={gridW}
              onChange={(e) => onGridWChange(Number(e.target.value))}
              aria-label="Grid resolution"
            />
          </label>

          <label style={labelStyle}>
            Zoom: {cellSize}px
            <input
              type="range"
              min={2}
              max={32}
              step={1}
              value={cellSize}
              onChange={(e) => onCellSizeChange(Number(e.target.value))}
              aria-label="Zoom level"
            />
          </label>

          <label style={labelStyle}>
            Brush: {brushSize}px
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              aria-label="Brush size"
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              cursor: "pointer",
              color: t.text,
            }}
          >
            <input
              type="checkbox"
              checked={showGrid}
              onChange={onToggleGrid}
              aria-label="Toggle grid lines"
            />
            Grid lines
          </label>

          <button
            style={{
              ...btnStyle,
              opacity: canUndo ? 1 : 0.5,
            }}
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo last stroke"
            tabIndex={0}
          >
            Undo (Ctrl+Z)
          </button>
        </div>
      </div>

      {/* Export group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Export</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>
            Scale:
            <select
              value={exportScale}
              onChange={(e) => onExportScaleChange(Number(e.target.value))}
              style={selectStyle}
              aria-label="Export scale"
            >
              {EXPORT_SCALES.map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>

          <button
            style={btnStyle}
            onClick={onExportPng}
            aria-label="Export as PNG"
            tabIndex={0}
          >
            Save As PNG...
          </button>
        </div>
      </div>

      {/* Instructions group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Instructions</span>
        <ol
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 14,
            color: t.text,
            lineHeight: 1.6,
            listStyleType: "decimal",
          }}
        >
          <li>Upload any image you want to pixel paint</li>
          <li>Use &apos;V&apos; to pick a color from the image, and click to paint</li>
          <li>Drag around to paint</li>
          <li>&quot;Save as PNG&quot; ✨</li>
        </ol>
      </div>
    </div>
  );
};

export default ControlPanel;
