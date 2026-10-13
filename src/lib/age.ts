export const MIN_AGE = 16;

/** `birthISO` au format "YYYY-MM-DD". */
export function isOldEnough(birthISO: string, minAge: number = MIN_AGE, now: Date = new Date()): boolean {
  const [year, month, day] = birthISO.split('-').map(Number);
  if (!year || !month || !day) return false;
  let age = now.getFullYear() - year;
  const month0 = now.getMonth() + 1;
  if (month0 < month || (month0 === month && now.getDate() < day)) age -= 1;
  return age >= minAge;
}
