import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const universitiesTable = pgTable("universities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  universityName: text("university_name"),
  country: text("country"),
  website: text("website"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUniversitySchema = createInsertSchema(universitiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type University = typeof universitiesTable.$inferSelect;
