import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabaseSchema, seedDatabaseIfNeeded } from './server/db';
import { apiRouter } from './server/api';

async function startServer() {
  // 1. Initialize SQLite Database & Seeding
  initDatabaseSchema();
  seedDatabaseIfNeeded();

  const app = express();
  const PORT = 3000;

  // 2. Security Headers & Payload Controls
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // In-memory sliding window rate limiter for authentication endpoints
  const authAttempts = new Map<string, { count: number; resetTime: number }>();
  const MAX_AUTH_ATTEMPTS = 20; // 20 attempts
  const AUTH_WINDOW_MS = 60 * 1000; // per 1 minute

  const authRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/auth/')) {
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-client';
      const now = Date.now();
      const entry = authAttempts.get(ip);
      if (!entry || now > entry.resetTime) {
        authAttempts.set(ip, { count: 1, resetTime: now + AUTH_WINDOW_MS });
        return next();
      }
      if (entry.count >= MAX_AUTH_ATTEMPTS) {
        return res.status(429).json({
          success: false,
          error: 'Terlalu banyak permintaan otentikasi. Demi keamanan, silakan tunggu 1 menit.'
        });
      }
      entry.count++;
    }
    next();
  };

  // 3. API Routes FIRST
  app.use('/api', authRateLimiter, apiRouter);

  // 4. Vite Middleware for Development / Static Dist for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Global Error Handler (Sanitizes error leaks)
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SQLite Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Fatal Server Startup Error]:', err);
  process.exit(1);
});
