// lib/frequency.ts
// M/A/N frequency parser and time calculation functions

/** The three default reminder time slots in HH:MM format (UTC). */
export const DEFAULT_TIMES = {
  morning:   '08:00',
  afternoon: '13:00',
  night:     '21:00',
} as const

export type TimeSlot = 'morning' | 'afternoon' | 'night'

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
 * Given a reminder time string (HH:MM) and a reference Date (defaults to now),
 * return the next future Date at which that time occurs.
 *
 * If the time has already passed today (UTC), returns tomorrow at that time.
 * If the time is still in the future today (UTC), returns today at that time.
 *
 * @param timeStr   e.g. '08:00'
 * @param now       Reference point (default: new Date())
 * @returns         Next future Date for this time slot (UTC)
 */
export function computeNextOccurrence(timeStr: string, now: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  // Create a date for today at the specified time (UTC)
  const nextOccurrence = new Date(now)
  nextOccurrence.setUTCHours(hours, minutes, 0, 0)

  // If the time has already passed today, move to tomorrow
  if (nextOccurrence <= now) {
    nextOccurrence.setUTCDate(nextOccurrence.getUTCDate() + 1)
  }

  return nextOccurrence
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
