const express = require('express');
const http = require('http');
const redis = require('redis');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

console.log('Creating Redis clients...');
const redisPub = redis.createClient();
const redisSub = redis.createClient();

// Redis client event listeners
redisPub.on('connect', () => console.log('[Redis Publisher] Connected'));
redisPub.on('error', (err) => console.error('[Redis Publisher] Error:', err));
redisPub.on('end', () => console.log('[Redis Publisher] Disconnected'));

redisSub.on('connect', () => console.log('[Redis Subscriber] Connected'));
redisSub.on('error', (err) => console.error('[Redis Subscriber] Error:', err));
redisSub.on('end', () => console.log('[Redis Subscriber] Disconnected'));

console.log('Creating WebSocket server...');
const wss = new WebSocket.Server({ server });

// WebSocket server events
wss.on('connection', (ws) => {
  console.log('[WebSocket] New client connected');
  console.log(`[WebSocket] Current connections: ${wss.clients.size}`);

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    console.log(`[WebSocket] Remaining connections: ${wss.clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

function broadcast(data) {
  console.log(`[Broadcast] Sending to ${wss.clients.size} clients:`, data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    } else {
      console.warn('[Broadcast] Skipping non-ready client');
    }
  });
}

async function start() {
  console.log('Starting server initialization...');

  try {
    // Connect both clients
    console.log('Connecting Redis publisher...');
    await redisPub.connect();
    console.log('Redis publisher connected successfully');

    console.log('Connecting Redis subscriber...');
    await redisSub.connect();
    console.log('Redis subscriber connected successfully');

    // Subscribe to channel
    console.log('Subscribing to trade-events channel...');
    await redisSub.subscribe('trade-events', (message) => {
      console.log('[Redis Sub] Received message:', message);
      try {
        const data = JSON.parse(message);
        console.log('[Redis Sub] Parsed trade event:', data);
        broadcast(data);
      } catch (err) {
        console.error('[Redis Sub] Error parsing message:', err);
      }
    });
    console.log('Successfully subscribed to trade-events');

    // POST trade endpoint
    app.post('/trade', async (req, res) => {
      console.log('[HTTP] POST /trade received:', req.body);
      
      try {
        const { userId, symbol, quantity, price } = req.body;
        
        // if (!userId || !symbol || !quantity || !price) {
        //   console.warn('[HTTP] Invalid trade data received');
        //   return res.status(400).json({ error: 'Missing required fields' });
        // }

        const tradeEvent = {
          userId,
          symbol,
          quantity,
          price,
          timestamp: Date.now()
        };

        console.log('[HTTP] Publishing trade event:', tradeEvent);
        
        // Publish trade event
        await redisPub.publish('trade-events', JSON.stringify(tradeEvent));
        console.log('[HTTP] Trade event published successfully');

        res.status(200).json({ status: 'Order executed', trade: tradeEvent });
      } catch (err) {
        console.error('[HTTP] Error processing trade:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
      }
    });

    // Start HTTP server
    const PORT = 4000;
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log('Server initialization complete');
    });

  } catch (err) {
    console.error('Server initialization failed:', err);
    process.exit(1);
  }
}

// Start everything
console.log('Starting server...');
start().catch(err => {
  console.error('Fatal error during startup:', err);
  process.exit(1);
});