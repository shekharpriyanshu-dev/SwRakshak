import dotenv from 'dotenv';
// Load environment variables in order of specificity
dotenv.config({ path: '.env.development.local' });
dotenv.config({ path: '.env.local' });
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './server/app.js';
import { initDatabase } from './server/db.js';

const PORT = 3000;

// Initialize server and database
export async function startServer() {
  try {
    // Bootstrap SQL database tables and seed records
    await initDatabase();
  } catch (error) {
    console.error('[Server] Warning during database initialization:', error);
  }

  // Vite middleware for development
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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] SwRakshak running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server] Port ${PORT} is already in use. Exiting process so supervisor can restart cleanly.`);
      process.exit(1);
    } else {
      console.error('[Server] Unexpected server error:', err);
    }
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// Only start listening if run directly (e.g. node server.ts / tsx server.ts)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
