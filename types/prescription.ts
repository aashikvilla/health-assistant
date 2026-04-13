import type { MedicationExplanation } from './analysis'

export type Confidence = 'high' | 'low'

/** Raw medication row as extracted from a prescription image/PDF (Stage 2). */
export interface Medication {
  id?: string
  name: string
  dosage: string
  duration: string
  confidence: Confidence
}

/**
 * Hydrated prescription used by the /explanation/[id] page (Stage 3).
 * Medications carry the AI-generated plain-language explanation, not the
 * raw extraction shape.
 */
export interface PrescriptionExplanation {
  id: string
  patientName: string
  doctorName: string
  disclaimerDoctorName: string
  date: string
  medications: (MedicationExplanation & { id: string })[]
  doctorNotes: string[]
}

export interface PrescriptionData {
  doctor: string
  doctorConfidence: Confidence
  date: string
  dateConfidence: Confidence
  illness: string
  illnessConfidence: Confidence
  medications: Medication[]
}
