export type GridState = {
  gridW: number;
  gridH: number;
  colors: Uint32Array;
};

export type StrokeDiff = {
  idx: number;
  before: number;
  after: number;
};

export type Stroke = {
  diffs: StrokeDiff[];
};

export type PixelateResult = {
  gridW: number;
  gridH: number;
  colors: Uint32Array;
};

export type ExportOptions = {
  gridW: number;
  gridH: number;
  colors: Uint32Array;
  scale: number;
  paintedCells?: Set<number>;
};
