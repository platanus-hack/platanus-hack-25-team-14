import {
  BloodType,
  ConditionStatus,
  ExamCategory,
  ExamSource,
  PrismaClient,
  RelationType,
  Sex,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo data for existing user...");

  // Busca un usuario existente (por ahora tomamos el primero)
  const user = await prisma.user.findFirst({});

  if (!user) {
    console.warn(
      "No se encontró ningún usuario en la base de datos. Crea un usuario vía autenticación antes de correr el seed."
    );
    return;
  }

  console.log("Usando usuario para seed:", user.email, user.id);

  // Crea o actualiza el Patient asociado a este usuario
  const patient = await prisma.patient.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      fullName: user.name ?? "Paciente Demo",
      documentId: "12345678-9",
      email: user.email,
      phone: "+56911111111",
      sex: Sex.FEMALE,
      dateOfBirth: new Date("1988-03-15T12:00:00.000Z"),
      bloodType: BloodType.O_POS,
      emergencyNotes: "Alergia a penicilina. Asmática.",
      emergencyContactName: "Juan Pérez",
      emergencyContactPhone: "+56922222222",
    },
  });

  console.log("Paciente asociado:", patient.fullName, patient.id);

  // Limpia datos clínicos previos del paciente para que el seed sea determinista
  await prisma.anthropometricRecord.deleteMany({
    where: { patientId: patient.id },
  });
  await prisma.allergy.deleteMany({ where: { patientId: patient.id } });
  await prisma.condition.deleteMany({ where: { patientId: patient.id } });
  await prisma.familyHistory.deleteMany({ where: { patientId: patient.id } });
  await prisma.surgery.deleteMany({ where: { patientId: patient.id } });
  await prisma.vaccineRecord.deleteMany({ where: { patientId: patient.id } });
  await prisma.medicationPlan.deleteMany({ where: { patientId: patient.id } });
  await prisma.consultation.deleteMany({
    where: { patientId: patient.id },
  });
  await prisma.exam.deleteMany({ where: { patientId: patient.id } });

  // Registros antropométricos
  await prisma.anthropometricRecord.createMany({
    data: [
      {
        patientId: patient.id,
        date: new Date("2024-01-10T12:00:00.000Z"),
        heightCm: 162,
        weightKg: 65,
        bmi: 24.8,
        notes: "Control anual",
      },
      {
        patientId: patient.id,
        date: new Date("2025-01-10T12:00:00.000Z"),
        heightCm: 162,
        weightKg: 68,
        bmi: 25.9,
        notes: "Aumento leve de peso",
      },
    ],
  });

  // Alergias
  await prisma.allergy.createMany({
    data: [
      {
        patientId: patient.id,
        substance: "Penicilina",
        reaction: "Anafilaxia",
        isMedication: true,
        isSevere: true,
      },
      {
        patientId: patient.id,
        substance: "Pólen",
        reaction: "Rinitis alérgica",
        isMedication: false,
        isSevere: false,
      },
    ],
  });

  // Condiciones
  await prisma.condition.createMany({
    data: [
      {
        patientId: patient.id,
        name: "Asma",
        status: ConditionStatus.ACTIVE,
        diagnosedAt: new Date("2005-01-01T12:00:00.000Z"),
        notes: "Usa inhalador de rescate según necesidad.",
      } as any,
      {
        patientId: patient.id,
        name: "Hipotiroidismo",
        status: ConditionStatus.ACTIVE,
        diagnosedAt: new Date("2018-06-01T12:00:00.000Z"),
      } as any,
    ],
  });

  // Antecedentes familiares
  await prisma.familyHistory.createMany({
    data: [
      {
        patientId: patient.id,
        relation: RelationType.MOTHER,
        conditionName: "Cáncer de mama",
        ageAtDiagnosis: 48,
      },
      {
        patientId: patient.id,
        relation: RelationType.FATHER,
        conditionName: "Infarto agudo al miocardio",
        ageAtDiagnosis: 55,
      },
    ],
  });

  // Cirugías
  await prisma.surgery.create({
    data: {
      patientId: patient.id,
      name: "Cesárea",
      date: new Date("2016-09-20T12:00:00.000Z"),
      hospital: "Clínica Alemana",
      doctorName: "Dr. Rodríguez",
      notes: "Sin complicaciones.",
    },
  });

  // Vacunas
  await prisma.vaccineRecord.createMany({
    data: [
      {
        patientId: patient.id,
        vaccineName: "COVID-19 Pfizer",
        doseNumber: 1,
        totalDosesPlanned: 2,
        date: new Date("2021-03-10T12:00:00.000Z"),
        facility: "Vacunatorio municipal",
      },
      {
        patientId: patient.id,
        vaccineName: "COVID-19 Pfizer",
        doseNumber: 2,
        totalDosesPlanned: 2,
        date: new Date("2021-04-10T12:00:00.000Z"),
        facility: "Vacunatorio municipal",
      },
      {
        patientId: patient.id,
        vaccineName: "Influenza",
        doseNumber: 1,
        totalDosesPlanned: 1,
        date: new Date("2024-05-01T12:00:00.000Z"),
        facility: "CESFAM Los Héroes",
      },
    ],
  });

  // Medicación
  await prisma.medicationPlan.createMany({
    data: [
      {
        patientId: patient.id,
        drugName: "Levotiroxina 50 mcg",
        dose: "1 comprimido",
        frequency: "1 vez al día",
        route: "VO",
        startDate: new Date("2018-06-01T12:00:00.000Z"),
        isActive: true,
      } as any,
      {
        patientId: patient.id,
        drugName: "Salbutamol inhalador",
        dose: "2 puff",
        frequency: "Según crisis",
        route: "Inhalado",
        isActive: true,
      } as any,
    ],
  });

  // Consultas médicas + diagnósticos
  const consulta1 = await prisma.consultation.create({
    data: {
      patientId: patient.id,
      date: new Date("2024-02-01T12:00:00.000Z"),
      facilityName: "Clínica Santa María",
      doctorName: "Dra. González",
      specialty: "Medicina interna",
      reason: "Control de asma",
      notes: "Buen control, ajustar dosis de inhalador según síntomas.",
      diagnoses: {
        create: [
          {
            code: "J45",
            description: "Asma",
            isPrimary: true,
            isChronic: true,
          },
        ],
      },
    },
  });

  await prisma.medicationPlan.create({
    data: {
      patientId: patient.id,
      consultationId: consulta1.id,
      drugName: "Budesonida inhalador",
      dose: "2 puff",
      frequency: "2 veces al día",
      route: "Inhalado",
      startDate: new Date("2024-02-01T12:00:00.000Z"),
      isActive: true,
    },
  });

  // Exámenes
  await prisma.exam.createMany({
    data: [
      {
        patientId: patient.id,
        title: "Hemograma completo",
        category: ExamCategory.LAB,
        examDate: new Date("2024-02-15T12:00:00.000Z"),
        reportDate: new Date("2024-02-16T12:00:00.000Z"),
        labName: "Laboratorio Central",
        orderingDoctor: "Dra. González",
        specialty: "Medicina interna",
        source: ExamSource.WEB_UPLOAD,
      } as any,
      {
        patientId: patient.id,
        title: "Perfil lipídico",
        category: ExamCategory.LAB,
        examDate: new Date("2024-02-15T12:00:00.000Z"),
        reportDate: new Date("2024-02-16T12:00:00.000Z"),
        labName: "Laboratorio Central",
        orderingDoctor: "Dra. González",
        specialty: "Medicina interna",
        source: ExamSource.WEB_UPLOAD,
      } as any,
      {
        patientId: patient.id,
        title: "Radiografía de tórax",
        category: ExamCategory.IMAGING,
        examDate: new Date("2023-11-01T12:00:00.000Z"),
        reportDate: new Date("2023-11-01T12:00:00.000Z"),
        labName: "Centro de imágenes XYZ",
        orderingDoctor: "Dr. López",
        specialty: "Neumología",
        source: ExamSource.MANUAL_ENTRY,
      } as any,
    ],
  });

  console.log("Seed completado para el usuario:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
