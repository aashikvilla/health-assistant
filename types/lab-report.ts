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
