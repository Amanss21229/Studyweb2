import { 
  users, conversations, questions, solutions,
  type User, type InsertUser,
  type Conversation, type InsertConversation,
  type Question, type InsertQuestion,
  type Solution, type InsertSolution
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: string, language: string, theme: string): Promise<User>;

  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, title: string): Promise<Conversation>;

  // Questions
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestionsByConversation(conversationId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getSubjectCounts(): Promise<Record<string, number>>;

  // Solutions
  getSolution(id: string): Promise<Solution | undefined>;
  getSolutionByShareUrl(shareUrl: string): Promise<Solution | undefined>;
  getSolutionsByQuestion(questionId: string): Promise<Solution[]>;
  createSolution(solution: InsertSolution): Promise<Solution>;
  getPublicSolutions(): Promise<Solution[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPreferences(id: string, language: string, theme: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ language, theme })
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
}

export const storage = new DatabaseStorage();
