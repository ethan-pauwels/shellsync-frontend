import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QueryViewer from "./pages/QueryViewer";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/query" element={<QueryViewer />} />
        <Route path="*" element={<div>Home</div>} />
      </Routes>
    </Router>
  );
}

export default App;
