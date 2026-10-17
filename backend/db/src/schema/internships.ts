import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const internshipStatusEnum = pgEnum("internship_status", ["open", "closed", "draft"]);

export const internshipsTable = pgTable("internships", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  type: text("type"),
  duration: text("duration"),
  skills: text("skills").array().notNull().default([]),
  salary: text("salary"),
  status: internshipStatusEnum("status").notNull().default("open"),
  deadline: text("deadline"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInternshipSchema = createInsertSchema(internshipsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Internship = typeof internshipsTable.$inferSelect;
