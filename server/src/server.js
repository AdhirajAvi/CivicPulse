import 'dotenv/config';
import http from 'http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import issuesRouter from './routes/issues.js';
import statsRouter from './routes/stats.js';
import { attachSockets } from './sockets/index.js';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'civicpulse-api' });
});
app.use('/api/issues', issuesRouter);
app.use('/api/stats', statsRouter);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong.';
  console.error(error);
  res.status(status).json({ message });
});

attachSockets(io);

connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`CivicPulse API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start CivicPulse API:', error.message);
    process.exit(1);
  });
