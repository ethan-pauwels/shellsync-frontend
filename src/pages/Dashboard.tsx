import { useState, useEffect } from "react";
import { getToken, clearToken, getUserRole } from "../utils/auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


interface Boat {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface Reservation {
  reservation_id: number;
  boat_id: number;
  boat_name: string;
  boat_type: string;
  start_time: string;
  end_time: string;
}

function formatForDateTimeLocalInput(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function formatUTCtoLocalDisplay(datetime: string): string {
  const utc = new Date(datetime + "Z");
  return utc.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [workingBoatId, setWorkingBoatId] = useState<number | null>(null);
  const [reservingBoatId, setReservingBoatId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchBoats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) throw new Error("User not logged in");

      const res = await fetch("https://shellsync.onrender.com/boats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
      }

      const data = await res.json();
      setBoats(data);
      setFilteredBoats(data);
    } catch (err: any) {
      console.error("Error fetching boats:", err);
      setError(err.message || "❌ Failed to load boats");
      setBoats([]);
      setFilteredBoats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = getToken();
      const res = await fetch("https://shellsync.onrender.com/reservations/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch reservations");

      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = boats.filter((boat) =>
      `${boat.name} ${boat.type}`.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredBoats(filtered);
  };

  const handleCheckOut = async (id: number) => {
    const token = getToken();
    if (!token) {
      setError("❌ You must be logged in to check out a boat");
      return;
    }

    try {
      setWorkingBoatId(id);
      const res = await fetch(`https://shellsync.onrender.com/boats/${id}/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const resBody = await res.text();
      if (!res.ok) throw new Error(`Checkout failed: ${resBody}`);

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
        headers: { Authorization: `Bearer ${token}` },
      });

      const resBody = await res.text();
      if (!res.ok) throw new Error(`Check-in failed: ${resBody}`);

      setError("✅ Boat checked in successfully");
      await fetchBoats();
    } catch (err) {
      console.error("Check-in error:", err);
      setError("❌ Failed to check in boat");
    } finally {
      setWorkingBoatId(null);
    }
  };

  const handleReserve = async (id: number) => {
    const token = getToken();
    if (!token) {
      setError("❌ You must be logged in to reserve a boat");
      return;
    }

    if (!startTime || !endTime) {
      setError("❌ Start and end time required");
      return;
    }

    try {
      setWorkingBoatId(id);
      const res = await fetch(`https://shellsync.onrender.com/reservations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boat_id: id,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
        }),
      });

      const resBody = await res.text();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("🚫 This boat is already reserved for that time.");
        }
        throw new Error(`Reservation failed: ${resBody}`);
      }

      setError("✅ Reservation successful");
      setReservingBoatId(null);
      setStartTime("");
      setEndTime("");
      await fetchBoats();
      await fetchReservations();
    } catch (err: any) {
      console.error("Reservation error:", err);
      setError(err.message || "❌ Failed to reserve boat");
    } finally {
      setWorkingBoatId(null);
    }
  };

  const handleLogout = () => {
    clearToken();
    window.location.href = "/";
  };

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    setUserRole(role);

    if (token) {
      fetchBoats();
      fetchReservations();
    }
  }, []);

  const reservationDates = reservations.map(r => new Date(r.start_time + "Z").toDateString());

  const tileContent = ({ date }: { date: Date }) => {
    const isReserved = reservationDates.includes(date.toDateString());
    return isReserved ? (
      <div className="mt-1 w-1 h-1 rounded-full bg-red-500 mx-auto" />
    ) : null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Navbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Boat Dashboard</h1>
        {userRole && (
          <p className="text-sm text-gray-600 mt-1">
            Logged in as <span className="font-semibold capitalize">{userRole}</span>
          </p>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
        >
          Logout
        </button>
      </div>

      {/* Calendar Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setCalendarOpen(!calendarOpen)}
          className="text-sm px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
        >
          {calendarOpen ? "Hide Reservation Calendar" : "Show Reservation Calendar"}
        </button>

        {calendarOpen && (
          <div className="mt-4 border p-4 rounded-lg shadow bg-white">
            <h2 className="text-lg font-semibold mb-2">Upcoming Reservations</h2>
            <Calendar tileContent={tileContent} />
            <ul className="mt-4 space-y-1 text-sm">
              {reservations.map((r) => {
                const start = new Date(r.start_time);
                return (
                  <li key={r.reservation_id}>
                    {start.toLocaleDateString()} —{" "}
                    {formatUTCtoLocalDisplay(r.start_time)} to{" "}
                    {formatUTCtoLocalDisplay(r.end_time)} —{" "}
                    <span className="font-semibold">{r.boat_name}</span> ({r.boat_type})
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading && <p className="text-gray-600">Loading boats...</p>}
      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {filteredBoats.length > 0 ? (
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
              {filteredBoats.map((boat) => (
                <>
                  <tr key={boat.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{boat.name}</td>
                    <td className="px-4 py-3 text-gray-600">{boat.type}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{boat.status}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
                        onClick={() => handleCheckOut(boat.id)}
                        disabled={boat.status !== "available" || workingBoatId === boat.id}
                      >
                        Check Out
                      </button>
                      <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
                        onClick={() => handleCheckIn(boat.id)}
                        disabled={boat.status !== "checked_out" || workingBoatId === boat.id}
                      >
                        Check In
                      </button>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-sm disabled:opacity-50"
                        onClick={() => setReservingBoatId(boat.id)}
                        disabled={boat.status !== "available"}
                      >
                        Reserve
                      </button>
                    </td>
                  </tr>
                  {reservingBoatId === boat.id && (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                          <input
                            type="datetime-local"
                            value={startTime ? formatForDateTimeLocalInput(startTime) : ""}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <input
                            type="datetime-local"
                            value={endTime ? formatForDateTimeLocalInput(endTime) : ""}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="border rounded px-2 py-1"
                          />
                          <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-sm"
                            onClick={() => handleReserve(boat.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="text-sm text-gray-500 hover:underline"
                            onClick={() => setReservingBoatId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
