import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { generateSolution, generateConversationTitle } from "./services/openai";
import { extractTextFromImage } from "./services/ocr";
import { setupAuth, isAuthenticated, checkFreeUserLimit, requireAuthForPremiumFeatures } from "./replitAuth";
import { 
  insertQuestionSchema, 
  insertSolutionSchema, 
  insertConversationSchema,
  completeProfileSchema
} from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = completeProfileSchema.parse(req.body);
      
      const user = await storage.completeUserProfile(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error completing profile:", error);
      res.status(500).json({ message: "Failed to complete profile" });
    }
  });

  // Get usage stats for free users
  app.get('/api/auth/usage-stats', async (req: any, res) => {
    if (req.isAuthenticated()) {
      return res.json({ 
        isAuthenticated: true,
        unlimited: true 
      });
    }

    const usageMinutes = req.session?.totalUsageMinutes || 0;
    const remainingMinutes = Math.max(0, 120 - usageMinutes);

    res.json({
      isAuthenticated: false,
      usedMinutes: usageMinutes,
      remainingMinutes,
      totalMinutes: 120,
      limitExceeded: remainingMinutes === 0
    });
  });
  
  // Create or get conversation
  app.post("/api/conversations", async (req: any, res: Response) => {
    try {
      const { title } = req.body;
      
      // Use authenticated user ID if logged in, otherwise null for guest
      const userId = req.isAuthenticated() ? req.user.claims.sub : null;
      
      const conversation = await storage.createConversation({
        userId,
        title: title || null,
      });
      
      res.json(conversation);
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });

  // Get conversation history
  app.get("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const questions = await storage.getQuestionsByConversation(id);
      const messages = [];
      
      for (const question of questions) {
        messages.push({
          id: question.id,
          type: 'question',
          text: question.questionText,
          inputType: question.inputType,
          imageUrl: question.imageUrl,
          audioUrl: question.audioUrl,
          createdAt: question.createdAt,
        });
        
        const solutions = await storage.getSolutionsByQuestion(question.id);
        for (const solution of solutions) {
          messages.push({
            id: solution.id,
            type: 'solution',
            text: solution.solutionText,
            explanation: solution.explanation,
            subject: solution.subject,
            chapter: solution.chapter,
            topic: solution.topic,
            neetJeePyq: solution.neetJeePyq,
            shareUrl: solution.shareUrl,
            createdAt: solution.createdAt,
          });
        }
      }
      
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get conversation messages' });
    }
  });

  // Submit question (text) - Available to all, with time tracking for free users
  app.post("/api/questions/text", checkFreeUserLimit, async (req: any, res: Response) => {
    try {
      const { conversationId, questionText, language = 'english' } = req.body;
      
      if (!questionText?.trim()) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      // Track usage for free users (add 1 minute per question)
      if (!req.isAuthenticated() && req.session) {
        req.session.totalUsageMinutes = (req.session.totalUsageMinutes || 0) + 1;
      }
      
      // Get user name for personalized conversation
      let userName: string | undefined;
      if (req.isAuthenticated()) {
        const user = await storage.getUser(req.user.claims.sub);
        userName = user?.name || user?.firstName || undefined;
      } else if (req.session?.userName) {
        userName = req.session.userName;
      }
      
      // Extract name from conversation if user introduces themselves
      const nameMatch = questionText.match(/(?:my name is|i am|i'm|mera naam|main)\s+([A-Za-z]+)/i);
      if (nameMatch && nameMatch[1]) {
        userName = nameMatch[1];
        if (req.session) {
          req.session.userName = userName;
        }
      }
      
      // Create question
      const question = await storage.createQuestion({
        conversationId,
        questionText: questionText.trim(),
        inputType: 'text',
      });
      
      // Generate AI solution with user context
      const aiResponse = await generateSolution(questionText, language, userName);
      
      // Create solution with unique share URL
      const shareUrl = `${nanoid(12)}`;
      const solution = await storage.createSolution({
        questionId: question.id,
        solutionText: aiResponse.answer,
        explanation: aiResponse.answer,
        subject: aiResponse.subject,
        chapter: aiResponse.chapter,
        topic: aiResponse.topic,
        neetJeePyq: aiResponse.neetJeePyq,
        language,
        shareUrl,
        isPublic: true,
      });
      
      // Update question with subject/chapter/topic
      await storage.updateQuestion(question.id, {
        subject: aiResponse.subject,
        chapter: aiResponse.chapter,
        topic: aiResponse.topic,
      });
      
      // Generate conversation title if it's the first question
      const conversation = await storage.getConversation(conversationId);
      if (!conversation?.title) {
        const title = await generateConversationTitle(questionText);
        await storage.updateConversation(conversationId, title);
      }
      
      res.json({
        question,
        solution: {
          ...solution,
          shareUrl: `${req.protocol}://${req.get('host')}/solution/${shareUrl}`
        }
      });
    } catch (error) {
      console.error('Submit text question error:', error);
      res.status(500).json({ error: 'Failed to process question' });
    }
  });

  // Submit question (image) - Requires login
  app.post("/api/questions/image", requireAuthForPremiumFeatures, upload.single('image'), async (req: any, res: Response) => {
    try {
      const { conversationId, language = 'english' } = req.body;
      
      if (!req.file || !('buffer' in req.file)) {
        return res.status(400).json({ error: 'Image file is required' });
      }
      
      // Extract text from image using OCR
      const extractedText = await extractTextFromImage(req.file.buffer);
      
      if (!extractedText.trim()) {
        return res.status(400).json({ error: 'No text could be extracted from the image' });
      }
      
      // Get user name for personalized conversation
      let userName: string | undefined;
      if (req.isAuthenticated()) {
        const user = await storage.getUser(req.user.claims.sub);
        userName = user?.name || user?.firstName || undefined;
      }
      
      // Create question
      const question = await storage.createQuestion({
        conversationId,
        questionText: extractedText.trim(),
        inputType: 'image',
        imageUrl: '', // In production, save to cloud storage
      });
      
      // Generate AI solution with user context
      const aiResponse = await generateSolution(extractedText, language, userName);
      
      // Create solution
      const shareUrl = `${nanoid(12)}`;
      const solution = await storage.createSolution({
        questionId: question.id,
        solutionText: aiResponse.answer,
        explanation: aiResponse.answer,
        subject: aiResponse.subject,
        chapter: aiResponse.chapter,
        topic: aiResponse.topic,
        neetJeePyq: aiResponse.neetJeePyq,
        language,
        shareUrl,
        isPublic: true,
      });
      
      res.json({
        question,
        solution: {
          ...solution,
          shareUrl: `${req.protocol}://${req.get('host')}/solution/${shareUrl}`
        },
        extractedText
      });
    } catch (error) {
      console.error('Submit image question error:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  // Get solution by share URL
  app.get("/api/solutions/:shareUrl", async (req: Request, res: Response) => {
    try {
      const { shareUrl } = req.params;
      
      const solution = await storage.getSolutionByShareUrl(shareUrl);
      if (!solution) {
        return res.status(404).json({ error: 'Solution not found' });
      }
      
      const question = await storage.getQuestion(solution.questionId);
      
      res.json({
        solution,
        question
      });
    } catch (error) {
      console.error('Get solution error:', error);
      res.status(500).json({ error: 'Failed to get solution' });
    }
  });

  // API endpoint for external integrations (Telegram bot)
  app.post("/api/solution", async (req: Request, res: Response) => {
    try {
      const { question, language = 'english' } = req.body;
      
      if (!question?.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }
      
      // Create a temporary conversation
      const conversation = await storage.createConversation({
        userId: null,
        title: null,
      });
      
      // Create question
      const questionRecord = await storage.createQuestion({
        conversationId: conversation.id,
        questionText: question.trim(),
        inputType: 'text',
      });
      
      // Generate AI solution
      const aiResponse = await generateSolution(question, language);
      
      // Create solution
      const shareUrl = `${nanoid(12)}`;
      const solution = await storage.createSolution({
        questionId: questionRecord.id,
        solutionText: aiResponse.answer,
        explanation: aiResponse.answer,
        subject: aiResponse.subject,
        chapter: aiResponse.chapter,
        topic: aiResponse.topic,
        neetJeePyq: aiResponse.neetJeePyq,
        language,
        shareUrl,
        isPublic: true,
      });
      
      res.json({
        solutionUrl: `${req.protocol}://${req.get('host')}/solution/${shareUrl}`,
        solution: aiResponse
      });
    } catch (error) {
      console.error('External solution API error:', error);
      res.status(500).json({ error: 'Failed to generate solution' });
    }
  });

  // Update user preferences
  app.patch("/api/users/:id/preferences", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { language, theme } = req.body;
      
      const user = await storage.updateUserPreferences(id, language, theme);
      res.json(user);
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  });

  // Get subject counts
  app.get("/api/stats/subject-counts", async (req: Request, res: Response) => {
    try {
      const counts = await storage.getSubjectCounts();
      res.json(counts);
    } catch (error) {
      console.error('Get subject counts error:', error);
      res.status(500).json({ error: 'Failed to get subject counts' });
    }
  });

  // Get user's conversation history
  app.get("/api/history", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserHistory(userId);
      res.json(history);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  });

  // Get bookmarked solutions
  app.get("/api/saved-solutions", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const bookmarked = await storage.getBookmarkedSolutions(userId);
      res.json(bookmarked);
    } catch (error) {
      console.error('Get saved solutions error:', error);
      res.status(500).json({ error: 'Failed to get saved solutions' });
    }
  });

  // Get user progress analytics
  app.get("/api/progress", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  });

  // Toggle bookmark on solution
  app.post("/api/solutions/:id/bookmark", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const solution = await storage.toggleBookmark(id);
      res.json(solution);
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
  });

  // Get exam updates by type (neet or jee)
  app.get("/api/exam-updates/:examType", async (req: Request, res: Response) => {
    try {
      const { examType } = req.params;
      if (examType !== 'neet' && examType !== 'jee') {
        return res.status(400).json({ error: 'Invalid exam type' });
      }
      const updates = await storage.getExamUpdates(examType);
      res.json(updates);
    } catch (error) {
      console.error('Get exam updates error:', error);
      res.status(500).json({ error: 'Failed to get exam updates' });
    }
  });

  // Get exam criteria by type (neet or jee)
  app.get("/api/exam-criteria/:examType", async (req: Request, res: Response) => {
    try {
      const { examType } = req.params;
      if (examType !== 'neet' && examType !== 'jee') {
        return res.status(400).json({ error: 'Invalid exam type' });
      }
      const criteria = await storage.getExamCriteria(examType);
      res.json(criteria);
    } catch (error) {
      console.error('Get exam criteria error:', error);
      res.status(500).json({ error: 'Failed to get exam criteria' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
