/**
 * Time utility functions for HH:mm calculations
 */

export function parseMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutes(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes);
  const hours = Math.floor(normalized / 60) % 24;
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const current = parseMinutes(timeStr);
  return formatMinutes(current + minutesToAdd);
}

export function timeDiffMinutes(startTime: string, endTime: string): number {
  const s = parseMinutes(startTime);
  const e = parseMinutes(endTime);
  return e - s;
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = parseMinutes(startA);
  const eA = parseMinutes(endA);
  const sB = parseMinutes(startB);
  const eB = parseMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} ~ ${end}`;
}
