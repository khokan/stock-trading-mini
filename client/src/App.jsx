import React, { useEffect, useState } from 'react';

function App() {
  const [trades, setTrades] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [wsStatus, setWsStatus] = useState('disconnected');

  // Debug initial state
  console.log('[App] Initial render', { symbol, quantity, price, trades });

  useEffect(() => {
    console.log('[WebSocket] Attempting to connect...');
    const ws = new WebSocket('ws://localhost:4000');

    ws.onopen = () => {
      console.log('[WebSocket] Connection established');
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      console.groupCollapsed('[WebSocket] Received message');
      console.log('Raw message:', event.data);
      
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed trade data:', data);
        
        setTrades(prev => {
          const newTrades = [data, ...prev.slice(0, 9)]; // Keep last 10 trades
          console.log('Updated trades:', newTrades);
          return newTrades;
        });
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
      console.groupEnd();
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
      setWsStatus('error');
    };

    ws.onclose = () => {
      console.log('[WebSocket] Connection closed');
      setWsStatus('disconnected');
    };

    return () => {
      console.log('[WebSocket] Cleaning up connection');
      ws.close();
    };
  }, []);

  const placeOrder = async () => {
    console.group('[Order] Placing new order');
    try {
      const orderData = {
        userId: 'user123',
        symbol,
        quantity: Number(quantity),
        price: Number(price),
      };
      
      console.log('Sending order:', orderData);
      
      const res = await fetch('http://localhost:4000/trade', {
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

  // Debug render with current state
  console.log('[App] Render', { 
    symbol, 
    quantity, 
    price, 
    tradeCount: trades.length,
    wsStatus 
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Real-Time Stock Trading</h1>
      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <input 
            placeholder="Symbol (e.g. AAPL)" 
            value={symbol} 
            onChange={e => {
              console.log('Symbol changed to:', e.target.value);
              setSymbol(e.target.value);
            }} 
            style={{ marginRight: 10 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            placeholder="Quantity" 
            type="number" 
            value={quantity} 
            onChange={e => {
              console.log('Quantity changed to:', e.target.value);
              setQuantity(e.target.value);
            }} 
            style={{ marginRight: 10 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input 
            placeholder="Price" 
            type="number" 
            step="0.01"
            value={price} 
            onChange={e => {
              console.log('Price changed to:', e.target.value);
              setPrice(e.target.value);
            }} 
            style={{ marginRight: 10 }}
          />
        </div>
        <button 
          onClick={placeOrder}
          disabled={!symbol || !quantity || !price}
        >
          Place Order
        </button>
        <div style={{ marginTop: 10 }}>
          WebSocket Status: {wsStatus}
        </div>
      </div>
      
      <h2>Executed Trades (Last 10)</h2>
      {trades.length === 0 ? (
        <p>No trades yet</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {trades.map((trade, idx) => (
            <li key={idx} style={{ 
              padding: 10, 
              marginBottom: 5, 
              border: '1px solid #ddd',
              borderRadius: 4
            }}>
              <div>
                <strong>{trade.symbol}</strong> - {trade.quantity} shares @ ${trade.price.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                User: {trade.userId} | {new Date(trade.timestamp).toLocaleTimeString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;