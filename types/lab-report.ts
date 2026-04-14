import type { Confidence } from '@/types/prescription'

export interface LabTest {
  testName: string
  result: string
  unit: string
  referenceRange: string
  status: 'normal' | 'low' | 'high' | 'critical' | ''
  confidence: Confidence
}

export interface LabReportData {
  patientName: string
  patientNameConfidence: Confidence
  testDate: string
  testDateConfidence: Confidence
  labName: string
  labNameConfidence: Confidence
  doctorName: string
  doctorNameConfidence: Confidence
  tests: LabTest[]
}

/** A single out-of-range marker with AI explanation — returned by /api/analyse */
export interface AbnormalMarker {
  id: string
  name: string
  value: string
  unit: string
  status: 'low' | 'high' | 'critical'
  referenceRange: string
  explanation: string
}

/** AI analysis of a lab report — only out-of-range markers + doctor notes */
export interface LabReportExplanation {
  patientName: string
  labName: string
  testDate: string
  doctorName: string
  abnormalMarkers: AbnormalMarker[]
  doctorNotes: string[]
}
