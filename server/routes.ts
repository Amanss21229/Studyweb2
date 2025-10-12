import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { generateSolution, generateConversationTitle } from "./services/openai";
import { extractTextFromImage } from "./services/ocr";
import { generateApiKey, hashApiKey, validateApiKey } from "./apiKeyAuth";
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
  
  // Create or get conversation
  app.post("/api/conversations", async (req: any, res: Response) => {
    try {
      const { title } = req.body;
      
      const conversation = await storage.createConversation({
        userId: null,
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

  // Submit question (text) - Available to all users
  app.post("/api/questions/text", async (req: any, res: Response) => {
    try {
      const { conversationId, questionText, language = 'english' } = req.body;
      
      if (!questionText?.trim()) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      // Extract name from conversation if user introduces themselves
      let userName: string | undefined;
      const nameMatch = questionText.match(/(?:my name is|i am|i'm|mera naam|main)\s+([A-Za-z]+)/i);
      if (nameMatch && nameMatch[1]) {
        userName = nameMatch[1];
      }
      
      // Create question
      const question = await storage.createQuestion({
        conversationId,
        questionText: questionText.trim(),
        inputType: 'text',
      });
      
      // Generate AI solution with user context
      const aiResponse = await generateSolution(questionText, language, { userName });
      
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

  // Submit question (image) - Available to all users
  app.post("/api/questions/image", upload.single('image'), async (req: any, res: Response) => {
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
      
      // Create question
      const question = await storage.createQuestion({
        conversationId,
        questionText: extractedText.trim(),
        inputType: 'image',
        imageUrl: '', // In production, save to cloud storage
      });
      
      // Generate AI solution
      const aiResponse = await generateSolution(extractedText, language);
      
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

  // API endpoint for external integrations (Telegram bot) - Requires API Key
  app.post("/api/solution", validateApiKey, async (req: Request, res: Response) => {
    try {
      const { question, language = 'english', userName } = req.body;
      
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
      
      // Generate AI solution with optional user name
      const aiResponse = await generateSolution(question, language, userName ? { userName } : undefined);
      
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
        success: true,
        solutionUrl: `${req.protocol}://${req.get('host')}/solution/${shareUrl}`,
        solution: {
          answer: aiResponse.answer,
          subject: aiResponse.subject,
          chapter: aiResponse.chapter,
          topic: aiResponse.topic,
          neetJeePyq: aiResponse.neetJeePyq,
        }
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

  // Get user's conversation history - Disabled (no authentication)
  app.get("/api/history", async (req: any, res: Response) => {
    try {
      res.json([]);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  });

  // Get bookmarked solutions - Disabled (no authentication)
  app.get("/api/saved-solutions", async (req: any, res: Response) => {
    try {
      res.json([]);
    } catch (error) {
      console.error('Get saved solutions error:', error);
      res.status(500).json({ error: 'Failed to get saved solutions' });
    }
  });

  // Get user progress analytics - Disabled (no authentication)
  app.get("/api/progress", async (req: any, res: Response) => {
    try {
      res.json({
        totalQuestions: 0,
        subjectBreakdown: {},
        recentActivity: []
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  });

  // Toggle bookmark on solution - Disabled (no authentication)
  app.post("/api/solutions/:id/bookmark", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      res.json({ message: 'Bookmark feature disabled without authentication' });
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

  // API Keys Management - Available to everyone
  app.get("/api/keys", async (req: Request, res: Response) => {
    try {
      const keys = await storage.getAllApiKeys();
      res.json(keys);
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ error: 'Failed to get API keys' });
    }
  });

  app.post("/api/keys", async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Key name is required' });
      }
      
      const apiKey = generateApiKey();
      const hashedKey = hashApiKey(apiKey);
      
      const newKey = await storage.createApiKey({
        name: name.trim(),
        key: hashedKey,
      });
      
      res.json({ ...newKey, key: apiKey });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ error: 'Failed to create API key' });
    }
  });

  app.delete("/api/keys/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteApiKey(id);
      res.json({ message: 'API key revoked successfully' });
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  // Get current user info
  app.get("/api/auth/user", async (req: any, res: Response) => {
    try {
      if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return res.json(req.user);
      }
      res.status(401).json({ message: 'Not authenticated' });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  });

  // Search API for Telegram bot - GET endpoint with query parameter
  app.get("/api/search", async (req: Request, res: Response) => {
    const startTime = Date.now();
    const { query, key } = req.query;
    let matchedQuestionId: string | null = null;
    let success = false;
    let responseMessage = '';

    try {
      // Validate API key (check environment variable or database)
      const expectedApiKey = process.env.API_KEY || 'AIMAI123';
      
      if (!key || key !== expectedApiKey) {
        responseMessage = 'Invalid API key';
        await storage.createApiLog({
          query: (query as string) || '',
          matchedQuestionId: null,
          success: false,
          source: 'telegram',
          apiKey: key as string,
          responseMessage,
        });
        return res.json({ 
          success: false, 
          message: responseMessage 
        });
      }

      // Check if query is empty
      if (!query || (query as string).trim() === '') {
        responseMessage = 'Empty query';
        await storage.createApiLog({
          query: '',
          matchedQuestionId: null,
          success: false,
          source: 'telegram',
          apiKey: key as string,
          responseMessage,
        });
        return res.json({ 
          success: false, 
          message: responseMessage 
        });
      }

      // Search for similar questions using fuzzy matching
      const matches = await storage.searchQuestionsByText(query as string, 0.3);
      
      if (matches.length === 0) {
        responseMessage = 'No solution found';
        await storage.createApiLog({
          query: query as string,
          matchedQuestionId: null,
          success: false,
          source: 'telegram',
          apiKey: key as string,
          responseMessage,
        });
        return res.json({ 
          success: false, 
          message: responseMessage 
        });
      }

      // Get the best match (first one, as they're sorted by similarity)
      const bestMatch = matches[0];
      matchedQuestionId = bestMatch.id;
      success = true;
      responseMessage = 'Match found';

      // Log the successful API request
      await storage.createApiLog({
        query: query as string,
        matchedQuestionId,
        success: true,
        source: 'telegram',
        apiKey: key as string,
        responseMessage,
      });

      // Return success response with solution link
      const solutionLink = `${req.protocol}://${req.get('host')}/solution/${bestMatch.solution.shareUrl}`;
      
      res.json({
        success: true,
        question: bestMatch.questionText,
        solution_link: solutionLink,
        similarity: Math.round(bestMatch.similarity * 100) / 100
      });

    } catch (error) {
      console.error('Search API error:', error);
      responseMessage = 'Internal server error';
      
      await storage.createApiLog({
        query: (query as string) || '',
        matchedQuestionId: null,
        success: false,
        source: 'telegram',
        apiKey: key as string,
        responseMessage,
      });

      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
