import type { PixelateResult } from "./types";
import { packColor } from "./color";

const MAX_GRID_DIM = 256;
const MIN_GRID_DIM = 8;

const clampDim = (v: number): number => Math.max(MIN_GRID_DIM, Math.min(MAX_GRID_DIM, Math.round(v)));

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
};

export const pixelateImageToGrid = async (
  file: File,
  gridW: number
): Promise<PixelateResult> => {
  const img = await loadImage(file);

  const clampedW = clampDim(gridW);
  const aspect = img.height / img.width;
  const clampedH = clampDim(clampedW * aspect);

  const canvas = document.createElement("canvas");
  canvas.width = clampedW;
  canvas.height = clampedH;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "medium";
  ctx.drawImage(img, 0, 0, clampedW, clampedH);

  const imageData = ctx.getImageData(0, 0, clampedW, clampedH);
  const data = imageData.data;
  const colors = new Uint32Array(clampedW * clampedH);

  for (let i = 0; i < colors.length; i++) {
    const offset = i * 4;
    colors[i] = packColor(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
  }

  return { gridW: clampedW, gridH: clampedH, colors };
};
