import cv from "@techstark/opencv-js";
import type { Corner } from "../types/scanner";
import { loadImage } from "./image";

let readyPromise: Promise<any> | null = null;

export function loadOpenCv() {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve) => {
    if (cv?.Mat) {
      resolve(cv);
      return;
    }

    cv.onRuntimeInitialized = () => resolve(cv);
  });

  return readyPromise;
}

export async function detectAndCorrectDocument(dataUrl: string) {
  const openCv = await loadOpenCv();
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر فتح الصورة للمعالجة.");
  ctx.drawImage(image, 0, 0);

  const src = openCv.imread(canvas);
  const maxWidth = 1800;
  const scale = src.cols > maxWidth ? maxWidth / src.cols : 1;
  const working = new openCv.Mat();
  openCv.resize(src, working, new openCv.Size(Math.round(src.cols * scale), Math.round(src.rows * scale)));

  const gray = new openCv.Mat();
  const blurred = new openCv.Mat();
  const edges = new openCv.Mat();
  const contours = new openCv.MatVector();
  const hierarchy = new openCv.Mat();

  try {
    openCv.cvtColor(working, gray, openCv.COLOR_RGBA2GRAY);
    openCv.GaussianBlur(gray, blurred, new openCv.Size(5, 5), 0);
    openCv.Canny(blurred, edges, 60, 180);
    openCv.findContours(edges, contours, hierarchy, openCv.RETR_LIST, openCv.CHAIN_APPROX_SIMPLE);

    const corners = findDocumentCorners(openCv, contours, scale, src.cols, src.rows);
    if (!corners) return dataUrl;
    return perspectiveTransform(openCv, src, corners);
  } finally {
    src.delete();
    working.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
  }
}

function findDocumentCorners(openCv: any, contours: any, scale: number, width: number, height: number): Corner[] | null {
  let bestArea = 0;
  let bestCorners: Corner[] | null = null;

  for (let i = 0; i < contours.size(); i += 1) {
    const contour = contours.get(i);
    const perimeter = openCv.arcLength(contour, true);
    const approx = new openCv.Mat();
    openCv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

    if (approx.rows === 4) {
      const area = Math.abs(openCv.contourArea(approx));
      if (area > bestArea) {
        const points: Corner[] = [];
        for (let row = 0; row < 4; row += 1) {
          points.push({
            x: approx.intPtr(row, 0)[0] / scale,
            y: approx.intPtr(row, 0)[1] / scale
          });
        }

        if (area > width * height * scale * scale * 0.12) {
          bestArea = area;
          bestCorners = orderCorners(points);
        }
      }
    }

    approx.delete();
    contour.delete();
  }

  return bestCorners;
}

function perspectiveTransform(openCv: any, src: any, corners: Corner[]) {
  const [tl, tr, br, bl] = corners;
  const widthA = distance(br, bl);
  const widthB = distance(tr, tl);
  const heightA = distance(tr, br);
  const heightB = distance(tl, bl);
  const maxWidth = Math.max(widthA, widthB);
  const maxHeight = Math.max(heightA, heightB);

  const srcTri = openCv.matFromArray(4, 1, openCv.CV_32FC2, [
    tl.x, tl.y,
    tr.x, tr.y,
    br.x, br.y,
    bl.x, bl.y
  ]);
  const dstTri = openCv.matFromArray(4, 1, openCv.CV_32FC2, [
    0, 0,
    maxWidth - 1, 0,
    maxWidth - 1, maxHeight - 1,
    0, maxHeight - 1
  ]);

  const dst = new openCv.Mat();
  const matrix = openCv.getPerspectiveTransform(srcTri, dstTri);
  openCv.warpPerspective(src, dst, matrix, new openCv.Size(maxWidth, maxHeight), openCv.INTER_LINEAR, openCv.BORDER_CONSTANT, new openCv.Scalar());

  const out = document.createElement("canvas");
  out.width = maxWidth;
  out.height = maxHeight;
  openCv.imshow(out, dst);
  const result = out.toDataURL("image/jpeg", 0.92);

  srcTri.delete();
  dstTri.delete();
  dst.delete();
  matrix.delete();
  return result;
}

function orderCorners(points: Corner[]): Corner[] {
  const sorted = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const tl = sorted[0];
  const br = sorted[3];
  const remaining = [sorted[1], sorted[2]].sort((a, b) => a.y - b.y);
  const [tr, bl] = remaining[0].x > remaining[1].x ? [remaining[0], remaining[1]] : [remaining[1], remaining[0]];
  return [tl, tr, br, bl];
}

function distance(a: Corner, b: Corner) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
