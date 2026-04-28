import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

export default function PlayerDetail() {
  const { name, year } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    Papa.parse("/final_5axis_score_dataset.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        const found = res.data.find(
          (p) =>
            p.PLAYER_NAME === name &&
            String(p.DRAFT_YEAR) === String(year)
        );

        setPlayer(found);
      },
    });
  }, [name, year]);

  if (!player) return <div>Loading...</div>;

  const data = [
    { axis: "Physical", value: Math.floor(player.PHYSICAL_SCORE_FINAL) },
    { axis: "Athletic", value: Math.floor(player.ATHLETIC_SCORE_FINAL) },
    { axis: "Shooting", value: Math.floor(player.SHOOTING_SCORE) },
    { axis: "Playmaking", value: Math.floor(player.PLAYMAKING_SCORE) },
    { axis: "Defense", value: Math.floor(player.DEFENSE_SCORE) },
  ];

  const overall =
    (player.PHYSICAL_SCORE_FINAL +
      player.ATHLETIC_SCORE_FINAL +
      player.SHOOTING_SCORE +
      player.PLAYMAKING_SCORE +
      player.DEFENSE_SCORE) /
    5;

  return (
    <div className="detailPage">
      <button onClick={() => navigate(-1)}>← Back</button>

      <h1>{toTitleCase(player.PLAYER_NAME)}</h1>
      <h2>Overall: {Math.floor(overall)}</h2>

      <div style={{ width: 400, height: 400 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" />
            <PolarRadiusAxis domain={[20, 80]} />
            <Radar dataKey="value" stroke="#000" fill="#000" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="detailScores">
        {data.map((d) => (
          <p key={d.axis}>
            {d.axis}: <strong>{d.value}</strong>
          </p>
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