export type Confidence = 'high' | 'low'

export interface Medication {
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
  medications: Medication[]
}
