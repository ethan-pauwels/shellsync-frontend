import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

interface Boat {
  id: number;
  name: string;
  type: string;
  status: string;
}

export default function BrokenBoats() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBrokenBoats = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("No token found");

        const res = await fetch("https://shellsync.onrender.com/boats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch boats");

        const data = await res.json();
        const brokenBoats = data.filter((boat: Boat) => boat.status === "broken");
        setBoats(brokenBoats);
      } catch (err: any) {
        setError(err.message || "Failed to load broken boats");
      }
    };

    fetchBrokenBoats();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Broken Boats</h1>
      {error && <p className="text-red-500">{error}</p>}

      {boats.length > 0 ? (
        <ul className="space-y-2">
          {boats.map((boat) => (
            <li key={boat.id} className="border p-4 rounded-lg shadow bg-white">
              <p className="text-lg font-semibold">{boat.name}</p>
              <p className="text-gray-600">Type: {boat.type}</p>
              <p className="text-red-600 font-medium">Status: {boat.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No broken boats at the moment.</p>
      )}
    </div>
  );
}
