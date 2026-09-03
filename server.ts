import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes';
import { initDatabase } from './server/db';

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes FIRST
app.use('/api', apiRouter);

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] SwRakshak running on http://0.0.0.0:${PORT}`);
  });
}

// Only start listening if run directly (e.g. node server.ts / tsx server.ts)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
