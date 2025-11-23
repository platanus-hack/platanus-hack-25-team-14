/*
  Warnings:

  - You are about to drop the column `rawText` on the `MedicalExam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "medicationPlanId" TEXT;

-- AlterTable
ALTER TABLE "MedicalExam" DROP COLUMN "rawText";

-- CreateIndex
CREATE INDEX "Attachment_medicationPlanId_idx" ON "Attachment"("medicationPlanId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_medicationPlanId_fkey" FOREIGN KEY ("medicationPlanId") REFERENCES "MedicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
