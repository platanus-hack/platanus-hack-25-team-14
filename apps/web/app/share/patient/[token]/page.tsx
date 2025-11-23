"use client";

import { useQuery, gql } from "@apollo/client";
import { useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { LogoLoading } from "../../../../components/FancyLoading";

const GET_SHARE_LINK_PATIENT = gql(`
  query GetShareLinkPatient($token: String!) {
    getShareLink(token: $token) {
      purpose
      includeBasicInfo
      includeEmergencyInfo
      includeConsultations
      includeDiagnoses
      includeExams
      includeSurgeries
      includeVaccines
      includeFamilyHistory
      includeAllergies
      includeConditions
      includeMedications
      includeAnthropometrics
      patient {
        fullName
        sex
        dateOfBirth
        bloodType
        emergencyNotes
        emergencyContactName
        emergencyContactPhone
        latestAnthropometric {
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
        }
        medicationPlans {
          id
          drugName
          dose
          frequency
          route
          isActive
        }
        consultations {
          id
          date
          facilityName
          doctorName
          specialty
          reason
          diagnoses {
            id
            description
            isPrimary
          }
        }
        exams {
          id
          title
          createdAt
        }
        surgeries {
          id
          name
          date
          hospital
          doctorName
        }
        vaccines {
          id
          vaccineName
          doseNumber
          date
          facility
        }
      }
    }
  }
`);

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

export default function PatientSharePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const { data, loading, error } = useQuery(GET_SHARE_LINK_PATIENT, {
    variables: { token },
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LogoLoading />
      </div>
    );
  }

  if (error || !data?.getShareLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 px-4">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Enlace no válido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Este enlace no es válido, ha sido revocado o ha expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const link = data.getShareLink;
  const patient = link.patient;

  const isEmergency = link.purpose === "EMERGENCY";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>
                  {isEmergency
                    ? "Ficha de emergencia"
                    : "Ficha clínica compartida"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isEmergency
                    ? "Información clínica simplificada para uso médico en contextos de urgencia."
                    : "Información clínica seleccionada para compartir con un profesional de la salud."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {patient.sex && (
                  <Badge variant="secondary" className="uppercase">
                    {formatSex(patient.sex)}
                  </Badge>
                )}
                {patient.bloodType && (
                  <Badge variant="outline">
                    {`Grupo sanguíneo: ${formatBloodType(patient.bloodType)}`}
                  </Badge>
                )}
                {patient.dateOfBirth && (
                  <Badge variant="outline">
                    Nac.{" "}
                    {new Date(patient.dateOfBirth).toLocaleDateString("es-CL")}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-semibold">{patient.fullName}</p>
            {link.includeEmergencyInfo && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Contacto de emergencia
                </p>
                {(patient.emergencyContactName ||
                  patient.emergencyContactPhone) && (
                  <p className="text-sm">
                    {patient.emergencyContactName ?? "Sin nombre registrado"}
                    {patient.emergencyContactPhone
                      ? ` (${patient.emergencyContactPhone})`
                      : null}
                  </p>
                )}
                {patient.emergencyNotes && (
                  <p className="text-sm text-muted-foreground">
                    {patient.emergencyNotes}
                  </p>
                )}
              </div>
            )}

            {link.includeAnthropometrics && patient.latestAnthropometric && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Datos antropométricos
                </p>
                <p className="text-sm">
                  <span className="font-medium">Estatura:</span>{" "}
                  {patient.latestAnthropometric.heightCm
                    ? `${patient.latestAnthropometric.heightCm} cm`
                    : "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Peso:</span>{" "}
                  {patient.latestAnthropometric.weightKg
                    ? `${patient.latestAnthropometric.weightKg} kg`
                    : "—"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">IMC:</span>{" "}
                  {patient.latestAnthropometric.bmi
                    ? patient.latestAnthropometric.bmi.toFixed(1)
                    : "—"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {link.includeConditions && (
          <Card>
            <CardHeader>
              <CardTitle>Enfermedades crónicas</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.conditions || patient.conditions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin condiciones registradas.
                </p>
              ) : (
                <ul className="text-sm list-disc list-inside space-y-1">
                  {patient.conditions.map((c: any) => (
                    <li key={c.id}>
                      <span className="font-medium">{c.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({c.status})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {link.includeAllergies && (
          <Card>
            <CardHeader>
              <CardTitle>Alergias</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.allergies || patient.allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sin alergias registradas.
                </p>
              ) : (
                <ul className="text-sm list-disc list-inside space-y-1">
                  {patient.allergies.map((a: any) => (
                    <li key={a.id}>
                      <span className="font-medium">{a.substance}</span>
                      {a.reaction ? ` – ${a.reaction}` : ""}
                      {a.isMedication ? " (medicamento)" : ""}
                      {a.isSevere ? " ⚠︎" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {link.includeMedications && (
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos actuales</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.medicationPlans ||
              patient.medicationPlans.filter((m: any) => m.isActive).length ===
                0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay medicación activa registrada.
                </p>
              ) : (
                <ul className="text-sm list-disc list-inside space-y-1">
                  {patient.medicationPlans
                    .filter((m: any) => m.isActive)
                    .map((m: any) => (
                      <li key={m.id}>
                        <span className="font-medium">{m.drugName}</span>
                        {m.dose ? ` – ${m.dose}` : ""}
                        {m.frequency ? `, ${m.frequency}` : ""}
                        {m.route ? ` (${m.route})` : ""}
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {link.includeConsultations && patient.consultations?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Consultas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {patient.consultations.slice(0, 5).map((c: any) => {
                  const primaryDx =
                    c.diagnoses?.find((d: any) => d.isPrimary) ??
                    c.diagnoses?.[0];
                  return (
                    <li key={c.id} className="space-y-0.5">
                      <p className="font-medium">
                        {new Date(c.date).toLocaleDateString("es-CL")}{" "}
                        {c.specialty ? `· ${c.specialty}` : ""}
                      </p>
                      {(c.facilityName || c.doctorName) && (
                        <p className="text-xs text-muted-foreground">
                          {c.facilityName}
                          {c.facilityName && c.doctorName ? " · " : ""}
                          {c.doctorName}
                        </p>
                      )}
                      {primaryDx && (
                        <p className="text-xs">
                          Diagnóstico principal: {primaryDx.description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {link.includeExams && patient.exams?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exámenes recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5">
                {patient.exams.slice(0, 8).map((e: any) => (
                  <li key={e.id}>
                    <span className="font-medium">{e.title}</span>
                    {e.createdAt && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {new Date(e.createdAt).toLocaleDateString("es-CL")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {link.includeSurgeries && patient.surgeries?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cirugías / procedimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5">
                {patient.surgeries.slice(0, 5).map((s: any) => (
                  <li key={s.id}>
                    <span className="font-medium">{s.name}</span>
                    {s.date && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {new Date(s.date).toLocaleDateString("es-CL")}
                      </span>
                    )}
                    {s.hospital && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {s.hospital}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {link.includeVaccines && patient.vaccines?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vacunas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1.5">
                {patient.vaccines.slice(0, 8).map((v: any) => (
                  <li key={v.id}>
                    <span className="font-medium">{v.vaccineName}</span>
                    {typeof v.doseNumber === "number" && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · Dosis {v.doseNumber}
                      </span>
                    )}
                    {v.date && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {new Date(v.date).toLocaleDateString("es-CL")}
                      </span>
                    )}
                    {v.facility && (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        · {v.facility}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <p className="mt-2 text-xs text-muted-foreground text-center">
          Esta información es confidencial y debe ser utilizada únicamente con
          fines médicos en el contexto de este episodio de atención.
        </p>
      </div>
    </div>
  );
}
