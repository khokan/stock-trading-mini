# NextGen OMS - Client (React)

This is the frontend React application for NextGen OMS. It allows traders to submit equity orders, view order status, and live market depth via WebSocket.

---

## 🚀 Live Client

🔗 [https://nextgen-oms-client.web.app](https://nextgen-oms-client.web.app)

---

## ⚙️ Tech Stack

- React.js
- Tailwind CSS
- Axios
- Vite
- WebSocket for market data

---

## 📦 Setup Instructions

```bash
git clone https://github.com/your-org/nextgen-oms-client.git
cd nextgen-oms-client
npm install
npm run dev
```

---

## 🧪 Sample `.env`

```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

---

## 📃 Features

- Submit order (buy/sell) with `userId`, `symbol`, `qty`, `price`
- WebSocket-based real-time market depth
- Order confirmation/status display

---

## 📁 Project Structure

```
src/
├── components/
│   └── OrderForm.jsx
│   └── MarketDepth.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```
