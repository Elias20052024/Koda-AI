DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "applications"
    GROUP BY "student_id", "internship_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add applications_student_internship_uq: duplicate student/internship applications exist.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "company_assessment_consents" AS consents
    INNER JOIN "applications" AS applications
      ON applications."id" = consents."application_id"
    WHERE consents."student_id" <> applications."student_id"
  ) THEN
    RAISE EXCEPTION 'Cannot add company_assessment_consents_application_student_fk: consent student does not match its application.';
  END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX "applications_student_internship_uq"
  ON "applications" USING btree ("student_id", "internship_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "applications_id_student_uq"
  ON "applications" USING btree ("id", "student_id");
--> statement-breakpoint
ALTER TABLE "company_assessment_consents"
  ADD CONSTRAINT "company_assessment_consents_application_student_fk"
  FOREIGN KEY ("application_id", "student_id")
  REFERENCES "public"."applications"("id", "student_id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;
