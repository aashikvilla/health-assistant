// Typed shapes for the Json fields inside document_analyses.
// The DB stores these as untyped Json — cast to these interfaces when reading.
//
// Usage:
//   const meds = analysis.medications_found as MedicationExplanation[]
//   const notes = analysis.recommendations as string[]

/** One medication's AI-generated explanation — stored in document_analyses.medications_found */
export interface MedicationExplanation {
  name: string
  dosage: string
  frequency: string
  /** What condition this drug treats, in plain language */
  treats: string
  /** Timing, food interactions, how to swallow */
  how_to_take: string
  /** Common side effects, plainly worded */
  side_effects: string
  /** Food/drink/activity interactions to avoid */
  avoid: string
}

/** Typed overlay for the Json columns in document_analyses */
export interface DocumentAnalysisData {
  /** AI explanation per medication — cast medications_found to this */
  medications_found: MedicationExplanation[]
  /** "Things to tell your doctor" bullet list — cast recommendations to this */
  recommendations: string[]
  /** Structured key findings (lab values out of range, flags, etc.) */
  key_findings: Record<string, unknown> | null
  /** Risk flags surfaced by the LLM */
  risk_flags: string[] | null
  /** Medical terms explained in plain language */
  terms_explained: Record<string, string> | null
}
