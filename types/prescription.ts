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
