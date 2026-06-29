import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ScanPage } from "../types/scanner";
import { dataUrlToBlob } from "./image";
import { formatArabicDate } from "./date";

const BRAND_TEXT = "تم إنشاؤه بواسطة المعهد العالي - شبكة كلّيات قُطرية";

export async function createPdfBlob(pages: ScanPage[], fileName: string) {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const createdAt = new Date();

  pdfDoc.setTitle(fileName);
  pdfDoc.setSubject(BRAND_TEXT);
  pdfDoc.setCreator("ماسح المستندات");
  pdfDoc.setProducer("المعهد العالي");
  pdfDoc.setCreationDate(createdAt);
  pdfDoc.setModificationDate(createdAt);

  for (const scanPage of pages) {
    const blob = await dataUrlToBlob(scanPage.dataUrl);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const embeddedImage = await pdfDoc.embedJpg(bytes);
    const { width, height } = embeddedImage.scale(1);
    const pdfPage = pdfDoc.addPage([width, height + 34]);
    pdfPage.drawImage(embeddedImage, { x: 0, y: 34, width, height });
    pdfPage.drawText(`${BRAND_TEXT} - ${formatArabicDate(createdAt)}`, {
      x: 20,
      y: 14,
      size: 11,
      font: helvetica,
      color: rgb(0.24, 0.2, 0.18)
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
}
