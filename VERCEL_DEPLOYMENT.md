# Vercel Deployment Guide - Frontend

## Prerequisites

1. Vercel account (https://vercel.com)
2. Backend deployed on Vercel (or use external URL)
3. Frontend repo pushed to GitHub

## Step 1: Connect Frontend Repository to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/nikhilvishwanath/decoder-diary-frontend`
4. Click "Import"

### Option B: Via CLI

```bash
cd /home/nikhil/decoder-diary-frontend
npm install -g vercel
vercel login
vercel
```

## Step 2: Configure Deployment Settings

In Vercel dashboard:

**Framework:** React
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Node Version:** 20

## Step 3: Add Environment Variables

In Vercel Settings > Environment Variables:

```
VITE_API_URL=https://decoder-diary-backend.vercel.app
NODE_ENV=production
```

**Get your backend URL:**
- Check your deployed backend on Vercel
- Format: `https://your-backend-name.vercel.app`

## Step 4: Deploy

### Via CLI:
```bash
cd /home/nikhil/decoder-diary-frontend
vercel --prod
```

### Via Dashboard:
- Push to main: `git push origin main`
- Auto-deploys if connected

## Step 5: Verify Deployment

Your frontend will be live at:
```
https://decoder-diary-frontend.vercel.app
```

### Test it:
1. Visit the URL in browser
2. Check console for API errors
3. Try logging in / using features

## Configuring API Connection

### If Backend is on Vercel:
Frontend automatically configured via `.env` during build:
```
VITE_API_URL=https://decoder-diary-backend.vercel.app
```

### If Backend is Elsewhere:
Update `VITE_API_URL` environment variable:
```
VITE_API_URL=https://your-backend-url.com
```

Then redeploy.

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://backend.vercel.app` |
| `NODE_ENV` | Node environment | `production` |

## Common Issues

### API calls returning 404

**Problem:** Frontend can't find backend
**Solution:** 
- Check `VITE_API_URL` is correct
- Verify backend is deployed and running
- Check CORS settings on backend

### Blank page or build error

**Problem:** Build failed
**Solution:**
- Check build logs: Vercel dashboard > Deployments
- Ensure `npm run build` works locally
- Check `package.json` has build script

### Slow loading

**Problem:** App takes forever to load
**Solution:**
- Cold start: Vercel functions need warm-up
- Use `vercel analytics` to monitor performance
- Consider Vercel Pro for better performance

## Building Locally Before Deploy

```bash
cd /home/nikhil/decoder-diary-frontend

# Install dependencies
npm install

# Build
npm run build

# Preview production build
npm run preview
```

## Custom Domain (Optional)

1. Register domain (Vercel, Namecheap, GoDaddy, etc.)
2. In Vercel dashboard: Settings > Domains
3. Add domain and configure DNS

## Database Sync

Frontend data is stored in backend database (Supabase).
No database needed on Vercel for frontend.

## Performance Tips

1. **Image Optimization:** Use Next.js Image (if upgrading to Next.js)
2. **Code Splitting:** Vite does this automatically
3. **Caching:** Vercel caches static assets by default
4. **API Calls:** Implement request debouncing

## Monitoring & Analytics

### View Logs:
```bash
vercel logs decoder-diary-frontend
```

### Monitor Performance:
https://vercel.com/dashboard → your-project → Analytics

## Rollback to Previous Deploy

If something breaks:
1. Go to Vercel dashboard
2. Deployments tab
3. Click previous version > "Promote to Production"

## Next Steps

1. ✅ Frontend deployed
2. Test with backend
3. Set up analytics (optional)
4. Configure custom domain (optional)
5. Set up GitHub Actions for CI/CD (optional)

## Support

- Vercel Docs: https://vercel.com/docs
- GitHub Issues in frontend repo
- Vercel Support: support@vercel.com
