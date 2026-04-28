import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import "./App.css";

const ITEMS_PER_PAGE = 12;

export default function Board() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse("/final_5axis_score_dataset.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        const scoreCols = [
          "PHYSICAL_SCORE_FINAL",
          "ATHLETIC_SCORE_FINAL",
          "SHOOTING_SCORE",
          "PLAYMAKING_SCORE",
          "DEFENSE_SCORE",
        ];

        const clean = res.data
          .filter((p) => p.PLAYER_NAME)
          .map((p) => {
            const scores = scoreCols.map((col) => Number(p[col]));
            const overall =
              scores.reduce((sum, v) => sum + v, 0) / scores.length;

            return {
              ...p,
              PLAYER_NAME: String(p.PLAYER_NAME).trim(),
              DRAFT_YEAR: Number(p.DRAFT_YEAR),
              PHYSICAL_SCORE_FINAL: Number(p.PHYSICAL_SCORE_FINAL),
              ATHLETIC_SCORE_FINAL: Number(p.ATHLETIC_SCORE_FINAL),
              SHOOTING_SCORE: Number(p.SHOOTING_SCORE),
              PLAYMAKING_SCORE: Number(p.PLAYMAKING_SCORE),
              DEFENSE_SCORE: Number(p.DEFENSE_SCORE),
              OVERALL: Number(p.OVERALL) || overall,
            };
          })
          .filter((p) => Number.isFinite(p.OVERALL))
          .sort((a, b) => b.OVERALL - a.OVERALL);

        setPlayers(clean);
      },
    });
  }, []);

  const years = useMemo(() => {
    return [...new Set(players.map((p) => p.DRAFT_YEAR))]
      .filter((y) => Number.isFinite(y))
      .sort((a, b) => b - a);
  }, [players]);

  const filtered = useMemo(() => {
    return players
      .filter((p) =>
        selectedYear === "ALL"
          ? true
          : String(p.DRAFT_YEAR) === String(selectedYear)
      )
      .filter((p) =>
        p.PLAYER_NAME.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.OVERALL - a.OVERALL);
  }, [players, selectedYear, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedYear]);

  return (
    <div className="page widePage">
      <header className="hero wideHero">
        <div>
          <p className="eyebrow">NCAA → NBA Translation Model</p>
          <h1>NBA Draft Big Board</h1>
          <p className="heroText">
            NCAA 선수의 피지컬, 운동능력, 슈팅, 플레이메이킹, 수비 점수를 종합해
            NBA에서도 통할 가능성이 높은 선수를 평가하는 빅보드입니다.
            OVERALL은 5개 점수의 평균이며, 높은 순서대로 정렬됩니다.
          </p>
        </div>

        <div className="heroStats wideStats">
          <div>
            <strong>{players.length}</strong>
            <span>Total Players</span>
          </div>
          <div>
            <strong>{filtered.length}</strong>
            <span>Results</span>
          </div>
          <div>
            <strong>{selectedYear}</strong>
            <span>Draft Year</span>
          </div>
        </div>
      </header>

      <section className="controls wideControls">
        <input
          className="search wideSearch"
          placeholder="Search player from all data..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="yearTabs">
          <button
            className={selectedYear === "ALL" ? "yearTab active" : "yearTab"}
            onClick={() => setSelectedYear("ALL")}
          >
            ALL
          </button>

          {years.map((year) => (
            <button
              key={year}
              className={
                String(selectedYear) === String(year)
                  ? "yearTab active"
                  : "yearTab"
              }
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </section>

      <div className="boardGrid">
        {paginatedPlayers.map((p, idx) => {
          const rank = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
          const tierClass = getTierClass(p.OVERALL);

          return (
            <div
              key={`${p.PLAYER_NAME}-${p.DRAFT_YEAR}-${idx}`}
              className={`playerCard ${tierClass}`}
              onClick={() =>
                navigate(
                  `/player/${encodeURIComponent(p.PLAYER_NAME)}/${p.DRAFT_YEAR}`
                )
              }
            >
              <div className="cardHeader">
                <div className="rankBadge">#{rank}</div>

                <div className="overallBadge">
                  <span>OVERALL</span>
                  <strong>{Math.floor(p.OVERALL)}</strong>
                </div>
              </div>

              <h2>{toTitleCase(p.PLAYER_NAME)}</h2>
              <p className="draftYear">Draft Year {p.DRAFT_YEAR}</p>

              <div className="miniScores">
                <div>
                  <span>PHY</span>
                  <strong>{Math.floor(p.PHYSICAL_SCORE_FINAL)}</strong>
                </div>
                <div>
                  <span>ATH</span>
                  <strong>{Math.floor(p.ATHLETIC_SCORE_FINAL)}</strong>
                </div>
                <div>
                  <span>SHT</span>
                  <strong>{Math.floor(p.SHOOTING_SCORE)}</strong>
                </div>
                <div>
                  <span>PLY</span>
                  <strong>{Math.floor(p.PLAYMAKING_SCORE)}</strong>
                </div>
                <div>
                  <span>DEF</span>
                  <strong>{Math.floor(p.DEFENSE_SCORE)}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function getTierClass(overall) {
  if (overall >= 70) return "elite";
  if (overall >= 65) return "great";
  if (overall >= 60) return "good";
  return "normal";
}

function toTitleCase(name) {
  return String(name)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}