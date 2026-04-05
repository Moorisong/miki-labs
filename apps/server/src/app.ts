import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/error-handler';
import './types/express';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://box.haroo.site',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

console.log('[DEBUG] Initialized allowedOrigins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('Incoming Origin:', origin);
    console.log('Allowed Origins:', allowedOrigins);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed');
      return callback(null, true);
    }
    console.log('Origin NOT allowed');
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
  res.json({ message: 'Haroo Box API', version: '1.0.0' });
});

// API Routes
app.use('/api', routes);

// Error Handler (must be last)
app.use(errorHandler);

export default app;
