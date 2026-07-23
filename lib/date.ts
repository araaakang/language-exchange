export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export function formatChatDateDivider(date: Date): string {
  const now = new Date();

  if (isSameDay(date, now)) return "今天";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "昨天";

  const weekday = WEEKDAY_LABELS[date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (date.getFullYear() === now.getFullYear()) {
    return `${month} 月 ${day} 日（${weekday}）`;
  }

  return `${date.getFullYear()} 年 ${month} 月 ${day} 日（${weekday}）`;
}
