import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  const email = profile.emails?.[0]?.value;
  const userId = profile.id;
  
  await storage.upsertUser({
    id: userId,
    email: email,
    firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
    lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
    profileImageUrl: profile.photos?.[0]?.value || null,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth not configured!');
    console.warn('   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
    console.warn('   Get credentials from: https://console.cloud.google.com/');
    return;
  }

  // Determine callback URL based on environment
  const callbackURL = process.env.NODE_ENV === 'production'
    ? `${process.env.APP_URL}/api/auth/google/callback`
    : 'http://localhost:5000/api/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          await upsertUser(profile);
          done(null, profile);
        } catch (error) {
          console.error('Google auth error:', error);
          done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error as Error, null);
    }
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/",
      successRedirect: "/",
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        res.clearCookie('connect.sid');
        res.redirect("/?logout=success");
      });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check free user time limit (2 hours per day)
export const checkFreeUserLimit: RequestHandler = (req: any, res, next) => {
  // If authenticated, skip this check
  if (req.isAuthenticated()) {
    return next();
  }

  // Initialize session usage tracking
  if (!req.session.usageStartTime) {
    req.session.usageStartTime = Date.now();
    req.session.totalUsageMinutes = 0;
  }

  // Check if we need to reset (24 hours passed)
  const now = Date.now();
  const hoursSinceStart = (now - req.session.usageStartTime) / (1000 * 60 * 60);
  
  if (hoursSinceStart >= 24) {
    req.session.usageStartTime = now;
    req.session.totalUsageMinutes = 0;
  }

  // Check if limit exceeded (120 minutes = 2 hours)
  if (req.session.totalUsageMinutes >= 120) {
    return res.status(403).json({ 
      message: "Daily limit exceeded. Please login to continue using all features.",
      limitExceeded: true 
    });
  }

  next();
};

// Middleware to require authentication for premium features
export const requireAuthForPremiumFeatures: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(403).json({ 
      message: "This feature requires login. Please login to continue.",
      requiresAuth: true 
    });
  }
  next();
};
