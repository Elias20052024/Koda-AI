ALTER TYPE "public"."assessment_attempt_status"
ADD VALUE IF NOT EXISTS 'pending_review' AFTER 'in_progress';
--> statement-breakpoint
ALTER TABLE "internship_talent_requirements"
  ADD COLUMN "match_weights" jsonb NOT NULL DEFAULT '{"assessment":0.45,"skills":0.3,"projectsExperience":0.15,"education":0.1}'::jsonb,
  ADD COLUMN "skill_weights" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "minimum_match_score" real,
  ADD COLUMN "minimum_assessment_score" real,
  ADD COLUMN "require_verified_student" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "internship_talent_requirements"
  ADD CONSTRAINT "internship_talent_requirements_match_score_range"
    CHECK ("minimum_match_score" IS NULL OR ("minimum_match_score" >= 0 AND "minimum_match_score" <= 100)),
  ADD CONSTRAINT "internship_talent_requirements_assessment_score_range"
    CHECK ("minimum_assessment_score" IS NULL OR ("minimum_assessment_score" >= 0 AND "minimum_assessment_score" <= 100)),
  ADD CONSTRAINT "internship_talent_requirements_skill_weights_object"
    CHECK (jsonb_typeof("skill_weights") = 'object');
--> statement-breakpoint
ALTER TABLE "assessment_answers"
  ADD COLUMN "evaluated_by_user_id" integer,
  ADD COLUMN "evaluated_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "assessment_answers"
  ADD CONSTRAINT "assessment_answers_evaluated_by_user_id_users_id_fk"
    FOREIGN KEY ("evaluated_by_user_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
