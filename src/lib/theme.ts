export type Theme = {
  bg: string;
  bgAlt: string;
  bgActive: string;
  text: string;
  borderLight: string;
  borderDark: string;
  borderMid: string;
  canvasBg: string;
  titleBarGradient: string;
  titleBtnBg: string;
  selectBg: string;
  groupBorder: string;
  groupLabelBg: string;
  swatchBorder: string;
  swatchSelectedBorder: string;
  swatchOutline: string;
};

export const lightTheme: Theme = {
  bg: "#c0c0c0",
  bgAlt: "#c0c0c0",
  bgActive: "#a0a0a0",
  text: "#000",
  borderLight: "#fff",
  borderDark: "#404040",
  borderMid: "#808080",
  canvasBg: "#808080",
  titleBarGradient: "linear-gradient(90deg, #000080, #1084d0)",
  titleBtnBg: "#c0c0c0",
  selectBg: "#fff",
  groupBorder: "#808080",
  groupLabelBg: "#c0c0c0",
  swatchBorder: "#808080",
  swatchSelectedBorder: "#fff",
  swatchOutline: "#000",
};

export const darkTheme: Theme = {
  bg: "#1e1e1e",
  bgAlt: "#2a2a2a",
  bgActive: "#444",
  text: "#e0e0e0",
  borderLight: "#555",
  borderDark: "#000",
  borderMid: "#333",
  canvasBg: "#111",
  titleBarGradient: "linear-gradient(90deg, #1a1a2e, #16213e)",
  titleBtnBg: "#333",
  selectBg: "#2a2a2a",
  groupBorder: "#444",
  groupLabelBg: "#1e1e1e",
  swatchBorder: "#555",
  swatchSelectedBorder: "#fff",
  swatchOutline: "#ccc",
};
