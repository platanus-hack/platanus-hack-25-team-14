"use client";

import { useQuery, gql } from "@apollo/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

const GET_PATIENT_SURGERIES = gql(`
  query GetPatientSurgeries($patientId: String!) {
    getPatientSurgeries(patientId: $patientId) {
      id
      name
      date
      hospital
      doctorName
      notes
    }
  }
`);

type SurgeriesTabProps = {
  patientId: string;
};

export function SurgeriesTab({ patientId }: SurgeriesTabProps) {
  const { data, loading } = useQuery(GET_PATIENT_SURGERIES, {
    variables: { patientId },
    fetchPolicy: "cache-first",
  });

  const surgeries = data?.getPatientSurgeries ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cirugías y procedimientos</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && surgeries.length === 0 ? (
          <div className="blur-sm">
            <p className="text-sm text-muted-foreground">Cargando cirugías y procedimientos…</p>
          </div>
        ) : surgeries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay cirugías ni procedimientos registrados para este paciente.
          </p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Procedimiento</th>
                  <th className="px-3 py-2 text-left">Centro / Médico</th>
                  <th className="px-3 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {surgeries.map((s: any) => (
                  <tr key={s.id} className="border-t align-top">
                    <td className="px-3 py-2">
                      {s.date
                        ? new Date(s.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{s.name}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-0.5">
                        {s.hospital && (
                          <p className="font-medium">{s.hospital}</p>
                        )}
                        {s.doctorName && (
                          <p className="text-xs text-muted-foreground">
                            {s.doctorName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {s.notes ?? (
                        <span className="text-xs text-muted-foreground">
                          Sin notas registradas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


