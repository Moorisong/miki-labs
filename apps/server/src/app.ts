import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error-handler';
import './types/express';

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://box.haroo.site',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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
