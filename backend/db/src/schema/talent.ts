import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  sql,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { applicationsTable } from "./applications";
import { internshipsTable } from "./internships";
import { studentsTable } from "./students";
import { universitiesTable } from "./universities";
import { usersTable } from "./users";

export const skillCategoryEnum = pgEnum("skill_category", [
  "software",
  "data_ai",
  "cloud_infrastructure",
  "security",
  "quality_assurance",
  "it_support",
  "design_product",
  "enterprise_platforms",
  "other",
]);
export const assessmentDifficultyEnum = pgEnum("assessment_difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const assessmentVersionStatusEnum = pgEnum("assessment_version_status", [
  "draft",
  "published",
  "retired",
]);
export const assessmentQuestionTypeEnum = pgEnum("assessment_question_type", [
  "single_choice",
  "multi_select",
  "scenario",
  "code_reading",
  "short_answer",
]);
export const assessmentAttemptStatusEnum = pgEnum("assessment_attempt_status", [
  "in_progress",
  "submitted",
  "expired",
]);

export const itRolesTable = pgTable("it_roles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: skillCategoryEnum("category").notNull(),
  description: text("description").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skillCatalogTable = pgTable("skill_catalog", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: skillCategoryEnum("category").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roleSkillRequirementsTable = pgTable(
  "role_skill_requirements",
  {
    roleId: integer("role_id").notNull().references(() => itRolesTable.id, { onDelete: "cascade" }),
    skillId: integer("skill_id").notNull().references(() => skillCatalogTable.id, { onDelete: "cascade" }),
    importance: integer("importance").notNull().default(1),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.skillId] }),
    check("role_skill_requirements_importance_nonnegative", sql`${table.importance} >= 0`),
  ],
);

export const internshipTalentRequirementsTable = pgTable("internship_talent_requirements", {
  internshipId: integer("internship_id").primaryKey().references(() => internshipsTable.id, { onDelete: "cascade" }),
  roleId: integer("role_id").references(() => itRolesTable.id, { onDelete: "set null" }),
  requiredCoursework: text("required_coursework").array().notNull().default([]),
  requiredFieldsOfStudy: text("required_fields_of_study").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentEducationTable = pgTable("student_education", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  institution: text("institution").notNull(),
  degree: text("degree"),
  fieldOfStudy: text("field_of_study"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  coursework: text("coursework").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentProjectsTable = pgTable("student_projects", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  url: text("url"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentExperienceTable = pgTable("student_experience", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  skills: text("skills").array().notNull().default([]),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentTemplatesTable = pgTable("assessment_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  roleId: integer("role_id").references(() => itRolesTable.id, { onDelete: "set null" }),
  skillId: integer("skill_id").notNull().references(() => skillCatalogTable.id, { onDelete: "restrict" }),
  difficulty: assessmentDifficultyEnum("difficulty").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check(
    "assessment_templates_duration_minutes_in_range",
    sql`${table.durationMinutes} >= 1 AND ${table.durationMinutes} <= 240`,
  ),
]);

export const assessmentVersionsTable = pgTable(
  "assessment_versions",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id").notNull().references(() => assessmentTemplatesTable.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    status: assessmentVersionStatusEnum("status").notNull().default("draft"),
    configuration: jsonb("configuration").notNull().default({}),
    createdByUserId: integer("created_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_versions_template_version_uq").on(table.templateId, table.version),
    check("assessment_versions_version_positive", sql`${table.version} > 0`),
  ],
);

export const assessmentQuestionsTable = pgTable(
  "assessment_questions",
  {
    id: serial("id").primaryKey(),
    versionId: integer("version_id").notNull().references(() => assessmentVersionsTable.id, { onDelete: "cascade" }),
    skillId: integer("skill_id").notNull().references(() => skillCatalogTable.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    type: assessmentQuestionTypeEnum("type").notNull(),
    difficulty: assessmentDifficultyEnum("difficulty").notNull(),
    prompt: text("prompt").notNull(),
    options: jsonb("options"),
    answerKey: jsonb("answer_key").notNull(),
    rubric: jsonb("rubric"),
    maxPoints: numeric("max_points", { precision: 8, scale: 2 }).notNull(),
    explanation: text("explanation").notNull(),
    reviewedByUserId: integer("reviewed_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_questions_version_position_uq").on(table.versionId, table.position),
    index("assessment_questions_version_skill_idx").on(table.versionId, table.skillId),
    check("assessment_questions_position_positive", sql`${table.position} > 0`),
    check("assessment_questions_points_positive", sql`${table.maxPoints} > 0`),
  ],
);

export const assessmentAttemptsTable = pgTable(
  "assessment_attempts",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    versionId: integer("version_id").notNull().references(() => assessmentVersionsTable.id, { onDelete: "restrict" }),
    status: assessmentAttemptStatusEnum("status").notNull().default("in_progress"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    overallScore: real("overall_score"),
    resultExplanation: text("result_explanation"),
    explanationModel: text("explanation_model"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("assessment_attempts_student_created_idx").on(table.studentId, table.createdAt),
    index("assessment_attempts_version_status_idx").on(table.versionId, table.status),
    uniqueIndex("assessment_attempts_active_student_version_uq")
      .on(table.studentId, table.versionId)
      .where(sql`${table.status} = 'in_progress'`),
    check("assessment_attempts_expiration_after_start", sql`${table.expiresAt} > ${table.startedAt}`),
    check(
      "assessment_attempts_score_in_range",
      sql`${table.overallScore} IS NULL OR (${table.overallScore} >= 0 AND ${table.overallScore} <= 100)`,
    ),
  ],
);

export const assessmentAnswersTable = pgTable(
  "assessment_answers",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id").notNull().references(() => assessmentAttemptsTable.id, { onDelete: "cascade" }),
    questionId: integer("question_id").notNull().references(() => assessmentQuestionsTable.id, { onDelete: "restrict" }),
    answer: jsonb("answer"),
    pointsEarned: numeric("points_earned", { precision: 8, scale: 2 }),
    deterministic: boolean("deterministic").notNull().default(true),
    evaluatorNotes: text("evaluator_notes"),
    answeredAt: timestamp("answered_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("assessment_answers_attempt_question_uq").on(table.attemptId, table.questionId),
    index("assessment_answers_attempt_idx").on(table.attemptId),
  ],
);

export const assessmentSkillScoresTable = pgTable(
  "assessment_skill_scores",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id").notNull().references(() => assessmentAttemptsTable.id, { onDelete: "cascade" }),
    skillId: integer("skill_id").notNull().references(() => skillCatalogTable.id, { onDelete: "restrict" }),
    score: real("score").notNull(),
    earnedPoints: numeric("earned_points", { precision: 8, scale: 2 }).notNull(),
    possiblePoints: numeric("possible_points", { precision: 8, scale: 2 }).notNull(),
  },
  (table) => [
    uniqueIndex("assessment_skill_scores_attempt_skill_uq").on(table.attemptId, table.skillId),
    check("assessment_skill_scores_score_in_range", sql`${table.score} >= 0 AND ${table.score} <= 100`),
  ],
);

export const internshipMatchSnapshotsTable = pgTable(
  "internship_match_snapshots",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    internshipId: integer("internship_id").notNull().references(() => internshipsTable.id, { onDelete: "cascade" }),
    assessmentAttemptId: integer("assessment_attempt_id").references(() => assessmentAttemptsTable.id, { onDelete: "set null" }),
    score: real("score"),
    coverage: real("coverage").notNull(),
    weights: jsonb("weights").notNull(),
    breakdown: jsonb("breakdown").notNull(),
    explanation: text("explanation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("internship_match_snapshots_student_score_idx").on(table.studentId, table.score),
    index("internship_match_snapshots_internship_idx").on(table.internshipId),
    check(
      "internship_match_snapshots_score_in_range",
      sql`${table.score} IS NULL OR (${table.score} >= 0 AND ${table.score} <= 100)`,
    ),
    check(
      "internship_match_snapshots_coverage_in_range",
      sql`${table.coverage} >= 0 AND ${table.coverage} <= 100`,
    ),
  ],
);

export const universityAnalyticsConsentsTable = pgTable(
  "university_analytics_consents",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    universityId: integer("university_id").notNull().references(() => universitiesTable.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("university_analytics_consents_student_university_uq").on(table.studentId, table.universityId)],
);

export const companyAssessmentConsentsTable = pgTable(
  "company_assessment_consents",
  {
    id: serial("id").primaryKey(),
    studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    applicationId: integer("application_id").notNull().references(() => applicationsTable.id, { onDelete: "cascade" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("company_assessment_consents_student_application_uq").on(table.studentId, table.applicationId)],
);

export const studentDataAccessAuditTable = pgTable(
  "student_data_access_audit",
  {
    id: serial("id").primaryKey(),
    accessorUserId: integer("accessor_user_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
    studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
    resource: text("resource").notNull(),
    resourceId: integer("resource_id"),
    purpose: text("purpose").notNull(),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("student_data_access_audit_student_accessed_idx").on(table.studentId, table.accessedAt),
    index("student_data_access_audit_accessor_accessed_idx").on(table.accessorUserId, table.accessedAt),
  ],
);
