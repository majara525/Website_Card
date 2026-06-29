export type Corner = {
  x: number;
  y: number;
};

export type ScanPage = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
  width: number;
  height: number;
};

export type SavedScan = {
  id: string;
  fileName: string;
  createdAt: string;
  pageCount: number;
  blob: Blob;
};

export type EnhancementSettings = {
  brightness: number;
  contrast: number;
};
