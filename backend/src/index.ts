import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import listingsRouter from './routes/listings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/listings', listingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏠 Real Estate API running on http://localhost:${PORT}`);
});