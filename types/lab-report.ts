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

export interface MarkerAction {
  title:   string
  detail:  string
  urgent?: boolean
}

/** A single out-of-range marker with rich AI explanation */
export interface AbnormalMarker {
  id:             string
  name:           string
  /** Subtitle shown under the name, e.g. "25-Hydroxyvitamin D · Severely deficient" */
  sub?:           string
  value:          string
  unit:           string
  status:         'low' | 'high' | 'critical'
  referenceRange: string
  /** Plain-English "What this means for you" paragraph */
  explanation:    string
  /** Body systems/organs affected, e.g. ["Bones", "Immune system", "Mood"] */
  bodySystems?:   string[]
  /** 2–4 specific recommended actions */
  actions?:       MarkerAction[]
}

/** AI analysis of a lab report */
export interface LabReportExplanation {
  patientName:     string
  labName:         string
  testDate:        string
  doctorName:      string
  /** 2-3 sentence insight on how the abnormal findings relate to each other */
  summary?:        string
  /** Short tag phrases for the connection card, e.g. ["Low D worsens PCOD"] */
  connectionTags?: string[]
  abnormalMarkers: AbnormalMarker[]
  doctorNotes:     string[]
}
