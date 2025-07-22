// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QueryViewer from "./pages/QueryViewer";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import BrokenBoats from "./pages/BrokenBoats"; // ✅ NEW
import { getUserRole } from "./utils/auth";

function App() {
  const role = getUserRole();

  return (
    <Router>
      <div className="p-4 bg-gray-100 border-b mb-6">
        <nav className="space-x-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Dashboard
          </Link>

          {role === "admin" && (
            <Link to="/admin" className="text-blue-600 hover:underline">
              Admin Dashboard
            </Link>
          )}

          {(role === "admin" || role === "coach") && (
            <>
              <Link to="/admin/query" className="text-blue-600 hover:underline">
                Query Viewer
              </Link>
              <Link to="/broken-boats" className="text-blue-600 hover:underline">
                Broken Boats
              </Link>
            </>
          )}

          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </nav>
      </div>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/admin"
          element={
            role === "admin" ? (
              <AdminDashboard />
            ) : (
              <div className="p-6 text-red-600 font-semibold">Access Denied</div>
            )
          }
        />

        <Route
          path="/admin/query"
          element={
            role === "admin" || role === "coach" ? (
              <QueryViewer />
            ) : (
              <div className="p-6 text-red-600 font-semibold">Access Denied</div>
            )
          }
        />

        <Route
          path="/broken-boats"
          element={
            role === "admin" || role === "coach" ? (
              <BrokenBoats />
            ) : (
              <div className="p-6 text-red-600 font-semibold">Access Denied</div>
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div className="p-6">Welcome to ShellSync</div>} />
      </Routes>
    </Router>
  );
}

export default App;
