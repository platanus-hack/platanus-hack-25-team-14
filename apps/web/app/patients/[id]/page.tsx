"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { SummaryTab } from "./SummaryTab";
import { ExamsTab } from "./ExamsTab";
import { ConsultationsTab } from "./ConsultationsTab";
import { SurgeriesTab } from "./SurgeriesTab";
import { VaccinesTab } from "./VaccinesTab";
import { AllergiesConditionsTab } from "./AllergiesConditionsTab";
import { MedicationsTab } from "./MedicationsTab";
import { ShareLinksTab } from "./ShareLinksTab";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { FancyLoadingHeader } from "../../../components/FancyLoading";
import { 
  Link as LinkIcon, 
  User, 
  Sparkles,
  LayoutDashboard, 
  Stethoscope, 
  Pill, 
  AlertTriangle, 
  FileText, 
  Scissors, 
  Syringe, 
  Share2,
  Shield,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";

const GET_PATIENT = gql(`
  query GetPatient($id: String!) {
    getPatient(id: $id) {
      ...PatientBasicById
    }
  }

  fragment PatientBasicById on Patient {
    id
    fullName
    documentId
    email
    phone
    sex
    dateOfBirth
    bloodType
    emergencyNotes
    emergencyContactName
    emergencyContactPhone
    latestAnthropometric {
      date
      heightCm
      weightKg
      bmi
    }
    allergies {
      id
      substance
      reaction
      isMedication
      isSevere
    }
    conditions {
      id
      name
      status
      diagnosedAt
      notes
    }
    medicationPlans {
      id
      drugName
      dose
      frequency
      route
      isActive
      startDate
      endDate
      notes
    }
  }
`);

const CREATE_EMERGENCY_SHARE_LINK = gql(`
  mutation CreateEmergencyShareLink($patientId: String!) {
    createEmergencyShareLink(patientId: $patientId) {
      token
    }
  }
`);

type PatientPageProps = {
  params: { id: string };
};

export default function PatientPage({ params }: PatientPageProps) {
  const [activeSection, setActiveSection] = useState<
    | "summary"
    | "consultations"
    | "exams"
    | "surgeries"
    | "vaccines"
    | "medications"
    | "allergies-conditions"
    | "share-links"
  >("summary");

  const { id } = params;

  const { data, loading } = useQuery(GET_PATIENT, {
    variables: { id },
    fetchPolicy: "cache-first",
  });

  const [emergencyLink, setEmergencyLink] = useState<string | null>(null);
  const [createEmergencyShareLink, { loading: creatingEmergency }] = useMutation(CREATE_EMERGENCY_SHARE_LINK);

  const patient = data?.getPatient;
  const patientName = patient?.fullName ?? "Paciente";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleCreateEmergencyLink = async () => {
    if (emergencyLink) {
      await navigator.clipboard.writeText(emergencyLink);
      return;
    }
    const { data: mutationData } = await createEmergencyShareLink({ variables: { patientId: id } });
    if (mutationData?.createEmergencyShareLink?.token) {
      const link = `${baseUrl}/share/patient/${mutationData.createEmergencyShareLink.token}`;
      setEmergencyLink(link);
      await navigator.clipboard.writeText(link);
    }
  };

  const menuItems = [
    { label: "Resumen", icon: LayoutDashboard, section: "summary" as const },
    { label: "Consultas médicas", icon: Stethoscope, section: "consultations" as const },
    { label: "Medicamentos", icon: Pill, section: "medications" as const },
    { label: "Alergias y enfermedades", icon: AlertTriangle, section: "allergies-conditions" as const },
    { label: "Exámenes", icon: FileText, section: "exams" as const },
    { label: "Cirugías y procedimientos", icon: Scissors, section: "surgeries" as const },
    { label: "Vacunas", icon: Syringe, section: "vaccines" as const },
    { label: "Compartir ficha", icon: Share2, section: "share-links" as const },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {loading ? (
        <FancyLoadingHeader />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 mb-4" style={{ gap: '1.5rem' }}>
          <Card className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-blue-500"></div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-gray-900 text-lg font-semibold">
                      {patientName}
                    </h1>
                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Activo
                    </Badge>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 border-gray-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Ficha clínica
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-gray-100 border-gray-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Últ. actualización: Hoy
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="w-full md:w-80 bg-white border border-gray-200 rounded-lg shadow-sm relative">
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <h3 className="text-gray-900 text-sm font-medium">Acceso de emergencia</h3>
              </div>
              <Button
                size="sm"
                onClick={handleCreateEmergencyLink}
                disabled={creatingEmergency}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white gap-2 text-sm h-8 px-3 rounded-md"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {creatingEmergency
                  ? "Generando..."
                  : emergencyLink
                  ? "Copiar enlace"
                  : "Generar enlace"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-56 flex-shrink-0">
            <Card className="p-3 bg-white border border-stone-200 shadow-xl">
            <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-0 md:space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.section;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveSection(item.section)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors duration-200 flex items-center gap-3 text-sm focus:outline-none ${
                      isActive
                        ? `bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-400`
                        : "text-slate-700 hover:bg-stone-100 hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

          <div className="flex-1">
            {activeSection === "summary" && (
              <SummaryTab patient={patient} loading={loading} />
            )}
            {activeSection === "exams" && <ExamsTab patientId={id} />}
          {activeSection === "consultations" && (
            <ConsultationsTab patientId={id} />
          )}
          {activeSection === "surgeries" && <SurgeriesTab patientId={id} />}
          {activeSection === "vaccines" && <VaccinesTab patientId={id} />}
          {activeSection === "medications" && (
            <MedicationsTab patient={patient} loading={loading} />
          )}
          {activeSection === "allergies-conditions" && (
            <AllergiesConditionsTab patient={patient} loading={loading} />
          )}
          {activeSection === "share-links" && <ShareLinksTab patientId={id} />}
        </div>
      </div>
    </div>
  );
}
