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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .replace(/^-+|-+$/g, '');
}

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
            isBookmarked: solution.isBookmarked,
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
      
      // Create SEO question page for Google indexing
      const slug = generateSlug(questionText.substring(0, 80));
      const uniqueSlug = `${slug}-${nanoid(6)}`;
      const metaTitle = `${questionText.substring(0, 60)} - NEET/JEE Solution | AIMAI`;
      const metaDescription = `Instant NEET/JEE AI answer by AIMAI. ${aiResponse.answer.substring(0, 100)}... Ask, Save & Share your doubts instantly!`;
      const keywords = `${aiResponse.subject || 'NEET JEE'} question, ${aiResponse.chapter || 'NEET'}, ${aiResponse.topic || 'JEE'}, NEET 2025, JEE 2025, AIMAI`;
      
      await storage.createSeoQuestion({
        slug: uniqueSlug,
        questionId: question.id,
        solutionId: solution.id,
        metaTitle,
        metaDescription,
        keywords,
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

  // Get user's conversation history
  app.get("/api/history", async (req: any, res: Response) => {
    try {
      const allConversations = await storage.getAllConversations();
      
      const results = await Promise.all(
        allConversations.map(async (conv) => {
          const convQuestions = await storage.getQuestionsByConversation(conv.id);
          return {
            ...conv,
            questions: convQuestions,
            questionCount: convQuestions.length
          };
        })
      );
      
      const historyWithQuestions = results.filter(r => r.questionCount > 0);
      res.json(historyWithQuestions);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  });

  // Get bookmarked solutions
  app.get("/api/saved-solutions", async (req: any, res: Response) => {
    try {
      const allConversations = await storage.getAllConversations();
      const results: any[] = [];
      
      for (const conv of allConversations) {
        const convQuestions = await storage.getQuestionsByConversation(conv.id);
        
        for (const question of convQuestions) {
          const questionSolutions = await storage.getSolutionsByQuestion(question.id);
          const bookmarkedSolutions = questionSolutions.filter(s => s.isBookmarked);
          
          for (const sol of bookmarkedSolutions) {
            results.push({
              ...sol,
              question,
              conversation: conv
            });
          }
        }
      }
      
      const sortedResults = results.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      res.json(sortedResults);
    } catch (error) {
      console.error('Get saved solutions error:', error);
      res.status(500).json({ error: 'Failed to get saved solutions' });
    }
  });

  // Get user progress analytics
  app.get("/api/progress", async (req: any, res: Response) => {
    try {
      const allConversations = await storage.getAllConversations();
      
      if (allConversations.length === 0) {
        return res.json({
          totalQuestions: 0,
          subjectBreakdown: {},
          weakAreas: [],
          strongAreas: [],
          recentActivity: []
        });
      }

      const allQuestions: any[] = [];
      for (const conv of allConversations) {
        const questions = await storage.getQuestionsByConversation(conv.id);
        allQuestions.push(...questions);
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
            const key = `${q.subject}-${q.chapter}`;
            chapterCounts[key] = (chapterCounts[key] || 0) + 1;
          }
        }

        const date = new Date(q.createdAt).toISOString().split('T')[0];
        activityByDate[date] = (activityByDate[date] || 0) + 1;
      }

      const sortedChapters = Object.entries(chapterCounts).sort((a, b) => a[1] - b[1]);
      const weakAreas = sortedChapters.slice(0, 5).map(([key, count]) => {
        const [subject, chapter] = key.split('-');
        return { subject, chapter, count };
      });

      const strongAreas = sortedChapters.slice(-5).reverse().map(([key, count]) => {
        const [subject, chapter] = key.split('-');
        return { subject, chapter, count };
      });

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      const recentActivity = last30Days.map(date => ({
        date,
        count: activityByDate[date] || 0
      }));

      res.json({
        totalQuestions: allQuestions.length,
        subjectBreakdown,
        weakAreas,
        strongAreas,
        recentActivity
      });
    } catch (error) {
      console.error('Get progress error:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  });

  // Toggle bookmark on solution
  app.post("/api/solutions/:id/bookmark", async (req: Request, res: Response) => {
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

    // Redact API key for logging (show only last 4 chars)
    const redactedKey = key ? `***${(key as string).slice(-4)}` : 'none';

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
          apiKey: redactedKey,
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
          apiKey: redactedKey,
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
          apiKey: redactedKey,
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
        apiKey: redactedKey,
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
        apiKey: redactedKey,
        responseMessage,
      });

      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while searching' 
      });
    }
  });

  // News Articles Routes
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const { examType } = req.query;
      let articles;
      
      if (examType && (examType === 'neet' || examType === 'jee')) {
        articles = await storage.getNewsArticlesByExamType(examType);
      } else {
        articles = await storage.getPublishedNewsArticles();
      }
      
      res.json(articles);
    } catch (error) {
      console.error('Get news articles error:', error);
      res.status(500).json({ error: 'Failed to get news articles' });
    }
  });

  app.get("/api/news/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const article = await storage.getNewsArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ error: 'News article not found' });
      }
      
      await storage.incrementNewsArticleView(article.id);
      res.json(article);
    } catch (error) {
      console.error('Get news article error:', error);
      res.status(500).json({ error: 'Failed to get news article' });
    }
  });

  app.post("/api/news", async (req: Request, res: Response) => {
    try {
      const article = await storage.createNewsArticle(req.body);
      res.json(article);
    } catch (error) {
      console.error('Create news article error:', error);
      res.status(500).json({ error: 'Failed to create news article' });
    }
  });

  // Blog Posts Routes
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      let posts;
      
      if (category && typeof category === 'string') {
        posts = await storage.getBlogPostsByCategory(category);
      } else {
        posts = await storage.getPublishedBlogPosts();
      }
      
      res.json(posts);
    } catch (error) {
      console.error('Get blog posts error:', error);
      res.status(500).json({ error: 'Failed to get blog posts' });
    }
  });

  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      
      await storage.incrementBlogPostView(post.id);
      res.json(post);
    } catch (error) {
      console.error('Get blog post error:', error);
      res.status(500).json({ error: 'Failed to get blog post' });
    }
  });

  app.post("/api/blog", async (req: Request, res: Response) => {
    try {
      const post = await storage.createBlogPost(req.body);
      res.json(post);
    } catch (error) {
      console.error('Create blog post error:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });

  // SEO Question Routes
  app.get("/api/seo-questions/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const seoQuestion = await storage.getSeoQuestionBySlug(slug);
      
      if (!seoQuestion) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      const question = await storage.getQuestion(seoQuestion.questionId);
      const solution = await storage.getSolution(seoQuestion.solutionId);
      const relatedQuestions = await storage.getRelatedSeoQuestions(seoQuestion.questionId, 5);
      
      await storage.incrementSeoQuestionView(seoQuestion.id);
      
      res.json({
        ...seoQuestion,
        question,
        solution,
        relatedQuestions
      });
    } catch (error) {
      console.error('Get SEO question error:', error);
      res.status(500).json({ error: 'Failed to get question' });
    }
  });

  // Sitemap.xml Route
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const seoQuestions = await storage.getAllSeoQuestions();
      const newsArticles = await storage.getPublishedNewsArticles();
      const blogPosts = await storage.getPublishedBlogPosts();
      
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
      sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Static pages
      const staticPages = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/news', priority: '0.9', changefreq: 'daily' },
        { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
        { loc: '/about-us', priority: '0.7', changefreq: 'monthly' },
        { loc: '/contact-us', priority: '0.7', changefreq: 'monthly' },
        { loc: '/neet-updates', priority: '0.8', changefreq: 'daily' },
        { loc: '/jee-updates', priority: '0.8', changefreq: 'daily' },
      ];
      
      staticPages.forEach(page => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}${page.loc}</loc>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += `  </url>\n`;
      });
      
      // SEO Question pages
      seoQuestions.forEach(sq => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/question/${sq.slug}</loc>\n`;
        sitemap += `    <lastmod>${new Date(sq.updatedAt).toISOString()}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += `  </url>\n`;
      });
      
      // News articles
      newsArticles.forEach(article => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/news/${article.slug}</loc>\n`;
        sitemap += `    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>\n`;
        sitemap += `    <changefreq>daily</changefreq>\n`;
        sitemap += `    <priority>0.9</priority>\n`;
        sitemap += `  </url>\n`;
      });
      
      // Blog posts
      blogPosts.forEach(post => {
        sitemap += `  <url>\n`;
        sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        sitemap += `    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.7</priority>\n`;
        sitemap += `  </url>\n`;
      });
      
      sitemap += '</urlset>';
      
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt Route
  app.get("/robots.txt", (req: Request, res: Response) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);
  return httpServer;
}
