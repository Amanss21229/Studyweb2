import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, index, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  name: text("name"),
  gender: varchar("gender", { length: 10 }),
  class: varchar("class", { length: 20 }),
  stream: varchar("stream", { length: 50 }),
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),
  language: varchar("language", { length: 10 }).notNull().default('english'),
  theme: varchar("theme", { length: 10 }).notNull().default('light'),
  dailyUsageMinutes: integer("daily_usage_minutes").notNull().default(0),
  lastUsageReset: timestamp("last_usage_reset").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  questionText: text("question_text").notNull(),
  inputType: varchar("input_type", { length: 10 }).notNull(), // 'text', 'image', 'audio'
  subject: varchar("subject", { length: 100 }), // 'physics', 'chemistry', 'math', 'biology'
  chapter: text("chapter"),
  topic: text("topic"),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const solutions = pgTable("solutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").references(() => questions.id).notNull(),
  solutionText: text("solution_text").notNull(),
  explanation: text("explanation"),
  subject: varchar("subject", { length: 100 }).notNull(),
  chapter: text("chapter"),
  topic: text("topic"),
  neetJeePyq: jsonb("neet_jee_pyq").$type<{
    neet?: string[];
    jee?: string[];
  }>(),
  language: varchar("language", { length: 10 }).notNull(),
  shareUrl: text("share_url").notNull().unique(),
  isPublic: boolean("is_public").notNull().default(false),
  isBookmarked: boolean("is_bookmarked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examUpdates = pgTable("exam_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examType: varchar("exam_type", { length: 10 }).notNull(), // 'neet' or 'jee'
  title: text("title").notNull(),
  description: text("description").notNull(),
  sourceUrl: text("source_url"),
  isVerified: boolean("is_verified").notNull().default(true),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examCriteria = pgTable("exam_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examType: varchar("exam_type", { length: 10 }).notNull(), // 'neet' or 'jee'
  pattern: text("pattern").notNull(),
  criteria: text("criteria").notNull(),
  syllabus: jsonb("syllabus").$type<{
    subjects: Array<{
      name: string;
      topics: string[];
    }>;
  }>().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  apiKeys: many(apiKeys),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [questions.conversationId],
    references: [conversations.id],
  }),
  solutions: many(solutions),
}));

export const solutionsRelations = relations(solutions, ({ one }) => ({
  question: one(questions, {
    fields: [solutions.questionId],
    references: [questions.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const completeProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"]),
  class: z.string().min(1, "Class is required"),
  stream: z.string().min(1, "Stream is required"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertSolutionSchema = createInsertSchema(solutions).omit({
  id: true,
  createdAt: true,
});

export const insertExamUpdateSchema = createInsertSchema(examUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertExamCriteriaSchema = createInsertSchema(examCriteria).omit({
  id: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type CompleteProfile = z.infer<typeof completeProfileSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Solution = typeof solutions.$inferSelect;
export type InsertSolution = z.infer<typeof insertSolutionSchema>;

export type ExamUpdate = typeof examUpdates.$inferSelect;
export type InsertExamUpdate = z.infer<typeof insertExamUpdateSchema>;

export type ExamCriteria = typeof examCriteria.$inferSelect;
export type InsertExamCriteria = z.infer<typeof insertExamCriteriaSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
