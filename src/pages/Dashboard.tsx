// src/pages/Dashboard.tsx

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [boats, setBoats] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBoats = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://shellsync.onrender.com/boats", {
        credentials: "include",
      });
      const data = await res.json();
      setBoats(data);
    } catch (err) {
      setError("Failed to load boats");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    await fetch(`https://shellsync.onrender.com/boats/${id}/checkout`, {
      method: "POST",
      credentials: "include",
    });
    fetchBoats();
  };

  const handleCheckIn = async (id: number) => {
    await fetch(`https://shellsync.onrender.com/boats/${id}/checkin`, {
      method: "POST",
      credentials: "include",
    });
    fetchBoats();
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {loading && <p>Loading boats...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {boats.length === 0 ? (
        <p>No boats found</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Name</th>
              <th className="border p-2 bg-gray-100">Type</th>
              <th className="border p-2 bg-gray-100">Status</th>
              <th className="border p-2 bg-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boats.map((boat: any) => (
              <tr key={boat.id} className="even:bg-gray-50">
                <td className="border p-2">{boat.name}</td>
                <td className="border p-2">{boat.type}</td>
                <td className="border p-2 capitalize">{boat.status}</td>
                <td className="border p-2 space-x-2">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => handleCheckOut(boat.id)}
                    disabled={boat.status !== "available"}
                  >
                    Check Out
                  </button>
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={() => handleCheckIn(boat.id)}
                    disabled={boat.status !== "checked_out"}
                  >
                    Check In
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
