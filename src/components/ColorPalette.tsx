"use client";

import { useRef } from "react";
import { PALETTE_COLORS } from "@/lib/palette";
import { argbToCss, argbToHex, hexToArgb } from "@/lib/color";
import type { Theme } from "@/lib/theme";

type ColorPaletteProps = {
  selectedColor: number;
  onSelectColor: (color: number) => void;
  theme: Theme;
  themeMode: "light" | "dark";
  onThemeModeChange: (mode: "light" | "dark") => void;
};

const ColorPalette = ({
  selectedColor,
  onSelectColor,
  theme: t,
  themeMode,
  onThemeModeChange,
}: ColorPaletteProps) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectColor(hexToArgb(e.target.value));
  };

  const handlePreviewClick = () => {
    colorInputRef.current?.click();
  };

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    padding: "3px 8px",
    backgroundColor: active ? t.bgActive : t.bg,
    borderTop: active ? `2px solid ${t.borderDark}` : `2px solid ${t.borderLight}`,
    borderLeft: active ? `2px solid ${t.borderDark}` : `2px solid ${t.borderLight}`,
    borderBottom: active ? `2px solid ${t.borderLight}` : `2px solid ${t.borderDark}`,
    borderRight: active ? `2px solid ${t.borderLight}` : `2px solid ${t.borderDark}`,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 400,
    color: t.text,
    flex: 1,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Hidden native color picker */}
      <input
        ref={colorInputRef}
        type="color"
        value={argbToHex(selectedColor)}
        onChange={handleColorInputChange}
        style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
        aria-label="Pick a custom color"
        tabIndex={-1}
      />

      {/* Selected color preview — click to open color picker */}
      <div
        style={{
          position: "relative",
          width: 36,
          height: 36,
          alignSelf: "center",
          cursor: "pointer",
        }}
        onClick={handlePreviewClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePreviewClick(); }}
        tabIndex={0}
        role="button"
        aria-label={`Selected color: ${argbToHex(selectedColor)}. Click to pick a custom color.`}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 24,
            height: 24,
            backgroundColor: t.selectBg,
            borderTop: `1px solid ${t.borderMid}`,
            borderLeft: `1px solid ${t.borderMid}`,
            borderBottom: `1px solid ${t.borderLight}`,
            borderRight: `1px solid ${t.borderLight}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 24,
            height: 24,
            backgroundColor: argbToCss(selectedColor),
            borderTop: `1px solid ${t.borderMid}`,
            borderLeft: `1px solid ${t.borderMid}`,
            borderBottom: `1px solid ${t.borderLight}`,
            borderRight: `1px solid ${t.borderLight}`,
          }}
        />
      </div>

      {/* Color swatch grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2,
          borderTop: `1px solid ${t.swatchBorder}`,
          borderLeft: `1px solid ${t.swatchBorder}`,
          borderBottom: `1px solid ${t.borderLight}`,
          borderRight: `1px solid ${t.borderLight}`,
          padding: 3,
          backgroundColor: t.bg,
        }}
      >
        {PALETTE_COLORS.map((color, i) => {
          const isSelected = color === selectedColor;
          return (
            <button
              key={i}
              onClick={() => onSelectColor(color)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectColor(color);
              }}
              tabIndex={0}
              aria-label={`Color ${argbToHex(color)}`}
              style={{
                width: 28,
                height: 28,
                backgroundColor: argbToCss(color),
                border: isSelected
                  ? `2px solid ${t.swatchSelectedBorder}`
                  : `1px solid ${t.swatchBorder}`,
                outline: isSelected ? `1px dotted ${t.swatchOutline}` : "none",
                outlineOffset: 1,
                borderRadius: 0,
                cursor: "pointer",
                padding: 0,
                boxSizing: "border-box",
              }}
            />
          );
        })}
      </div>

      {/* Theme toggle */}
      <div
        style={{
          border: `1px solid ${t.groupBorder}`,
          padding: "10px 8px 8px",
          position: "relative",
          marginTop: 6,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: -7,
            left: 8,
            backgroundColor: t.groupLabelBg,
            padding: "0 4px",
            fontSize: 14,
            color: t.text,
          }}
        >
          Theme
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            style={toggleBtn(themeMode === "light")}
            onClick={() => onThemeModeChange("light")}
            aria-label="Light mode"
            tabIndex={0}
          >
            ☀️ Light
          </button>
          <button
            style={toggleBtn(themeMode === "dark")}
            onClick={() => onThemeModeChange("dark")}
            aria-label="Dark mode"
            tabIndex={0}
          >
            🌙 Dark
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
