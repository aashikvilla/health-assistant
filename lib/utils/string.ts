/**
 * Shared string utility functions.
 * All functions are pure and handle null/undefined/empty inputs without throwing.
 */

/**
 * Converts each word in a string to title case.
 * First character of each whitespace-delimited word is uppercased; the rest are lowercased.
 * Returns '' for null, undefined, or empty input.
 *
 * @example toTitleCase('LAvanya sharma') → 'Lavanya Sharma'
 * @example toTitleCase(null) → ''
 */
export function toTitleCase(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Strips a leading medication form prefix from a drug name.
 * Matches: Tab., Cap., Syr., Inj. (case-insensitive, followed by optional whitespace).
 * Returns the name unchanged if no recognised prefix is found.
 *
 * @example stripMedicationPrefix('Tab. Pantoprazole 40 mg') → 'Pantoprazole 40 mg'
 * @example stripMedicationPrefix('CAP.Amoxicillin 500mg')  → 'Amoxicillin 500mg'
 * @example stripMedicationPrefix('Metformin 500mg')        → 'Metformin 500mg'
 */
export function stripMedicationPrefix(name: string): string {
  if (!name) return name
  return name.replace(/^(tab|cap|syr|inj)\.\s*/i, '')
}
