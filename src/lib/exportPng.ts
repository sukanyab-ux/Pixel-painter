import type { ExportOptions } from "./types";
import { unpackColor } from "./color";

export const exportGridAsPNG = ({ gridW, gridH, colors, scale, paintedCells }: ExportOptions): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = gridW * scale;
    canvas.height = gridH * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Cannot get 2d context"));

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (paintedCells) {
      for (const idx of paintedCells) {
        const x = idx % gridW;
        const y = Math.floor(idx / gridW);
        const argb = colors[idx];
        const { r, g, b, a } = unpackColor(argb);
        ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    } else {
      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const argb = colors[y * gridW + x];
          const { r, g, b, a } = unpackColor(argb);
          ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create PNG blob"));
    }, "image/png");
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
