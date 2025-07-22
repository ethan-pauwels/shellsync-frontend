// src/pages/AdminDashboard.tsx

import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";

interface Boat {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Boat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [view, setView] = useState<"boats" | "users">("boats");
  const [searchTerm, setSearchTerm] = useState("");
  const [editedRoles, setEditedRoles] = useState<Record<number, string>>({});
  const [editedStatuses, setEditedStatuses] = useState<Record<number, string>>({});

  const fetchBoats = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch("https://shellsync.onrender.com/boats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch boats");
      const data = await res.json();
      setBoats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setError("");
    try {
      const token = getToken();
      const res = await fetch("https://shellsync.onrender.com/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteBoat = async (id: number) => {
    try {
      const token = getToken();
      const res = await fetch(`https://shellsync.onrender.com/boats/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete boat");
      await fetchBoats();
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    setEditedRoles((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleStatusChange = (boatId: number, newStatus: string) => {
    setEditedStatuses((prev) => ({ ...prev, [boatId]: newStatus }));
  };

  const saveChanges = async () => {
    const token = getToken();
    try {
      for (const [userId, newRole] of Object.entries(editedRoles)) {
        await fetch(`https://shellsync.onrender.com/users/${userId}?role=${newRole}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      for (const [boatId, newStatus] of Object.entries(editedStatuses)) {
        await fetch(`https://shellsync.onrender.com/boats/${boatId}?status=${newStatus}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setEditedRoles({});
      setEditedStatuses({});
      await fetchBoats();
      await fetchUsers();
    } catch (err: any) {
      setError("❌ Failed to save changes");
    }
  };

  useEffect(() => {
    fetchBoats();
    fetchUsers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500 text-white";
      case "reserved": return "bg-yellow-400 text-black";
      case "checked_out": return "bg-red-500 text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500 text-white";
      case "coach": return "bg-blue-500 text-white";
      default: return "bg-gray-300 text-black";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setView("boats")} className={`px-3 py-1.5 rounded-xl text-sm ${view === "boats" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>Boats</button>
          <button onClick={() => setView("users")} className={`px-3 py-1.5 rounded-xl text-sm ${view === "users" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>Users</button>
          <button onClick={saveChanges} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-sm">Save Changes</button>
        </div>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name..."
        className="w-full max-w-md mb-4 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600">Loading boats...</p>}

      {view === "boats" ? (
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
              {boats
                .filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((boat) => (
                  <tr key={boat.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{boat.name}</td>
                    <td className="px-4 py-3 text-gray-600">{boat.type}</td>
                    <td className="px-4 py-3">
                      <select
                        value={editedStatuses[boat.id] || boat.status}
                        onChange={(e) => handleStatusChange(boat.id, e.target.value)}
                        className={`px-2 py-1 rounded ${getStatusColor(boat.status)} focus:outline-none`}
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="checked_out">Checked Out</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteTarget(boat)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-sm"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-2xl">
          <table className="min-w-full border border-gray-200 bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Name</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Email</th>
                <th className="text-left text-sm font-semibold text-gray-700 px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={editedRoles[user.id] || user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-2 py-1 rounded ${getRoleColor(user.role)} focus:outline-none`}
                      >
                        <option value="member">Member</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
              >Cancel</button>
              <button
                onClick={() => deleteBoat(deleteTarget.id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
              >Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
