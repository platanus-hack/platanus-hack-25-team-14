"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

const MOCK_CONSULTATIONS = [
  {
    id: "mock-1",
    date: "2024-01-15",
    facilityName: "Clínica Central",
    doctorName: "Dra. González",
    specialty: "Medicina interna",
    reason: "Control anual",
    diagnoses: [
      {
        id: "mock-dx-1",
        description: "Hipertensión arterial",
        isPrimary: true,
        code: "I10",
      },
    ],
  },
  {
    id: "mock-2",
    date: "2024-06-20",
    facilityName: "Centro de Salud Familiar",
    doctorName: "Dr. Martínez",
    specialty: "Medicina familiar",
    reason: "Control de diabetes",
    diagnoses: [
      {
        id: "mock-dx-2",
        description: "Diabetes mellitus tipo 2",
        isPrimary: true,
        code: "E11",
      },
    ],
  },
];

const GET_PATIENT_CONSULTATIONS = gql(`
  query GetPatientConsultations($patientId: String!) {
    getPatientConsultations(patientId: $patientId) {
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
  }
`);

type ConsultationsTabProps = {
  patientId: string;
};

export function ConsultationsTab({ patientId }: ConsultationsTabProps) {
  const { data, loading } = useQuery(GET_PATIENT_CONSULTATIONS, {
    variables: { patientId },
    fetchPolicy: "cache-first",
  });

  const consultations =
    data?.getPatientConsultations && data.getPatientConsultations.length > 0
      ? data.getPatientConsultations
      : MOCK_CONSULTATIONS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas médicas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && consultations.length === 0 ? (
          <div className="blur-sm">
            <p className="text-sm text-muted-foreground">Cargando consultas médicas…</p>
          </div>
        ) : consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay consultas médicas registradas para este paciente.
          </p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Centro / Médico</th>
                  <th className="px-3 py-2 text-left">Motivo de consulta</th>
                  <th className="px-3 py-2 text-left">Diagnóstico principal</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c: any) => {
                  const primaryDiagnosis =
                    c.diagnoses?.find((d: any) => d.isPrimary) ??
                    c.diagnoses?.[0] ??
                    null;

                  return (
                    <tr key={c.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        {c.date
                          ? new Date(c.date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-0.5">
                          {c.facilityName && (
                            <p className="font-medium">{c.facilityName}</p>
                          )}
                          {(c.doctorName || c.specialty) && (
                            <p className="text-xs text-muted-foreground">
                              {c.doctorName}
                              {c.specialty ? ` · ${c.specialty}` : ""}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {c.reason ?? (
                          <span className="text-xs text-muted-foreground">
                            Sin motivo registrado
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {primaryDiagnosis ? (
                          <div className="space-y-0.5">
                            <p className="font-medium">
                              {primaryDiagnosis.description}
                            </p>
                            {primaryDiagnosis.code && (
                              <p className="text-xs text-muted-foreground">
                                Código: {primaryDiagnosis.code}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sin diagnóstico registrado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


