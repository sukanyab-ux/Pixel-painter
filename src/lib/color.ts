/** Pack RGBA into ARGB Uint32: 0xAARRGGBB */
export const packColor = (r: number, g: number, b: number, a = 255): number => {
  return ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
};

/** Unpack ARGB Uint32 into { r, g, b, a } */
export const unpackColor = (argb: number): { r: number; g: number; b: number; a: number } => {
  return {
    a: (argb >>> 24) & 0xff,
    r: (argb >>> 16) & 0xff,
    g: (argb >>> 8) & 0xff,
    b: argb & 0xff,
  };
};

/** Convert ARGB Uint32 to CSS rgba string */
export const argbToCss = (argb: number): string => {
  const { r, g, b, a } = unpackColor(argb);
  return `rgba(${r},${g},${b},${a / 255})`;
};

/** Convert CSS hex (#RRGGBB or #RGB) to ARGB Uint32 */
export const hexToArgb = (hex: string): number => {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return packColor(r, g, b, 255);
};

/** Convert ARGB Uint32 to hex #RRGGBB */
export const argbToHex = (argb: number): string => {
  const { r, g, b } = unpackColor(argb);
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
};
