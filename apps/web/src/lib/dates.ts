/** Calendar dates as local "YYYY-MM-DD" keys, so sample data always sits on today's week */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Local noon avoids daylight-saving edge cases when adding days */
function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey(now = new Date()) {
  return toKey(now)
}

export function addDays(key: string, days: number) {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** "Tue" */
export function weekdayShort(key: string) {
  return WEEKDAYS[fromKey(key).getDay()]
}

/** 22 */
export function dayOfMonth(key: string) {
  return fromKey(key).getDate()
}

/** "Tue 22 Sep" */
export function formatDay(key: string) {
  const d = fromKey(key)
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** "Tue 22 Sep 2026" */
export function formatDayWithYear(key: string) {
  return `${formatDay(key)} ${fromKey(key).getFullYear()}`
}

/** Monday to Sunday of the week containing `key` */
export function weekOf(key: string) {
  const offset = (fromKey(key).getDay() + 6) % 7 // days since Monday
  const monday = addDays(key, -offset)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}
