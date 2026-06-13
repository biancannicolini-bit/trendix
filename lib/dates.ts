export function getCurrentWeekStart(from = new Date()): Date {
  const day = from.getDay();
  const diff = from.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(from);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getNextWeekStart(from = new Date()): Date {
  const monday = getCurrentWeekStart(from);
  monday.setDate(monday.getDate() + 7);
  return monday;
}

/** Semana visible en dashboard: vie-dom muestra la entrante si existe. */
export function getActiveWeekStarts(from = new Date()): Date[] {
  const current = getCurrentWeekStart(from);
  const next = getNextWeekStart(from);
  const day = from.getDay();

  if (day >= 5) return [next, current];
  return [current, next];
}
