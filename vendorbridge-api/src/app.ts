import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { pool } from './config/db';

dotenv.config();
const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api', apiRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection status: Connected successfully');
  } catch (err: any) {
    console.error('Database connection status: Connection failed');
    console.error(err);
  }
});

export default app;
