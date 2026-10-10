export function calculateEndDate(startDateStr: string, durationDays: number): string {
  try {
    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return startDateStr;
    const days = Math.max(1, durationDays);
    const end = new Date(start);
    end.setDate(end.getDate() + (days - 1));
    return end.toISOString().split('T')[0];
  } catch {
    return startDateStr;
  }
}

export function calculateDurationFromDates(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  } catch {
    return 1;
  }
}

export function formatDatePretty(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
