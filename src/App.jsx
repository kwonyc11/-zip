import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Board from "./Board";
import PlayerDetail from "./PlayerDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/player/:name/:year" element={<PlayerDetail />} />
      </Routes>
    </Router>
  );
}