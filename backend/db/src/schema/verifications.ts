import { pgTable, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { universitiesTable } from "./universities";

export const verificationStatusEnum = pgEnum("verification_status", ["pending", "approved", "rejected"]);

export const verificationRequestsTable = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  universityId: integer("university_id").notNull().references(() => universitiesTable.id, { onDelete: "cascade" }),
  status: verificationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequestsTable.$inferSelect;
