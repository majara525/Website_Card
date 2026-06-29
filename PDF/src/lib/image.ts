import type { Corner, EnhancementSettings } from "../types/scanner";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("تعذر تحميل الصورة."));
    img.src = src;
  });
}

export async function getImageSize(dataUrl: string) {
  const img = await loadImage(dataUrl);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

export async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function drawToDataUrl(
  source: string,
  transform?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, image: HTMLImageElement) => void
) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("تعذر تجهيز مساحة المعالجة.");
  ctx.drawImage(image, 0, 0);
  transform?.(ctx, canvas, image);
  return canvas.toDataURL("image/jpeg", 0.88);
}

export async function enhanceImage(source: string, settings: EnhancementSettings) {
  return drawToDataUrl(source, (ctx, canvas) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const brightness = settings.brightness;
    const contrast = settings.contrast;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(factor * (data[i] - 128) + 128 + brightness);
      data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128 + brightness);
      data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128 + brightness);
    }

    ctx.putImageData(imageData, 0, 0);
  });
}

export async function autoEnhanceImage(source: string) {
  return enhanceImage(source, { brightness: 12, contrast: 42 });
}

export async function rotateImage(source: string, degrees: 90 | -90) {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر تدوير الصورة.");

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export async function cropByCorners(source: string, corners: Corner[]) {
  const image = await loadImage(source);
  const minX = Math.max(0, Math.min(...corners.map((point) => point.x)));
  const minY = Math.max(0, Math.min(...corners.map((point) => point.y)));
  const maxX = Math.min(image.naturalWidth, Math.max(...corners.map((point) => point.x)));
  const maxY = Math.min(image.naturalHeight, Math.max(...corners.map((point) => point.y)));

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر قص الصورة.");
  ctx.drawImage(image, minX, minY, width, height, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function defaultCorners(width: number, height: number): Corner[] {
  const marginX = width * 0.06;
  const marginY = height * 0.06;
  return [
    { x: marginX, y: marginY },
    { x: width - marginX, y: marginY },
    { x: width - marginX, y: height - marginY },
    { x: marginX, y: height - marginY }
  ];
}

function clamp(value: number) {
  return Math.max(0, Math.min(255, value));
}
