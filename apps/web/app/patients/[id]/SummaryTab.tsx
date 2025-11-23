"use client";

import { useQuery, gql } from "@apollo/client";
import { Card, CardContent } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import {
  AlertCircle,
  User,
  Phone,
  Ruler,
  Calendar,
  Info,
  FileText,
  Stethoscope,
  Scissors,
  Syringe,
} from "lucide-react";
import { FancyLoading } from "../../../components/FancyLoading";

function formatSex(sex?: string | null) {
  if (!sex) return "—";
  switch (sex) {
    case "FEMALE":
      return "Mujer";
    case "MALE":
      return "Hombre";
    case "OTHER":
      return "Otro";
    default:
      return "No especificado";
  }
}

function formatBloodType(bloodType?: string | null) {
  if (!bloodType || bloodType === "UNKNOWN") return "Desconocido";
  return bloodType.replace("_POS", "+").replace("_NEG", "-");
}

const GET_PATIENT_TIMELINE = gql(`
  query GetPatientTimeline($patientId: String!) {
    exams: getPatientExams(patientId: $patientId) {
      id
      title
      createdAt
      status
    }
    consultations: getPatientConsultations(patientId: $patientId) {
      id
      date
      facilityName
      doctorName
      specialty
      reason
    }
    surgeries: getPatientSurgeries(patientId: $patientId) {
      id
      name
      date
      hospital
      doctorName
    }
    vaccines: getPatientVaccines(patientId: $patientId) {
      id
      vaccineName
      date
      facility
      doseNumber
    }
  }
`);

type TimelineEvent = {
  id: string;
  date: string;
  type: "exam" | "consultation" | "surgery" | "vaccine";
  title: string;
  description?: string;
  icon: typeof FileText;
  color: string;
  badgeColor: string;
};

type SummaryTabProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patient: any | undefined;
  loading: boolean;
};

export function SummaryTab({ patient, loading }: SummaryTabProps) {
  const { data, loading: timelineLoading } = useQuery(GET_PATIENT_TIMELINE, {
    variables: { patientId: patient?.id ?? "" },
    fetchPolicy: "cache-first",
    skip: !patient?.id,
  });

  const {
    exams = [],
    consultations = [],
    surgeries = [],
    vaccines = [],
  } = data || {};

  if (loading) {
    return <FancyLoading />;
  }

  if (!patient) {
    return (
      <Card className="p-4 md:p-6 bg-white border border-stone-200 shadow-xl">
        <p className="text-sm text-slate-600">
          No se encontró información del paciente.
        </p>
      </Card>
    );
  }

  const events: TimelineEvent[] = [];

  exams?.forEach(
    (exam: {
      id: string;
      title: string;
      createdAt: string;
      status?: string;
    }) => {
      events.push({
        id: exam.id,
        date: exam.createdAt,
        type: "exam",
        title: exam.title,
        description: exam.status,
        icon: FileText,
        color: "bg-green-100 text-green-800",
        badgeColor: "bg-green-500",
      });
    }
  );

  consultations?.forEach(
    (consultation: {
      id: string;
      date: string;
      facilityName?: string;
      doctorName?: string;
      specialty?: string;
      reason?: string;
    }) => {
      const description = [
        consultation.facilityName,
        consultation.doctorName,
        consultation.specialty,
      ]
        .filter(Boolean)
        .join(" • ");
      events.push({
        id: consultation.id,
        date: consultation.date,
        type: "consultation",
        title: consultation.reason || "Consulta médica",
        description,
        icon: Stethoscope,
        color: "bg-purple-100 text-purple-800",
        badgeColor: "bg-purple-500",
      });
    }
  );

  surgeries?.forEach(
    (surgery: {
      id: string;
      name: string;
      date?: string;
      hospital?: string;
      doctorName?: string;
    }) => {
      const description = [surgery.hospital, surgery.doctorName]
        .filter(Boolean)
        .join(" • ");
      events.push({
        id: surgery.id,
        date: surgery.date || new Date().toISOString(),
        type: "surgery",
        title: surgery.name,
        description,
        icon: Scissors,
        color: "bg-orange-100 text-orange-800",
        badgeColor: "bg-orange-500",
      });
    }
  );

  vaccines?.forEach(
    (vaccine: {
      id: string;
      vaccineName: string;
      date?: string;
      facility?: string;
      doseNumber?: number;
    }) => {
      const description = [
        vaccine.facility,
        vaccine.doseNumber ? `Dosis ${vaccine.doseNumber}` : null,
      ]
        .filter(Boolean)
        .join(" • ");
      events.push({
        id: vaccine.id,
        date: vaccine.date || new Date().toISOString(),
        type: "vaccine",
        title: vaccine.vaccineName,
        description,
        icon: Syringe,
        color: "bg-teal-100 text-teal-800",
        badgeColor: "bg-teal-500",
      });
    }
  );

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("es-ES", { month: "long" });
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = { year, month, events: [] };
    }
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { year: number; month: string; events: TimelineEvent[] }>);

  const timelineGroups = Object.values(groupedEvents).slice(0, 3);

  return (
    <Card className="p-4 bg-white border border-stone-200 shadow-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-blue-700">Datos básicos</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Nombre:</span>{" "}
                <strong className="text-slate-900">
                  {patient.fullName || "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Documento:</span>{" "}
                <strong className="text-slate-900">
                  {patient.documentId || "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Nacimiento:</span>{" "}
                <strong className="text-slate-900">
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "numeric", year: "numeric" }
                      )
                    : "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Sexo:</span>{" "}
                <strong className="text-slate-900">
                  {formatSex(patient.sex)}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Tipo de sangre:</span>{" "}
                {patient.bloodType &&
                formatBloodType(patient.bloodType) !== "Desconocido" ? (
                  <span className="inline-block bg-rose-500 text-white px-2 py-0.5 rounded text-xs ml-1">
                    {formatBloodType(patient.bloodType)}
                  </span>
                ) : (
                  <strong className="text-slate-900">—</strong>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-slate-600 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-700">Contacto</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Email:</span>{" "}
                <strong className="text-slate-900">
                  {patient.email || "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Teléfono:</span>{" "}
                <strong className="text-slate-900">
                  {patient.phone || "—"}
                </strong>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-slate-500 rounded-lg flex items-center justify-center">
                <Ruler className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-700">Medidas recientes</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Actualizado:</span>{" "}
                <strong className="text-slate-900">
                  {patient.latestAnthropometric?.date
                    ? new Date(
                        patient.latestAnthropometric.date
                      ).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Estatura:</span>{" "}
                <strong className="text-slate-900">
                  {patient.latestAnthropometric?.heightCm
                    ? `${patient.latestAnthropometric.heightCm} cm`
                    : "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">Peso:</span>{" "}
                <strong className="text-slate-900">
                  {patient.latestAnthropometric?.weightKg
                    ? `${patient.latestAnthropometric.weightKg} kg`
                    : "—"}
                </strong>
              </div>
              <div className="hover:translate-x-1 transition-transform duration-200">
                <span className="text-slate-600">IMC:</span>{" "}
                {(() => {
                  const heightCm = patient.latestAnthropometric?.heightCm;
                  const weightKg = patient.latestAnthropometric?.weightKg;
                  const bmiFromDb = patient.latestAnthropometric?.bmi ?? null;

                  let bmiValue = "—";
                  if (bmiFromDb) {
                    bmiValue = bmiFromDb.toFixed(1);
                  } else if (heightCm && weightKg) {
                    const m = heightCm / 100;
                    const bmi = weightKg / (m * m);
                    if (isFinite(bmi)) {
                      bmiValue = bmi.toFixed(1);
                    }
                  }

                  return bmiValue !== "—" ? (
                    <span className="inline-block bg-slate-100 border border-slate-300 text-slate-900 px-2 py-0.5 rounded text-xs ml-1">
                      {bmiValue}
                    </span>
                  ) : (
                    <strong className="text-slate-900">—</strong>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-stone-200" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 hover:border-rose-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-rose-700">⚠️ Alergias Importantes</h3>
            </div>
            <div className="text-sm">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies
                  .filter(
                    (a: Record<string, unknown>) => a.isSevere || a.isMedication
                  )
                  .map((a: Record<string, unknown>) => (
                    <div
                      key={String(a.id)}
                      className="flex items-start gap-2 hover:translate-x-1 transition-transform duration-200"
                    >
                      <span className="text-lg">⚠️</span>
                      <span>
                        <strong className="text-slate-900">
                          {String(a.substance)}
                        </strong>
                        {a.reaction ? ` – ${String(a.reaction)}` : ""}
                        {a.isMedication ? " (medicamento)" : ""}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-slate-800">Sin alergias registradas.</p>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 hover:border-amber-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-amber-700">Información de emergencia</h3>
            </div>
            <p className="text-slate-800 text-sm">
              Notas: {patient.emergencyNotes ?? "Sin notas registradas."}
            </p>
          </div>
        </div>

        <Separator className="bg-stone-200" />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-indigo-700">Condiciones crónicas activas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {patient.conditions &&
            patient.conditions.some(
              (c: Record<string, unknown>) => c.status === "ACTIVE"
            ) ? (
              patient.conditions
                .filter((c: Record<string, unknown>) => c.status === "ACTIVE")
                .map((c: Record<string, unknown>) => (
                  <div
                    key={String(c.id)}
                    className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-sm hover:border-indigo-300 hover:translate-x-1 transition-transform duration-200"
                  >
                    <strong className="text-slate-900">{String(c.name)}</strong>{" "}
                    <span className="text-slate-600">
                      {c.diagnosedAt
                        ? `– desde ${new Date(
                            String(c.diagnosedAt)
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}`
                        : ""}
                    </span>
                    {typeof c.notes === "string" && c.notes && (
                      <p className="text-slate-700 text-xs mt-1">{c.notes}</p>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-600">
                No hay condiciones crónicas activas registradas.
              </p>
            )}
          </div>
        </div>

        <Separator className="bg-stone-200" />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">💊</span>
            </div>
            <h3 className="text-blue-700">Medicación activa</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {patient.medicationPlans &&
            patient.medicationPlans.some(
              (m: Record<string, unknown>) => m.isActive
            ) ? (
              patient.medicationPlans
                .filter((m: Record<string, unknown>) => m.isActive)
                .map((m: Record<string, unknown>) => (
                  <div
                    key={String(m.id)}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-sm hover:border-blue-300 hover:translate-x-1 transition-transform duration-200"
                  >
                    <strong className="text-slate-900">
                      {String(m.drugName)}
                    </strong>
                    <p className="text-slate-700 text-xs mt-1">
                      {m.dose ? String(m.dose) : ""}
                      {m.frequency ? `, ${String(m.frequency)}` : ""}
                      {m.route ? ` (${String(m.route)})` : ""}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-slate-600">
                No hay medicación activa registrada.
              </p>
            )}
          </div>
        </div>

        {timelineGroups.length > 0 && (
          <>
            <Separator className="bg-stone-200" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-blue-700">Línea de tiempo reciente</h3>
              </div>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
                <div className="space-y-4">
                  {timelineGroups.map((group) => (
                    <div key={`${group.year}-${group.month}`}>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                          <p className="text-white text-sm capitalize">
                            {group.month}
                          </p>
                          <p className="text-blue-100 text-xs">{group.year}</p>
                        </div>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-3 ml-0 md:ml-16">
                        {group.events.slice(0, 3).map((event) => {
                          const Icon = event.icon;
                          return (
                            <div key={event.id} className="relative">
                              <div
                                className={`absolute -left-16 top-3 w-2.5 h-2.5 rounded-full border-2 border-white hidden md:block ${event.badgeColor}`}
                              />
                              <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                <CardContent className="p-3">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <Badge className={`${event.color} text-xs`}>
                                      <Icon className="w-3 h-3 mr-1" />
                                      {event.type === "exam" && "Examen"}
                                      {event.type === "consultation" &&
                                        "Consulta"}
                                      {event.type === "surgery" && "Cirugía"}
                                      {event.type === "vaccine" && "Vacuna"}
                                    </Badge>
                                    <span className="text-gray-600 text-xs">
                                      {new Date(event.date).toLocaleDateString(
                                        "es-ES",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <h4 className="text-gray-900 text-sm font-medium mb-0.5">
                                    {event.title}
                                  </h4>
                                  {event.description && (
                                    <p className="text-gray-600 text-xs">
                                      {event.description}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
