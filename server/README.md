# NextGen OMS - Server (Node.js)

This is the backend server for NextGen OMS. It receives REST orders from the client, publishes them to Redis (for FIX Engine), and broadcasts live market data via WebSocket.

---

## 🚀 Live Server

🔗 [https://nextgen-oms-server.vercel.app](https://nextgen-oms-server.vercel.app)

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- Redis Pub/Sub
- WebSocket
- CORS / dotenv

---

## 🔧 Features

- `POST /api/order` → Accepts equity orders
- Publishes order JSON to Redis → FIX Engine reads and routes to Exchange
- Receives execution reports (from FIX via Redis) and pushes to client
- WebSocket endpoint for market depth updates (from FAST engine)

---

## 📦 Setup Instructions

```bash
git clone https://github.com/your-org/nextgen-oms-server.git
cd nextgen-oms-server
npm install
npm run dev
```

---

## 🧪 Sample `.env`

```
PORT=5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
ORDER_CHANNEL=order_channel
REPORT_CHANNEL=report_channel
DEPTH_CHANNEL=depth_channel
```

---

## 🧩 Redis Channels

| Channel        | Purpose                         |
|----------------|----------------------------------|
| `order_channel`| Order sent to FIX Engine         |
| `report_channel`| Order reports (fill/cancel/etc) |
| `depth_channel`| Market depth from FAST engine    |

---

## 🧱 Folder Structure

```
server/
├── index.js
├── websocket.js
├── routes/
│   └── order.js
├── redis/
│   └── pub.js
│   └── sub.js
├── utils/
│   └── logger.js
└── .env
```

---

## 🔐 Security

- Input validation
- Logging with timestamps
- Try/catch with fail-safe Redis error handling

---

## 🔄 Order Flow

1. React sends order → `POST /api/order`
2. Server publishes to Redis `order_channel`
3. C# FIX Engine reads Redis, routes FIX order
4. Report from Exchange sent to `report_channel`
5. Server pushes to client via WebSocket

---
