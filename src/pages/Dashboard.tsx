import { useState, useEffect } from "react";
import { getToken } from "../utils/auth";

interface Boat {
  id: number;
  name: string;
  type: string;
  status: string;
}

export default function Dashboard() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [workingBoatId, setWorkingBoatId] = useState<number | null>(null);

  const fetchBoats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      console.log("Token being used:", token);
      if (!token) throw new Error("User not logged in");

      const res = await fetch("https://shellsync.onrender.com/boats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetch /boats response:", res.status);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
      }

      const data = await res.json();
      console.log("Fetched boat data:", data);

      if (Array.isArray(data)) {
        setBoats(data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      console.error("Error fetching boats:", err);
      setError(err.message || "❌ Failed to load boats");
      setBoats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    const token = getToken();
    if (!token) {
      setError("❌ You must be logged in to check out a boat");
      console.error("No token found — user must be logged in.");
      return;
    }

    try {
      console.log(`📤 Attempting to check out boat ID ${id}`);
      setWorkingBoatId(id);

      const res = await fetch(`https://shellsync.onrender.com/boats/${id}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Checkout response:", res.status);
      const resBody = await res.text();
      console.log("Checkout response body:", resBody);

      if (!res.ok) {
        throw new Error(`Checkout failed with status ${res.status}: ${resBody}`);
      }

      setError("✅ Boat checked out successfully");
      await fetchBoats();
    } catch (err) {
      console.error("Checkout error:", err);
      setError("❌ Failed to check out boat");
    } finally {
      setWorkingBoatId(null);
    }
  };

  const handleCheckIn = async (id: number) => {
    const token = getToken();
    if (!token) {
      setError("❌ You must be logged in to check in a boat");
      return;
    }

    try {
      setWorkingBoatId(id);
      const res = await fetch(`https://shellsync.onrender.com/boats/${id}/checkin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Check-in failed with status ${res.status}: ${text}`);
      }

      setError("✅ Boat checked in successfully");
      await fetchBoats();
    } catch (err) {
      console.error("Checkin error:", err);
      setError("❌ Failed to check in boat");
    } finally {
      setWorkingBoatId(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getToken();
      if (token) {
        console.log("✅ Token found, fetching boats...");
        fetchBoats();
        clearInterval(interval);
      } else {
        console.log("⏳ Waiting for token...");
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Boat Dashboard</h1>

      {loading && <p className="text-gray-600">Loading boats...</p>}
      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {boats.length > 0 ? (
        <div className="overflow-x-auto shadow rounded-2xl">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Name</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Type</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Status</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boats.map((boat) => (
                <tr
                  key={boat.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-800">{boat.name}</td>
                  <td className="px-4 py-3 text-gray-600">{boat.type}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{boat.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
                      onClick={() => handleCheckOut(boat.id)}
                      disabled={
                        boat.status !== "available" || workingBoatId === boat.id
                      }
                    >
                      Check Out
                    </button>
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
                      onClick={() => handleCheckIn(boat.id)}
                      disabled={
                        boat.status !== "checked_out" || workingBoatId === boat.id
                      }
                    >
                      Check In
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <p className="text-gray-500">No boats found</p>
      )}
    </div>
  );
}
