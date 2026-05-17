import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./Upload";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;