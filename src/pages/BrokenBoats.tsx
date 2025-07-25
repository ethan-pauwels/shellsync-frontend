import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

interface Boat {
  id: number;
  name: string;
  type: string;
  status: string;
  updated_at?: string; // Optional timestamp for when the boat was last updated
}

export default function BrokenBoats() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBrokenOnly, setShowBrokenOnly] = useState(false);

  const fetchBoats = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const res = await fetch("https://shellsync.onrender.com/boats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch boats");

      const data = await res.json();
      setBoats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load boats");
    }
  };

  useEffect(() => {
    fetchBoats();
  }, []);

  const markFixed = async (boatId: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`https://shellsync.onrender.com/boats/${boatId}/mark-fixed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to mark as fixed");
      await fetchBoats();
    } catch (err: any) {
      setError(err.message || "Fix failed");
    } finally {
      setLoading(false);
    }
  };

  const markDamaged = async (boatId: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`https://shellsync.onrender.com/boats/${boatId}?status=maintenance`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to mark as damaged");
      await fetchBoats();
    } catch (err: any) {
      setError(err.message || "Damage failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredBoats = boats.filter((boat) => {
    const matchesSearch = `${boat.name} ${boat.type}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showBrokenOnly ? boat.status === "maintenance" : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Broken Boats Manager</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-2/3 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showBrokenOnly}
            onChange={(e) => setShowBrokenOnly(e.target.checked)}
          />
          <span className="text-sm">Show Broken Only</span>
        </label>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {filteredBoats.length > 0 ? (
        <ul className="space-y-4">
          {filteredBoats.map((boat) => (
            <li key={boat.id} className="border p-4 rounded-lg shadow bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{boat.name}</p>
                  <p className="text-gray-600">Type: {boat.type}</p>
                  <p
                    className={`font-medium ${
                      boat.status === "broken" ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Status: {boat.status}
                  </p>
                  {boat.status === "broken" && boat.updated_at && (
                    <p className="text-xs text-gray-500">
                      Marked broken: {new Date(boat.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  {boat.status === "maintenance" ? (
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => markFixed(boat.id)}
                      disabled={loading}
                    >
                      Mark Fixed
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => markDamaged(boat.id)}
                      disabled={loading}
                    >
                      Mark Damaged
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No boats match your search.</p>
      )}
    </div>
  );
}
