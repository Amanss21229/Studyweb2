import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { generateSolution, generateConversationTitle } from "./services/openai";
import { extractTextFromImage } from "./services/ocr";
import { 
  insertQuestionSchema, 
  insertSolutionSchema, 
  insertConversationSchema 
} from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create or get conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { userId, title } = req.body;
      
      const conversation = await storage.createConversation({
        userId: userId || null,
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

  // Submit question (text)
  app.post("/api/questions/text", async (req: Request, res: Response) => {
    try {
      const { conversationId, questionText, language = 'english' } = req.body;
      
      if (!questionText?.trim()) {
        return res.status(400).json({ error: 'Question text is required' });
      }
      
      // Create question
      const question = await storage.createQuestion({
        conversationId,
        questionText: questionText.trim(),
        inputType: 'text',
      });
      
      // Generate AI solution
      const aiResponse = await generateSolution(questionText, language);
      
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

  // Submit question (image)
  app.post("/api/questions/image", upload.single('image'), async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
