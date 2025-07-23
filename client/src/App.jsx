import React, { useEffect, useState } from 'react';

function App() {
  const [symbol, setSymbol] = useState('GP');
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("338");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [side, setSide] = useState('1'); // Default to Buy ('1' is FIX code for Buy)
  const [userId, setUserId] = useState('');
  const [reports, setReports] = useState([]);


  // Debug initial state
  console.log('[App] Initial render', { symbol, quantity, price, reports });

 const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:4000');

    socket.onopen = () => {
      console.log('[WS] Connected');
      socket.send(JSON.stringify({ type: 'identify', userId }));
      setConnected(true);
      setStatus('Connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[WS] Execution report received:', data);
      setReports((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      console.log('[WS] Disconnected');
      setConnected(false);
      setStatus('Disconnected');
    };
  };


  const placeOrder = async () => {
    console.group('[Order] Placing new order');
    try {
      const orderData = {
        userId,
        symbol,
        quantity: Number(quantity),
        price: Number(price),
        side: side, // '1' for Buy, '2' for Sell
      };
      
      console.log('Sending order:', orderData);
      
      const res = await fetch('http://localhost:4000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Order failed:', errorData);
        throw new Error(errorData.error || 'Order failed');
      }

      const result = await res.json();
      console.log('Order successful:', result);
      return result;
    } catch (err) {
      console.error('Order error:', err);
      alert(`Order failed: ${err.message}`);
      throw err;
    } finally {
      console.groupEnd();
    }
  };


   return (
    <div className="p-4 max-w-xl mx-auto space-y-4 font-mono">
      <p className="text-xl font-bold">📡 FIX Order Client</p>

      {!connected ? (
        <div className="space-y-2">
          <input
            placeholder="Enter User ID"
            className="border px-2 py-1 w-full"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            onClick={connectWebSocket}
            className="bg-blue-600 text-white px-4 py-1 rounded"
            disabled={!userId}
          >
            Connect
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div>Status: <span className="font-semibold">{status}</span></div>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Symbol"
              className="border px-2 py-1 w-full"
            />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantity"
              className="border px-2 py-1 w-full"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Price"
              className="border px-2 py-1 w-full"
            />
              <div style={{ marginBottom: 10 }}>
          <label>
            <input
              type="radio"
              name="side"
              value="1"
              checked={side === '1'}
              onChange={() => setSide('1')}
              style={{ marginRight: 5 }}
            />
            Buy
          </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              name="side"
              value="2"
              checked={side === '2'}
              onChange={() => setSide('2')}
              style={{ marginRight: 5 }}
            />
            Sell
          </label>
        </div>
            <button
              onClick={placeOrder}
              className="bg-green-600 text-white px-4 py-1 rounded"
            >
              Submit Order
            </button>
          </div>

          <div>
            <h2 className="mt-4 font-bold">📈 Execution Reports:</h2>
            <ul className="mt-2 space-y-1 text-sm max-h-48 overflow-auto">
              {reports.map((r, idx) => (
                <li key={idx} className="border-b py-1">
                  <code>{JSON.stringify(r)}</code>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default App;