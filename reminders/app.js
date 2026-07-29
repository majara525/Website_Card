(() => {
  "use strict";

  const STORAGE_KEY = "tazkirati_web_v2";
  const EVENT_KEY = "tazkirati_events_v1";
  const DEFAULT_CATEGORIES = [
    "● شخصي", "🍽 طعام", "🛠 أدوات", "✓ أساسيات", "🛒 تسوق",
    "💊 صحة", "💼 عمل", "📚 دراسة", "🏠 منزل", "📞 اتصالات"
  ];
  const DAY_NAMES = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
  const DAY_INDEX = [6, 0, 1, 2, 3, 4, 5];

  const state = load();
  let tab = "reminders";
  let editingId = null;

  const view = document.getElementById("view");
  const tools = document.getElementById("reminder-tools");
  const editor = document.getElementById("editor");
  const form = document.getElementById("reminder-form");
  const details = document.getElementById("details");

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        reminders: Array.isArray(saved.reminders) ? saved.reminders : [],
        categories: Array.isArray(saved.categories) ? saved.categories : [...DEFAULT_CATEGORIES]
      };
    } catch {
      return { reminders: [], categories: [...DEFAULT_CATEGORIES] };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function record(type, reminder) {
    let events = [];
    try { events = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]"); } catch {}
    events.push({
      type,
      time: Date.now(),
      reminderId: reminder?.id || 0,
      duration: reminder?.lastTriggeredAt ? Math.max(0, Date.now() - reminder.lastTriggeredAt) : 0
    });
    localStorage.setItem(EVENT_KEY, JSON.stringify(events.slice(-2000)));
  }

  function localDateTimeValue(time) {
    const date = new Date(time);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  function formatDate(time) {
    return new Intl.DateTimeFormat("ar", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(time));
  }

  function timeToMinutes(value) {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  }

  function minuteLabel(value) {
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  }

  function nextOccurrence(reminder, after = Date.now()) {
    if (!reminder.enabled) return -1;
    if (reminder.snoozedUntil > after) return reminder.snoozedUntil;
    if (reminder.mode === "once") return reminder.startAt > after ? reminder.startAt : -1;
    const intervalMs = Math.max(1, reminder.interval) * 60000;
    if (reminder.mode === "interval") {
      if (reminder.startAt > after) return reminder.startAt;
      return reminder.startAt + (Math.floor((after - reminder.startAt) / intervalMs) + 1) * intervalMs;
    }

    const midnight = new Date(after);
    midnight.setHours(0, 0, 0, 0);
    let best = Infinity;
    for (let offset = -1; offset <= 8; offset += 1) {
      const day = new Date(midnight);
      day.setDate(day.getDate() + offset);
      const dayIndex = DAY_INDEX[day.getDay()];
      if (!(reminder.daysMask & (1 << dayIndex))) continue;
      const custom = reminder.dayRanges?.[dayIndex];
      const startMinute = custom?.start ?? reminder.rangeStart;
      const endMinute = custom?.end ?? reminder.rangeEnd;
      const start = new Date(day);
      start.setMinutes(startMinute);
      const end = new Date(day);
      end.setMinutes(endMinute);
      if (endMinute <= startMinute) end.setDate(end.getDate() + 1);
      let candidate = start.getTime();
      if (candidate <= after) candidate += (Math.floor((after - candidate) / intervalMs) + 1) * intervalMs;
      if (candidate <= end.getTime()) best = Math.min(best, candidate);
    }
    return Number.isFinite(best) ? best : -1;
  }

  function scheduleLabel(reminder) {
    if (reminder.mode === "once") return `مرة واحدة — ${formatDate(reminder.startAt)}`;
    if (reminder.mode === "interval") return `كل ${reminder.interval} دقيقة بدءًا من ${formatDate(reminder.startAt)}`;
    return `كل ${reminder.interval} دقيقة، من ${minuteLabel(reminder.rangeStart)} إلى ${minuteLabel(reminder.rangeEnd)}`;
  }

  function render() {
    document.querySelectorAll(".tabs button").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    tools.hidden = !["reminders", "favorites"].includes(tab);
    if (tab === "analytics") renderAnalytics();
    else if (tab === "settings") renderSettings();
    else renderReminders(tab === "favorites");
  }

  function renderReminders(favoritesOnly) {
    const query = document.getElementById("search").value.trim().toLocaleLowerCase("ar");
    const sort = document.getElementById("sort").value;
    const direction = document.getElementById("direction").value === "asc" ? 1 : -1;
    const reminders = state.reminders.filter(reminder => {
      if (favoritesOnly && !reminder.favorite) return false;
      const text = `${reminder.title} ${reminder.notes} ${reminder.category} ${reminder.location}`.toLocaleLowerCase("ar");
      return !query || text.includes(query);
    });
    reminders.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "ar") * direction;
      if (sort === "modified") return (a.updatedAt - b.updatedAt) * direction;
      if (sort === "category") return a.category.localeCompare(b.category, "ar") * direction;
      const aNext = nextOccurrence(a); const bNext = nextOccurrence(b);
      return ((aNext < 0 ? Infinity : aNext) - (bNext < 0 ? Infinity : bNext)) * direction;
    });
    if (!reminders.length) {
      view.innerHTML = `<div class="notice">${favoritesOnly ? "لا توجد تذكيرات مفضلة بعد." : "لا توجد تذكيرات مطابقة."}</div>`;
      return;
    }
    view.innerHTML = `<div class="reminder-list">${reminders.map(reminderCard).join("")}</div>`;
  }

  function reminderCard(reminder) {
    const next = nextOccurrence(reminder);
    return `
      <article class="reminder-card ${reminder.enabled ? "" : "off"}" data-id="${reminder.id}">
        <div class="card-head">
          <div><h3>${escapeHtml(reminder.title)}</h3><p class="meta">${escapeHtml(reminder.category)} · ${escapeHtml(reminder.intensity)}</p></div>
          <button class="star" data-action="favorite" aria-label="المفضلة">${reminder.favorite ? "★" : "☆"}</button>
        </div>
        ${reminder.notes ? `<p>${escapeHtml(reminder.notes).replaceAll("\n", "<br>")}</p>` : ""}
        ${reminder.location ? `<p class="meta">المكان: ${escapeHtml(reminder.location)}</p>` : ""}
        <p><b>${escapeHtml(scheduleLabel(reminder))}</b></p>
        <p class="meta">${reminder.enabled && next > 0 ? `القادم: ${formatDate(next)}` : "متوقف أو منتهٍ"}</p>
        <div class="card-actions">
          <button data-action="view">عرض</button>
          <button data-action="edit">تعديل</button>
          <button data-action="complete">تم</button>
          <button data-action="toggle">${reminder.enabled ? "إيقاف" : "تشغيل"}</button>
          <button data-action="delete">حذف</button>
        </div>
      </article>`;
  }

  function openEditor(reminder = null) {
    editingId = reminder?.id || null;
    document.getElementById("editor-title").textContent = reminder ? "تعديل التذكير" : "تذكير جديد";
    document.getElementById("reminder-id").value = editingId || "";
    document.getElementById("title").value = reminder?.title || "";
    document.getElementById("notes").value = reminder?.notes || "";
    fillCategories(reminder?.category);
    document.getElementById("custom-category").value = "";
    document.getElementById("location").value = reminder?.location || "";
    document.getElementById("favorite").checked = reminder?.favorite || false;
    document.getElementById("mode").value = reminder?.mode || "once";
    document.getElementById("start-at").value = localDateTimeValue(reminder?.startAt || Date.now() + 3600000);
    document.getElementById("interval").value = reminder?.interval || 60;
    document.getElementById("range-start").value = minuteLabel(reminder?.rangeStart ?? 480);
    document.getElementById("range-end").value = minuteLabel(reminder?.rangeEnd ?? 1020);
    document.getElementById("early").value = reminder?.early || 0;
    document.getElementById("intensity").value = reminder?.intensity || "متوسطة";
    document.getElementById("enabled").checked = reminder?.enabled ?? true;
    document.querySelectorAll(".days input").forEach((input, index) => {
      input.checked = reminder ? Boolean(reminder.daysMask & (1 << index)) : true;
    });
    updateModeFields();
    editor.showModal();
  }

  function fillCategories(selected) {
    const select = document.getElementById("category");
    select.innerHTML = state.categories.map(category =>
      `<option ${category === selected ? "selected" : ""}>${escapeHtml(category)}</option>`
    ).join("");
  }

  function updateModeFields() {
    const mode = document.getElementById("mode").value;
    document.querySelectorAll(".repeat-field").forEach(item => item.hidden = mode === "once");
    document.querySelectorAll(".range-field").forEach(item => item.hidden = mode !== "range");
  }

  function saveReminder(event) {
    event.preventDefault();
    const customCategory = document.getElementById("custom-category").value.trim();
    if (customCategory && !state.categories.includes(customCategory)) state.categories.push(customCategory);
    const existing = state.reminders.find(item => item.id === editingId);
    let daysMask = 0;
    document.querySelectorAll(".days input").forEach((input, index) => {
      if (input.checked) daysMask |= 1 << index;
    });
    const reminder = {
      id: editingId || Date.now(),
      title: document.getElementById("title").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      category: customCategory || document.getElementById("category").value,
      location: document.getElementById("location").value.trim(),
      favorite: document.getElementById("favorite").checked,
      mode: document.getElementById("mode").value,
      startAt: new Date(document.getElementById("start-at").value).getTime(),
      interval: Math.max(1, Number(document.getElementById("interval").value) || 1),
      rangeStart: timeToMinutes(document.getElementById("range-start").value),
      rangeEnd: timeToMinutes(document.getElementById("range-end").value),
      daysMask,
      dayRanges: existing?.dayRanges || {},
      early: Math.max(0, Number(document.getElementById("early").value) || 0),
      intensity: document.getElementById("intensity").value,
      enabled: document.getElementById("enabled").checked,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      lastTriggeredAt: existing?.lastTriggeredAt || 0,
      completed: existing?.completed || 0,
      snoozedUntil: 0
    };
    if (!reminder.title) return;
    if (existing) Object.assign(existing, reminder);
    else {
      state.reminders.push(reminder);
      record("created", reminder);
    }
    save();
    editor.close();
    render();
  }

  function showDetails(reminder) {
    const next = nextOccurrence(reminder);
    document.getElementById("details-content").innerHTML = `
      <div class="dialog-head"><h2>${reminder.favorite ? "★ " : ""}${escapeHtml(reminder.title)}</h2><button class="icon-close" data-close>×</button></div>
      <p class="meta">${escapeHtml(reminder.category)}</p>
      ${reminder.notes ? `<p>${escapeHtml(reminder.notes).replaceAll("\n", "<br>")}</p>` : ""}
      ${reminder.location ? `<p>المكان: ${escapeHtml(reminder.location)}</p>` : ""}
      <p><b>${escapeHtml(scheduleLabel(reminder))}</b></p>
      <p>${next > 0 ? `الموعد القادم: ${formatDate(next)}` : "لا يوجد موعد قادم"}</p>
      <div class="dialog-actions"><button class="button ghost" data-close>إغلاق</button><button class="button primary" data-detail-edit>تعديل</button></div>`;
    details.showModal();
    details.querySelectorAll("[data-close]").forEach(button => button.onclick = () => details.close());
    details.querySelector("[data-detail-edit]").onclick = () => { details.close(); openEditor(reminder); };
  }

  function complete(reminder) {
    const disable = confirm("اضغط «موافق» لإيقاف التذكير نهائيًا، أو «إلغاء» لتسجيل الإنجاز لهذه المرة فقط.");
    reminder.completed = (reminder.completed || 0) + 1;
    reminder.updatedAt = Date.now();
    if (disable || reminder.mode === "once") reminder.enabled = false;
    record("completed", reminder);
    save();
    render();
  }

  function renderAnalytics() {
    let events = [];
    try { events = JSON.parse(localStorage.getItem(EVENT_KEY) || "[]"); } catch {}
    const created = events.filter(event => event.type === "created");
    const completed = events.filter(event => event.type === "completed");
    const deleted = events.filter(event => event.type === "deleted");
    const hours = Array(24).fill(0);
    created.forEach(event => { hours[new Date(event.time).getHours()] += 1; });
    const busiest = hours.indexOf(Math.max(...hours));
    const durations = completed.map(event => event.duration).filter(Boolean);
    const average = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0;
    view.innerHTML = `
      <div class="stats">
        <div class="stat"><strong>${state.reminders.length}</strong>التذكيرات الحالية</div>
        <div class="stat"><strong>${created.length}</strong>أُضيف تاريخيًا</div>
        <div class="stat"><strong>${completed.length}</strong>مرات الإنجاز</div>
        <div class="stat"><strong>${deleted.length}</strong>المحذوفة</div>
      </div>
      <div class="notice">
        <p><b>الساعة الأكثر استخدامًا للإضافة:</b> ${created.length ? `${String(busiest).padStart(2, "0")}:00` : "لا توجد بيانات بعد"}</p>
        <p><b>متوسط وقت الإنجاز:</b> ${average ? durationLabel(average) : "لا توجد بيانات كافية"}</p>
        <p>هذه البيانات محفوظة محليًا في هذا المتصفح فقط.</p>
      </div>`;
  }

  function renderSettings() {
    view.innerHTML = `
      <div class="notice">
        <h2>الإشعارات</h2>
        <p>حالة الإذن: ${!("Notification" in window) ? "غير مدعومة" : Notification.permission === "granted" ? "مسموح" : "غير مسموح"}</p>
        <button class="button primary" id="allow-notifications">السماح بإشعارات الويب</button>
      </div>
      <div class="notice">
        <h2>نسخة احتياطية محلية</h2>
        <p>صدّر بياناتك إلى ملف، أو استوردها على هذا المتصفح.</p>
        <div class="card-actions"><button id="export-data">تصدير البيانات</button><button id="import-data">استيراد البيانات</button></div>
        <input id="import-file" type="file" accept="application/json" hidden>
      </div>
      <div class="notice">
        <h2>حدود نسخة الويب</h2>
        <p>عند إغلاق المتصفح قد تتوقف التنبيهات. الويدجت، التوقيت الدقيق، الأصوات المتقدمة والمرفقات متاحة بصورة أفضل في تطبيق أندرويد.</p>
      </div>`;
    document.getElementById("allow-notifications").onclick = async () => {
      if ("Notification" in window) await Notification.requestPermission();
      renderSettings();
    };
    document.getElementById("export-data").onclick = exportData;
    document.getElementById("import-data").onclick = () => document.getElementById("import-file").click();
    document.getElementById("import-file").onchange = importData;
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "نسخة-تذكيراتي.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported.reminders)) throw new Error();
      state.reminders = imported.reminders;
      state.categories = Array.isArray(imported.categories) ? imported.categories : [...DEFAULT_CATEGORIES];
      save();
      alert("تم استيراد البيانات بنجاح.");
      render();
    } catch {
      alert("تعذر قراءة ملف النسخة الاحتياطية.");
    }
  }

  function checkNotifications() {
    const now = Date.now();
    state.reminders.forEach(reminder => {
      if (!reminder.enabled) return;
      const next = nextOccurrence(reminder, now - 65000);
      if (next <= now && next > now - 65000 && reminder.lastWebAlert !== next) {
        reminder.lastWebAlert = next;
        reminder.lastTriggeredAt = now;
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(reminder.title, { body: reminder.notes || reminder.category, icon: "assets/icon.svg" });
        }
        save();
      }
    });
  }

  function durationLabel(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 1) return "أقل من دقيقة";
    if (minutes < 60) return `${minutes} دقيقة`;
    return `${Math.floor(minutes / 60)} ساعة و${minutes % 60} دقيقة`;
  }

  function escapeHtml(value = "") {
    return value.replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  document.querySelector(".days").innerHTML = DAY_NAMES.map((day, index) =>
    `<label><input type="checkbox" value="${index}" checked>${day}</label>`
  ).join("");
  document.querySelectorAll(".tabs button").forEach(button => {
    button.onclick = () => { tab = button.dataset.tab; render(); };
  });
  document.getElementById("new-reminder").onclick = () => openEditor();
  document.getElementById("search").addEventListener("input", render);
  document.getElementById("sort").addEventListener("change", render);
  document.getElementById("direction").addEventListener("change", render);
  document.getElementById("mode").addEventListener("change", updateModeFields);
  document.querySelectorAll("[data-editor-close]").forEach(button => {
    button.onclick = () => editor.close();
  });
  document.querySelectorAll("[data-prefix]").forEach(button => {
    button.onclick = () => {
      const notes = document.getElementById("notes");
      notes.setRangeText(button.dataset.prefix, notes.selectionStart, notes.selectionEnd, "end");
      notes.focus();
    };
  });
  document.getElementById("numbered-note").onclick = () => {
    const notes = document.getElementById("notes");
    const numbers = [...notes.value.matchAll(/^(\d+)\./gm)].map(match => Number(match[1]));
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    notes.setRangeText(`${next}. `, notes.selectionStart, notes.selectionEnd, "end");
    notes.focus();
  };
  form.addEventListener("submit", saveReminder);
  view.addEventListener("click", event => {
    const card = event.target.closest(".reminder-card");
    if (!card) return;
    const reminder = state.reminders.find(item => item.id === Number(card.dataset.id));
    if (!reminder) return;
    const action = event.target.dataset.action;
    if (action === "favorite") { reminder.favorite = !reminder.favorite; save(); render(); }
    else if (action === "view") showDetails(reminder);
    else if (action === "edit") openEditor(reminder);
    else if (action === "complete") complete(reminder);
    else if (action === "toggle") { reminder.enabled = !reminder.enabled; save(); render(); }
    else if (action === "delete" && confirm("هل تريد حذف هذا التذكير؟")) {
      state.reminders = state.reminders.filter(item => item.id !== reminder.id);
      record("deleted", reminder); save(); render();
    }
  });
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
  setInterval(checkNotifications, 30000);
  render();
})();
