export function formatCourseDate(date: string): string {
  const parsedDate = new Date(date + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES').format(parsedDate);
}

export function normalizeCourseText(value: string): string {
  return value.toLowerCase().trim();
}
