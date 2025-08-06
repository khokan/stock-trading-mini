# NextGen OMS - Order Management System for Equity Trading

NextGen OMS is a professional-grade Order Management System designed for equity markets. It supports real-time FIX 5.0 SP2 order routing, market data via FAST protocol, and scalable microservice communication using Redis.

---

## Client
[Detailed client docs](./client/README.md)

## Server
[Detailed server docs](./server/README.md)

# How Client Will See Broadcast Message from Redis via WebSocket

## Overview

Your backend listens to Redis **pub/sub** messages and broadcasts them to connected clients via **WebSocket**. The client maintains a WebSocket connection and receives real-time updates pushed from the backend.

---

## Workflow

1. **Backend** subscribes to Redis channel (e.g., `trade-events`) and receives published messages.
2. Backend broadcasts those messages via WebSocket to all connected clients.
3. **Client (frontend)** opens a WebSocket connection to the backend.
4. When a message arrives, client’s WebSocket `onmessage` event is triggered.
5. Client parses the message and updates UI accordingly in real-time.

---

## 📦 Full Stack Overview

| Layer     | Tech Stack                          |
|-----------|-------------------------------------|
| 🔵 Client | React.js + Tailwind CSS             |
| 🟢 Server | Node.js + Express + Redis Pub/Sub   |
| ⚙️ Engine | C# FIX Engine (Order Routing)       |
| 📊 Market | C# FAST Engine (Market Data Feed)   |

---

## 🚀 Live Links

- **Client Website:** [https://nextgen-oms-client.web.app](https://nextgen-oms-client.web.app)
- **Server API:** [https://nextgen-oms-server.vercel.app](https://nextgen-oms-server.vercel.app)

---

## 🗂 Repositories

- **Client:** [NextGen OMS Client](./client)
- **Server:** [NextGen OMS Server](./server)

---

## 🔧 System Architecture

```
Browser UI → Node.js API → Redis Pub/Sub → C# Order Processor (FIX Engine)
                       ↑                      ↓
             WebSocket Market Feed     Exchange (via FIX 5.0 SP2 / FAST)
```

---

## 🧱 Modules

- 📘 `client/` – React trading UI
- 📗 `server/` – Express API server, Redis integration
- ⚙️ `fix-engine/` – C# FIX Engine console app
- 📉 `fast-decoder/` – C# FAST Engine (market data)

---

## ✅ Setup & Run

Refer to each module’s README for individual setup instructions.

---
