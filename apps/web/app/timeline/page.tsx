"use client";

import { useQuery } from "@apollo/client";
import { gql } from "../../gql";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MedicalDocument, DocumentCategory } from "../../types/medical";
import { FileTextOutlined } from "@ant-design/icons";

const GET_EXAMS = gql(`
  query GetExams {
    exams {
      id
      title
      fileKey
      status
      createdAt
      downloadUrl
    }
  }
`);

const categoryLabels: Record<DocumentCategory, string> = {
  exam: "Examen",
  appointment: "Cita",
  prescription: "Receta",
  "lab-result": "Resultado de laboratorio",
  imaging: "Imagenología",
  vaccination: "Vacunación",
  other: "Otro",
};

const categoryColors: Record<DocumentCategory, string> = {
  exam: "bg-green-100 text-green-800",
  appointment: "bg-purple-100 text-purple-800",
  prescription: "bg-orange-100 text-orange-800",
  "lab-result": "bg-blue-100 text-blue-800",
  imaging: "bg-pink-100 text-pink-800",
  vaccination: "bg-teal-100 text-teal-800",
  other: "bg-gray-100 text-gray-800",
};

export default function Page() {
  const { data, loading, error } = useQuery(GET_EXAMS, {
    pollInterval: 5000,
  });

  const documents: MedicalDocument[] =
    data?.exams?.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      category: "exam", // Defaulting to exam
      date: exam.createdAt,
      description: exam.status,
      fileUrl: exam.downloadUrl,
      fileName: exam.fileKey,
    })) || [];

  // Sort by date descending
  const sortedDocuments = [...documents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Agrupar documentos por año y mes
  const groupedDocs = sortedDocuments.reduce((acc, doc) => {
    const date = new Date(doc.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("es-CL", { month: "long" });
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = { year, month, docs: [] };
    }
    acc[key].docs.push(doc);
    return acc;
  }, {} as Record<string, { year: number; month: string; docs: MedicalDocument[] }>);

  const timelineGroups = Object.values(groupedDocs);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-gray-900 text-xl font-semibold mb-1">Línea de tiempo médica</h1>
        <p className="text-gray-600 text-sm">
          Revisa tu historial médico en orden cronológico
        </p>
      </div>

      {/* Línea de tiempo */}
      {loading ? (
        <div className="blur-sm">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Cargando…</p>
            </CardContent>
          </Card>
        </div>
      ) : sortedDocuments.length === 0 ? (
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardContent className="py-12 text-center">
            <FileTextOutlined
              style={{
                fontSize: "48px",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            />
            <p className="text-gray-600 mb-1">
              Aún no hay registros en tu línea de tiempo
            </p>
            <p className="text-gray-500">
              Sube documentos para verlos aparecer aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Línea vertical de la línea de tiempo */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

          <div className="space-y-6">
            {timelineGroups.map((group, groupIndex) => (
              <div key={`${group.year}-${group.month}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <p className="text-white">{group.month}</p>
                    <p className="text-blue-100">{group.year}</p>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Eventos */}
                <div className="space-y-4 ml-0 md:ml-16">
                  {group.docs.map((doc, docIndex) => (
                    <div key={doc.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-16 top-4 w-3 h-3 bg-blue-600 rounded-full border-4 border-white hidden md:block" />

                      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={categoryColors[doc.category]}>
                                  {categoryLabels[doc.category]}
                                </Badge>
                                <span className="text-gray-600">
                                  {new Date(doc.date).toLocaleDateString(
                                    "default",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <h3 className="text-gray-900 mb-2">
                                {doc.title}
                              </h3>
                              {doc.description && (
                                <p className="text-gray-600 mb-2">
                                  {doc.description}
                                </p>
                              )}
                              {doc.provider && (
                                <p className="text-gray-600">
                                  Prestador: {doc.provider}
                                </p>
                              )}
                              {doc.notes && (
                                <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg">
                                  {doc.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
