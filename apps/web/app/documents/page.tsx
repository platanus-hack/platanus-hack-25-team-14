"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { gql } from "../../gql";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { DocumentDialog } from "../../components/DocumentDialog";
import { DocumentCategory, MedicalDocument } from "../../types/medical";
import { LogoLoading } from "../../components/FancyLoading";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(null);

  const { data, loading, error } = useQuery(GET_EXAMS, {
    pollInterval: 5000,
  });

  const documents: MedicalDocument[] =
    data?.exams?.map((exam: any) => ({
      id: exam.id,
      title: exam.title,
      category: "exam", // Defaulting to exam as backend doesn't store category yet
      date: exam.createdAt,
      description: exam.status,
      fileUrl: exam.downloadUrl,
      fileName: exam.fileKey,
    })) || [];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      alert("Delete not implemented in backend yet");
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
        <div>
          <h1 className="text-gray-900 text-xl font-semibold mb-1">
            Documentos médicos
          </h1>
          <p className="text-gray-600 text-sm">
            Explora y gestiona tus registros médicos
          </p>
        </div>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm ">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <FilterOutlined className="w-4 h-4" />
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setCategoryFilter("all")}
            className={
              categoryFilter === "all"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          >
            Todos ({documents.length})
          </Button>
          {Object.entries(categoryLabels).map(([value, label]) => {
            const count = documents.filter((d) => d.category === value).length;
            return (
              <Button
                key={value}
                size="sm"
                onClick={() => setCategoryFilter(value)}
                className={
                  categoryFilter === value
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardContent className="py-12 text-center">
              <FileTextOutlined
                style={{
                  fontSize: "48px",
                  color: "#d1d5db",
                  marginBottom: "12px",
                }}
              />
              <p className="text-gray-600 mb-1">No se encontraron documentos</p>
              <p className="text-gray-500 text-sm">
                Intenta ajustar tu búsqueda o filtros
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={categoryColors[doc.category]}>
                      {categoryLabels[doc.category]}
                    </Badge>
                    <p className="text-gray-600">
                      {new Date(doc.date).toLocaleDateString()}
                    </p>
                  </div>
                  <CardTitle className="text-gray-900">{doc.title}</CardTitle>
                  {doc.description && (
                    <CardDescription>{doc.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {doc.provider && (
                    <div>
                      <p className="text-gray-600">Provider</p>
                      <p className="text-gray-900">{doc.provider}</p>
                    </div>
                  )}
                  {doc.notes && (
                    <div>
                      <p className="text-gray-600">Notes</p>
                      <p className="text-gray-900">{doc.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <EyeOutlined className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <DeleteOutlined className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Dialog */}
        <DocumentDialog
          document={selectedDocument}
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
        />
      </div>
    </div>
  );
}
