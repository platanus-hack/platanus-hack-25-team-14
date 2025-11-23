import { MedicalDocument } from "../types/medical";
import { mockDocuments } from "./mockData";

const STORAGE_KEY = "medical_documents";

export const storage = {
  getDocuments(): MedicalDocument[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with mock data
    this.saveDocuments(mockDocuments);
    return mockDocuments;
  },

  saveDocuments(documents: MedicalDocument[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  },

  addDocument(document: MedicalDocument): void {
    const documents = this.getDocuments();
    documents.unshift(document);
    this.saveDocuments(documents);
  },

  updateDocument(id: string, updates: Partial<MedicalDocument>): void {
    const documents = this.getDocuments();
    const index = documents.findIndex((doc) => doc.id === id);
    if (index !== -1) {
      documents[index] = { ...documents[index], ...updates };
      this.saveDocuments(documents);
    }
  },

  deleteDocument(id: string): void {
    const documents = this.getDocuments();
    const filtered = documents.filter((doc) => doc.id !== id);
    this.saveDocuments(filtered);
  },
};
