export type DocumentCategory = 
  | 'exam'
  | 'appointment'
  | 'prescription'
  | 'lab-result'
  | 'imaging'
  | 'vaccination'
  | 'other';

export interface MedicalDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  provider?: string;
  notes?: string;
  metadata?: {
    extractedText?: string;
    aiClassification?: string;
    confidence?: number;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  category: DocumentCategory;
  title: string;
  description?: string;
  documentId?: string;
}
