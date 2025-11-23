/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Allergy = {
  __typename?: 'Allergy';
  id: Scalars['ID']['output'];
  isMedication: Scalars['Boolean']['output'];
  isSevere: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  reaction?: Maybe<Scalars['String']['output']>;
  substance: Scalars['String']['output'];
};

export type AnthropometricRecord = {
  __typename?: 'AnthropometricRecord';
  bmi?: Maybe<Scalars['Float']['output']>;
  date: Scalars['DateTime']['output'];
  heightCm?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  weightKg?: Maybe<Scalars['Float']['output']>;
};

export enum BloodType {
  AbNeg = 'AB_NEG',
  AbPos = 'AB_POS',
  ANeg = 'A_NEG',
  APos = 'A_POS',
  BNeg = 'B_NEG',
  BPos = 'B_POS',
  ONeg = 'O_NEG',
  OPos = 'O_POS',
  Unknown = 'UNKNOWN'
}

export type Condition = {
  __typename?: 'Condition';
  diagnosedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
};

export type Consultation = {
  __typename?: 'Consultation';
  date: Scalars['DateTime']['output'];
  diagnoses: Array<Diagnosis>;
  doctorName?: Maybe<Scalars['String']['output']>;
  facilityName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  specialty?: Maybe<Scalars['String']['output']>;
};

export type Diagnosis = {
  __typename?: 'Diagnosis';
  code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isChronic: Scalars['Boolean']['output'];
  isPrimary: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
};

export type Exam = {
  __typename?: 'Exam';
  createdAt: Scalars['DateTime']['output'];
  /** Temporary S3 URL to download the latest attachment for this exam */
  downloadUrl: Scalars['String']['output'];
  fileKey: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Temporary S3 URL to upload/overwrite the primary attachment for this exam */
  presignedUrl: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type MedicationPlan = {
  __typename?: 'MedicationPlan';
  dose?: Maybe<Scalars['String']['output']>;
  drugName: Scalars['String']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  frequency?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  route?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createDocumentUpload: Exam;
  createEmergencyShareLink: ShareLink;
  createGeneralShareLink: ShareLink;
  upsertPatientProfile: Patient;
};


export type MutationCreateDocumentUploadArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  docType: Scalars['String']['input'];
  filename: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateEmergencyShareLinkArgs = {
  includeAllergies?: InputMaybe<Scalars['Boolean']['input']>;
  includeAnthropometrics?: InputMaybe<Scalars['Boolean']['input']>;
  includeBasicInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeConditions?: InputMaybe<Scalars['Boolean']['input']>;
  includeEmergencyInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeMedications?: InputMaybe<Scalars['Boolean']['input']>;
  patientId: Scalars['String']['input'];
};


export type MutationCreateGeneralShareLinkArgs = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  includeAllergies?: InputMaybe<Scalars['Boolean']['input']>;
  includeAnthropometrics?: InputMaybe<Scalars['Boolean']['input']>;
  includeBasicInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeConditions?: InputMaybe<Scalars['Boolean']['input']>;
  includeConsultations?: InputMaybe<Scalars['Boolean']['input']>;
  includeDiagnoses?: InputMaybe<Scalars['Boolean']['input']>;
  includeEmergencyInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeExams?: InputMaybe<Scalars['Boolean']['input']>;
  includeFamilyHistory?: InputMaybe<Scalars['Boolean']['input']>;
  includeMedications?: InputMaybe<Scalars['Boolean']['input']>;
  includeSurgeries?: InputMaybe<Scalars['Boolean']['input']>;
  includeVaccines?: InputMaybe<Scalars['Boolean']['input']>;
  patientId: Scalars['String']['input'];
};


export type MutationUpsertPatientProfileArgs = {
  bloodType?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  documentId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  emergencyNotes?: InputMaybe<Scalars['String']['input']>;
  fullName: Scalars['String']['input'];
  heightCm?: InputMaybe<Scalars['Float']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
  weightKg?: InputMaybe<Scalars['Float']['input']>;
};

export type Patient = {
  __typename?: 'Patient';
  allergies: Array<Allergy>;
  bloodType?: Maybe<BloodType>;
  conditions: Array<Condition>;
  consultations: Array<Consultation>;
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  documentId?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  emergencyNotes?: Maybe<Scalars['String']['output']>;
  exams: Array<Exam>;
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  latestAnthropometric?: Maybe<AnthropometricRecord>;
  medicationPlans: Array<MedicationPlan>;
  phone?: Maybe<Scalars['String']['output']>;
  sex?: Maybe<Sex>;
  surgeries: Array<Surgery>;
  updatedAt: Scalars['DateTime']['output'];
  vaccines: Array<VaccineRecord>;
};

export type Query = {
  __typename?: 'Query';
  exam: Exam;
  exams: Array<Exam>;
  getPatient: Patient;
  getPatientByUser?: Maybe<Patient>;
  getPatientConsultations: Array<Consultation>;
  getPatientExams: Array<Exam>;
  getPatientShareLinks: Array<ShareLink>;
  getPatientSurgeries: Array<Surgery>;
  getPatientVaccines: Array<VaccineRecord>;
  getShareLink: ShareLink;
};


export type QueryExamArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPatientArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPatientByUserArgs = {
  userId: Scalars['String']['input'];
};


export type QueryGetPatientConsultationsArgs = {
  patientId: Scalars['String']['input'];
};


export type QueryGetPatientExamsArgs = {
  patientId: Scalars['String']['input'];
};


export type QueryGetPatientShareLinksArgs = {
  patientId: Scalars['String']['input'];
};


export type QueryGetPatientSurgeriesArgs = {
  patientId: Scalars['String']['input'];
};


export type QueryGetPatientVaccinesArgs = {
  patientId: Scalars['String']['input'];
};


export type QueryGetShareLinkArgs = {
  token: Scalars['String']['input'];
};

export enum Sex {
  Female = 'FEMALE',
  Male = 'MALE',
  Other = 'OTHER',
  Unknown = 'UNKNOWN'
}

export type ShareLink = {
  __typename?: 'ShareLink';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  includeAllergies: Scalars['Boolean']['output'];
  includeAnthropometrics: Scalars['Boolean']['output'];
  includeBasicInfo: Scalars['Boolean']['output'];
  includeConditions: Scalars['Boolean']['output'];
  includeConsultations: Scalars['Boolean']['output'];
  includeDiagnoses: Scalars['Boolean']['output'];
  includeEmergencyInfo: Scalars['Boolean']['output'];
  includeExams: Scalars['Boolean']['output'];
  includeFamilyHistory: Scalars['Boolean']['output'];
  includeMedications: Scalars['Boolean']['output'];
  includeSurgeries: Scalars['Boolean']['output'];
  includeVaccines: Scalars['Boolean']['output'];
  patient: Patient;
  patientId: Scalars['String']['output'];
  purpose: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  token: Scalars['String']['output'];
};

export type Surgery = {
  __typename?: 'Surgery';
  date?: Maybe<Scalars['DateTime']['output']>;
  doctorName?: Maybe<Scalars['String']['output']>;
  hospital?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  patient?: Maybe<Patient>;
};

export type VaccineRecord = {
  __typename?: 'VaccineRecord';
  date?: Maybe<Scalars['DateTime']['output']>;
  doseNumber?: Maybe<Scalars['Int']['output']>;
  facility?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lotNumber?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  totalDosesPlanned?: Maybe<Scalars['Int']['output']>;
  vaccineName: Scalars['String']['output'];
};

export type GetExamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExamsQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, title: string, fileKey: string, status: string, createdAt: any, downloadUrl: string }> };

export type GetMyPatientQueryVariables = Exact<{
  userId: Scalars['String']['input'];
}>;


export type GetMyPatientQuery = { __typename?: 'Query', getPatientByUser?: (
    { __typename?: 'Patient' }
    & { ' $fragmentRefs'?: { 'PatientBasicFragment': PatientBasicFragment } }
  ) | null };

export type PatientBasicFragment = { __typename?: 'Patient', id: string, fullName: string, documentId?: string | null, email?: string | null, phone?: string | null, sex?: Sex | null, dateOfBirth?: any | null, bloodType?: BloodType | null, emergencyNotes?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, latestAnthropometric?: { __typename?: 'AnthropometricRecord', date: any, heightCm?: number | null, weightKg?: number | null, bmi?: number | null } | null, allergies: Array<{ __typename?: 'Allergy', id: string, substance: string, reaction?: string | null, isMedication: boolean, isSevere: boolean }>, conditions: Array<{ __typename?: 'Condition', id: string, name: string, status: string, diagnosedAt?: any | null, notes?: string | null }>, medicationPlans: Array<{ __typename?: 'MedicationPlan', id: string, drugName: string, dose?: string | null, frequency?: string | null, route?: string | null, isActive: boolean, startDate?: any | null, endDate?: any | null, notes?: string | null }>, vaccines: Array<{ __typename?: 'VaccineRecord', id: string }> } & { ' $fragmentName'?: 'PatientBasicFragment' };

export type UpsertPatientProfileMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  documentId?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  bloodType?: InputMaybe<Scalars['String']['input']>;
  emergencyNotes?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  heightCm?: InputMaybe<Scalars['Float']['input']>;
  weightKg?: InputMaybe<Scalars['Float']['input']>;
}>;


export type UpsertPatientProfileMutation = { __typename?: 'Mutation', upsertPatientProfile: { __typename?: 'Patient', id: string, fullName: string, documentId?: string | null, email?: string | null, phone?: string | null, sex?: Sex | null, dateOfBirth?: any | null, bloodType?: BloodType | null, emergencyNotes?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null } };

export type CreateEmergencyShareLinkFromHeaderMutationVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type CreateEmergencyShareLinkFromHeaderMutation = { __typename?: 'Mutation', createEmergencyShareLink: { __typename?: 'ShareLink', token: string } };

export type GetPatientConsultationsQueryVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type GetPatientConsultationsQuery = { __typename?: 'Query', getPatientConsultations: Array<{ __typename?: 'Consultation', id: string, date: any, facilityName?: string | null, doctorName?: string | null, specialty?: string | null, reason?: string | null, diagnoses: Array<{ __typename?: 'Diagnosis', id: string, description: string, isPrimary: boolean }> }> };

export type GetPatientExamsQueryVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type GetPatientExamsQuery = { __typename?: 'Query', getPatientExams: Array<{ __typename?: 'Exam', id: string, title: string, status: string, createdAt: any, downloadUrl: string }> };

export type CreateGeneralShareLinkMutationVariables = Exact<{
  patientId: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  includeBasicInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeEmergencyInfo?: InputMaybe<Scalars['Boolean']['input']>;
  includeConsultations?: InputMaybe<Scalars['Boolean']['input']>;
  includeDiagnoses?: InputMaybe<Scalars['Boolean']['input']>;
  includeExams?: InputMaybe<Scalars['Boolean']['input']>;
  includeSurgeries?: InputMaybe<Scalars['Boolean']['input']>;
  includeVaccines?: InputMaybe<Scalars['Boolean']['input']>;
  includeFamilyHistory?: InputMaybe<Scalars['Boolean']['input']>;
  includeAllergies?: InputMaybe<Scalars['Boolean']['input']>;
  includeConditions?: InputMaybe<Scalars['Boolean']['input']>;
  includeMedications?: InputMaybe<Scalars['Boolean']['input']>;
  includeAnthropometrics?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CreateGeneralShareLinkMutation = { __typename?: 'Mutation', createGeneralShareLink: { __typename?: 'ShareLink', token: string, expiresAt?: any | null } };

export type CreateEmergencyShareLinkMutationVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type CreateEmergencyShareLinkMutation = { __typename?: 'Mutation', createEmergencyShareLink: { __typename?: 'ShareLink', token: string } };

export type GetPatientTimelineQueryVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type GetPatientTimelineQuery = { __typename?: 'Query', exams: Array<{ __typename?: 'Exam', id: string, title: string, createdAt: any, status: string }>, consultations: Array<{ __typename?: 'Consultation', id: string, date: any, facilityName?: string | null, doctorName?: string | null, specialty?: string | null, reason?: string | null }>, surgeries: Array<{ __typename?: 'Surgery', id: string, name: string, date?: any | null, hospital?: string | null, doctorName?: string | null }>, vaccines: Array<{ __typename?: 'VaccineRecord', id: string, vaccineName: string, date?: any | null, facility?: string | null, doseNumber?: number | null }> };

export type GetPatientSurgeriesQueryVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type GetPatientSurgeriesQuery = { __typename?: 'Query', getPatientSurgeries: Array<{ __typename?: 'Surgery', id: string, name: string, date?: any | null, hospital?: string | null, doctorName?: string | null, notes?: string | null }> };

export type GetPatientVaccinesQueryVariables = Exact<{
  patientId: Scalars['String']['input'];
}>;


export type GetPatientVaccinesQuery = { __typename?: 'Query', getPatientVaccines: Array<{ __typename?: 'VaccineRecord', id: string, vaccineName: string, doseNumber?: number | null, totalDosesPlanned?: number | null, date?: any | null, facility?: string | null, notes?: string | null }> };

export type GetPatientQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetPatientQuery = { __typename?: 'Query', getPatient: (
    { __typename?: 'Patient' }
    & { ' $fragmentRefs'?: { 'PatientBasicByIdFragment': PatientBasicByIdFragment } }
  ) };

export type PatientBasicByIdFragment = { __typename?: 'Patient', id: string, fullName: string, documentId?: string | null, email?: string | null, phone?: string | null, sex?: Sex | null, dateOfBirth?: any | null, bloodType?: BloodType | null, emergencyNotes?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, latestAnthropometric?: { __typename?: 'AnthropometricRecord', date: any, heightCm?: number | null, weightKg?: number | null, bmi?: number | null } | null, allergies: Array<{ __typename?: 'Allergy', id: string, substance: string, reaction?: string | null, isMedication: boolean, isSevere: boolean }>, conditions: Array<{ __typename?: 'Condition', id: string, name: string, status: string, diagnosedAt?: any | null, notes?: string | null }>, medicationPlans: Array<{ __typename?: 'MedicationPlan', id: string, drugName: string, dose?: string | null, frequency?: string | null, route?: string | null, isActive: boolean, startDate?: any | null, endDate?: any | null, notes?: string | null }> } & { ' $fragmentName'?: 'PatientBasicByIdFragment' };

export type GetExamQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetExamQuery = { __typename?: 'Query', exam: { __typename?: 'Exam', id: string, title: string, fileKey: string, status: string, createdAt: any, downloadUrl: string } };

export type GetShareLinkPatientQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type GetShareLinkPatientQuery = { __typename?: 'Query', getShareLink: { __typename?: 'ShareLink', purpose: string, includeBasicInfo: boolean, includeEmergencyInfo: boolean, includeConsultations: boolean, includeDiagnoses: boolean, includeExams: boolean, includeSurgeries: boolean, includeVaccines: boolean, includeFamilyHistory: boolean, includeAllergies: boolean, includeConditions: boolean, includeMedications: boolean, includeAnthropometrics: boolean, patient: { __typename?: 'Patient', fullName: string, sex?: Sex | null, dateOfBirth?: any | null, bloodType?: BloodType | null, emergencyNotes?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, latestAnthropometric?: { __typename?: 'AnthropometricRecord', heightCm?: number | null, weightKg?: number | null, bmi?: number | null } | null, allergies: Array<{ __typename?: 'Allergy', id: string, substance: string, reaction?: string | null, isMedication: boolean, isSevere: boolean }>, conditions: Array<{ __typename?: 'Condition', id: string, name: string, status: string }>, medicationPlans: Array<{ __typename?: 'MedicationPlan', id: string, drugName: string, dose?: string | null, frequency?: string | null, route?: string | null, isActive: boolean }>, consultations: Array<{ __typename?: 'Consultation', id: string, date: any, facilityName?: string | null, doctorName?: string | null, specialty?: string | null, reason?: string | null, diagnoses: Array<{ __typename?: 'Diagnosis', id: string, description: string, isPrimary: boolean }> }>, exams: Array<{ __typename?: 'Exam', id: string, title: string, createdAt: any }>, surgeries: Array<{ __typename?: 'Surgery', id: string, name: string, date?: any | null, hospital?: string | null, doctorName?: string | null }>, vaccines: Array<{ __typename?: 'VaccineRecord', id: string, vaccineName: string, doseNumber?: number | null, date?: any | null, facility?: string | null }> } } };

export type CreateDocumentUploadMutationVariables = Exact<{
  title: Scalars['String']['input'];
  userId: Scalars['String']['input'];
  filename: Scalars['String']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  docType: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateDocumentUploadMutation = { __typename?: 'Mutation', createDocumentUpload: { __typename?: 'Exam', id: string, title: string, presignedUrl: string } };

export const PatientBasicFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PatientBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"latestAnthropometric"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"heightCm"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"bmi"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"substance"}},{"kind":"Field","name":{"kind":"Name","value":"reaction"}},{"kind":"Field","name":{"kind":"Name","value":"isMedication"}},{"kind":"Field","name":{"kind":"Name","value":"isSevere"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"diagnosedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"medicationPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"drugName"}},{"kind":"Field","name":{"kind":"Name","value":"dose"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vaccines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<PatientBasicFragment, unknown>;
export const PatientBasicByIdFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PatientBasicById"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"latestAnthropometric"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"heightCm"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"bmi"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"substance"}},{"kind":"Field","name":{"kind":"Name","value":"reaction"}},{"kind":"Field","name":{"kind":"Name","value":"isMedication"}},{"kind":"Field","name":{"kind":"Name","value":"isSevere"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"diagnosedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"medicationPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"drugName"}},{"kind":"Field","name":{"kind":"Name","value":"dose"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<PatientBasicByIdFragment, unknown>;
export const GetExamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fileKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadUrl"}}]}}]}}]} as unknown as DocumentNode<GetExamsQuery, GetExamsQueryVariables>;
export const GetMyPatientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyPatient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatientByUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PatientBasic"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PatientBasic"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"latestAnthropometric"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"heightCm"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"bmi"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"substance"}},{"kind":"Field","name":{"kind":"Name","value":"reaction"}},{"kind":"Field","name":{"kind":"Name","value":"isMedication"}},{"kind":"Field","name":{"kind":"Name","value":"isSevere"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"diagnosedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"medicationPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"drugName"}},{"kind":"Field","name":{"kind":"Name","value":"dose"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vaccines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GetMyPatientQuery, GetMyPatientQueryVariables>;
export const UpsertPatientProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpsertPatientProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fullName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sex"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dateOfBirth"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"bloodType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"emergencyNotes"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"emergencyContactName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"emergencyContactPhone"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"heightCm"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weightKg"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upsertPatientProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"fullName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fullName"}}},{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}},{"kind":"Argument","name":{"kind":"Name","value":"sex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sex"}}},{"kind":"Argument","name":{"kind":"Name","value":"dateOfBirth"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dateOfBirth"}}},{"kind":"Argument","name":{"kind":"Name","value":"bloodType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"bloodType"}}},{"kind":"Argument","name":{"kind":"Name","value":"emergencyNotes"},"value":{"kind":"Variable","name":{"kind":"Name","value":"emergencyNotes"}}},{"kind":"Argument","name":{"kind":"Name","value":"emergencyContactName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"emergencyContactName"}}},{"kind":"Argument","name":{"kind":"Name","value":"emergencyContactPhone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"emergencyContactPhone"}}},{"kind":"Argument","name":{"kind":"Name","value":"heightCm"},"value":{"kind":"Variable","name":{"kind":"Name","value":"heightCm"}}},{"kind":"Argument","name":{"kind":"Name","value":"weightKg"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weightKg"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}}]}}]}}]} as unknown as DocumentNode<UpsertPatientProfileMutation, UpsertPatientProfileMutationVariables>;
export const CreateEmergencyShareLinkFromHeaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEmergencyShareLinkFromHeader"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEmergencyShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<CreateEmergencyShareLinkFromHeaderMutation, CreateEmergencyShareLinkFromHeaderMutationVariables>;
export const GetPatientConsultationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatientConsultations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatientConsultations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facilityName"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}},{"kind":"Field","name":{"kind":"Name","value":"specialty"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"diagnoses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}}]}}]}}]}}]} as unknown as DocumentNode<GetPatientConsultationsQuery, GetPatientConsultationsQueryVariables>;
export const GetPatientExamsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatientExams"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatientExams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadUrl"}}]}}]}}]} as unknown as DocumentNode<GetPatientExamsQuery, GetPatientExamsQueryVariables>;
export const CreateGeneralShareLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGeneralShareLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"expiresAt"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeBasicInfo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeEmergencyInfo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeConsultations"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeDiagnoses"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeExams"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeSurgeries"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeVaccines"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeFamilyHistory"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeAllergies"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeConditions"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeMedications"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeAnthropometrics"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGeneralShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}},{"kind":"Argument","name":{"kind":"Name","value":"expiresAt"},"value":{"kind":"Variable","name":{"kind":"Name","value":"expiresAt"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeBasicInfo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeBasicInfo"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeEmergencyInfo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeEmergencyInfo"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeConsultations"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeConsultations"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeDiagnoses"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeDiagnoses"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeExams"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeExams"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeSurgeries"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeSurgeries"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeVaccines"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeVaccines"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeFamilyHistory"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeFamilyHistory"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeAllergies"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeAllergies"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeConditions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeConditions"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeMedications"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeMedications"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeAnthropometrics"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeAnthropometrics"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}}]} as unknown as DocumentNode<CreateGeneralShareLinkMutation, CreateGeneralShareLinkMutationVariables>;
export const CreateEmergencyShareLinkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEmergencyShareLink"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEmergencyShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<CreateEmergencyShareLinkMutation, CreateEmergencyShareLinkMutationVariables>;
export const GetPatientTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatientTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"exams"},"name":{"kind":"Name","value":"getPatientExams"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"consultations"},"name":{"kind":"Name","value":"getPatientConsultations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facilityName"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}},{"kind":"Field","name":{"kind":"Name","value":"specialty"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"surgeries"},"name":{"kind":"Name","value":"getPatientSurgeries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hospital"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"vaccines"},"name":{"kind":"Name","value":"getPatientVaccines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"vaccineName"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facility"}},{"kind":"Field","name":{"kind":"Name","value":"doseNumber"}}]}}]}}]} as unknown as DocumentNode<GetPatientTimelineQuery, GetPatientTimelineQueryVariables>;
export const GetPatientSurgeriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatientSurgeries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatientSurgeries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hospital"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<GetPatientSurgeriesQuery, GetPatientSurgeriesQueryVariables>;
export const GetPatientVaccinesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatientVaccines"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatientVaccines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"patientId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"patientId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"vaccineName"}},{"kind":"Field","name":{"kind":"Name","value":"doseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"totalDosesPlanned"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facility"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<GetPatientVaccinesQuery, GetPatientVaccinesQueryVariables>;
export const GetPatientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPatient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPatient"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PatientBasicById"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PatientBasicById"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Patient"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"latestAnthropometric"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"heightCm"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"bmi"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"substance"}},{"kind":"Field","name":{"kind":"Name","value":"reaction"}},{"kind":"Field","name":{"kind":"Name","value":"isMedication"}},{"kind":"Field","name":{"kind":"Name","value":"isSevere"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"diagnosedAt"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"medicationPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"drugName"}},{"kind":"Field","name":{"kind":"Name","value":"dose"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<GetPatientQuery, GetPatientQueryVariables>;
export const GetExamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetExam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fileKey"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"downloadUrl"}}]}}]}}]} as unknown as DocumentNode<GetExamQuery, GetExamQueryVariables>;
export const GetShareLinkPatientDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShareLinkPatient"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getShareLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"includeBasicInfo"}},{"kind":"Field","name":{"kind":"Name","value":"includeEmergencyInfo"}},{"kind":"Field","name":{"kind":"Name","value":"includeConsultations"}},{"kind":"Field","name":{"kind":"Name","value":"includeDiagnoses"}},{"kind":"Field","name":{"kind":"Name","value":"includeExams"}},{"kind":"Field","name":{"kind":"Name","value":"includeSurgeries"}},{"kind":"Field","name":{"kind":"Name","value":"includeVaccines"}},{"kind":"Field","name":{"kind":"Name","value":"includeFamilyHistory"}},{"kind":"Field","name":{"kind":"Name","value":"includeAllergies"}},{"kind":"Field","name":{"kind":"Name","value":"includeConditions"}},{"kind":"Field","name":{"kind":"Name","value":"includeMedications"}},{"kind":"Field","name":{"kind":"Name","value":"includeAnthropometrics"}},{"kind":"Field","name":{"kind":"Name","value":"patient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"dateOfBirth"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyNotes"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"latestAnthropometric"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"heightCm"}},{"kind":"Field","name":{"kind":"Name","value":"weightKg"}},{"kind":"Field","name":{"kind":"Name","value":"bmi"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allergies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"substance"}},{"kind":"Field","name":{"kind":"Name","value":"reaction"}},{"kind":"Field","name":{"kind":"Name","value":"isMedication"}},{"kind":"Field","name":{"kind":"Name","value":"isSevere"}}]}},{"kind":"Field","name":{"kind":"Name","value":"conditions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"medicationPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"drugName"}},{"kind":"Field","name":{"kind":"Name","value":"dose"}},{"kind":"Field","name":{"kind":"Name","value":"frequency"}},{"kind":"Field","name":{"kind":"Name","value":"route"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}},{"kind":"Field","name":{"kind":"Name","value":"consultations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facilityName"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}},{"kind":"Field","name":{"kind":"Name","value":"specialty"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"diagnoses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isPrimary"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"exams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"surgeries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"hospital"}},{"kind":"Field","name":{"kind":"Name","value":"doctorName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vaccines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"vaccineName"}},{"kind":"Field","name":{"kind":"Name","value":"doseNumber"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"facility"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetShareLinkPatientQuery, GetShareLinkPatientQueryVariables>;
export const CreateDocumentUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDocumentUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"docType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mimeType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDocumentUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}},{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"docType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"docType"}}},{"kind":"Argument","name":{"kind":"Name","value":"mimeType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mimeType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"presignedUrl"}}]}}]}}]} as unknown as DocumentNode<CreateDocumentUploadMutation, CreateDocumentUploadMutationVariables>;