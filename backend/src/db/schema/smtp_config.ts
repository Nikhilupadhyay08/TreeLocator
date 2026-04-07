import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const smtpConfigTable = pgTable("smtp_config", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  provider: text("provider").notNull(), // e.g., "gmail", "outlook", "custom"
  host: text("host").notNull(),
  port: integer("port").notNull(),
  secure: boolean("secure").notNull().default(true), // TLS/SSL
  username: text("username").notNull(),
  password: text("password").notNull(), // Should be encrypted in production
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name"),
  isActive: boolean("is_active").notNull().default(false),
  testEmail: text("test_email"), // Email address for testing
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SmtpConfig = typeof smtpConfigTable.$inferSelect;
export type SmtpConfigInsert = typeof smtpConfigTable.$inferInsert;
