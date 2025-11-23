"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Calendar } from "antd";

type MedicationsTabProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patient: any | undefined;
  loading: boolean;
};

type SlotId = "morning" | "afternoon" | "night";

function getSlotsForMedication(plan: any): SlotId[] {
  const freq = (plan.frequency as string | undefined)?.toLowerCase() ?? "";

  // Heurística simple basada en texto libre
  if (freq.includes("cada 8")) {
    return ["morning", "afternoon", "night"];
  }
  if (freq.includes("cada 12")) {
    return ["morning", "night"];
  }
  if (freq.includes("noche")) {
    return ["night"];
  }
  if (freq.includes("tarde")) {
    return ["afternoon"];
  }
  if (
    freq.includes("mañana") ||
    freq.includes("1 vez") ||
    freq.includes("una vez")
  ) {
    return ["morning"];
  }

  // Sin información clara: lo dejamos sin slot específico
  return [];
}

export function MedicationsTab({ patient, loading }: MedicationsTabProps) {
  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medicamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="blur-sm">
              <p className="text-sm text-muted-foreground">Cargando plan de medicación…</p>
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

  const allPlans = patient.medicationPlans ?? [];
  const activePlans = allPlans.filter((m: any) => m.isActive);

  // Para el calendario priorizamos medicamentos con frecuencia "estructurada",
  // es decir, cuyo texto incluye un número (cada 8 h, cada 12 h, 1 vez al día, etc.).
  const calendarPlans = activePlans.filter((m: any) => {
    const freq = (m.frequency as string | undefined) ?? "";
    return /\d/.test(freq);
  });

  const schedule: Record<SlotId, any[]> = {
    morning: [],
    afternoon: [],
    night: [],
  };

  activePlans.forEach((plan: any) => {
    const slots = getSlotsForMedication(plan);
    slots.forEach((slot) => {
      schedule[slot].push(plan);
    });
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plan de medicación activo</CardTitle>
        </CardHeader>
        <CardContent>
          {activePlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay medicamentos activos registrados.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Medicamento</th>
                    <th className="px-3 py-2 text-left">Dosis</th>
                    <th className="px-3 py-2 text-left">Frecuencia</th>
                    <th className="px-3 py-2 text-left">Vía</th>
                    <th className="px-3 py-2 text-left">Período</th>
                  </tr>
                </thead>
                <tbody>
                  {activePlans.map((m: any) => (
                    <tr key={m.id} className="border-t align-top">
                      <td className="px-3 py-2">
                        <span className="font-medium">{m.drugName}</span>
                      </td>
                      <td className="px-3 py-2">
                        {m.dose ?? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {m.frequency ?? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {m.route ?? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {(() => {
                          const hasStart = !!m.startDate;
                          const hasEnd = !!m.endDate;

                          if (hasStart && hasEnd) {
                            return `${new Date(
                              m.startDate
                            ).toLocaleDateString()} → ${new Date(
                              m.endDate
                            ).toLocaleDateString()}`;
                          }

                          if (hasStart && !hasEnd) {
                            const startLabel = new Date(
                              m.startDate
                            ).toLocaleDateString();
                            return `${startLabel} - Permanencia`;
                          }

                          if (!hasStart && hasEnd) {
                            return `Hasta ${new Date(
                              m.endDate
                            ).toLocaleDateString()}`;
                          }

                          return "—";
                        })()}
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
          <CardTitle>Calendario mensual de medicación (heurístico)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-4">
          {calendarPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay medicamentos activos para mostrar en el calendario.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <Calendar
                  fullscreen={false}
                  dateCellRender={(value: any) => {
                    const date: Date = value.toDate();
                    const itemsForDay = calendarPlans.filter((m: any) => {
                      const start = m.startDate ? new Date(m.startDate) : null;
                      const end = m.endDate ? new Date(m.endDate) : null;

                      if (start && date < new Date(start.toDateString()))
                        return false;
                      if (end && date > new Date(end.toDateString()))
                        return false;
                      return true;
                    });

                    if (itemsForDay.length === 0) return null;

                    const count = itemsForDay.length;
                    const label =
                      count === 1
                        ? itemsForDay[0].drugName
                        : `${count} medicamentos`;

                    return (
                      <div className="mt-1">
                        <div className="max-w-full truncate rounded-full border border-primary/40 bg-primary/5 px-1.5 py-0.5 text-[9px] leading-none text-foreground">
                          {label}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
