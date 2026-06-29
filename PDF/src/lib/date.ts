export function todayFileName() {
  return `مستند_${new Date().toISOString().slice(0, 10)}`;
}

export function formatArabicDate(date = new Date()) {
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
