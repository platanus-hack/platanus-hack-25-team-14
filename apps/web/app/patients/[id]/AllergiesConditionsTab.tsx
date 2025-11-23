"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";

type AllergiesConditionsTabProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patient: any | undefined;
  loading: boolean;
};

export function AllergiesConditionsTab({
  patient,
  loading,
}: AllergiesConditionsTabProps) {
  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alergias y enfermedades</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="blur-sm">
              <p className="text-sm text-muted-foreground">Cargando información clínica…</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se encontró información del paciente.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const allergies = patient.allergies ?? [];
  const conditions = patient.conditions ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Alergias</CardTitle>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay alergias registradas.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Sustancia</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Reacción</th>
                    <th className="px-3 py-2 text-left">Gravedad</th>
                    <th className="px-3 py-2 text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {allergies.map((a: any) => (
                    <tr key={a.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <span className="font-medium">{a.substance}</span>
                      </td>
                      <td className="px-3 py-2">
                        {a.isMedication ? "Medicamento" : "Ambiental / alimento"}
                      </td>
                      <td className="px-3 py-2">
                        {a.reaction ?? (
                          <span className="text-xs text-muted-foreground">
                            Sin reacción registrada
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {a.isSevere ? (
                          <span className="text-xs font-semibold text-red-600">
                            Severa
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No severa
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {a.notes ?? (
                          <span className="text-xs text-muted-foreground">
                            Sin notas
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

      <Card>
        <CardHeader>
          <CardTitle>Enfermedades y condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          {conditions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay condiciones registradas.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Condición</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Desde</th>
                    <th className="px-3 py-2 text-left">Hasta</th>
                    <th className="px-3 py-2 text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {conditions.map((c: any) => (
                    <tr key={c.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <span className="font-medium">{c.name}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-muted-foreground">
                          {c.status === "ACTIVE"
                            ? "Activa"
                            : c.status === "RESOLVED"
                            ? "Resuelta"
                            : "En remisión"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {c.diagnosedAt
                          ? new Date(c.diagnosedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {c.resolvedAt
                          ? new Date(c.resolvedAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {c.notes ?? (
                          <span className="text-xs text-muted-foreground">
                            Sin notas
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
    </div>
  );
}


