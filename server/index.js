// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('redis');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// === Redis Setup ===
const redis = createClient();           // default localhost:6379
const subscriber = redis.duplicate();   // separate client for subscription
redis.connect();
subscriber.connect();

const ORDER_CHANNEL = 'order-events';
const REPORT_CHANNEL = 'execution-reports';

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());

// === In-Memory Map of userId -> WebSocket connection ===
const clients = new Map();

// === WebSocket Setup ===
wss.on('connection', (ws) => {
  console.log('[WS] New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('[WS] Received message:', data);
    if (data.type === 'identify') {
      clients.set(data.userId, ws);
      console.log(`[WS] Registered user: ${data.userId}`);
    }
  });

  ws.on('close', () => {
    for (const [userId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(userId);
        console.log(`[WS] User ${userId} disconnected`);
        break; 
      }
    }
  });
});


// === REST Endpoint to Receive Order from React ===
app.post('/order', async (req, res) => {
  const order = req.body;

  if (!order.userId || !order.symbol || !order.quantity || !order.price) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  console.log('[API] Received order:', order);

  // Publish order to Redis
  await redis.publish(ORDER_CHANNEL, JSON.stringify(order));

  res.status(200).json({ message: 'Order submitted' });
});

// === Redis Subscriber: Execution Report Handler ===
subscriber.subscribe(REPORT_CHANNEL, (message) => {
  const report = JSON.parse(message);
  console.log('[REDIS] Received execution report:', report);
  const { userId } = report;

  console.log('[REDIS] Received execution report:', report);

  const userSocket = clients.get(userId);
  if (userSocket && userSocket.readyState === WebSocket.OPEN) {
    userSocket.send(JSON.stringify(report));
    console.log(`[WS] Sent report to user ${userId}`);
    
  } else {
    console.warn(`[WS] No WebSocket found for user ${userId}`);
  }
});

// === Start Server ===
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ API server running at http://localhost:${PORT}`);
});