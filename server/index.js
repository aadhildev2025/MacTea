const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static public folder for images
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static(path.join(__dirname, '../dist')));

// Create HTTP server
const server = http.createServer(app);

// Attach WebSocket Server
const wss = new WebSocketServer({ server });
app.locals.wss = wss;

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ event: 'connected', message: 'Connected to MacTea real-time order server.' }));
});

// API Routes
app.use('/api', apiRoutes);

// Fallback for SPA routing in production
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const distIndex = path.join(__dirname, '../dist/index.html');
  if (require('fs').existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  return res.send('MacTea API Server is running. Frontend dev mode active.');
});

// Start Server
server.listen(PORT, () => {
  console.log(`🍵 MacTea Server listening on http://localhost:${PORT}`);
});
