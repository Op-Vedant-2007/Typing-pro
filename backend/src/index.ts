import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import typingTestsRoutes from './routes/typingTests';
import weakWordsRoutes from './routes/weakWords';
import analyticsRoutes from './routes/analytics';
import userRoutes from './routes/user';
import { ensureDemoUser } from './seed/demoData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(
  cors({
    origin: '*',
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

// Mount Routes
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
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Initialize server and seed demo account in background
app.listen(PORT, async () => {
  console.log(`🚀 TypeFlow Backend is running on port ${PORT}`);
  try {
    await ensureDemoUser();
    console.log('✅ Demo account and sample typing metrics initialized');
  } catch (err) {
    console.error('Failed to initialize demo account on startup:', err);
  }
});
