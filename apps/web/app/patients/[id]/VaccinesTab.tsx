"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

const GET_PATIENT_VACCINES = gql(`
  query GetPatientVaccines($patientId: String!) {
    getPatientVaccines(patientId: $patientId) {
      id
      vaccineName
      doseNumber
      totalDosesPlanned
      date
      facility
      notes
    }
  }
`);

type VaccinesTabProps = {
  patientId: string;
};

export function VaccinesTab({ patientId }: VaccinesTabProps) {
  const { data, loading } = useQuery(GET_PATIENT_VACCINES, {
    variables: { patientId },
    fetchPolicy: "cache-first",
  });

  const vaccines = data?.getPatientVaccines ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de vacunas</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && vaccines.length === 0 ? (
          <div className="blur-sm">
            <p className="text-sm text-muted-foreground">Cargando historial de vacunas…</p>
          </div>
        ) : vaccines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay vacunas registradas para este paciente.
          </p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Vacuna</th>
                  <th className="px-3 py-2 text-left">Dosis</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Centro</th>
                  <th className="px-3 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.map((v: any) => {
                  const isComplete =
                    v.totalDosesPlanned &&
                    v.doseNumber &&
                    v.doseNumber >= v.totalDosesPlanned;

                  return (
                    <tr key={v.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <div className="space-y-0.5">
                          <p className="font-medium">{v.vaccineName}</p>
                          {v.totalDosesPlanned && (
                            <p className="text-xs text-muted-foreground">
                              {isComplete
                                ? "Esquema completo"
                                : `Esquema incompleto (${v.doseNumber ?? 0}/${
                                    v.totalDosesPlanned
                                  })`}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {v.doseNumber ?? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {v.date
                          ? new Date(v.date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {v.facility ?? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {v.notes ?? (
                          <span className="text-xs text-muted-foreground">
                            Sin notas
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


