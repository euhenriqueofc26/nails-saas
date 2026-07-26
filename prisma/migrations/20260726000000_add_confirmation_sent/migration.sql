-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "confirmationSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Appointment" ADD COLUMN "confirmationSentAt" TIMESTAMP(3);
