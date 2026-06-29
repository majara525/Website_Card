export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function shareFile(blob: Blob, fileName: string, title: string) {
  const file = new File([blob], fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`, {
    type: "application/pdf"
  });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({
      title,
      text: "ملف PDF من ماسح المستندات",
      files: [file]
    });
    return true;
  }

  return false;
}

export function shareEmail(fileName: string) {
  const subject = encodeURIComponent(fileName);
  const body = encodeURIComponent("تم إنشاء ملف PDF بواسطة ماسح المستندات. إذا لم يظهر المرفق، يرجى استخدام زر المشاركة أو الحفظ المحلي ثم إرفاق الملف.");
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function printBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      iframe.remove();
    }, 2000);
  };
}
