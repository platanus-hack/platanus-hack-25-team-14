import type { Prisma } from "@prisma/client";
import type {
  LatestExamSummaryInput,
  ClinicalHistorySummaryInput,
} from "./openai";

export type ExamWithResults = Prisma.ExamGetPayload<{
  include: { results: true };
}>;

export const PATIENT_HISTORY_INCLUDE = {
  allergies: {
    orderBy: { createdAt: "desc" },
    take: 5,
  },
  conditions: {
    orderBy: { updatedAt: "desc" },
    take: 5,
  },
  surgeries: {
    orderBy: { date: "desc" },
    take: 3,
  },
  medicationPlans: {
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  },
  exams: {
    orderBy: { examDate: "desc" },
    take: 2,
    include: {
      results: {
        orderBy: { orderIndex: "asc" },
        take: 5,
      },
    },
  },
  consultations: {
    orderBy: { date: "desc" },
    take: 3,
    include: {
      diagnoses: true,
    },
  },
} satisfies Prisma.PatientInclude;

export type PatientHistorySnapshot = Prisma.PatientGetPayload<{
  include: typeof PATIENT_HISTORY_INCLUDE;
}>;

export function buildLatestExamSummaryInput(
  exam: ExamWithResults,
  patientName?: string | null
): LatestExamSummaryInput {
  return {
    patientName,
    exam: {
      title: exam.title,
      category: exam.category,
      examDate: formatDate(exam.examDate ?? exam.createdAt),
      labName: exam.labName,
      orderingDoctor: exam.orderingDoctor,
      notes: exam.rawText ?? exam.parsingNotes ?? null,
      keyFindings: exam.results.slice(0, 10).map((result) => ({
        name: result.name,
        value: formatResultValue(result),
        referenceRange: formatReferenceRange(result),
        interpretation: result.interpretation,
        isFlagged: result.isFlagged,
      })),
    },
  };
}

export function buildClinicalHistorySummaryInput(
  patient: PatientHistorySnapshot
): ClinicalHistorySummaryInput {
  return {
    patient: {
      name: patient.fullName,
      age: calculateAge(patient.dateOfBirth),
      sex: patient.sex,
      bloodType: patient.bloodType,
      emergencyNotes: patient.emergencyNotes,
    },
    allergies: patient.allergies.map((allergy) => ({
      substance: allergy.substance,
      reaction: allergy.reaction,
      isSevere: allergy.isSevere,
    })),
    conditions: patient.conditions.map((condition) => ({
      name: condition.name,
      status: condition.status,
      diagnosedAt: formatDate(condition.diagnosedAt),
    })),
    surgeries: patient.surgeries.map((surgery) => ({
      name: surgery.name,
      date: formatDate(surgery.date),
      notes: surgery.notes,
    })),
    medications: patient.medicationPlans.map((plan) => ({
      drugName: plan.drugName,
      dose: plan.dose,
      frequency: plan.frequency,
    })),
    recentConsultations: patient.consultations.map((consultation) => ({
      date: formatDate(consultation.date),
      specialty: consultation.specialty ?? consultation.doctorName ?? undefined,
      reason: consultation.reason ?? consultation.notes ?? undefined,
      keyDiagnoses: consultation.diagnoses
        .slice(0, 3)
        .map((diagnosis) => diagnosis.description),
    })),
    recentExams: patient.exams.map((exam) => ({
      title: exam.title,
      examDate: formatDate(exam.examDate ?? exam.createdAt),
      category: exam.category,
      highlights: exam.results
        .slice(0, 3)
        .map((result) => `${result.name}: ${formatResultValue(result)}`),
    })),
  };
}

export function formatDate(date?: Date | null) {
  if (!date) return null;
  return date.toISOString().split("T")[0];
}

export function calculateAge(dateOfBirth?: Date | null) {
  if (!dateOfBirth) return null;
  const diff = Date.now() - dateOfBirth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

type ExamResultRecord = ExamWithResults["results"][number];

export function formatResultValue(result: ExamResultRecord) {
  if (result.valueText) return result.valueText;
  if (result.valueNumeric !== null && result.valueNumeric !== undefined) {
    const numeric = Number(result.valueNumeric.toFixed(2));
    return `${numeric}${result.unit ? ` ${result.unit}` : ""}`;
  }
  return "Sin valor reportado";
}

export function formatReferenceRange(result: ExamResultRecord) {
  if (result.referenceRange) return result.referenceRange;
  if (
    result.referenceMin !== null &&
    result.referenceMin !== undefined &&
    result.referenceMax !== null &&
    result.referenceMax !== undefined
  ) {
    return `${result.referenceMin} - ${result.referenceMax}${
      result.unit ? ` ${result.unit}` : ""
    }`;
  }
  return null;
}
