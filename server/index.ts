import app from './app.js';
import apiRouter from './routes.js';
import { initDatabase, getDbConnection, getDbType } from './db.js';

export { app, apiRouter, initDatabase, getDbConnection, getDbType };
export default app;
