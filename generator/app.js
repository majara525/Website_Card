"use strict";

const $ = (id) => document.getElementById(id);
const numberAr = (value) => new Intl.NumberFormat("ar").format(value);
let toastTimer;
function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3000);
}

// Tabs and settings
function selectTab(name) {
  for (const tab of ["password", "qr"]) {
    const active = tab === name;
    $(`${tab}-tab`).hidden = !active;
    $(`nav-${tab}`).classList.toggle("active", active);
    if (active) $(`nav-${tab}`).setAttribute("aria-current", "page");
    else $(`nav-${tab}`).removeAttribute("aria-current");
  }
  history.replaceState(null, "", `#${name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("nav-password").addEventListener("click", () => selectTab("password"));
$("nav-qr").addEventListener("click", () => selectTab("qr"));
if (location.hash === "#qr") selectTab("qr");

$("settings-open").addEventListener("click", () => $("settings-dialog").showModal());
$("settings-close").addEventListener("click", () => $("settings-dialog").close());
$("settings-dialog").addEventListener("click", (event) => {
  if (event.target === $("settings-dialog")) $("settings-dialog").close();
});
for (const [id, className] of [["larger-text", "large-text"], ["high-contrast", "high-contrast"]]) {
  $(id).addEventListener("change", (event) => document.body.classList.toggle(className, event.target.checked));
}

// Secure password generation with unbiased random indices.
const passwordGroups = [
  ["include-upper", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
  ["include-lower", "abcdefghijklmnopqrstuvwxyz"],
  ["include-numbers", "0123456789"],
  ["include-symbols", "!@#$%^&*()-_=+[]{};:,.?"],
];
function secureIndex(max) {
  const limit = Math.floor(256 / max) * max;
  const byte = new Uint8Array(1);
  do { crypto.getRandomValues(byte); } while (byte[0] >= limit);
  return byte[0] % max;
}
function updateStrength(password, poolSize) {
  const meter = $("strength-meter");
  const fill = meter.firstElementChild;
  if (!password) {
    meter.setAttribute("aria-valuenow", "0");
    fill.style.width = "0";
    $("strength-label").textContent = "—";
    $("strength-hint").textContent = "اختر الإعدادات ثم اضغط زر التوليد.";
    return;
  }
  const bits = password.length * Math.log2(poolSize);
  const level = bits < 50 ? 1 : bits < 75 ? 2 : bits < 110 ? 3 : 4;
  const labels = ["", "ضعيفة", "متوسطة", "قوية", "قوية جدًا"];
  const colors = ["", "#c83838", "#b16b00", "#438b42", "#197a4a"];
  meter.setAttribute("aria-valuenow", String(level));
  fill.style.width = `${level * 25}%`;
  fill.style.backgroundColor = colors[level];
  $("strength-label").textContent = labels[level];
  $("strength-label").style.color = colors[level];
  $("strength-hint").textContent = "تقدير تقريبي يعتمد على الطول ومجموعة الأحرف.";
}
$("password-length").addEventListener("input", (event) => $("length-value").textContent = numberAr(event.target.value));
$("password-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!globalThis.crypto?.getRandomValues) { toast("التوليد الآمن غير متاح في هذا المتصفح."); return; }
  const excludeSimilar = $("exclude-similar").checked;
  const groups = passwordGroups.filter(([id]) => $(id).checked).map(([, chars]) => excludeSimilar ? chars.replace(/[0Oo1Il|]/g, "") : chars);
  if (!groups.length) { toast("اختر نوعًا واحدًا من الأحرف على الأقل."); return; }
  const length = Number($("password-length").value);
  const pool = groups.join("");
  const result = groups.map((group) => group[secureIndex(group.length)]);
  while (result.length < length) result.push(pool[secureIndex(pool.length)]);
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  $("password-output").value = result.join("");
  $("password-copy").disabled = false;
  $("password-clear").disabled = false;
  updateStrength(result, pool.length);
  toast("تم توليد كلمة المرور.");
});
$("password-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("password-output").value); toast("تم نسخ كلمة المرور."); }
  catch { toast("تعذّر النسخ. حدّد كلمة المرور وانسخها يدويًا."); $("password-output").select(); }
});
$("password-clear").addEventListener("click", () => {
  $("password-output").value = "";
  $("password-copy").disabled = true;
  $("password-clear").disabled = true;
  updateStrength("", 1);
  toast("تم مسح كلمة المرور.");
});

// QR payload formatting follows common URI, Wi-Fi, and vCard conventions.
const qrTypeNames = { text: "نص", url: "رابط", wifi: "واي فاي", vcard: "جهة اتصال", email: "بريد إلكتروني", sms: "رسالة نصية" };
const value = (id) => $(id).value.trim();
const escapeWifi = (text) => text.replace(/[\\;,:"]/g, "\\$&");
const escapeVcard = (text) => text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
function getPayload() {
  const type = $("qr-type").value;
  let data = "";
  let label = "";
  if (type === "text") { data = value("qr-text"); label = data; }
  if (type === "url") {
    const raw = value("qr-url");
    if (raw && !/^https?:\/\//i.test(raw)) throw new Error("أدخل رابطًا يبدأ بـ https:// أو http://.");
    if (raw) { try { const parsed = new URL(raw); if (!parsed.hostname) throw new Error(); } catch { throw new Error("أدخل رابطًا صحيحًا."); } }
    data = raw; label = raw;
  }
  if (type === "wifi") {
    const name = value("wifi-name");
    if (!name) return null;
    const security = $("wifi-security").value;
    const pass = value("wifi-password");
    if (security !== "nopass" && !pass) throw new Error("أدخل كلمة مرور الشبكة أو اختر شبكة مفتوحة.");
    data = `WIFI:T:${security};S:${escapeWifi(name)};P:${escapeWifi(pass)};H:${$("wifi-hidden").checked ? "true" : "false"};;`;
    label = name;
  }
  if (type === "vcard") {
    const name = value("vcard-name");
    if (!name) return null;
    data = ["BEGIN:VCARD", "VERSION:3.0", `FN:${escapeVcard(name)}`, value("vcard-phone") && `TEL:${escapeVcard(value("vcard-phone"))}`, value("vcard-email") && `EMAIL:${escapeVcard(value("vcard-email"))}`, value("vcard-org") && `ORG:${escapeVcard(value("vcard-org"))}`, "END:VCARD"].filter(Boolean).join("\r\n");
    label = name;
  }
  if (type === "email") {
    const to = value("email-to");
    if (!to) return null;
    if (!$("email-to").checkValidity()) throw new Error("أدخل بريدًا إلكترونيًا صحيحًا.");
    const params = new URLSearchParams();
    if (value("email-subject")) params.set("subject", value("email-subject"));
    if (value("email-body")) params.set("body", value("email-body"));
    data = `mailto:${to}${params.size ? `?${params.toString()}` : ""}`;
    label = to;
  }
  if (type === "sms") {
    const to = value("sms-to");
    if (!to) return null;
    data = `sms:${to}${value("sms-body") ? `?body=${encodeURIComponent(value("sms-body"))}` : ""}`;
    label = to;
  }
  if (!data) return null;
  if (new TextEncoder().encode(data).length > 1900) throw new Error("المحتوى طويل جدًا. اختصره وحاول مجددًا.");
  return { type, data, label: label.slice(0, 100) };
}

let logoData = "";
let qrInstance = null;
let previewTimer;
let previewVersion = 0;
const historyKey = "almahad-qr-history-v1";
function readHistory() {
  try { const records = JSON.parse(localStorage.getItem(historyKey) || "[]"); return Array.isArray(records) ? records.slice(0, 20) : []; }
  catch { return []; }
}
function saveHistory(records) {
  try { localStorage.setItem(historyKey, JSON.stringify(records)); return true; }
  catch { toast("تعذّر حفظ السجل على هذا الجهاز."); return false; }
}
function renderHistory() {
  const list = $("history-list");
  list.replaceChildren();
  const records = readHistory();
  if (!records.length) {
    const item = document.createElement("li"); item.className = "empty-history"; item.textContent = "لا توجد رموز محفوظة بعد."; list.append(item); return;
  }
  records.forEach((record, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button"); button.type = "button"; button.className = "history-item";
    const heading = document.createElement("strong"); heading.textContent = `${qrTypeNames[record.type] || "رمز"} · ${record.label || "بدون عنوان"}`;
    const date = document.createElement("small"); date.textContent = new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.createdAt));
    button.append(heading, date);
    button.addEventListener("click", () => {
      renderQr(record, true);
      toast("تم فتح الرمز من السجل.");
    });
    item.append(button); list.append(item);
  });
}
function clearHistory() {
  try { localStorage.removeItem(historyKey); } catch { /* Storage may be blocked. */ }
  renderHistory(); toast("تم مسح سجل رموز QR.");
}
$("history-clear").addEventListener("click", clearHistory);
$("settings-history-clear").addEventListener("click", clearHistory);

function qrOptions(payload, override = {}) {
  return {
    width: 320, height: 320, type: "svg", margin: 12, data: payload.data,
    qrOptions: { errorCorrectionLevel: override.correction || $("qr-correction").value },
    dotsOptions: { color: override.foreground || $("qr-foreground").value, type: "square" },
    cornersSquareOptions: { color: override.foreground || $("qr-foreground").value },
    cornersDotOptions: { color: override.foreground || $("qr-foreground").value },
    backgroundOptions: { color: override.background || $("qr-background").value },
    image: override.logo !== undefined ? override.logo : logoData,
    imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: .22, hideBackgroundDots: true },
  };
}
function setQrReady(ready) {
  $("download-png").disabled = !ready;
  $("download-svg").disabled = !ready;
}
function renderQr(payload, fromHistory = false) {
  const preview = $("qr-preview");
  preview.replaceChildren();
  qrInstance = null;
  setQrReady(false);
  if (!payload) {
    const placeholder = document.createElement("span"); placeholder.textContent = "أدخل المحتوى لمعاينة الرمز"; preview.append(placeholder);
    $("qr-status").textContent = "تتحدّث المعاينة أثناء الكتابة. اضغط إنشاء لحفظ الرمز في السجل.";
    return false;
  }
  if (!window.QRCodeStyling) {
    $("qr-status").textContent = "تعذّر تحميل مكتبة QR. اتصل بالإنترنت ثم أعد تحميل الصفحة.";
    return false;
  }
  try {
    const options = qrOptions(payload, fromHistory ? payload.options : {});
    qrInstance = new QRCodeStyling(options);
    qrInstance.append(preview);
    setQrReady(true);
    $("qr-status").textContent = fromHistory ? "رمز محفوظ في السجل. يمكنك تنزيله الآن." : "المعاينة جاهزة. اضغط إنشاء لحفظ الرمز في السجل.";
    return true;
  } catch {
    $("qr-status").textContent = "تعذّر إنشاء الرمز. اختصر المحتوى أو غيّر مستوى التصحيح.";
    return false;
  }
}
function updatePreview() {
  clearTimeout(previewTimer);
  const version = ++previewVersion;
  previewTimer = setTimeout(() => {
    if (version !== previewVersion) return;
    try { renderQr(getPayload()); }
    catch (error) { renderQr(null); $("qr-status").textContent = error.message; }
  }, 280);
}
$("qr-type").addEventListener("change", () => {
  const type = $("qr-type").value;
  document.querySelectorAll(".type-fields").forEach((section) => { section.hidden = section.dataset.type !== type; });
  updatePreview();
});
$("qr-form").addEventListener("input", updatePreview);
$("qr-form").addEventListener("change", updatePreview);
$("qr-logo").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  logoData = "";
  if (!file) { updatePreview(); return; }
  if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type) || file.size > 200 * 1024) {
    event.target.value = "";
    toast("اختر صورة PNG أو JPG أو WebP أو SVG بحجم أقل من ٢٠٠ كيلوبايت.");
    updatePreview(); return;
  }
  try { logoData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); updatePreview(); }
  catch { toast("تعذّرت قراءة صورة الشعار."); }
});
$("qr-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(previewTimer); ++previewVersion;
  let payload;
  try { payload = getPayload(); } catch (error) { toast(error.message); return; }
  if (!payload) { toast("أدخل محتوى الرمز أولًا."); return; }
  if ($( "qr-foreground" ).value.toLowerCase() === $( "qr-background" ).value.toLowerCase()) { toast("اختر لونين مختلفين للرمز والخلفية."); return; }
  if (!renderQr(payload)) { toast("تعذّر إنشاء الرمز."); return; }
  const record = { ...payload, createdAt: Date.now(), options: { foreground: $("qr-foreground").value, background: $("qr-background").value, correction: $("qr-correction").value, logo: logoData } };
  const saved = saveHistory([record, ...readHistory()].slice(0, 20));
  renderHistory();
  toast(saved ? "تم إنشاء الرمز وحفظه في السجل." : "تم إنشاء الرمز.");
});
for (const extension of ["png", "svg"]) {
  $(`download-${extension}`).addEventListener("click", async () => {
    if (!qrInstance) return;
    try { await qrInstance.download({ name: "almahad-qr", extension }); toast("بدأ تنزيل رمز QR."); }
    catch { toast("تعذّر تنزيل الرمز. حاول مجددًا."); }
  });
}
renderHistory();

// FUTURE DYNAMIC QR: A dynamic code should contain a short HTTPS redirect URL.
// A future backend would store the URL-to-destination mapping and resolve each
// scan. The static app would only create and display that short URL's QR code;
// authentication, analytics, and redirect edits belong on the backend.

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
