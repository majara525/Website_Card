import { repository } from "./db.js";
import { SleepSensor, AmbientSound, AlarmSound } from "./audio.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const labels = { awake: "يقظة", light: "نوم خفيف", deep: "نوم عميق" };
const defaults = { window: 30, sound: "off", volume: 35, microphone: true, notifications: false };
let settings = { ...defaults }, nights = [], articles = [], active = null, sensor = null, tickTimer = null;
const ambient = new AmbientSound();
const alarm = new AlarmSound();
let previousView = "home";

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 6000);
}

function formatDuration(ms) {
  const minutes = Math.max(0, Math.round(ms / 60000));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} س ${minutes % 60} د` : `${minutes} دقيقة`;
}

function dateText(timestamp) {
  return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function switchView(view) {
  if (view === "settings") previousView = $$(".tab").find(tab => tab.classList.contains("active"))?.dataset.view || "home";
  $$(".view").forEach(section => { section.hidden = section.id !== `${view}-view`; });
  $$(".tab").forEach(tab => {
    const selected = tab.dataset.view === view;
    tab.classList.toggle("active", selected);
    if (selected) tab.setAttribute("aria-current", "page"); else tab.removeAttribute("aria-current");
  });
  const titles = {
    home: ["ليلة هادئة تبدأ هنا", "ابدأ التتبع حين تستعد للنوم، وحدد موعد الاستيقاظ المناسب لك."],
    articles: ["اقرأ على مهل", "احتفظ بما يفيدك، وتابع ما قرأته."],
    stats: ["افهم نمط نومك", "نظرة تقديرية إلى لياليك المسجلة."],
    history: ["لياليك ويومياتك", "دوّن ما تود تذكره عن كل ليلة."],
    settings: ["الإعدادات", "خصص التتبع والمنبه بما يناسبك."]
  };
  $("#page-title").textContent = titles[view][0];
  $("#page-subtitle").textContent = titles[view][1];
  if (view === "stats") renderStats();
  if (view === "history") renderHistory();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTrackingUi() {
  const running = Boolean(active);
  $("#start-button").hidden = running;
  $("#stop-button").hidden = !running;
  $("#live-panel").hidden = !running;
  $("#tracking-badge").textContent = running ? "جارٍ التتبع" : "غير نشط";
  $("#tracking-badge").classList.toggle("active", running);
  $("#wake-time").disabled = running;
  $("#alarm-window").disabled = running;
  $("#tracking-source").disabled = running;
  if (running) {
    $("#live-duration").textContent = formatDuration(Date.now() - active.startedAt);
    $("#live-stage").textContent = labels[active.currentStage] || "جارٍ التحليل";
    $("#live-source").textContent = active.source === "microphone" ? "الميكروفون" : active.source === "motion" ? "الحركة" : "المؤقت فقط";
  }
}

function targetTime(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date.getTime();
}

function stageFromSamples(samples) {
  if (samples.length < 3) return "awake";
  const recent = samples.slice(-10);
  const movement = recent.reduce((sum, sample) => sum + sample.movement, 0) / recent.length;
  const hasSnore = recent.some(sample => sample.snore);
  if (movement > 0.09) return "awake";
  if (movement > 0.025 || hasSnore) return "light";
  if (recent[0].source === "motion") return "deep";
  // A stable, low audio envelope is a rough proxy for regular breathing.
  const levels = recent.map(sample => sample.level || 0);
  const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
  const spread = Math.sqrt(levels.reduce((sum, level) => sum + (level - mean) ** 2, 0) / levels.length);
  return mean > 0.003 && spread / mean < 0.6 ? "deep" : "light";
}

async function onSample(sample) {
  if (!active) return;
  active.samples.push(sample);
  if (active.samples.length > 25000) active.samples.shift();
  if (sample.snore) active.snoreTimes.push(sample.at);
  const stage = stageFromSamples(active.samples);
  if (stage !== active.currentStage) active.stages.push({ at: sample.at, stage });
  active.currentStage = stage;
  updateTrackingUi();
  checkAlarm();
}

async function startTracking() {
  if (active) return;
  const wake = $("#wake-time").value;
  if (!wake) { showToast("اختر وقت الاستيقاظ أولاً."); $("#wake-time").focus(); return; }
  const target = targetTime(wake);
  const windowMinutes = Number($("#alarm-window").value);
  const night = {
    id: crypto.randomUUID(), startedAt: Date.now(), endedAt: null, targetAt: target,
    windowMinutes, source: "none", status: "tracking", samples: [], snoreTimes: [],
    stages: [{ at: Date.now(), stage: "awake" }], currentStage: "awake", note: "", alarmFired: false
  };
  active = night;
  sensor = new SleepSensor(onSample);
  try { active.source = await sensor.start(settings.microphone && $("#tracking-source").value === "auto"); }
  catch (error) { active.source = "none"; showToast("المستشعر غير متاح. سيستمر حساب الوقت، لكن لا يمكن تقدير مراحل النوم."); }
  try { await repository.nights.put(active); }
  catch (error) { sensor.stop(); active = null; showToast("تعذر حفظ البيانات المحلية. تحقق من إعدادات المتصفح."); return; }
  if (settings.notifications && "Notification" in window && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch (_) { /* optional permission */ }
  }
  tickTimer = setInterval(async () => {
    if (!active) return;
    updateTrackingUi();
    checkAlarm();
    try { await repository.nights.put(active); } catch (_) { showToast("تعذر حفظ آخر تحديث لليلة."); }
  }, 15000);
  updateTrackingUi();
  showToast("بدأ تتبع النوم. أبقِ التطبيق مفتوحاً واضبط منبهاً احتياطياً.");
}

function qualityFor(night) {
  if (night.source === "none" || !night.samples.length) return null;
  const duration = (night.endedAt || Date.now()) - night.startedAt;
  const hours = duration / 3600000;
  const movements = night.samples.filter(s => s.movement > 0.09).length;
  return Math.max(0, Math.min(100, Math.round(75 + Math.min(hours, 8) * 2 - Math.max(0, 7 - hours) * 5 - movements * 1.5 - night.snoreTimes.length * 1.5)));
}

async function stopTracking(status = "complete") {
  if (!active) return;
  alarm.stop();
  $("#dismiss-alarm").hidden = true;
  sensor?.stop();
  clearInterval(tickTimer);
  active.endedAt = Date.now();
  active.status = status;
  active.quality = qualityFor(active);
  await repository.nights.put(active);
  nights.unshift(active);
  active = null;
  updateTrackingUi();
  showToast("حُفظت الليلة. يمكنك إضافة يومياتك من سجل الليالي.");
  renderHistory();
}

async function checkAlarm() {
  if (!active || active.alarmFired) return;
  const now = Date.now();
  const windowStart = active.targetAt - active.windowMinutes * 60000;
  if (now < windowStart) return;
  const lightDetected = active.source !== "none" && active.samples.length >= 3 && ["light", "awake"].includes(active.currentStage);
  if (now < active.targetAt && !lightDetected) return;
  active.alarmFired = true;
  await repository.nights.put(active);
  ambient.stop();
  $("#sound-toggle").textContent = "تشغيل الصوت";
  try { await alarm.start(); $("#dismiss-alarm").hidden = false; } catch (_) { /* browser may block audio after suspension */ }
  showToast("حان وقت الاستيقاظ. صباح الخير!");
  if (settings.notifications && "Notification" in window && Notification.permission === "granted") {
    const options = { body: "صباح الخير! افتح تطبيق نومي لإنهاء التتبع.", icon: "icon-192.png", tag: "sleep-alarm" };
    try {
      const registration = navigator.serviceWorker ? await navigator.serviceWorker.getRegistration() : null;
      if (registration) await registration.showNotification("حان وقت الاستيقاظ", options);
      else new Notification("حان وقت الاستيقاظ", options);
    } catch (_) { /* unsupported */ }
  }
  if ("vibrate" in navigator) navigator.vibrate([300, 180, 300]);
}

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderArticles() {
  const list = $("#articles-list"); list.replaceChildren();
  if (!articles.length) { list.append(makeElement("div", "empty-state", "لا توجد مقالات بعد. أضف أول مقالة من الزر أعلاه.")); return; }
  articles.sort((a, b) => b.createdAt - a.createdAt).forEach(article => {
    const card = makeElement("article", "card article-card");
    card.append(makeElement("h3", "", article.title));
    if (article.summary) card.append(makeElement("p", "article-summary", article.summary));
    const body = makeElement("p", "article-body", article.body); body.hidden = true;
    const open = makeElement("button", "text-button", "قراءة المقالة"); open.type = "button";
    open.addEventListener("click", () => { body.hidden = !body.hidden; open.textContent = body.hidden ? "قراءة المقالة" : "إخفاء المقالة"; });
    const label = makeElement("label", "checkbox-field");
    const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = Boolean(article.read);
    checkbox.addEventListener("change", async () => { article.read = checkbox.checked; await repository.articles.put(article); showToast(article.read ? "تم تسجيل المقالة كمقروءة." : "أزيلت علامة القراءة."); });
    label.append(checkbox, makeElement("span", "", "تمت القراءة"));
    card.append(open, body, label); list.append(card);
  });
}

function renderHistory() {
  const list = $("#history-list"); list.replaceChildren();
  if (!nights.length) { list.append(makeElement("div", "empty-state", "لم تسجل أي ليلة بعد. ابدأ التتبع من الرئيسية.")); return; }
  nights.sort((a, b) => b.startedAt - a.startedAt).forEach(night => {
    const card = makeElement("article", "card night-card");
    card.append(makeElement("h3", "", dateText(night.startedAt)));
    const meta = makeElement("p", "night-meta", `${formatDuration((night.endedAt || night.startedAt) - night.startedAt)} · الجودة: ${night.quality == null ? "غير متاحة" : `${night.quality}%`} · الشخير: ${night.snoreTimes.length}`);
    card.append(meta);
    if (night.status === "interrupted") card.append(makeElement("p", "helper", "توقف التتبع بسبب إغلاق الصفحة أو إعادة تحميلها."));
    const snore = night.snoreTimes.length ? night.snoreTimes.map(dateText).join("، ") : "لم يُرصد شخير";
    card.append(makeElement("p", "helper", `أوقات الشخير: ${snore}`));
    const label = makeElement("label", "field"); label.append(makeElement("span", "", "ملاحظات هذه الليلة"));
    const textarea = document.createElement("textarea"); textarea.value = night.note || ""; textarea.rows = 3; textarea.placeholder = "كيف شعرت عند الاستيقاظ؟"; label.append(textarea); card.append(label);
    const save = makeElement("button", "secondary-button small", "حفظ اليوميات"); save.type = "button";
    save.addEventListener("click", async () => { night.note = textarea.value; await repository.nights.put(night); showToast("حُفظت يوميات هذه الليلة."); });
    card.append(save); list.append(card);
  });
}

function renderStats() {
  const done = nights.filter(night => night.endedAt);
  const withQuality = done.filter(night => night.quality != null);
  $("#average-duration").textContent = done.length ? formatDuration(done.reduce((sum, night) => sum + night.endedAt - night.startedAt, 0) / done.length) : "—";
  $("#average-quality").textContent = withQuality.length ? `${Math.round(withQuality.reduce((sum, night) => sum + night.quality, 0) / withQuality.length)}%` : "—";
  $("#total-snores").textContent = done.length ? String(done.reduce((sum, night) => sum + night.snoreTimes.length, 0)) : "—";
  const days = $("#chart-period").value === "month" ? 30 : 7;
  const chart = $("#duration-chart"); chart.replaceChildren();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const buckets = Array.from({ length: days }, (_, index) => {
    const start = now.getTime() - (days - index - 1) * 86400000;
    const total = done.filter(night => night.startedAt >= start && night.startedAt < start + 86400000).reduce((sum, night) => sum + night.endedAt - night.startedAt, 0);
    return { start, hours: total / 3600000 };
  });
  const max = Math.max(8, ...buckets.map(day => day.hours));
  chart.classList.toggle("month", days === 30);
  buckets.forEach(day => {
    const column = makeElement("div", "chart-column");
    const bar = makeElement("div", "chart-bar"); bar.style.height = `${Math.max(2, day.hours / max * 100)}%`;
    bar.title = `${new Intl.DateTimeFormat("ar", { dateStyle: "medium" }).format(day.start)}: ${day.hours.toFixed(1)} ساعة`;
    const label = makeElement("span", "", new Intl.DateTimeFormat("ar", { day: "numeric" }).format(day.start));
    column.append(bar, label); chart.append(column);
  });
  chart.setAttribute("aria-label", `رسم مدة النوم لآخر ${days} يوماً`);
}

async function load() {
  try {
    [nights, articles] = await Promise.all([repository.nights.all(), repository.articles.all()]);
    settings = { ...defaults, ...(await repository.settings.get("preferences"))?.value };
    const interrupted = nights.filter(night => night.status === "tracking");
    for (const night of interrupted) {
      night.status = "interrupted";
      night.endedAt = night.samples.at(-1)?.at || night.startedAt;
      night.quality = qualityFor(night);
      await repository.nights.put(night);
    }
    if (interrupted.length) showToast("انقطع تتبع ليلة سابقة بعد إغلاق الصفحة. راجع السجل واضبط منبهاً احتياطياً.");
  } catch (error) { showToast("تعذر فتح التخزين المحلي. قد لا تُحفظ البيانات في وضع التصفح الخاص."); }
  $("#alarm-window").value = String(settings.window);
  $("#sound-select").value = settings.sound;
  $("#sound-volume").value = settings.volume;
  $("#volume-value").textContent = `${settings.volume}%`;
  $("#settings-window").value = String(settings.window);
  $("#settings-sound").value = settings.sound;
  $("#settings-mic").checked = settings.microphone;
  $("#settings-notifications").checked = settings.notifications;
  $("#wake-time").value = "07:00";
  renderArticles(); renderHistory(); updateTrackingUi();
}

$$('.tab').forEach(tab => tab.addEventListener("click", () => switchView(tab.dataset.view)));
$("#settings-open").addEventListener("click", () => switchView("settings"));
$("#settings-back").addEventListener("click", () => switchView(previousView));
$("#start-button").addEventListener("click", startTracking);
$("#stop-button").addEventListener("click", () => stopTracking());
$("#dismiss-alarm").addEventListener("click", () => { alarm.stop(); $("#dismiss-alarm").hidden = true; });
$("#chart-period").addEventListener("change", renderStats);
$("#article-add-toggle").addEventListener("click", () => { const form = $("#article-form"); form.hidden = !form.hidden; if (!form.hidden) $("#article-title").focus(); });
$("#article-form").addEventListener("submit", async event => {
  event.preventDefault();
  const article = { id: crypto.randomUUID(), title: $("#article-title").value.trim(), summary: $("#article-summary").value.trim(), body: $("#article-body").value.trim(), createdAt: Date.now(), read: false };
  if (!article.title || !article.body) return;
  await repository.articles.put(article); articles.push(article); event.target.reset(); event.target.hidden = true; renderArticles(); showToast("أُضيفت المقالة.");
});
$("#sound-toggle").addEventListener("click", async () => {
  if (ambient.playing) { ambient.stop(); $("#sound-toggle").textContent = "تشغيل الصوت"; return; }
  if ($("#sound-select").value === "off") { showToast("اختر صوتاً أولاً."); return; }
  try { await ambient.play($("#sound-select").value, Number($("#sound-volume").value)); $("#sound-toggle").textContent = "إيقاف الصوت"; }
  catch (_) { showToast("تعذر تشغيل الصوت على هذا المتصفح."); }
});
$("#sound-select").addEventListener("change", async () => {
  if (ambient.playing) { if ($("#sound-select").value === "off") { ambient.stop(); $("#sound-toggle").textContent = "تشغيل الصوت"; } else await ambient.play($("#sound-select").value, Number($("#sound-volume").value)); }
});
$("#sound-volume").addEventListener("input", event => { $("#volume-value").textContent = `${event.target.value}%`; ambient.setVolume(Number(event.target.value)); });
$("#settings-form").addEventListener("submit", async event => {
  event.preventDefault();
  settings = { window: Number($("#settings-window").value), sound: $("#settings-sound").value, volume: Number($("#sound-volume").value), microphone: $("#settings-mic").checked, notifications: $("#settings-notifications").checked };
  if (settings.notifications && "Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch (_) {} }
  await repository.settings.put("preferences", settings);
  $("#alarm-window").value = String(settings.window); $("#sound-select").value = settings.sound;
  showToast("حُفظت الإعدادات."); switchView(previousView);
});
document.addEventListener("visibilitychange", () => { if (!document.hidden && active) { updateTrackingUi(); checkAlarm(); } });
window.addEventListener("pagehide", () => { if (active) sensor?.stop(); ambient.stop(); alarm.stop(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
load();
