// src/pages/QueryViewer.tsx

import { useState } from "react";

export default function QueryViewer() {
  const [query, setQuery] = useState("SELECT * FROM boats LIMIT 10;");
  const [result, setResult] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("https://shellsync.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.rows);
      }
    } catch (err: any) {
      setError("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SQL Query Viewer</h1>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded-md p-2 h-32 text-sm font-mono"
        placeholder="Enter SELECT query..."
      />

      <button
        onClick={runQuery}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Query
      </button>

      {loading && <p className="mt-4 text-blue-600">Running query...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {result && (
        <div className="mt-6 overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                {Object.keys(result[0] || {}).map((key) => (
                  <th key={key} className="border p-2 bg-gray-100 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border p-2">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
