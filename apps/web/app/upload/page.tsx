"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  UploadOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { DocumentCategory } from "../../types/medical";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCheckIcon } from "lucide-react";
import { notification } from "antd";

// Mutación genérica para subir un documento clínico usando la misma infraestructura de "exam"
const CREATE_DOCUMENT_UPLOAD = gql(`
  mutation CreateDocumentUpload(
    $title: String!
    $userId: String!
    $filename: String!
    $category: String
    $docType: String!
    $mimeType: String
  ) {
    createDocumentUpload(
      title: $title
      userId: $userId
      filename: $filename
      category: $category
      docType: $docType
      mimeType: $mimeType
    ) {
      id
      title
      presignedUrl
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

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  const [createDocumentUpload, { loading }] = useMutation(
    CREATE_DOCUMENT_UPLOAD
  );

  const mapCategoryToExamCategory = (cat: DocumentCategory): string => {
    switch (cat) {
      case "lab-result":
      case "exam":
        return "LAB";
      case "imaging":
        return "IMAGING";
      case "appointment":
      case "prescription":
        return "CLINICAL";
      default:
        return "OTHER";
    }
  };

  // Mapear la categoría del formulario al DocumentType del modelo clínico
  const mapCategoryToDocType = (cat: DocumentCategory): string => {
    switch (cat) {
      case "exam":
      case "lab-result":
      case "imaging":
      case "vaccination":
        return "EXAM_REPORT";
      case "prescription":
        return "PRESCRIPTION";
      case "appointment":
        return "CONSULTATION_SUMMARY";
      default:
        return "OTHER";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !userId) return;

    setUploading(true);

    try {
      // 1. Crear registro de documento en el backend y obtener URL firmada
      const result = await createDocumentUpload({
        variables: {
          title: title || file.name,
          userId,
          filename: file.name,
          category: mapCategoryToExamCategory(category),
          docType: mapCategoryToDocType(category),
          mimeType: file.type || "application/pdf",
        },
      });

      const presignedUrl = result.data?.createDocumentUpload?.presignedUrl;

      if (!presignedUrl) {
        throw new Error("No se pudo obtener la URL de carga");
      }

      // 2. Subir el archivo a S3 usando la URL firmada
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/pdf",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Error al subir el archivo a S3");
      }

      notification.success({
        message: "Documento subido exitosamente",
        description:
          "Tu documento ha sido guardado y está disponible en tus archivos.",
      });
    } catch (err) {
      console.error("Error al subir el documento:", err);
      toast("Error al subir el documento", {
        description: "No se pudo subir el documento. Intenta nuevamente.",
      });
    } finally {
      setUploading(false);
      router.push(`/documents`);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setCategory("other");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setProvider("");
    setNotes("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-gray-900 mb-2">Subir documento clínico</h1>
        <p className="text-gray-600">
          Sube tus documentos médicos y complétalos con información básica para
          tu historial.
        </p>
      </div>

      {/* Sección de subida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <ThunderboltOutlined
              className="text-emerald-600"
              style={{ fontSize: "20px" }}
            />
            Subida de documentos
          </CardTitle>
          <CardDescription>
            Selecciona un archivo y completa los datos del documento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subida de archivo */}
            <div>
              <Label htmlFor="file-upload">Seleccionar documento</Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="flex-1 bg-white border-gray-300"
                  disabled={uploading}
                />
                {file && (
                  <Button
                    onClick={resetForm}
                    disabled={uploading}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de detalles del documento */}
      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del documento</CardTitle>
            <CardDescription>
              Revisa y completa la información del documento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ej: Control anual, Radiografía de tórax…"
                    disabled={uploading}
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as DocumentCategory)}
                    disabled={uploading}
                  >
                    <SelectTrigger
                      id="category"
                      className="bg-white border-gray-300"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha del documento *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={uploading}
                    className="bg-white border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Prestador de salud</Label>
                  <Input
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Ej: Dra. González, Clínica Santa María…"
                    disabled={uploading}
                    className="bg-white border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del documento"
                  disabled={uploading}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas u observaciones adicionales"
                  rows={4}
                  disabled={uploading}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={uploading}
                >
                  <UploadOutlined />
                  {uploading ? "Subiendo…" : "Subir documento"}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  disabled={uploading}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Estado vacío */}
      {!file && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileTextOutlined
              style={{
                fontSize: "48px",
                color: "#d1d5db",
                marginBottom: "12px",
              }}
            />
            <p className="text-gray-600 mb-1">
              Aún no has seleccionado ningún archivo
            </p>
            <p className="text-gray-500">
              Elige un documento para agregarlo a tu historial clínico
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
