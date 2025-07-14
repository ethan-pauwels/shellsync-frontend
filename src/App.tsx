// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QueryViewer from "./pages/QueryViewer";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="p-4 bg-gray-100 border-b mb-6">
        <nav className="space-x-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
          <Link to="/admin/query" className="text-blue-600 hover:underline">
            Query Viewer
          </Link>
        </nav>
      </div>

      <Routes>
        <Route path="/admin/query" element={<QueryViewer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<div className="p-6">Welcome to ShellSync</div>} />
      </Routes>
    </Router>
  );
}

export default App;
