export interface PrescriptionData {
  doctorName?: string;
  date?: string;
  medications: Array<{
    drugName: string;
    dose?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  diagnoses?: string[];
  notes?: string;
}
export interface ExamData {
  title: string;
  category?: string;
  examDate?: string;
  reportDate?: string;
  labName?: string;
  orderingDoctor?: string;
  specialty?: string;
  source: string;
  results: Array<{
    name: string;
    valueNumeric?: number;
    valueText?: string;
    unit?: string;
    referenceMin?: number;
    referenceMax?: number;
    referenceRange?: string;
    interpretation?: string;
    comment?: string;
    orderIndex?: number;
  }>;
}

export interface ConsultationData {
  doctorName?: string;
  date?: string;
  specialty?: string;
  notes?: string;
}
