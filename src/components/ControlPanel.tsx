"use client";

import { useRef } from "react";

type ControlPanelProps = {
  gridW: number;
  onGridWChange: (w: number) => void;
  cellSize: number;
  onCellSizeChange: (size: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  exportScale: number;
  onExportScaleChange: (scale: number) => void;
  onUploadImage: (file: File) => void;
  onRePixelate: () => void;
  onExportPng: () => void;
  onUndo: () => void;
  hasImage: boolean;
  canUndo: boolean;
  activeTool: "paint" | "eyedropper";
  onToolChange: (tool: "paint" | "eyedropper") => void;
};

const EXPORT_SCALES = [8, 12, 16, 24, 32];

const win95Outset: React.CSSProperties = {
  borderTop: "2px solid #fff",
  borderLeft: "2px solid #fff",
  borderBottom: "2px solid #404040",
  borderRight: "2px solid #404040",
};

const win95Inset: React.CSSProperties = {
  borderTop: "1px solid #808080",
  borderLeft: "1px solid #808080",
  borderBottom: "1px solid #fff",
  borderRight: "1px solid #fff",
};

const btnStyle: React.CSSProperties = {
  padding: "3px 12px",
  backgroundColor: "#c0c0c0",
  ...win95Outset,
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 400,
  textAlign: "center",
  color: "#000",
  minWidth: 0,
};

const groupBoxStyle: React.CSSProperties = {
  border: "1px solid #808080",
  padding: "10px 8px 8px",
  position: "relative",
  marginTop: 6,
};

const groupLabelStyle: React.CSSProperties = {
  position: "absolute",
  top: -7,
  left: 8,
  backgroundColor: "#c0c0c0",
  padding: "0 4px",
  fontSize: 11,
  color: "#000",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
  fontSize: 11,
  color: "#000",
};

const selectStyle: React.CSSProperties = {
  padding: "2px 4px",
  backgroundColor: "#fff",
  color: "#000",
  fontSize: 11,
  ...win95Inset,
};

const ControlPanel = ({
  gridW,
  onGridWChange,
  cellSize,
  onCellSizeChange,
  showGrid,
  onToggleGrid,
  exportScale,
  onExportScaleChange,
  onUploadImage,
  onRePixelate,
  onExportPng,
  onUndo,
  hasImage,
  canUndo,
  activeTool,
  onToolChange,
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Tools group */}
      <div style={groupBoxStyle}>
        <span style={groupLabelStyle}>Tools</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={{
              ...btnStyle,
              flex: 1,
              whiteSpace: "nowrap",
              borderTop: activeTool === "paint" ? "2px solid #404040" : "2px solid #fff",
              borderLeft: activeTool === "paint" ? "2px solid #404040" : "2px solid #fff",
              borderBottom: activeTool === "paint" ? "2px solid #fff" : "2px solid #404040",
              borderRight: activeTool === "paint" ? "2px solid #fff" : "2px solid #404040",
              backgroundColor: activeTool === "paint" ? "#a0a0a0" : "#c0c0c0",
            }}
            onClick={() => onToolChange("paint")}
            aria-label="Paint tool"
            tabIndex={0}
          >
            &#9999;&#65039; Paint (P)
          </button>
          <button
            style={{
              ...btnStyle,
              flex: 1,
              whiteSpace: "nowrap",
              borderTop: activeTool === "eyedropper" ? "2px solid #404040" : "2px solid #fff",
              borderLeft: activeTool === "eyedropper" ? "2px solid #404040" : "2px solid #fff",
              borderBottom: activeTool === "eyedropper" ? "2px solid #fff" : "2px solid #404040",
              borderRight: activeTool === "eyedropper" ? "2px solid #fff" : "2px solid #404040",
              backgroundColor: activeTool === "eyedropper" ? "#a0a0a0" : "#c0c0c0",
            }}
            onClick={() => onToolChange("eyedropper")}
            aria-label="Eyedropper tool (V)"
            tabIndex={0}
          >
            &#128065; Picker (V)
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

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              cursor: "pointer",
              color: "#000",
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
      <div style={{ ...groupBoxStyle, marginTop: 10 }}>
        <span style={groupLabelStyle}>Instructions</span>
        <ol
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 11,
            color: "#000",
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
