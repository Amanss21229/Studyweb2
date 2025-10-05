import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import crypto from "crypto";

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key is required',
      message: 'Please provide an API key in the X-API-Key header' 
    });
  }

  try {
    const key = await storage.getApiKey(apiKey);
    
    if (!key) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked' 
      });
    }

    await storage.updateApiKeyLastUsed(apiKey);
    
    (req as any).apiKey = key;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
