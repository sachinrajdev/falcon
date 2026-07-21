# Pragati Deployment Guide

## ✅ Vercel Deployment Checklist

This guide walks you through deploying Pragati to Vercel.

### Prerequisites
- GitHub account with the Pragati repository
- Vercel account (free tier works for Phase 1)
- OpenAI API key
- LlamaCloud API key

### Step 1: Import Repository to Vercel

1. Go to [vercel.com](https://vercel.com/new)
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Paste: `https://github.com/sachinrajdev/falcon.git`
5. Click **"Import"**

### Step 2: Configure Environment Variables

Vercel will prompt you for environment variables:

- **OPENAI_API_KEY**
  - Get it at: https://platform.openai.com/api-keys
  - Paste the full API key
  
- **LLAMAINDEX_API_KEY**
  - Get it at: https://cloud.llamaindex.ai/api-key
  - Paste the full API key

> ⚠️ **Security Note:** These keys are secret. Vercel encrypts them and never shows them in logs.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Once live, you'll see the deployment URL

### Step 4: Verify Deployment

- Visit the live URL
- Upload a test resume
- Analyze against a sample JD
- Check that all 4 steps work

### Monitoring & Troubleshooting

**View Logs:**
- Go to your Vercel dashboard → Project → Deployments
- Click the latest deployment → "Functions" tab to see API logs

**Common Issues:**

| Issue | Solution |
|-------|----------|
| 500 error on resume upload | Check LLAMAINDEX_API_KEY is set and has quota |
| 500 error on decision/interview | Check OPENAI_API_KEY is valid and has balance |
| Build fails | Run `npm run build` locally to see errors |

### Environment Variables Reference

```
OPENAI_API_KEY=sk-...        # OpenAI API key (required)
LLAMAINDEX_API_KEY=...       # LlamaCloud API key (required)
```

### Rate Limiting

Pragati enforces 5 uploads per hour per IP to prevent abuse. This is configurable in:
- `app/api/upload/route.ts` - `RATE_LIMIT_MAX_REQUESTS`
- `app/api/upload/route.ts` - `RATE_LIMIT_WINDOW_MS`

### Scaling (Phase 2)

For production scale, consider:
- Enable [Vercel Analytics](https://vercel.com/docs/product/analytics)
- Add [serverless function scaling](https://vercel.com/docs/concepts/functions/edge-functions)
- Move file storage to S3 (currently in-memory)
- Add database for session persistence (currently localStorage)

### Support

For deployment issues, check:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- GitHub Issues in the Pragati repo
