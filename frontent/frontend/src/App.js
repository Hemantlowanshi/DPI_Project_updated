import React from 'react';
import Upload from './Upload';
import Dashboard from './Dashboard';

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🛡️ DPI Network Traffic Analyzer</h1>
      <Upload />
      <hr />
      <Dashboard />
    </div>
  );
}

export default App;