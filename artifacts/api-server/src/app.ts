import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { Request, Response, NextFunction } from 'express';

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(pinoHttp());

// Test route to confirm server health
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ status: "alive" });
});

export default app;
