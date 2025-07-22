// src/pages/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken, setUserRole } from "../utils/auth.ts";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [roleMessage, setRoleMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://shellsync.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      saveToken(data.access_token);

      const role = data.user?.role || "member"; // fallback if role isn't included
      setUserRole(role);
      setRoleMessage(`✅ Logged in as ${role}`);

      setTimeout(() => {
        setRoleMessage("");
        navigate("/dashboard");
      }, 2000); // brief banner display
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {roleMessage && (
        <p className="bg-green-100 text-green-800 text-sm p-2 rounded mb-4">
          {roleMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full border p-2 rounded"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
