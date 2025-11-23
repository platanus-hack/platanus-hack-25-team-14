"use client";

import { useQuery, gql } from "@apollo/client";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { FileText, Stethoscope, Scissors, Syringe } from "lucide-react";

const GET_PATIENT_TIMELINE = gql(`
  query GetPatientTimeline($patientId: String!) {
    exams: getPatientExams(patientId: $patientId) {
      id
      title
      createdAt
      status
    }
    consultations: getPatientConsultations(patientId: $patientId) {
      id
      date
      facilityName
      doctorName
      specialty
      reason
    }
    surgeries: getPatientSurgeries(patientId: $patientId) {
      id
      name
      date
      hospital
      doctorName
    }
    vaccines: getPatientVaccines(patientId: $patientId) {
      id
      vaccineName
      date
      facility
      doseNumber
    }
  }
`);

type TimelineEvent = {
  id: string;
  date: string;
  type: "exam" | "consultation" | "surgery" | "vaccine";
  title: string;
  description?: string;
  icon: typeof FileText;
  color: string;
  badgeColor: string;
};

type TimelineTabProps = {
  patientId: string;
};

export function TimelineTab({ patientId }: TimelineTabProps) {
  const { data, loading } = useQuery(GET_PATIENT_TIMELINE, {
    variables: { patientId },
    fetchPolicy: "cache-first",
  });

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm blur-sm">
        <CardContent className="py-12">
          <p className="text-gray-600">Cargando…</p>
        </CardContent>
      </Card>
    );
  }

  const events: TimelineEvent[] = [];

  data?.exams?.forEach((exam: { id: string; title: string; createdAt: string; status?: string }) => {
    events.push({
      id: exam.id,
      date: exam.createdAt,
      type: "exam",
      title: exam.title,
      description: exam.status,
      icon: FileText,
      color: "bg-green-100 text-green-800",
      badgeColor: "bg-green-500",
    });
  });

  data?.consultations?.forEach((consultation: { id: string; date: string; facilityName?: string; doctorName?: string; specialty?: string; reason?: string }) => {
    const description = [consultation.facilityName, consultation.doctorName, consultation.specialty].filter(Boolean).join(" • ");
    events.push({
      id: consultation.id,
      date: consultation.date,
      type: "consultation",
      title: consultation.reason || "Consulta médica",
      description,
      icon: Stethoscope,
      color: "bg-purple-100 text-purple-800",
      badgeColor: "bg-purple-500",
    });
  });

  data?.surgeries?.forEach((surgery: { id: string; name: string; date?: string; hospital?: string; doctorName?: string }) => {
    const description = [surgery.hospital, surgery.doctorName].filter(Boolean).join(" • ");
    events.push({
      id: surgery.id,
      date: surgery.date || new Date().toISOString(),
      type: "surgery",
      title: surgery.name,
      description,
      icon: Scissors,
      color: "bg-orange-100 text-orange-800",
      badgeColor: "bg-orange-500",
    });
  });

  data?.vaccines?.forEach((vaccine: { id: string; vaccineName: string; date?: string; facility?: string; doseNumber?: number }) => {
    const description = [vaccine.facility, vaccine.doseNumber ? `Dosis ${vaccine.doseNumber}` : null].filter(Boolean).join(" • ");
    events.push({
      id: vaccine.id,
      date: vaccine.date || new Date().toISOString(),
      type: "vaccine",
      title: vaccine.vaccineName,
      description,
      icon: Syringe,
      color: "bg-teal-100 text-teal-800",
      badgeColor: "bg-teal-500",
    });
  });

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const year = date.getFullYear();
    const month = date.toLocaleString("es-ES", { month: "long" });
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = { year, month, events: [] };
    }
    acc[key].events.push(event);
    return acc;
  }, {} as Record<string, { year: number; month: string; events: TimelineEvent[] }>);

  const timelineGroups = Object.values(groupedEvents);

  if (sortedEvents.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">
            Aún no hay registros en tu línea de tiempo
          </p>
          <p className="text-gray-500 text-sm">
            Los eventos médicos aparecerán aquí en orden cronológico
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />

      <div className="space-y-6">
        {timelineGroups.map((group) => (
          <div key={`${group.year}-${group.month}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                <p className="text-white capitalize">{group.month}</p>
                <p className="text-blue-100">{group.year}</p>
              </div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4 ml-0 md:ml-16">
              {group.events.map((event) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="relative">
                    <div className={`absolute -left-16 top-4 w-3 h-3 rounded-full border-4 border-white hidden md:block ${event.badgeColor}`} />
                    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={event.color}>
                                <Icon className="w-3 h-3 mr-1" />
                                {event.type === "exam" && "Examen"}
                                {event.type === "consultation" && "Consulta"}
                                {event.type === "surgery" && "Cirugía"}
                                {event.type === "vaccine" && "Vacuna"}
                              </Badge>
                              <span className="text-gray-600 text-sm">
                                {new Date(event.date).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-gray-600 text-sm">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

