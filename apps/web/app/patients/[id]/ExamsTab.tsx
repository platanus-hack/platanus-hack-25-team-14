"use client";

import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";

const GET_PATIENT_EXAMS = gql(`
  query GetPatientExams($patientId: String!) {
    getPatientExams(patientId: $patientId) {
      id
      title
      status
      createdAt
      downloadUrl
    }
  }
`);

type ExamsTabProps = {
  patientId: string;
};

const MOCK_EXAM_TRENDS = [
  {
    id: "hemoglobina",
    label: "Hemoglobina",
    unit: "g/dL",
    reference: "12.0 - 15.5",
    series: [
      { date: "2024-01-10", value: 13.2 },
      { date: "2024-06-10", value: 12.8 },
      { date: "2025-01-10", value: 12.4 },
    ],
  },
  {
    id: "glicemia",
    label: "Glicemia en ayunas",
    unit: "mg/dL",
    reference: "70 - 99",
    series: [
      { date: "2024-01-10", value: 110 },
      { date: "2024-06-10", value: 102 },
      { date: "2025-01-10", value: 95 },
    ],
  },
];

export function ExamsTab({ patientId }: ExamsTabProps) {
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(
    MOCK_EXAM_TRENDS[0]?.id ?? null,
  );

  const { data, loading } = useQuery(GET_PATIENT_EXAMS, {
    variables: { patientId },
    fetchPolicy: "cache-first",
  });

  const exams = data?.getPatientExams ?? [];
  const selectedTrend = MOCK_EXAM_TRENDS.find(
    (t) => t.id === selectedTrendId,
  );

  return (
    <Tabs defaultValue="list" className="space-y-4">
      <TabsList>
        <TabsTrigger value="list">Todos los exámenes</TabsTrigger>
        <TabsTrigger value="trends">Historial por resultado</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Todos los exámenes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && exams.length === 0 ? (
              <div className="blur-sm">
                <p className="text-sm text-muted-foreground">Cargando exámenes…</p>
              </div>
            ) : exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay exámenes registrados para este paciente.
              </p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Examen</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam: any) => (
                      <tr key={exam.id} className="border-t">
                        <td className="px-3 py-2">
                          {exam.createdAt
                            ? new Date(exam.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-3 py-2">{exam.title}</td>
                        <td className="px-3 py-2">{exam.status}</td>
                        <td className="px-3 py-2">
                          {exam.downloadUrl && (
                            <a
                              href={exam.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline"
                            >
                              Ver PDF
                            </a>
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
      </TabsContent>

      <TabsContent value="trends">
        <Card>
          <CardHeader>
            <CardTitle>Historial por resultado (demo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_EXAM_TRENDS.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay datos de parámetros configurados.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Selecciona un resultado
                  </p>
                  <Select
                    value={selectedTrendId ?? undefined}
                    onValueChange={(value) => setSelectedTrendId(value)}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Elegir resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_EXAM_TRENDS.map((trend) => (
                        <SelectItem key={trend.id} value={trend.id}>
                          {trend.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTrend && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">
                        {selectedTrend.label}
                      </span>{" "}
                      ({selectedTrend.unit}) · Rango de referencia{" "}
                      {selectedTrend.reference}
                    </p>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">Fecha</th>
                            <th className="px-3 py-2 text-left">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTrend.series.map((point) => (
                            <tr key={point.date} className="border-t">
                              <td className="px-3 py-2">
                                {new Date(point.date).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2">
                                {point.value} {selectedTrend.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}


