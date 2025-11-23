import { builder, prisma } from "@medical-platform/core";

// Basic User type exposing 1:1 relation with Patient
builder.prismaObject("User", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: (t: any) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
    image: t.exposeString("image", { nullable: true }),
    patient: t.relation("patient", { nullable: true }),
  }),
});

// Mutation to create or update the basic Patient profile for a given user.
// En un futuro, el userId debería venir del contexto de autenticación,
// no como argumento directo.
builder.mutationField("upsertPatientProfile", (t) =>
  t.prismaField({
    type: "Patient",
    args: {
      userId: t.arg.string({ required: true }),
      fullName: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: false }),
      email: t.arg.string({ required: false }),
      phone: t.arg.string({ required: false }),
      sex: t.arg.string({ required: false }),
      dateOfBirth: t.arg({ type: "DateTime", required: false }),
      bloodType: t.arg.string({ required: false }),
      emergencyNotes: t.arg.string({ required: false }),
      emergencyContactName: t.arg.string({ required: false }),
      emergencyContactPhone: t.arg.string({ required: false }),
      heightCm: t.arg({ type: "Float", required: false }),
      weightKg: t.arg({ type: "Float", required: false }),
    },
    resolve: async (query, _root, args) => {
      const user = await prisma.user.findUnique({
        where: { id: args.userId },
      });
      if (!user) {
        throw new Error("User not found");
      }

      const existingPatient = await prisma.patient.findUnique({
        where: { userId: args.userId },
      });

      const data = {
        fullName: args.fullName,
        documentId: args.documentId ?? null,
        email: args.email ?? null,
        phone: args.phone ?? null,
        // Casteamos los enums como string; Prisma validará el valor
        // en base al enum Sex / BloodType
        sex: (args.sex as any) ?? null,
        dateOfBirth: (args.dateOfBirth as Date | null) ?? null,
        bloodType: (args.bloodType as any) ?? undefined,
        emergencyNotes: args.emergencyNotes ?? null,
        emergencyContactName: args.emergencyContactName ?? null,
        emergencyContactPhone: args.emergencyContactPhone ?? null,
        userId: args.userId,
      };

      const patient = existingPatient
        ? await prisma.patient.update({
            ...query,
            where: { id: existingPatient.id },
            data,
          })
        : await prisma.patient.create({
            ...query,
            data,
          });

      // Si el usuario ingresó estatura y/o peso, creamos un registro antropométrico
      const heightCm = args.heightCm as number | null | undefined;
      const weightKg = args.weightKg as number | null | undefined;

      if (heightCm != null || weightKg != null) {
        const h = typeof heightCm === "number" ? heightCm : null;
        const w = typeof weightKg === "number" ? weightKg : null;

        let bmi: number | null = null;
        if (h && w) {
          const m = h / 100;
          if (m > 0) {
            bmi = w / (m * m);
          }
        }

        await prisma.anthropometricRecord.create({
          data: {
            patientId: patient.id,
            heightCm: h,
            weightKg: w,
            bmi,
          },
        });
      }

      return patient;
    },
  })
);
