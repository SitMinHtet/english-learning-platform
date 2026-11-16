/** Local calendar day (Myanmar PC clock) — not UTC */
export function localDayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Yesterday in local calendar */
export function localYesterdayKey(d = new Date()): string {
  const y = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
  return localDayKey(y)
}

/** Stable day index for rotation (local midnight based) */
export function localDayIndex(d = new Date()): number {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor(local.getTime() / 86400000)
}

export function formatDayMy(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return key
  return `${d}/${m}/${y}`
}

/** ms until next local midnight */
export function msUntilNextLocalMidnight(now = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return Math.max(1000, next.getTime() - now.getTime())
}

/** ISO-like local week key (YYYY-Www) for weekly AI cache */
export function localWeekKey(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  const week =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
}
