import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './api/index';

async function startServer() {
  const PORT = 3000;

  // ----------------------------------------------------
  // Vite Integration for Dev / Production
  // ----------------------------------------------------
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PakInvest server running on http://0.0.0.0:${PORT}`);
  });
}

// Only launch standalone dev/prod server listener when not running on serverless platforms (e.g. Vercel)
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
  });
}

export default app;
