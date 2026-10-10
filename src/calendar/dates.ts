// Local date-times as ISO strings without a zone ('2025-10-09T16:00'), as
// DatePicker gives dates: what a lesson's time means where it's taught.

const pad = (n: number) => String(n).padStart(2, '0')

export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const toISODateTime = (d: Date) => `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`

// '2025-10-09' or '2025-10-09T16:00' as a local Date.
export function parse(value: string) {
  const [date, time = '00:00'] = value.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(y, m - 1, d, h || 0, min || 0)
}

export const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, d.getHours(), d.getMinutes())
export const addMinutes = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60000)
export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes()
export const sameDay = (a: Date, b: Date) => toISODate(a) === toISODate(b)

// The first day of the week holding `d` (Monday by default).
export function startOfWeek(d: Date, weekStartsOn = 1) {
  const back = (d.getDay() - weekStartsOn + 7) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - back)
}
