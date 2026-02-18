import { hexToArgb } from "./color";

const PALETTE_HEX = [
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#808040", "#004040",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80", "#00ff80",
];

export const PALETTE_COLORS: number[] = PALETTE_HEX.map(hexToArgb);
