# Render Deployment Guide

This guide will help you deploy your AimAI application to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A Neon PostgreSQL database (https://neon.tech)
3. An OpenAI API key (https://platform.openai.com)

## Step 1: Set Up Neon Database

1. Go to https://neon.tech and create a new project
2. Create a new database
3. Copy the connection string (it will look like: `postgresql://user:password@host.neon.tech:5432/database?sslmode=require`)

## Step 2: Deploy to Render

1. Go to https://dashboard.render.com
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository or paste the repository URL
4. Configure the service:
   - **Name**: `aimai` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave blank
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

## Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

### Required Variables:

1. **DATABASE_URL**
   - Value: Your Neon database connection string
   - Example: `postgresql://user:password@host.neon.tech:5432/database?sslmode=require`

2. **OPENAI_API_KEY**
   - Value: Your OpenAI API key
   - Example: `sk-proj-...`

3. **SESSION_SECRET**
   - Value: A random secure string (generate one using: `openssl rand -hex 32`)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

4. **NODE_ENV**
   - Value: `production`

### Optional Variables (for Replit Auth):

5. **REPLIT_DOMAINS** (only if using Replit Auth)
   - Value: Your Replit domain
   
6. **REPL_ID** (only if using Replit Auth)
   - Value: Your Replit ID

7. **ISSUER_URL** (only if using Replit Auth)
   - Value: `https://replit.com/oidc`

## Step 4: Push Database Schema

After deployment, you need to push your database schema:

1. Install the Render CLI: `npm install -g render-cli`
2. Log in: `render login`
3. Find your service name: `render services list`
4. Run the migration: `render run -s your-service-name "npm run db:push"`

Alternatively, you can set up a PostgreSQL connection from your local machine and run:
```bash
DATABASE_URL="your-neon-connection-string" npm run db:push
```

## Step 5: Get Your API URL

After deployment, Render will provide you with a URL like:
```
https://your-app-name.onrender.com
```

Your API endpoint for the Telegram bot will be:
```
https://your-app-name.onrender.com/api/solution
```

## Step 6: Generate API Key for Telegram Bot

1. Visit your deployed application
2. Log in with Google (or create an account)
3. Go to Settings or API Keys section
4. Click "Generate New API Key"
5. Give it a name (e.g., "Telegram Bot")
6. Copy the API key (you won't see it again!)

## Using the API with Your Telegram Bot

### API Endpoint
```
POST https://your-app-name.onrender.com/api/solution
```

### Headers
```
Content-Type: application/json
X-API-Key: your-generated-api-key
```

### Request Body
```json
{
  "question": "Explain the concept of oxidation and reduction",
  "language": "english",
  "userName": "Optional user name"
}
```

### Response
```json
{
  "success": true,
  "solutionUrl": "https://your-app-name.onrender.com/solution/abc123xyz",
  "solution": {
    "answer": "Detailed explanation...",
    "subject": "chemistry",
    "chapter": "Redox Reactions",
    "topic": "Oxidation and Reduction",
    "neetJeePyq": {
      "neet": ["2023", "2022"],
      "jee": ["2024"]
    }
  }
}
```

## Troubleshooting

### Database Connection Issues
- Make sure your Neon database allows connections from anywhere (or specifically from Render's IP ranges)
- Check that the connection string includes `?sslmode=require`

### API Key Not Working
- Ensure the API key is being sent in the `X-API-Key` header
- Check that the API key hasn't been revoked
- Verify the key is active in your dashboard

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are in package.json
- Make sure Node version is compatible (Node 20+ recommended)

## Monitoring

Render provides:
- Automatic SSL certificates
- Health checks
- Auto-deploy on git push
- Log viewing in the dashboard

## Scaling

For production use:
1. Consider upgrading to a paid plan for better performance
2. Set up monitoring and alerts
3. Enable auto-scaling if traffic varies
4. Consider adding Redis for session storage

## Support

For issues specific to:
- **Neon Database**: https://neon.tech/docs
- **Render Platform**: https://render.com/docs
- **OpenAI API**: https://platform.openai.com/docs
