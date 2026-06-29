<script lang="ts">
  import { onMount, tick } from "svelte";
  import type { Corner, EnhancementSettings, SavedScan, ScanPage } from "./types/scanner";
  import { autoEnhanceImage, cropByCorners, defaultCorners, enhanceImage, getImageSize, rotateImage } from "./lib/image";
  import { detectAndCorrectDocument, loadOpenCv } from "./lib/opencv";
  import { createPdfBlob } from "./lib/pdf";
  import { deleteScan, getScans, saveScan } from "./lib/storage";
  import { formatArabicDate, todayFileName } from "./lib/date";
  import { downloadBlob, printBlob, shareEmail, shareFile } from "./lib/share";

  type Screen = "home" | "camera" | "review" | "pages" | "result";

  const MAX_PAGES = 20;
  const brandText = "تم إنشاؤه بواسطة المعهد العالي - شبكة كلّيات قُطرية";

  let screen: Screen = "home";
  let videoElement: HTMLVideoElement;
  let cropImageElement: HTMLImageElement;
  let cropWrapperElement: HTMLDivElement;
  let stream: MediaStream | null = null;
  let pages: ScanPage[] = [];
  let savedScans: SavedScan[] = [];
  let reviewImage = "";
  let reviewCorners: Corner[] = [];
  let reviewNaturalSize = { width: 1, height: 1 };
  let activeCornerIndex: number | null = null;
  let settings: EnhancementSettings = { brightness: 0, contrast: 0 };
  let loading = false;
  let loadingMessage = "";
  let errorMessage = "";
  let warningMessage = "";
  let fileName = todayFileName();
  let createdPdf: Blob | null = null;
  let createdPdfName = "";
  let openCvReady = false;

  $: canAddMorePages = pages.length < MAX_PAGES;
  $: cropScale = cropImageElement
    ? {
        x: cropImageElement.clientWidth / reviewNaturalSize.width,
        y: cropImageElement.clientHeight / reviewNaturalSize.height
      }
    : { x: 1, y: 1 };

  onMount(async () => {
    await refreshSavedScans();
    loadOpenCv()
      .then(() => {
        openCvReady = true;
      })
      .catch(() => {
        openCvReady = false;
      });
  });

  async function refreshSavedScans() {
    try {
      savedScans = await getScans();
    } catch {
      errorMessage = "تعذر تحميل المستندات المحفوظة محليًا.";
    }
  }

  async function startNewScan() {
    errorMessage = "";
    warningMessage = "";
    if (!canAddMorePages) {
      warningMessage = "وصلت إلى الحد الأقصى: 20 صفحة.";
      return;
    }

    screen = "camera";
    await tick();
    await startCamera();
  }

  async function startCamera() {
    stopCamera();
    loading = true;
    loadingMessage = "جاري فتح الكاميرا...";

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      videoElement.srcObject = stream;
      await videoElement.play();
    } catch {
      errorMessage = "تعذر فتح الكاميرا. تأكد من منح الإذن للمتصفح ثم حاول مرة أخرى.";
      screen = "home";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  async function capturePage() {
    if (!videoElement || pages.length >= MAX_PAGES) {
      warningMessage = "وصلت إلى الحد الأقصى: 20 صفحة.";
      return;
    }

    loading = true;
    loadingMessage = openCvReady ? "جاري اكتشاف حدود المستند وتحسين الصورة..." : "جاري التقاط الصورة...";

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("تعذر التقاط الصورة.");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const rawImage = canvas.toDataURL("image/jpeg", 0.92);
      const corrected = await detectAndCorrectDocument(rawImage).catch(() => rawImage);
      const size = await getImageSize(corrected);
      reviewImage = corrected;
      reviewNaturalSize = size;
      reviewCorners = defaultCorners(size.width, size.height);
      stopCamera();
      screen = "review";
    } catch {
      errorMessage = "حدث خطأ أثناء التقاط الصفحة. حاول مرة أخرى بإضاءة أفضل.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function applyCrop() {
    loading = true;
    loadingMessage = "جاري تطبيق القص...";

    try {
      reviewImage = await cropByCorners(reviewImage, reviewCorners);
      reviewNaturalSize = await getImageSize(reviewImage);
      reviewCorners = defaultCorners(reviewNaturalSize.width, reviewNaturalSize.height);
    } catch {
      errorMessage = "تعذر تطبيق القص اليدوي.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function enhanceAuto() {
    loading = true;
    loadingMessage = "جاري تحسين الجودة...";
    try {
      reviewImage = await autoEnhanceImage(reviewImage);
      settings = { brightness: 0, contrast: 0 };
    } catch {
      errorMessage = "تعذر تحسين الصورة.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function applyManualEnhancement() {
    loading = true;
    loadingMessage = "جاري تطبيق الإضاءة والتباين...";
    try {
      reviewImage = await enhanceImage(reviewImage, settings);
      settings = { brightness: 0, contrast: 0 };
    } catch {
      errorMessage = "تعذر تطبيق التحسين اليدوي.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function rotate(degrees: 90 | -90) {
    loading = true;
    loadingMessage = "جاري تدوير الصفحة...";
    try {
      reviewImage = await rotateImage(reviewImage, degrees);
      reviewNaturalSize = await getImageSize(reviewImage);
      reviewCorners = defaultCorners(reviewNaturalSize.width, reviewNaturalSize.height);
    } catch {
      errorMessage = "تعذر تدوير الصفحة.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function acceptPage(addAnother = false) {
    if (pages.length >= MAX_PAGES) {
      warningMessage = "وصلت إلى الحد الأقصى: 20 صفحة.";
      return;
    }

    const size = await getImageSize(reviewImage);
    pages = [
      ...pages,
      {
        id: crypto.randomUUID(),
        name: `صفحة ${pages.length + 1}`,
        dataUrl: reviewImage,
        createdAt: new Date().toISOString(),
        width: size.width,
        height: size.height
      }
    ];

    reviewImage = "";
    warningMessage = "";

    if (addAnother && pages.length < MAX_PAGES) {
      await startNewScan();
    } else {
      screen = "pages";
    }
  }

  function movePage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[index], next[target]] = [next[target], next[index]];
    pages = next;
  }

  function removePage(id: string) {
    pages = pages.filter((page) => page.id !== id);
  }

  async function generatePdf() {
    if (!pages.length) {
      warningMessage = "أضف صفحة واحدة على الأقل قبل إنشاء PDF.";
      return;
    }

    loading = true;
    loadingMessage = "جاري إنشاء ملف PDF...";

    try {
      createdPdfName = sanitizeFileName(fileName || todayFileName());
      createdPdf = await createPdfBlob(pages, createdPdfName);
      await saveScan({
        id: crypto.randomUUID(),
        fileName: createdPdfName,
        createdAt: new Date().toISOString(),
        pageCount: pages.length,
        blob: createdPdf
      });
      await refreshSavedScans();
      pages = [];
      screen = "result";
    } catch {
      errorMessage = "تعذر إنشاء ملف PDF.";
    } finally {
      loading = false;
      loadingMessage = "";
    }
  }

  async function handleShareWhatsApp(blob: Blob, name: string) {
    const shared = await shareFile(blob, name, "ماسح المستندات").catch(() => false);
    if (!shared) {
      warningMessage = "المشاركة المباشرة غير مدعومة في هذا المتصفح. احفظ الملف ثم شاركه عبر واتساب.";
    }
  }

  async function removeSavedScan(scan: SavedScan) {
    await deleteScan(scan.id);
    await refreshSavedScans();
  }

  function sanitizeFileName(value: string) {
    return value.replace(/[\\/:*?"<>|]/g, "_").trim() || todayFileName();
  }

  function beginCornerDrag(index: number, event: PointerEvent) {
    activeCornerIndex = index;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function dragCorner(event: PointerEvent) {
    if (activeCornerIndex === null || !cropImageElement) return;
    const rect = cropImageElement.getBoundingClientRect();
    const x = Math.max(0, Math.min(reviewNaturalSize.width, (event.clientX - rect.left) / cropScale.x));
    const y = Math.max(0, Math.min(reviewNaturalSize.height, (event.clientY - rect.top) / cropScale.y));
    reviewCorners = reviewCorners.map((corner, index) => (index === activeCornerIndex ? { x, y } : corner));
  }
</script>

<svelte:head>
  <title>ماسح المستندات</title>
</svelte:head>

<main class="min-h-screen bg-college-paper text-zinc-900">
  {#if loading}
    <div class="fixed inset-0 z-50 grid place-items-center bg-black/45 p-6 text-center text-white">
      <div class="rounded-lg bg-college-dark p-6 shadow-2xl">
        <div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-college-gold"></div>
        <p class="text-lg font-bold">{loadingMessage}</p>
      </div>
    </div>
  {/if}

  <section class="mx-auto max-w-5xl px-4 py-5 sm:px-6">
    <header class="mb-5 overflow-hidden rounded-lg bg-white shadow-xl shadow-red-950/10">
      <div class="flex justify-center bg-white p-5">
        <img class="h-auto w-44 max-w-full" src="/PDF/logo.jpg" alt="المعهد العالي" />
      </div>
      <div class="border-b-4 border-college-gold bg-college-red px-5 py-6 text-white">
        <p class="mb-1 text-sm font-bold text-college-gold">تطبيق ويب تقدمي</p>
        <h1 class="text-3xl font-black leading-tight sm:text-5xl">ماسح المستندات</h1>
        <p class="mt-3 max-w-2xl leading-8">{brandText} - {formatArabicDate()}</p>
      </div>
    </header>

    {#if errorMessage}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 font-bold text-red-800">{errorMessage}</div>
    {/if}

    {#if warningMessage}
      <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 font-bold text-amber-900">{warningMessage}</div>
    {/if}

    {#if screen === "home"}
      <section class="grid gap-4">
        <div class="rounded-lg bg-white p-5 shadow-lg">
          <p class="mb-4 rounded-lg border-r-4 border-college-gold bg-yellow-50 p-4 leading-8 text-zinc-700">
            جميع المستندات تبقى على جهازك فقط ولا يتم مشاركتها إلا عند استخدام زر المشاركة.
          </p>
          <button class="primary-button w-full text-xl" on:click={startNewScan}>ابدأ المسح الجديد</button>
        </div>

        <div class="rounded-lg bg-white p-5 shadow-lg">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-2xl font-black text-college-dark">المستندات السابقة</h2>
            <span class="rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-600">{savedScans.length}</span>
          </div>

          {#if savedScans.length === 0}
            <p class="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-zinc-500">لا توجد ملفات محفوظة بعد.</p>
          {:else}
            <div class="grid gap-3">
              {#each savedScans as scan}
                <article class="rounded-lg border border-zinc-200 p-4">
                  <div class="mb-3">
                    <h3 class="font-black">{scan.fileName}.pdf</h3>
                    <p class="text-sm text-zinc-500">{scan.pageCount} صفحة - {formatArabicDate(new Date(scan.createdAt))}</p>
                  </div>
                  <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <button class="secondary-button" on:click={() => downloadBlob(scan.blob, scan.fileName)}>تنزيل</button>
                    <button class="secondary-button" on:click={() => handleShareWhatsApp(scan.blob, scan.fileName)}>واتساب</button>
                    <button class="secondary-button" on:click={() => shareEmail(scan.fileName)}>البريد</button>
                    <button class="secondary-button" on:click={() => printBlob(scan.blob)}>طباعة</button>
                    <button class="danger-button" on:click={() => removeSavedScan(scan)}>حذف</button>
                  </div>
                </article>
              {/each}
            </div>
          {/if}
        </div>
      </section>
    {:else if screen === "camera"}
      <section class="rounded-lg bg-white p-4 shadow-lg">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="text-2xl font-black text-college-dark">التقاط الصفحة</h2>
          <span class="font-bold text-zinc-500">{pages.length} / {MAX_PAGES}</span>
        </div>
        <video class="aspect-[3/4] w-full rounded-lg bg-black object-cover" bind:this={videoElement} playsinline muted></video>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button class="secondary-button" on:click={() => { stopCamera(); screen = "home"; }}>إلغاء</button>
          <button class="primary-button" on:click={capturePage}>التقاط</button>
        </div>
      </section>
    {:else if screen === "review"}
      <section class="rounded-lg bg-white p-4 shadow-lg">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-2xl font-black text-college-dark">مراجعة الصفحة</h2>
          <span class="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">{openCvReady ? "OpenCV جاهز" : "معالجة أساسية"}</span>
        </div>

        <div class="relative mx-auto max-w-3xl touch-none overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950" bind:this={cropWrapperElement}>
          <img class="block w-full select-none" bind:this={cropImageElement} src={reviewImage} alt="معاينة الصفحة" draggable="false" />
          <svg class="pointer-events-none absolute inset-0 h-full w-full">
            <polygon
              points={reviewCorners.map((point) => `${point.x * cropScale.x},${point.y * cropScale.y}`).join(" ")}
              fill="rgba(251,194,58,0.16)"
              stroke="#fbc23a"
              stroke-width="3"
            />
          </svg>
          {#each reviewCorners as corner, index}
            <button
              class="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-college-gold shadow-lg"
              style={`left:${corner.x * cropScale.x}px; top:${corner.y * cropScale.y}px`}
              aria-label="مقبض القص"
              on:pointerdown={(event) => beginCornerDrag(index, event)}
              on:pointermove={dragCorner}
              on:pointerup={() => (activeCornerIndex = null)}
            ></button>
          {/each}
        </div>

        <div class="mt-4 grid gap-3">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button class="secondary-button" on:click={applyCrop}>تطبيق القص</button>
            <button class="secondary-button" on:click={enhanceAuto}>تحسين الجودة</button>
            <button class="secondary-button" on:click={() => rotate(-90)}>تدوير يسار 90°</button>
            <button class="secondary-button" on:click={() => rotate(90)}>تدوير يمين 90°</button>
          </div>

          <div class="grid gap-3 rounded-lg bg-zinc-50 p-4 sm:grid-cols-2">
            <label class="grid gap-2 font-bold">
              السطوع
              <input type="range" min="-80" max="80" bind:value={settings.brightness} />
            </label>
            <label class="grid gap-2 font-bold">
              التباين
              <input type="range" min="-80" max="120" bind:value={settings.contrast} />
            </label>
            <button class="secondary-button sm:col-span-2" on:click={applyManualEnhancement}>تطبيق السطوع والتباين</button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button class="secondary-button" on:click={() => acceptPage(false)}>اعتماد الصفحة</button>
            <button class="primary-button" disabled={!canAddMorePages} on:click={() => acceptPage(true)}>اعتماد وإضافة صفحة</button>
          </div>
        </div>
      </section>
    {:else if screen === "pages"}
      <section class="rounded-lg bg-white p-4 shadow-lg">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-2xl font-black text-college-dark">ترتيب الصفحات</h2>
          <span class="font-bold text-zinc-500">{pages.length} / {MAX_PAGES}</span>
        </div>

        <div class="grid gap-3">
          {#each pages as page, index}
            <article class="grid grid-cols-[84px_1fr] gap-3 rounded-lg border border-zinc-200 p-3">
              <img class="h-28 w-20 rounded-md object-cover" src={page.dataUrl} alt={page.name} />
              <div>
                <h3 class="mb-2 font-black">صفحة {index + 1}</h3>
                <div class="grid grid-cols-3 gap-2">
                  <button class="mini-button" disabled={index === 0} on:click={() => movePage(index, -1)}>أعلى</button>
                  <button class="mini-button" disabled={index === pages.length - 1} on:click={() => movePage(index, 1)}>أسفل</button>
                  <button class="mini-danger" on:click={() => removePage(page.id)}>حذف</button>
                </div>
              </div>
            </article>
          {/each}
        </div>

        <label class="mt-5 grid gap-2 font-bold">
          اسم ملف PDF
          <input class="text-input" bind:value={fileName} placeholder={todayFileName()} />
        </label>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <button class="secondary-button" disabled={!canAddMorePages} on:click={startNewScan}>إضافة صفحة</button>
          <button class="primary-button" on:click={generatePdf}>إنشاء PDF</button>
        </div>
      </section>
    {:else if screen === "result" && createdPdf}
      <section class="rounded-lg bg-white p-5 text-center shadow-lg">
        <h2 class="mb-2 text-2xl font-black text-college-dark">تم إنشاء ملف PDF</h2>
        <p class="mb-5 text-zinc-600">{createdPdfName}.pdf</p>
        <div class="grid gap-3">
          <button class="primary-button" on:click={() => downloadBlob(createdPdf as Blob, createdPdfName)}>حفظ محليًا</button>
          <button class="secondary-button" on:click={() => handleShareWhatsApp(createdPdf as Blob, createdPdfName)}>مشاركة عبر واتساب</button>
          <button class="secondary-button" on:click={() => shareEmail(createdPdfName)}>مشاركة عبر البريد الإلكتروني</button>
          <button class="secondary-button" on:click={() => printBlob(createdPdf as Blob)}>طباعة</button>
        </div>
        <button class="mt-4 font-bold text-college-red" on:click={() => { createdPdf = null; screen = "home"; }}>العودة للرئيسية</button>
      </section>
    {/if}
  </section>
</main>
