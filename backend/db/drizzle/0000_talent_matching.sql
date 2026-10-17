CREATE TYPE "public"."skill_category" AS ENUM('software', 'data_ai', 'cloud_infrastructure', 'security', 'quality_assurance', 'it_support', 'design_product', 'enterprise_platforms', 'other');
--> statement-breakpoint
CREATE TYPE "public"."assessment_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');
--> statement-breakpoint
CREATE TYPE "public"."assessment_version_status" AS ENUM('draft', 'published', 'retired');
--> statement-breakpoint
CREATE TYPE "public"."assessment_question_type" AS ENUM('single_choice', 'multi_select', 'scenario', 'code_reading', 'short_answer');
--> statement-breakpoint
CREATE TYPE "public"."assessment_attempt_status" AS ENUM('in_progress', 'submitted', 'expired');
--> statement-breakpoint
CREATE TABLE "it_roles" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "category" "skill_category" NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_catalog" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "category" "skill_category" NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_skill_requirements" (
  "role_id" integer NOT NULL,
  "skill_id" integer NOT NULL,
  "importance" integer DEFAULT 1 NOT NULL,
  CONSTRAINT "role_skill_requirements_role_id_skill_id_pk" PRIMARY KEY("role_id", "skill_id"),
  CONSTRAINT "role_skill_requirements_importance_nonnegative" CHECK ("importance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "internship_talent_requirements" (
  "internship_id" integer PRIMARY KEY NOT NULL,
  "role_id" integer,
  "required_coursework" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "required_fields_of_study" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_education" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "institution" text NOT NULL,
  "degree" text,
  "field_of_study" text,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "coursework" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_projects" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "url" text,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_experience" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "organization" text NOT NULL,
  "title" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "skills" text[] DEFAULT ARRAY[]::text[] NOT NULL,
  "started_at" timestamp with time zone,
  "ended_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_templates" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "role_id" integer,
  "skill_id" integer NOT NULL,
  "difficulty" "assessment_difficulty" NOT NULL,
  "duration_minutes" integer NOT NULL,
  "active" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "assessment_templates_duration_minutes_in_range" CHECK ("duration_minutes" >= 1 AND "duration_minutes" <= 240)
);
--> statement-breakpoint
CREATE TABLE "assessment_versions" (
  "id" serial PRIMARY KEY NOT NULL,
  "template_id" integer NOT NULL,
  "version" integer NOT NULL,
  "status" "assessment_version_status" DEFAULT 'draft' NOT NULL,
  "configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by_user_id" integer,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "assessment_versions_version_positive" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
  "id" serial PRIMARY KEY NOT NULL,
  "version_id" integer NOT NULL,
  "skill_id" integer NOT NULL,
  "position" integer NOT NULL,
  "type" "assessment_question_type" NOT NULL,
  "difficulty" "assessment_difficulty" NOT NULL,
  "prompt" text NOT NULL,
  "options" jsonb,
  "answer_key" jsonb NOT NULL,
  "rubric" jsonb,
  "max_points" numeric(8, 2) NOT NULL,
  "explanation" text NOT NULL,
  "reviewed_by_user_id" integer,
  "reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "assessment_questions_position_positive" CHECK ("position" > 0),
  CONSTRAINT "assessment_questions_points_positive" CHECK ("max_points" > 0)
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "version_id" integer NOT NULL,
  "status" "assessment_attempt_status" DEFAULT 'in_progress' NOT NULL,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "submitted_at" timestamp with time zone,
  "overall_score" real,
  "result_explanation" text,
  "explanation_model" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "assessment_attempts_expiration_after_start" CHECK ("expires_at" > "started_at"),
  CONSTRAINT "assessment_attempts_score_in_range" CHECK ("overall_score" IS NULL OR ("overall_score" >= 0 AND "overall_score" <= 100))
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
  "id" serial PRIMARY KEY NOT NULL,
  "attempt_id" integer NOT NULL,
  "question_id" integer NOT NULL,
  "answer" jsonb,
  "points_earned" numeric(8, 2),
  "deterministic" boolean DEFAULT true NOT NULL,
  "evaluator_notes" text,
  "answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "assessment_skill_scores" (
  "id" serial PRIMARY KEY NOT NULL,
  "attempt_id" integer NOT NULL,
  "skill_id" integer NOT NULL,
  "score" real NOT NULL,
  "earned_points" numeric(8, 2) NOT NULL,
  "possible_points" numeric(8, 2) NOT NULL,
  CONSTRAINT "assessment_skill_scores_score_in_range" CHECK ("score" >= 0 AND "score" <= 100)
);
--> statement-breakpoint
CREATE TABLE "internship_match_snapshots" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "internship_id" integer NOT NULL,
  "assessment_attempt_id" integer,
  "score" real,
  "coverage" real NOT NULL,
  "weights" jsonb NOT NULL,
  "breakdown" jsonb NOT NULL,
  "explanation" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "internship_match_snapshots_score_in_range" CHECK ("score" IS NULL OR ("score" >= 0 AND "score" <= 100)),
  CONSTRAINT "internship_match_snapshots_coverage_in_range" CHECK ("coverage" >= 0 AND "coverage" <= 100)
);
--> statement-breakpoint
CREATE TABLE "university_analytics_consents" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "university_id" integer NOT NULL,
  "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "company_assessment_consents" (
  "id" serial PRIMARY KEY NOT NULL,
  "student_id" integer NOT NULL,
  "application_id" integer NOT NULL,
  "granted_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "student_data_access_audit" (
  "id" serial PRIMARY KEY NOT NULL,
  "accessor_user_id" integer NOT NULL,
  "student_id" integer NOT NULL,
  "resource" text NOT NULL,
  "resource_id" integer,
  "purpose" text NOT NULL,
  "accessed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role_skill_requirements" ADD CONSTRAINT "role_skill_requirements_role_id_it_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."it_roles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_skill_requirements" ADD CONSTRAINT "role_skill_requirements_skill_id_skill_catalog_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_catalog"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "internship_talent_requirements" ADD CONSTRAINT "internship_talent_requirements_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "internship_talent_requirements" ADD CONSTRAINT "internship_talent_requirements_role_id_it_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."it_roles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_education" ADD CONSTRAINT "student_education_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_projects" ADD CONSTRAINT "student_projects_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_experience" ADD CONSTRAINT "student_experience_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_role_id_it_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."it_roles"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_templates" ADD CONSTRAINT "assessment_templates_skill_id_skill_catalog_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_catalog"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_template_id_assessment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."assessment_templates"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_versions" ADD CONSTRAINT "assessment_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_skill_id_skill_catalog_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_catalog"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_version_id_assessment_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."assessment_versions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_skill_scores" ADD CONSTRAINT "assessment_skill_scores_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assessment_skill_scores" ADD CONSTRAINT "assessment_skill_scores_skill_id_skill_catalog_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_catalog"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "internship_match_snapshots" ADD CONSTRAINT "internship_match_snapshots_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "internship_match_snapshots" ADD CONSTRAINT "internship_match_snapshots_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "internship_match_snapshots" ADD CONSTRAINT "internship_match_snapshots_assessment_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("assessment_attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "university_analytics_consents" ADD CONSTRAINT "university_analytics_consents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "university_analytics_consents" ADD CONSTRAINT "university_analytics_consents_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "company_assessment_consents" ADD CONSTRAINT "company_assessment_consents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "company_assessment_consents" ADD CONSTRAINT "company_assessment_consents_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_data_access_audit" ADD CONSTRAINT "student_data_access_audit_accessor_user_id_users_id_fk" FOREIGN KEY ("accessor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_data_access_audit" ADD CONSTRAINT "student_data_access_audit_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_versions_template_version_uq" ON "assessment_versions" USING btree ("template_id", "version");
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_questions_version_position_uq" ON "assessment_questions" USING btree ("version_id", "position");
--> statement-breakpoint
CREATE INDEX "assessment_questions_version_skill_idx" ON "assessment_questions" USING btree ("version_id", "skill_id");
--> statement-breakpoint
CREATE INDEX "assessment_attempts_student_created_idx" ON "assessment_attempts" USING btree ("student_id", "created_at");
--> statement-breakpoint
CREATE INDEX "assessment_attempts_version_status_idx" ON "assessment_attempts" USING btree ("version_id", "status");
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_attempts_active_student_version_uq" ON "assessment_attempts" USING btree ("student_id", "version_id") WHERE "status" = 'in_progress';
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_answers_attempt_question_uq" ON "assessment_answers" USING btree ("attempt_id", "question_id");
--> statement-breakpoint
CREATE INDEX "assessment_answers_attempt_idx" ON "assessment_answers" USING btree ("attempt_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_skill_scores_attempt_skill_uq" ON "assessment_skill_scores" USING btree ("attempt_id", "skill_id");
--> statement-breakpoint
CREATE INDEX "internship_match_snapshots_student_score_idx" ON "internship_match_snapshots" USING btree ("student_id", "score");
--> statement-breakpoint
CREATE INDEX "internship_match_snapshots_internship_idx" ON "internship_match_snapshots" USING btree ("internship_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "university_analytics_consents_student_university_uq" ON "university_analytics_consents" USING btree ("student_id", "university_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "company_assessment_consents_student_application_uq" ON "company_assessment_consents" USING btree ("student_id", "application_id");
--> statement-breakpoint
CREATE INDEX "student_data_access_audit_student_accessed_idx" ON "student_data_access_audit" USING btree ("student_id", "accessed_at");
--> statement-breakpoint
CREATE INDEX "student_data_access_audit_accessor_accessed_idx" ON "student_data_access_audit" USING btree ("accessor_user_id", "accessed_at");
--> statement-breakpoint
INSERT INTO "skill_catalog" ("slug", "name", "category") VALUES
  ('javascript', 'JavaScript', 'software'),
  ('typescript', 'TypeScript', 'software'),
  ('react', 'React', 'software'),
  ('node-js', 'Node.js', 'software'),
  ('python', 'Python', 'data_ai'),
  ('sql', 'SQL', 'data_ai'),
  ('data-analysis', 'Data Analysis', 'data_ai'),
  ('machine-learning', 'Machine Learning', 'data_ai'),
  ('aws', 'AWS', 'cloud_infrastructure'),
  ('azure', 'Azure', 'cloud_infrastructure'),
  ('docker', 'Docker', 'cloud_infrastructure'),
  ('kubernetes', 'Kubernetes', 'cloud_infrastructure'),
  ('linux', 'Linux', 'cloud_infrastructure'),
  ('networking', 'Networking', 'it_support'),
  ('security-fundamentals', 'Security Fundamentals', 'security'),
  ('penetration-testing', 'Penetration Testing', 'security'),
  ('test-automation', 'Test Automation', 'quality_assurance'),
  ('quality-assurance', 'Quality Assurance', 'quality_assurance'),
  ('ui-ux-design', 'UI/UX Design', 'design_product'),
  ('product-management', 'Product Management', 'design_product'),
  ('salesforce', 'Salesforce', 'enterprise_platforms'),
  ('systems-analysis', 'Systems Analysis', 'enterprise_platforms');
--> statement-breakpoint
INSERT INTO "it_roles" ("slug", "name", "category") VALUES
  ('software-engineer', 'Software Engineer', 'software'),
  ('frontend-developer', 'Frontend Developer', 'software'),
  ('backend-developer', 'Backend Developer', 'software'),
  ('data-analyst', 'Data Analyst', 'data_ai'),
  ('data-scientist', 'Data Scientist', 'data_ai'),
  ('ai-ml-engineer', 'AI/ML Engineer', 'data_ai'),
  ('cloud-engineer', 'Cloud Engineer', 'cloud_infrastructure'),
  ('devops-engineer', 'DevOps Engineer', 'cloud_infrastructure'),
  ('cybersecurity-analyst', 'Cybersecurity Analyst', 'security'),
  ('qa-engineer', 'QA Engineer', 'quality_assurance'),
  ('it-support-specialist', 'IT Support Specialist', 'it_support'),
  ('product-designer', 'Product Designer', 'design_product'),
  ('product-manager', 'Product Manager', 'design_product'),
  ('enterprise-systems-analyst', 'Enterprise Systems Analyst', 'enterprise_platforms');
--> statement-breakpoint
INSERT INTO "role_skill_requirements" ("role_id", "skill_id", "importance")
SELECT roles.id, skills.id, 1
FROM (VALUES
  ('software-engineer', 'javascript'),
  ('software-engineer', 'python'),
  ('frontend-developer', 'javascript'),
  ('frontend-developer', 'typescript'),
  ('frontend-developer', 'react'),
  ('backend-developer', 'node-js'),
  ('backend-developer', 'sql'),
  ('backend-developer', 'python'),
  ('data-analyst', 'sql'),
  ('data-analyst', 'data-analysis'),
  ('data-scientist', 'python'),
  ('data-scientist', 'sql'),
  ('data-scientist', 'machine-learning'),
  ('ai-ml-engineer', 'python'),
  ('ai-ml-engineer', 'machine-learning'),
  ('cloud-engineer', 'aws'),
  ('cloud-engineer', 'azure'),
  ('cloud-engineer', 'linux'),
  ('devops-engineer', 'docker'),
  ('devops-engineer', 'kubernetes'),
  ('devops-engineer', 'linux'),
  ('cybersecurity-analyst', 'security-fundamentals'),
  ('cybersecurity-analyst', 'networking'),
  ('cybersecurity-analyst', 'penetration-testing'),
  ('qa-engineer', 'quality-assurance'),
  ('qa-engineer', 'test-automation'),
  ('it-support-specialist', 'networking'),
  ('it-support-specialist', 'linux'),
  ('product-designer', 'ui-ux-design'),
  ('product-manager', 'product-management'),
  ('enterprise-systems-analyst', 'salesforce'),
  ('enterprise-systems-analyst', 'systems-analysis')
) AS requirements(role_slug, skill_slug)
JOIN "it_roles" AS roles ON roles.slug = requirements.role_slug
JOIN "skill_catalog" AS skills ON skills.slug = requirements.skill_slug;
