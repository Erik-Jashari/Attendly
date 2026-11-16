import express, { type Express } from 'express';
import { errorHandler } from './common/http/error-handler.js';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Module routes (presentation layer) are mounted here, e.g.:
  // app.use('/api/sessions', sessionsRouter);
  // app.use('/api/attendance', attendanceRouter);
  // app.use('/api/reports', reportsRouter);
  // app.use('/api/justifications', justificationsRouter);

  app.use(errorHandler);
  return app;
}
