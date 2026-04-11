// OCR/upload types — used by stage-2 upload flow
export type Confidence = 'high' | 'low'

export interface ScannedMedication {
  name: string
  dosage: string
  duration: string
  confidence: Confidence
}

export interface PrescriptionData {
  doctor: string
  doctorConfidence: Confidence
  date: string
  dateConfidence: Confidence
  illness: string
  illnessConfidence: Confidence
  medications: ScannedMedication[]
}

// AI explanation types — used by stage-3 insight flow
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  treats: string
  howToTake: string
  sideEffects: string
  avoid: string
}

export interface PrescriptionExplanation {
  id: string
  doctorName: string
  date: string
  patientName: string
  patientRelation?: string
  medications: Medication[]
  doctorNotes: string[]
  disclaimerDoctorName: string
}
