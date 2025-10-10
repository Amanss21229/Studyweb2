import { 
  users, conversations, questions, solutions, examUpdates, examCriteria, apiKeys,
  type User, type InsertUser, type UpsertUser, type CompleteProfile,
  type Conversation, type InsertConversation,
  type Question, type InsertQuestion,
  type Solution, type InsertSolution,
  type ExamUpdate, type InsertExamUpdate,
  type ExamCriteria, type InsertExamCriteria,
  type ApiKey, type InsertApiKey
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  completeUserProfile(id: string, profile: CompleteProfile): Promise<User>;
  updateUserPreferences(id: string, language: string, theme: string): Promise<User>;
  updateUserUsage(id: string, minutesUsed: number): Promise<User>;
  resetDailyUsage(id: string): Promise<User>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, title: string): Promise<Conversation>;

  // Questions
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestionsByConversation(conversationId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, updates: { subject?: string; chapter?: string; topic?: string }): Promise<Question>;
  getSubjectCounts(): Promise<Record<string, number>>;

  // Solutions
  getSolution(id: string): Promise<Solution | undefined>;
  getSolutionByShareUrl(shareUrl: string): Promise<Solution | undefined>;
  getSolutionsByQuestion(questionId: string): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
  getPublicSolutions(): Promise<Solution[]>;
  toggleBookmark(solutionId: string): Promise<Solution>;
  getBookmarkedSolutions(userId: string): Promise<Array<Solution & { question: Question; conversation: Conversation }>>;
  
  // Analytics & History
  getUserHistory(userId: string): Promise<Array<Conversation & { questions: Question[]; questionCount: number }>>;
  getUserProgress(userId: string): Promise<{
    totalQuestions: number;
    subjectBreakdown: Record<string, { count: number; topics: string[]; chapters: string[] }>;
    weakAreas: Array<{ subject: string; chapter: string; count: number }>;
    strongAreas: Array<{ subject: string; chapter: string; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
  }>;

  // Exam Updates & Criteria
  getExamUpdates(examType: string): Promise<ExamUpdate[]>;
  getExamCriteria(examType: string): Promise<ExamCriteria | undefined>;
  createExamUpdate(update: InsertExamUpdate): Promise<ExamUpdate>;
  updateExamCriteria(criteria: InsertExamCriteria): Promise<ExamCriteria>;

  // API Keys
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey(key: string): Promise<ApiKey | undefined>;
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKeysByUser(userId: string): Promise<ApiKey[]>;
  deleteApiKey(id: string): Promise<void>;
  updateApiKeyLastUsed(key: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async completeUserProfile(id: string, profile: CompleteProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        name: profile.name,
        gender: profile.gender,
        class: profile.class,
        stream: profile.stream,
        isProfileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPreferences(id: string, language: string, theme: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ language, theme, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserUsage(id: string, minutesUsed: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");

    const now = new Date();
    const lastReset = new Date(user.lastUsageReset);
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      const [updatedUser] = await db
        .update(users)
        .set({
          dailyUsageMinutes: minutesUsed,
          lastUsageReset: now,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        dailyUsageMinutes: user.dailyUsageMinutes + minutesUsed,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async resetDailyUsage(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        dailyUsageMinutes: 0,
        lastUsageReset: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Conversations
  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(insertConversation).returning();
    return conversation;
  }

  async updateConversation(id: string, title: string): Promise<Conversation> {
    const [conversation] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  // Questions
  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question || undefined;
  }

  async getQuestionsByConversation(conversationId: string): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.conversationId, conversationId))
      .orderBy(questions.createdAt);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(insertQuestion).returning();
    return question;
  }

  async updateQuestion(id: string, updates: { subject?: string; chapter?: string; topic?: string }): Promise<Question> {
    const [question] = await db
      .update(questions)
      .set(updates)
      .where(eq(questions.id, id))
      .returning();
    return question;
  }

  async getSubjectCounts(): Promise<Record<string, number>> {
    const allQuestions = await db.select().from(questions);
    const counts: Record<string, number> = {
      physics: 0,
      chemistry: 0,
      math: 0,
      biology: 0,
    };
    
    for (const question of allQuestions) {
      if (question.subject && counts.hasOwnProperty(question.subject)) {
        counts[question.subject]++;
      }
    }
    
    return counts;
  }

  // Solutions
  async getSolution(id: string): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.id, id));
    return solution || undefined;
  }

  async getSolutionByShareUrl(shareUrl: string): Promise<Solution | undefined> {
    const [solution] = await db.select().from(solutions).where(eq(solutions.shareUrl, shareUrl));
    return solution || undefined;
  }

  async getSolutionsByQuestion(questionId: string): Promise<Solution[]> {
    return await db
      .select()
      .from(solutions)
      .where(eq(solutions.questionId, questionId))
      .orderBy(solutions.createdAt);
  }

  async createSolution(insertSolution: InsertSolution): Promise<Solution> {
    const [solution] = await db.insert(solutions).values(insertSolution).returning();
    return solution;
  }

  async getPublicSolutions(): Promise<Solution[]> {
    return await db
      .select()
      .from(solutions)
      .where(eq(solutions.isPublic, true))
      .orderBy(desc(solutions.createdAt))
      .limit(20);
  }

  async toggleBookmark(solutionId: string): Promise<Solution> {
    const solution = await this.getSolution(solutionId);
    if (!solution) throw new Error("Solution not found");
    
    const [updated] = await db
      .update(solutions)
      .set({ isBookmarked: !solution.isBookmarked })
      .where(eq(solutions.id, solutionId))
      .returning();
    return updated;
  }

  async getBookmarkedSolutions(userId: string): Promise<Array<Solution & { question: Question; conversation: Conversation }>> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) return [];
    
    const results: Array<Solution & { question: Question; conversation: Conversation }> = [];
    
    for (const convId of conversationIds) {
      const convQuestions = await this.getQuestionsByConversation(convId);
      const conv = await this.getConversation(convId);
      
      for (const question of convQuestions) {
        const questionSolutions = await db
          .select()
          .from(solutions)
          .where(and(
            eq(solutions.questionId, question.id),
            eq(solutions.isBookmarked, true)
          ));
        
        for (const sol of questionSolutions) {
          results.push({
            ...sol,
            question,
            conversation: conv!
          });
        }
      }
    }
    
    return results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUserHistory(userId: string): Promise<Array<Conversation & { questions: Question[]; questionCount: number }>> {
    const userConversations = await this.getConversationsByUser(userId);
    
    const results = await Promise.all(
      userConversations.map(async (conv) => {
        const convQuestions = await this.getQuestionsByConversation(conv.id);
        return {
          ...conv,
          questions: convQuestions,
          questionCount: convQuestions.length
        };
      })
    );
    
    return results.filter(r => r.questionCount > 0);
  }

  async getUserProgress(userId: string): Promise<{
    totalQuestions: number;
    subjectBreakdown: Record<string, { count: number; topics: string[]; chapters: string[] }>;
    weakAreas: Array<{ subject: string; chapter: string; count: number }>;
    strongAreas: Array<{ subject: string; chapter: string; count: number }>;
    recentActivity: Array<{ date: string; count: number }>;
  }> {
    const userConversations = await this.getConversationsByUser(userId);
    const conversationIds = userConversations.map(c => c.id);
    
    if (conversationIds.length === 0) {
      return {
        totalQuestions: 0,
        subjectBreakdown: {},
        weakAreas: [],
        strongAreas: [],
        recentActivity: []
      };
    }
    
    let allQuestions: Question[] = [];
    for (const convId of conversationIds) {
      const convQuestions = await this.getQuestionsByConversation(convId);
      allQuestions = [...allQuestions, ...convQuestions];
    }
    
    const subjectBreakdown: Record<string, { count: number; topics: string[]; chapters: string[] }> = {};
    const chapterCounts: Record<string, number> = {};
    const activityByDate: Record<string, number> = {};
    
    for (const q of allQuestions) {
      if (q.subject) {
        if (!subjectBreakdown[q.subject]) {
          subjectBreakdown[q.subject] = { count: 0, topics: [], chapters: [] };
        }
        subjectBreakdown[q.subject].count++;
        
        if (q.topic && !subjectBreakdown[q.subject].topics.includes(q.topic)) {
          subjectBreakdown[q.subject].topics.push(q.topic);
        }
        if (q.chapter && !subjectBreakdown[q.subject].chapters.includes(q.chapter)) {
          subjectBreakdown[q.subject].chapters.push(q.chapter);
        }
        
        if (q.chapter) {
          const key = `${q.subject}|${q.chapter}`;
          chapterCounts[key] = (chapterCounts[key] || 0) + 1;
        }
      }
      
      const dateKey = new Date(q.createdAt).toISOString().split('T')[0];
      activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
    }
    
    const sortedChapters = Object.entries(chapterCounts).sort((a, b) => a[1] - b[1]);
    const weakAreas = sortedChapters.slice(0, 5).map(([key, count]) => {
      const [subject, chapter] = key.split('|');
      return { subject, chapter, count };
    });
    
    const strongAreas = sortedChapters.slice(-5).reverse().map(([key, count]) => {
      const [subject, chapter] = key.split('|');
      return { subject, chapter, count };
    });
    
    const recentActivity = Object.entries(activityByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
    
    return {
      totalQuestions: allQuestions.length,
      subjectBreakdown,
      weakAreas,
      strongAreas,
      recentActivity
    };
  }

  // Exam Updates & Criteria
  async getExamUpdates(examType: string): Promise<ExamUpdate[]> {
    const updates = await db
      .select()
      .from(examUpdates)
      .where(eq(examUpdates.examType, examType))
      .orderBy(desc(examUpdates.publishedAt));
    return updates;
  }

  async getExamCriteria(examType: string): Promise<ExamCriteria | undefined> {
    const [criteria] = await db
      .select()
      .from(examCriteria)
      .where(eq(examCriteria.examType, examType))
      .orderBy(desc(examCriteria.lastUpdated))
      .limit(1);
    return criteria || undefined;
  }

  async createExamUpdate(update: InsertExamUpdate): Promise<ExamUpdate> {
    const [newUpdate] = await db
      .insert(examUpdates)
      .values(update)
      .returning();
    return newUpdate;
  }

  async updateExamCriteria(criteriaData: InsertExamCriteria): Promise<ExamCriteria> {
    const existing = await this.getExamCriteria(criteriaData.examType);
    
    if (existing) {
      const [updated] = await db
        .update(examCriteria)
        .set({
          examType: criteriaData.examType,
          pattern: criteriaData.pattern,
          criteria: criteriaData.criteria,
          syllabus: criteriaData.syllabus,
          lastUpdated: new Date(),
        })
        .where(eq(examCriteria.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db
      .insert(examCriteria)
      .values({
        examType: criteriaData.examType,
        pattern: criteriaData.pattern,
        criteria: criteriaData.criteria,
        syllabus: criteriaData.syllabus,
      })
      .returning();
    return created;
  }

  // API Keys
  async createApiKey(apiKeyData: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db
      .insert(apiKeys)
      .values(apiKeyData)
      .returning();
    return apiKey;
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, key), eq(apiKeys.isActive, true)));
    return apiKey || undefined;
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.isActive, true))
      .orderBy(desc(apiKeys.createdAt));
    return keys;
  }

  async getApiKeysByUser(userId: string): Promise<ApiKey[]> {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
    return keys;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(key: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.key, key));
  }
}

export const storage = new DatabaseStorage();
