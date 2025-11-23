import { MedicalDocument, TimelineEvent } from "../types/medical";

export const mockDocuments: MedicalDocument[] = [
  {
    id: "1",
    title: "Annual Physical Examination",
    category: "exam",
    date: "2024-11-15",
    description: "Routine annual checkup with Dr. Smith",
    provider: "Dr. Sarah Smith",
    notes: "All vitals normal. Blood pressure: 120/80",
  },
  {
    id: "2",
    title: "Blood Test Results",
    category: "lab-result",
    date: "2024-11-10",
    description: "Complete blood count and metabolic panel",
    provider: "City Lab",
    notes: "All values within normal range",
  },
  {
    id: "3",
    title: "Prescription - Amoxicillin",
    category: "prescription",
    date: "2024-10-22",
    description: "Antibiotic for respiratory infection",
    provider: "Dr. John Davis",
    notes: "500mg, 3x daily for 7 days",
  },
  {
    id: "4",
    title: "Dental Cleaning Appointment",
    category: "appointment",
    date: "2024-10-05",
    description: "Routine dental cleaning and checkup",
    provider: "Dr. Emily Wilson, DDS",
  },
  {
    id: "5",
    title: "Chest X-Ray",
    category: "imaging",
    date: "2024-09-18",
    description: "Chest X-ray for persistent cough",
    provider: "Radiology Associates",
    notes: "No abnormalities detected",
  },
  {
    id: "6",
    title: "COVID-19 Booster",
    category: "vaccination",
    date: "2024-09-01",
    description: "COVID-19 vaccine booster shot",
    provider: "Community Health Clinic",
  },
];

export const mockTimeline: TimelineEvent[] = mockDocuments.map((doc) => ({
  id: doc.id,
  date: doc.date,
  category: doc.category,
  title: doc.title,
  description: doc.description,
  documentId: doc.id,
}));
