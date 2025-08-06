## Navigation
- [Client Documentation](#client)
- [Server Documentation](#server)

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

## React Client Example

```jsx
import React, { useEffect, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect to backend WebSocket server
    const ws = new WebSocket('ws://localhost:4000');

    // Handle incoming messages from backend
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [data, ...prev]);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    // Clean up WebSocket connection when component unmounts
    return () => ws.close();
  }, []);

  return (
    <div>
      <h1>Real-time Trades</h1>
      <ul>
        {messages.map((trade, idx) => (
          <li key={idx}>
            {trade.symbol} - {trade.quantity} shares @ ${trade.price} (User: {trade.userId})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

