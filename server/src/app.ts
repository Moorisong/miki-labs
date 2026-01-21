import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error-handler';
import './types/express';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Claw Addict API', version: '1.0.0' });
});

// API Routes
app.use('/api', routes);

// Error Handler (must be last)
app.use(errorHandler);

export default app;
