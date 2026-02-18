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

export const outlineImageToGrid = async (
  file: File,
  gridW: number
): Promise<PixelateResult> => {
  const img = await loadImage(file);

  const clampedW = clampDim(gridW);
  const aspect = img.height / img.width;
  const clampedH = clampDim(clampedW * aspect);

  // Run edge detection at a higher resolution for better results,
  // then downsample the edge map to the target grid size.
  const SCALE = 8;
  const hiW = clampedW * SCALE;
  const hiH = clampedH * SCALE;

  const hiCanvas = document.createElement("canvas");
  hiCanvas.width = hiW;
  hiCanvas.height = hiH;
  const hiCtx = hiCanvas.getContext("2d")!;
  hiCtx.imageSmoothingEnabled = true;
  hiCtx.imageSmoothingQuality = "high";
  hiCtx.drawImage(img, 0, 0, hiW, hiH);

  const hiData = hiCtx.getImageData(0, 0, hiW, hiH).data;

  const gray = new Float32Array(hiW * hiH);
  for (let i = 0; i < gray.length; i++) {
    const off = i * 4;
    gray[i] = 0.299 * hiData[off] + 0.587 * hiData[off + 1] + 0.114 * hiData[off + 2];
  }

  // Sobel on the high-res grayscale
  const edgeMag = new Float32Array(hiW * hiH);
  for (let y = 1; y < hiH - 1; y++) {
    for (let x = 1; x < hiW - 1; x++) {
      const tl = gray[(y - 1) * hiW + (x - 1)];
      const tc = gray[(y - 1) * hiW + x];
      const tr = gray[(y - 1) * hiW + (x + 1)];
      const ml = gray[y * hiW + (x - 1)];
      const mr = gray[y * hiW + (x + 1)];
      const bl = gray[(y + 1) * hiW + (x - 1)];
      const bc = gray[(y + 1) * hiW + x];
      const br = gray[(y + 1) * hiW + (x + 1)];

      const gx = -tl + tr - 2 * ml + 2 * mr - bl + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
      edgeMag[y * hiW + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Downsample: if any hi-res pixel in a cell block exceeds threshold, mark as edge
  const WHITE = packColor(255, 255, 255, 255);
  const BLACK = packColor(0, 0, 0, 255);
  const THRESHOLD = 40;
  const colors = new Uint32Array(clampedW * clampedH);
  colors.fill(WHITE);

  for (let cy = 0; cy < clampedH; cy++) {
    for (let cx = 0; cx < clampedW; cx++) {
      let maxMag = 0;
      const startY = cy * SCALE;
      const startX = cx * SCALE;
      for (let sy = startY; sy < startY + SCALE && sy < hiH; sy++) {
        for (let sx = startX; sx < startX + SCALE && sx < hiW; sx++) {
          const m = edgeMag[sy * hiW + sx];
          if (m > maxMag) maxMag = m;
        }
      }
      if (maxMag > THRESHOLD) {
        colors[cy * clampedW + cx] = BLACK;
      }
    }
  }

  return { gridW: clampedW, gridH: clampedH, colors };
};
