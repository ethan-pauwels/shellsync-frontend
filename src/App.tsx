// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QueryViewer from "./pages/QueryViewer";
import Dashboard from "./pages/Dashboard"; // ⬅️ import the new Dashboard

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/query" element={<QueryViewer />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ new route */}
        <Route path="*" element={<div>Home</div>} />
      </Routes>
    </Router>
  );
}

export default App;
