
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import typingTestsRoutes from './routes/typingTests';
import weakWordsRoutes from './routes/weakWords';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/user';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'TypeFlow Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/typing-tests', typingTestsRoutes);
app.use('/api/weak-words', weakWordsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 TypeFlow Backend is running on port ${PORT}`);
});
