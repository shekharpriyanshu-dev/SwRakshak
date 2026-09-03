import app from '../server/app.js';
import { initDatabase } from '../server/db.js';

let initialized = false;
let initPromise: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    if (!initPromise) {
      initPromise = initDatabase()
        .then(() => {
          initialized = true;
        })
        .catch((err) => {
          console.error('[Vercel Serverless] Error initializing DB:', err);
          // Allow subsequent requests to retry if needed
          initPromise = null;
        });
    }
    await initPromise;
  }
  return app(req, res);
}
