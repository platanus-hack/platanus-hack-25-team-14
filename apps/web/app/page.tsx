"use client";

import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "../lib/auth-client";
import { SummaryTab } from "./patients/[id]/SummaryTab";
import { ExamsTab } from "./patients/[id]/ExamsTab";
import { ConsultationsTab } from "./patients/[id]/ConsultationsTab";
import { SurgeriesTab } from "./patients/[id]/SurgeriesTab";
import { VaccinesTab } from "./patients/[id]/VaccinesTab";
import { AllergiesConditionsTab } from "./patients/[id]/AllergiesConditionsTab";
import { MedicationsTab } from "./patients/[id]/MedicationsTab";
import { ShareLinksTab } from "./patients/[id]/ShareLinksTab";
import { LogoLoading } from "../components/FancyLoading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Sparkles,
  Link as LinkIcon,
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
  User as UserIcon,
} from "lucide-react";

const GET_MY_PATIENT = gql(`
  query GetMyPatient($userId: String!) {
    getPatientByUser(userId: $userId) {
      ...PatientBasic
    }
  }

  fragment PatientBasic on Patient {
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
    vaccines {
      id
    }
  }
`);

const UPSERT_PATIENT_PROFILE = gql(`
  mutation UpsertPatientProfile(
    $userId: String!
    $fullName: String!
    $documentId: String
    $email: String
    $phone: String
    $sex: String
    $dateOfBirth: DateTime
    $bloodType: String
    $emergencyNotes: String
    $emergencyContactName: String
    $emergencyContactPhone: String
    $heightCm: Float
    $weightKg: Float
  ) {
    upsertPatientProfile(
      userId: $userId
      fullName: $fullName
      documentId: $documentId
      email: $email
      phone: $phone
      sex: $sex
      dateOfBirth: $dateOfBirth
      bloodType: $bloodType
      emergencyNotes: $emergencyNotes
      emergencyContactName: $emergencyContactName
      emergencyContactPhone: $emergencyContactPhone
      heightCm: $heightCm
      weightKg: $weightKg
    ) {
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
    }
  }
`);

const CREATE_EMERGENCY_SHARE_LINK_HEADER = gql(`
  mutation CreateEmergencyShareLinkFromHeader($patientId: String!) {
    createEmergencyShareLink(patientId: $patientId) {
      token
    }
  }
`);

interface BasicProfileFormProps {
  userId: string;
  defaultName?: string | null;
  defaultEmail?: string | null;
  onCompleted?: () => void;
}

function BasicProfileForm({
  userId,
  defaultName,
  defaultEmail,
  onCompleted,
}: BasicProfileFormProps) {
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [documentId, setDocumentId] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState<string>("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [upsertProfile, { loading, error }] = useMutation(
    UPSERT_PATIENT_PROFILE,
    {
      onCompleted: () => {
        onCompleted?.();
      },
    }
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("El nombre completo es obligatorio.");
      return;
    }

    const variables: Record<string, unknown> = {
      userId,
      fullName: fullName.trim(),
    };

    if (documentId.trim()) variables.documentId = documentId.trim();
    if (email.trim()) variables.email = email.trim();
    if (phone.trim()) variables.phone = phone.trim();
    if (sex) variables.sex = sex;
    if (bloodType) variables.bloodType = bloodType;
    if (emergencyContactName.trim()) {
      variables.emergencyContactName = emergencyContactName.trim();
    }
    if (emergencyContactPhone.trim()) {
      variables.emergencyContactPhone = emergencyContactPhone.trim();
    }
    if (emergencyNotes.trim()) {
      variables.emergencyNotes = emergencyNotes.trim();
    }
    if (heightCm.trim()) {
      const parsed = parseFloat(heightCm.replace(",", "."));
      if (!Number.isNaN(parsed)) {
        variables.heightCm = parsed;
      }
    }
    if (weightKg.trim()) {
      const parsed = parseFloat(weightKg.replace(",", "."));
      if (!Number.isNaN(parsed)) {
        variables.weightKg = parsed;
      }
    }
    if (dateOfBirth) {
      // Para evitar problemas de cambio de día por zonas horarias,
      // guardamos siempre la fecha de nacimiento como mediodía UTC.
      // Esto mantiene el mismo día en prácticamente cualquier huso horario.
      variables.dateOfBirth = `${dateOfBirth}T12:00:00.000Z`;
    }

    try {
      await upsertProfile({ variables });
    } catch {
      // el error ya se muestra desde `error`
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completa tu ficha básica</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. María Pérez Soto"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="documentId">RUT / Documento</Label>
              <Input
                id="documentId"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ej. 12.345.678-9"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.cl"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="sex">Sexo</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger id="sex">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Mujer</SelectItem>
                  <SelectItem value="MALE">Hombre</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                  <SelectItem value="UNKNOWN">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bloodType">Grupo sanguíneo</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_POS">A+</SelectItem>
                  <SelectItem value="A_NEG">A-</SelectItem>
                  <SelectItem value="B_POS">B+</SelectItem>
                  <SelectItem value="B_NEG">B-</SelectItem>
                  <SelectItem value="AB_POS">AB+</SelectItem>
                  <SelectItem value="AB_NEG">AB-</SelectItem>
                  <SelectItem value="O_POS">O+</SelectItem>
                  <SelectItem value="O_NEG">O-</SelectItem>
                  <SelectItem value="UNKNOWN">No lo sé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="heightCm">Estatura (cm)</Label>
              <Input
                id="heightCm"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Ej. 165"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weightKg">Peso (kg)</Label>
              <Input
                id="weightKg"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ej. 62.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="emergencyContactName">
                Contacto de emergencia
              </Label>
              <Input
                id="emergencyContactName"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Ej. Juan Pérez (padre)"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emergencyContactPhone">
                Teléfono de emergencia
              </Label>
              <Input
                id="emergencyContactPhone"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+56 9 8765 4321"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="emergencyNotes">Notas de emergencia</Label>
            <Textarea
              id="emergencyNotes"
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
              placeholder="Ej. Alergia a penicilina, asmática, antecedentes de hipertensión..."
            />
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-600">
              {formError ??
                "Ocurrió un error al guardar tu ficha. Intenta nuevamente."}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar ficha básica"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const { data: dataSession } = useSession();

  const userId = dataSession?.user.id ?? "";

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

  const { data, loading, refetch } = useQuery(GET_MY_PATIENT, {
    variables: { userId: userId ?? "" },
    fetchPolicy: "cache-first",
    skip: !userId,
  });

  const patient = data?.getPatientByUser;
  const patientName =
    patient?.fullName ?? dataSession?.user?.name ?? "Paciente";

  const patientInitials =
    patient?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  const [headerEmergencyLink, setHeaderEmergencyLink] = useState<string | null>(
    null
  );

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://example.com";

  const [createEmergencyShareLinkHeader, { loading: creatingHeaderEmergency }] =
    useMutation(CREATE_EMERGENCY_SHARE_LINK_HEADER);

  const handleHeaderEmergency = async () => {
    if (!patient) return;
    if (headerEmergencyLink) {
      await navigator.clipboard.writeText(headerEmergencyLink);
      return;
    }
    const { data: resp } = await createEmergencyShareLinkHeader({
      variables: { patientId: patient.id },
    });
    if (resp?.createEmergencyShareLink?.token) {
      const link = `${baseUrl}/share/patient/${resp.createEmergencyShareLink.token}`;
      setHeaderEmergencyLink(link);
    await navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 relative">
      {loading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md z-50 flex items-center justify-center pointer-events-none">
          <LogoLoading />
        </div>
      )}
      <div className={loading ? "blur-sm" : ""}>
        {patient && (
          <div
            className="flex flex-col md:flex-row gap-6 mb-4"
            style={{ gap: "1.5rem" }}
          >
            <Card className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-blue-500"></div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <UserIcon className="w-7 h-7 text-white" />
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
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-gray-100 border-gray-300"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Ficha clínica
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-gray-100 border-gray-300"
                      >
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
                  <h3 className="text-gray-900 text-sm font-medium">
                    Acceso de emergencia
                  </h3>
                </div>
                <Button
                  size="sm"
                  onClick={handleHeaderEmergency}
                  disabled={creatingHeaderEmergency}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white gap-2 text-sm h-8 px-3 rounded-md"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {creatingHeaderEmergency
                    ? "Generando..."
                    : headerEmergencyLink
                    ? "Copiar enlace"
                    : "Generar enlace"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {!patient && !loading && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patientName}
              </h1>
              <p className="text-sm text-gray-500">
                {loading ? "Cargando ficha..." : "Ficha clínica"}
              </p>
            </div>
          </div>
        )}

        {!loading && userId && !patient && (
          <BasicProfileForm
            userId={userId}
            defaultName={dataSession?.user?.name}
            defaultEmail={dataSession?.user?.email}
            onCompleted={() => {
              refetch();
            }}
          />
        )}

        {patient && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-56 flex-shrink-0">
              <Card className="p-3 bg-white border border-stone-200 shadow-xl">
                <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible gap-0 md:space-y-1">
                  {[
                    {
                      label: "Resumen",
                      icon: LayoutDashboard,
                      section: "summary" as const,
                    },
                    {
                      label: "Consultas médicas",
                      icon: Stethoscope,
                      section: "consultations" as const,
                    },
                    {
                      label: "Medicamentos",
                      icon: Pill,
                      section: "medications" as const,
                    },
                    {
                      label: "Alergias y enfermedades",
                      icon: AlertTriangle,
                      section: "allergies-conditions" as const,
                    },
                    {
                      label: "Exámenes",
                      icon: FileText,
                      section: "exams" as const,
                    },
                    {
                      label: "Cirugías y procedimientos",
                      icon: Scissors,
                      section: "surgeries" as const,
                    },
                    {
                      label: "Vacunas",
                      icon: Syringe,
                      section: "vaccines" as const,
                    },
                    {
                      label: "Compartir ficha",
                      icon: Share2,
                      section: "share-links" as const,
                    },
                  ].map((item) => {
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
              {activeSection === "exams" && <ExamsTab patientId={patient.id} />}
              {activeSection === "consultations" && (
                <ConsultationsTab patientId={patient.id} />
              )}
              {activeSection === "surgeries" && (
                <SurgeriesTab patientId={patient.id} />
              )}
              {activeSection === "vaccines" && (
                <VaccinesTab patientId={patient.id} />
              )}
              {activeSection === "medications" && (
                <MedicationsTab patient={patient} loading={loading} />
              )}
              {activeSection === "allergies-conditions" && (
                <AllergiesConditionsTab patient={patient} loading={loading} />
              )}
              {activeSection === "share-links" && (
                <ShareLinksTab patientId={patient.id} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
