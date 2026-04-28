import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");

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

          return { ...p, TOTAL_SCORE: avg };
        });

        // 랭킹 정렬
        withScore.sort((a, b) => b.TOTAL_SCORE - a.TOTAL_SCORE);

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
          <Row key={idx} player={p} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function Row({ player, rank }) {
  const data = [
    { axis: "Physical", value: player.PHYSICAL_SCORE_FINAL },
    { axis: "Athletic", value: player.ATHLETIC_SCORE_FINAL },
    { axis: "Shooting", value: player.SHOOTING_SCORE },
    { axis: "Playmaking", value: player.PLAYMAKING_SCORE },
    { axis: "Defense", value: player.DEFENSE_SCORE },
  ];

  return (
    <div className="row">
      <div className="left">
        <div className="rank">{rank}</div>

        <div className="info">
          <h2>{toTitleCase(player.PLAYER_NAME)}</h2>
          <p>{player.DRAFT_YEAR}</p>
        </div>
      </div>

      <div className="chart">
        <ResponsiveContainer width={160} height={160}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" tick={false} />
            <PolarRadiusAxis domain={[20, 80]} tick={false} />
            <Radar
              dataKey="value"
              stroke="#000"
              fill="#000"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
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