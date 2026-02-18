"use client";

import { PALETTE_COLORS } from "@/lib/palette";
import { argbToCss, argbToHex } from "@/lib/color";

type ColorPaletteProps = {
  selectedColor: number;
  onSelectColor: (color: number) => void;
};

const ColorPalette = ({ selectedColor, onSelectColor }: ColorPaletteProps) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Selected color preview - large + small like MS Paint */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 30,
            height: 30,
          }}
        >
          {/* Background (secondary) color */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              backgroundColor: "#fff",
              borderTop: "1px solid #808080",
              borderLeft: "1px solid #808080",
              borderBottom: "1px solid #fff",
              borderRight: "1px solid #fff",
            }}
          />
          {/* Foreground (selected) color */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 20,
              height: 20,
              backgroundColor: argbToCss(selectedColor),
              borderTop: "1px solid #808080",
              borderLeft: "1px solid #808080",
              borderBottom: "1px solid #fff",
              borderRight: "1px solid #fff",
            }}
            aria-label={`Selected color: ${argbToHex(selectedColor)}`}
          />
        </div>
      </div>

      {/* Color swatch grid - 2 rows like MS Paint */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: "repeat(2, 1fr)",
          gridAutoFlow: "column",
          gap: 1,
          borderTop: "1px solid #808080",
          borderLeft: "1px solid #808080",
          borderBottom: "1px solid #fff",
          borderRight: "1px solid #fff",
          padding: 2,
          backgroundColor: "#c0c0c0",
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
                width: 16,
                height: 16,
                backgroundColor: argbToCss(color),
                border: isSelected
                  ? "1px solid #fff"
                  : "1px solid #808080",
                outline: isSelected ? "1px dotted #000" : "none",
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
    </div>
  );
};

export default ColorPalette;
