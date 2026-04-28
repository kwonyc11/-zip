import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Board() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse("/final_5axis_score_dataset.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        const clean = res.data.filter((d) => d.PLAYER_NAME);

        const withScore = clean.map((p) => {
          const avg =
            (p.PHYSICAL_SCORE_FINAL +
              p.ATHLETIC_SCORE_FINAL +
              p.SHOOTING_SCORE +
              p.PLAYMAKING_SCORE +
              p.DEFENSE_SCORE) /
            5;

          return { ...p, OVERALL: avg };
        });

        withScore.sort((a, b) => b.OVERALL - a.OVERALL);

        setPlayers(withScore);
      },
    });
  }, []);

  const filtered = useMemo(() => {
    return players.filter((p) =>
      p.PLAYER_NAME.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  return (
    <div className="page">
      <header className="header">
        <h1>NBA Draft Big Board</h1>
        <input
          className="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      <div className="board">
        {filtered.map((p, idx) => (
          <div
            key={idx}
            className="row"
            onClick={() =>
              navigate(`/player/${p.PLAYER_NAME}/${p.DRAFT_YEAR}`)
            }
          >
            <div className="left">
              <div className="rank">{idx + 1}</div>

              <div className="info">
                <h2>{toTitleCase(p.PLAYER_NAME)}</h2>
                <p>{p.DRAFT_YEAR}</p>
              </div>
            </div>

            <div className="overall">
              {Math.floor(p.OVERALL)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toTitleCase(name) {
  return name
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}