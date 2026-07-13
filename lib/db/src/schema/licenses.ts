import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const licenseDuration = z.enum(["1month", "lifetime"]);
export type LicenseDuration = z.infer<typeof licenseDuration>;

export const licenseStatus = z.enum(["unused", "active", "revoked"]);
export type LicenseStatus = z.infer<typeof licenseStatus>;

export const licensesTable = pgTable("licenses", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  duration: text("duration", { enum: ["1month", "lifetime"] }).notNull(),
  status: text("status", { enum: ["unused", "active", "revoked"] })
    .notNull()
    .default("unused"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  deviceFingerprint: text("device_fingerprint"),
  createdBy: text("created_by"),
});

export type InsertLicense = {
  key: string;
  duration: "1month" | "lifetime";
  status?: "unused" | "active" | "revoked";
  createdBy?: string | null;
};

export type License = typeof licensesTable.$inferSelect;
