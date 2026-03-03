import { useEffect, useState } from 'react'

function App() {
  // We keep this tiny piece of state just to know we're still connected
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/health-check')
      .then(res => res.json())
      .then(data => setIsConnected(data.database.includes('✅')))
      .catch(() => setIsConnected(false));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial' }}>
      <h1>LoomLegacy</h1>
      <p style={{ color: isConnected ? '#4CAF50' : '#f44336', fontSize: '12px' }}>
        ● {isConnected ? 'System Online' : 'System Offline'}
      </p>

      <hr style={{ width: '50%', margin: '20px auto', opacity: '0.3' }} />

      {/* This is where your actual app content starts */}
      <div className="content">
        <h2>Welcome to the Legacy</h2>
        <p>Ready to start building your features.</p>
      </div>
    </div>
  )
}

export default App