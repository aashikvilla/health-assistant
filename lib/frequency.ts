// lib/frequency.ts
// M/A/N frequency parser and time calculation functions

/** 
 * The three default reminder time slots in HH:MM format (IST - Indian Standard Time).
 * These are the user-facing times in IST timezone.
 */
export const DEFAULT_TIMES = {
  morning:   '08:00',  // 8:00 AM IST
  afternoon: '13:00',  // 1:00 PM IST
  night:     '21:00',  // 9:00 PM IST
} as const

export type TimeSlot = 'morning' | 'afternoon' | 'night'

/** IST timezone offset in minutes (UTC+5:30) */
const IST_OFFSET_MINUTES = 330 // 5 hours 30 minutes = 330 minutes

/**
 * Parse an M/A/N frequency string into reminder times.
 *
 * @param frequency  e.g. "1-0-1" → ['08:00', '21:00']
 * @returns          Subset of ['08:00', '13:00', '21:00'] for non-zero positions.
 *                   Returns [] for non-matching or all-zero input.
 */
export function parseFrequency(frequency: string): string[] {
  // Match pattern: <int>-<int>-<int>
  const match = frequency.match(/^(\d+)-(\d+)-(\d+)$/)
  if (!match) return []

  const [, morning, afternoon, night] = match
  const morningCount = parseInt(morning, 10)
  const afternoonCount = parseInt(afternoon, 10)
  const nightCount = parseInt(night, 10)

  // Return empty array if all zeros
  if (morningCount === 0 && afternoonCount === 0 && nightCount === 0) {
    return []
  }

  const times: string[] = []
  if (morningCount > 0) times.push(DEFAULT_TIMES.morning)
  if (afternoonCount > 0) times.push(DEFAULT_TIMES.afternoon)
  if (nightCount > 0) times.push(DEFAULT_TIMES.night)

  return times
}

/**
 * Given a reminder time string (HH:MM in IST) and a reference Date (defaults to now),
 * return the next future Date at which that time occurs.
 *
 * The input time is interpreted as IST (UTC+5:30), and the returned Date is in UTC
 * for storage in the database.
 *
 * If the time has already passed today (in IST), returns tomorrow at that time.
 * If the time is still in the future today (in IST), returns today at that time.
 *
 * @param timeStr   e.g. '08:00' (interpreted as 8:00 AM IST)
 * @param now       Reference point (default: new Date())
 * @returns         Next future Date for this time slot (in UTC for database storage)
 */
export function computeNextOccurrence(timeStr: string, now: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  // Convert current UTC time to IST for comparison
  const nowInIST = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000)
  
  // Create a date for today at the specified time in IST
  const nextOccurrenceIST = new Date(nowInIST)
  nextOccurrenceIST.setHours(hours, minutes, 0, 0)
  
  // If the time has already passed today in IST, move to tomorrow
  if (nextOccurrenceIST <= nowInIST) {
    nextOccurrenceIST.setDate(nextOccurrenceIST.getDate() + 1)
  }
  
  // Convert back to UTC for database storage
  const nextOccurrenceUTC = new Date(nextOccurrenceIST.getTime() - IST_OFFSET_MINUTES * 60 * 1000)
  
  return nextOccurrenceUTC
}

/**
 * Derive the M/A/N string from a list of reminder times.
 * Inverse of parseFrequency — used for the round-trip property.
 *
 * @param times  e.g. ['08:00', '21:00'] → '1-0-1'
 * @returns      M/A/N string with 1 for each present slot, 0 for absent
 */
export function timesToFrequencyString(times: string[]): string {
  const hasMorning = times.includes(DEFAULT_TIMES.morning) ? 1 : 0
  const hasAfternoon = times.includes(DEFAULT_TIMES.afternoon) ? 1 : 0
  const hasNight = times.includes(DEFAULT_TIMES.night) ? 1 : 0

  return `${hasMorning}-${hasAfternoon}-${hasNight}`
}

/**
 * Map a reminder time string to its human-readable slot label.
 *
 * @param timeStr  '08:00' | '13:00' | '21:00'
 * @returns        'Morning' | 'Afternoon' | 'Night'
 */
export function timeToSlotLabel(timeStr: string): string {
  switch (timeStr) {
    case DEFAULT_TIMES.morning:
      return 'Morning'
    case DEFAULT_TIMES.afternoon:
      return 'Afternoon'
    case DEFAULT_TIMES.night:
      return 'Night'
    default:
      return 'Unknown'
  }
}

/**
 * Convert a UTC Date to IST time string (HH:MM format).
 * Useful for displaying scheduled times to users in IST.
 *
 * @param date  Date object in UTC
 * @returns     Time string in IST (e.g., '08:00')
 */
export function formatTimeInIST(date: Date): string {
  const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000)
  const hours = istDate.getUTCHours().toString().padStart(2, '0')
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Convert a UTC Date to a human-readable IST datetime string.
 * Useful for displaying scheduled times to users.
 *
 * @param date  Date object in UTC
 * @returns     Formatted string like "Apr 19, 2026 at 8:00 AM IST"
 */
export function formatDateTimeInIST(date: Date): string {
  const istDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000)
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
  
  return istDate.toLocaleString('en-IN', options) + ' IST'
}
