"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

const CREATE_GENERAL_SHARE_LINK = gql(`
  mutation CreateGeneralShareLink(
    $patientId: String!
    $expiresAt: DateTime
    $includeBasicInfo: Boolean
    $includeEmergencyInfo: Boolean
    $includeConsultations: Boolean
    $includeDiagnoses: Boolean
    $includeExams: Boolean
    $includeSurgeries: Boolean
    $includeVaccines: Boolean
    $includeFamilyHistory: Boolean
    $includeAllergies: Boolean
    $includeConditions: Boolean
    $includeMedications: Boolean
    $includeAnthropometrics: Boolean
  ) {
    createGeneralShareLink(
      patientId: $patientId
      expiresAt: $expiresAt
      includeBasicInfo: $includeBasicInfo
      includeEmergencyInfo: $includeEmergencyInfo
      includeConsultations: $includeConsultations
      includeDiagnoses: $includeDiagnoses
      includeExams: $includeExams
      includeSurgeries: $includeSurgeries
      includeVaccines: $includeVaccines
      includeFamilyHistory: $includeFamilyHistory
      includeAllergies: $includeAllergies
      includeConditions: $includeConditions
      includeMedications: $includeMedications
      includeAnthropometrics: $includeAnthropometrics
    ) {
      token
      expiresAt
    }
  }
`);

const CREATE_EMERGENCY_SHARE_LINK = gql(`
  mutation CreateEmergencyShareLink($patientId: String!) {
    createEmergencyShareLink(patientId: $patientId) {
      token
    }
  }
`);

type ShareLinksTabProps = {
  patientId: string;
};

type IncludeGeneralType = {
  basicInfo: boolean;
  emergencyInfo: boolean;
  consultations: boolean;
  diagnoses: boolean;
  exams: boolean;
  surgeries: boolean;
  vaccines: boolean;
  familyHistory: boolean;
  allergies: boolean;
  conditions: boolean;
  medications: boolean;
  anthropometrics: boolean;
};

export function ShareLinksTab({ patientId }: ShareLinksTabProps) {
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [generalLink, setGeneralLink] = useState<string | null>(null);
  const [emergencyLink, setEmergencyLink] = useState<string | null>(null);

  const [includeGeneral, setIncludeGeneral] = useState<IncludeGeneralType>({
    basicInfo: true,
    emergencyInfo: true,
    consultations: true,
    diagnoses: true,
    exams: true,
    surgeries: false,
    vaccines: false,
    familyHistory: false,
    allergies: true,
    conditions: true,
    medications: true,
    anthropometrics: true,
  });

  const [createGeneralShareLink, { loading: creatingGeneral }] = useMutation(
    CREATE_GENERAL_SHARE_LINK
  );
  const [createEmergencyShareLink, { loading: creatingEmergency }] =
    useMutation(CREATE_EMERGENCY_SHARE_LINK);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://example.com";

  const handleCreateGeneral = async () => {
    const variables: Record<string, unknown> = {
      patientId,
      includeBasicInfo: includeGeneral.basicInfo,
      includeEmergencyInfo: includeGeneral.emergencyInfo,
      includeConsultations: includeGeneral.consultations,
      includeDiagnoses: includeGeneral.diagnoses,
      includeExams: includeGeneral.exams,
      includeSurgeries: includeGeneral.surgeries,
      includeVaccines: includeGeneral.vaccines,
      includeFamilyHistory: includeGeneral.familyHistory,
      includeAllergies: includeGeneral.allergies,
      includeConditions: includeGeneral.conditions,
      includeMedications: includeGeneral.medications,
      includeAnthropometrics: includeGeneral.anthropometrics,
    };

    if (expiresAt) {
      variables.expiresAt = new Date(expiresAt).toISOString();
    }

    const { data } = await createGeneralShareLink({ variables });
    if (data?.createGeneralShareLink?.token) {
      const link = `${baseUrl}/share/patient/${data.createGeneralShareLink.token}`;
      setGeneralLink(link);
      await navigator.clipboard.writeText(link);
    }
  };

  const handleCreateEmergency = async () => {
    const { data } = await createEmergencyShareLink({
      variables: { patientId },
    });
    if (data?.createEmergencyShareLink?.token) {
      const link = `${baseUrl}/share/patient/${data.createEmergencyShareLink.token}`;
      setEmergencyLink(link);
      await navigator.clipboard.writeText(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg font-semibold">
              Compartir ficha con un médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Información incluida
                </p>

                <div className="space-y-3">
                  {[
                    ["basicInfo", "Datos básicos"],
                    ["emergencyInfo", "Información de emergencia"],
                    ["consultations", "Consultas médicas"],
                    ["diagnoses", "Diagnósticos"],
                    ["exams", "Exámenes"],
                    ["medications", "Medicamentos"],
                    ["conditions", "Enfermedades crónicas"],
                    ["allergies", "Alergias"],
                    ["anthropometrics", "Peso / talla / IMC"],
                    ["surgeries", "Cirugías / procedimientos"],
                    ["vaccines", "Vacunas"],
                    ["familyHistory", "Antecedentes familiares"],
                  ].map(([key, label]) => {
                    const typedKey = key as keyof IncludeGeneralType;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-1"
                      >
                        <Label className="text-sm text-gray-900 font-normal">
                          {label}
                        </Label>
                        <Switch
                          checked={includeGeneral[typedKey]}
                          onCheckedChange={(checked) =>
                            setIncludeGeneral((prev) => ({
                              ...prev,
                              [typedKey]: checked,
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Configuración
                </p>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-sm text-gray-900">
                    Fecha de expiración (opcional)
                  </Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-white border-gray-300"
                    placeholder="dd/mm/aaaa"
                  />
                </div>

                <Button
                  className="mt-4 w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  onClick={async () => {
                    if (generalLink) {
                      await navigator.clipboard.writeText(generalLink);
                    } else {
                      await handleCreateGeneral();
                    }
                  }}
                  disabled={creatingGeneral}
                >
                  {creatingGeneral
                    ? "Creando enlace…"
                    : generalLink
                    ? "Copiar enlace"
                    : "Generar enlace para médico"}
                </Button>

                {generalLink && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs text-gray-600">
                      Enlace generado
                    </Label>
                    <Input
                      readOnly
                      value={generalLink}
                      className="text-xs bg-gray-50 border-gray-300 text-gray-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 text-lg font-semibold">
              Enlace de emergencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              Este enlace está pensado para situaciones de urgencia. Incluye por
              defecto datos básicos, información de emergencia, tipo de sangre,
              enfermedades de base, medicación actual, alergias y
              peso/talla/IMC. No caduca automáticamente, pero puedes revocarlo
              desde la configuración avanzada más adelante.
            </p>

            <Button
              className="w-full md:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              onClick={async () => {
                if (emergencyLink) {
                  await navigator.clipboard.writeText(emergencyLink);
                } else {
                  await handleCreateEmergency();
                }
              }}
              disabled={creatingEmergency}
            >
              {creatingEmergency
                ? "Creando enlace de emergencia…"
                : emergencyLink
                ? "Copiar enlace"
                : "Generar enlace"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
