import { useState, useEffect, useRef } from "react";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return mobile;
}

const ATHLETES = ["Tom", "Camille"];
const SPORTS = ["Course à pied", "Hyrox", "Musculation"];

const SPORT_ICONS = {
  "Course à pied": "🏃",
  "Hyrox": "⚡",
  "Musculation": "🏋️",
};

const SPORT_COLORS = {
  "Course à pied": { main: "#FF6B35", light: "#FF6B3520", border: "#FF6B3540" },
  "Hyrox": { main: "#00D4FF", light: "#00D4FF20", border: "#00D4FF40" },
  "Musculation": { main: "#A8FF3E", light: "#A8FF3E20", border: "#A8FF3E40" },
};

const HYROX_STATIONS = [
  "1000m SkiErg", "50m Sled Push", "50m Sled Pull", "80m Burpee Broad Jump",
  "1000m Rowing", "200m Farmers Carry", "100m Sandbag Lunges", "100 Wall Balls",
];

const RUNNING_DISTANCES = ["1km", "5km", "10km", "20km", "Semi-marathon", "Marathon", "Autre"];
const RUNNING_PR_DISTANCES = ["1km", "5km", "10km", "20km", "Semi-marathon", "Marathon"];
const DISTANCE_KM = { "1km": 1, "5km": 5, "10km": 10, "20km": 20, "Semi-marathon": 21.0975, "Marathon": 42.195 };

function calcPace(distanceLabel, timeStr) {
  const km = DISTANCE_KM[distanceLabel];
  if (!km) return "";
  const secs = parseTimeInput(timeStr);
  if (!secs) return "";
  const secsPerKm = secs / km;
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function calcPct(rank, total) {
  if (!rank || !total || isNaN(rank) || isNaN(total) || total === 0) return null;
  return ((parseInt(rank) / parseInt(total)) * 100).toFixed(1);
}

function RankDisplay({ rank, total, color }) {
  const pct = calcPct(rank, total);
  if (!rank && !total) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      {rank && total ? (
        <>
          <span style={{ color: color || "#fff", fontWeight: 800, fontSize: 14 }}>{rank}</span>
          <span style={{ color: "#444", fontSize: 12 }}>/ {total}</span>
          {pct && <span style={{ color: "#666", fontSize: 11, marginLeft: 2 }}>({pct}%)</span>}
        </>
      ) : rank ? (
        <span style={{ color: color || "#fff", fontWeight: 800, fontSize: 14 }}>#{rank}</span>
      ) : null}
    </div>
  );
}

function ActionButtons({ onEdit, onDelete, accentColor }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <button onClick={onEdit} title="Modifier" style={{
        width: 30, height: 30, borderRadius: 7, border: "1px solid #222",
        background: "transparent", color: "#555", fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}
      >✎</button>
      {confirmDelete ? (
        <>
          <button onClick={onDelete} style={{
            padding: "4px 10px", borderRadius: 7, border: "none",
            background: "#f8714422", color: "#f87144", fontWeight: 700, fontSize: 11,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>Confirmer</button>
          <button onClick={() => setConfirmDelete(false)} style={{
            padding: "4px 10px", borderRadius: 7, border: "1px solid #222",
            background: "transparent", color: "#555", fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}>Annuler</button>
        </>
      ) : (
        <button onClick={() => setConfirmDelete(true)} title="Supprimer" style={{
          width: 30, height: 30, borderRadius: 7, border: "1px solid #222",
          background: "transparent", color: "#555", fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#f87144"; e.currentTarget.style.color = "#f87144"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#555"; }}
        >×</button>
      )}
    </div>
  );
}

const EXERCISES = {
  "Compound": ["Squat", "Deadlift", "Bench Press", "Overhead Press", "Barbell Row", "Hip Thrust", "Romanian Deadlift", "Front Squat", "Sumo Deadlift"],
  "Haltères": ["Dumbbell Press", "Dumbbell Row", "Goblet Squat", "Lunges", "Split Squat", "Shoulder Press", "Curl biceps", "Triceps kickback"],
  "Tirage": ["Tractions", "Lat Pulldown", "Tirage horizontal", "Face Pull", "Tirage nuque"],
  "Cardio / Fonctionnel": ["Kettlebell Swing", "Box Jump", "Burpees", "Wall Ball", "Farmers Carry", "Sandbag Carry", "Sled Push", "Sled Pull"],
  "Isolation": ["Curl biceps barre", "Extension triceps", "Leg Curl", "Leg Extension", "Calf Raises", "Lateral Raise"],
  "Gainage / Core": ["Planche", "Crunch", "Russian Twist", "Ab Wheel", "Dead Bug", "Pallof Press"],
  "Autre": ["Autre (personnalisé)"],
};

const DEFAULT_RACE_NAMES = [
  "Cross de Sceaux",
  "20k de Paris",
  "10k Ekiden",
  "5k Ekiden",
  "Semi-marathon de Paris",
  "Marathon de Toulouse",
];

const defaultRunForm = { date: "", distance: "", time: "", pace: "", raceName: "", rankOverall: "", totalOverall: "", rankGender: "", totalGender: "", notes: "", athlete: "Tom" };
const HYROX_CATEGORIES = ["Solo", "Double Mixte", "Double Hommes", "Double Femmes"];
const defaultHyroxForm = { date: "", totalTime: "", runTime: "", roxzoneTime: "", category: "Solo", stations: {}, notes: "", athlete: "Tom" };
const defaultMuscuForm = { date: "", exercise: "", sets: "", reps: "", weight: "", notes: "", athlete: "Tom" };

function formatTime(seconds) {
  if (!seconds) return "-";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`;
  return `${m}m${String(s).padStart(2, "0")}s`;
}

function parseTimeInput(str) {
  if (!str) return null;
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function Badge({ color, children }) {
  return (
    <span style={{
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      borderRadius: "999px",
      padding: "2px 10px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>{children}</span>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#0f0f0f",
      border: `1px solid #1e1e1e`,
      borderRadius: "12px",
      padding: "16px 20px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ color: color || "#fff", fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{value || "—"}</div>
      {sub && <div style={{ color: "#555", fontSize: "12px", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function AthleteSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {ATHLETES.map(a => (
        <button key={a} onClick={() => onChange(a)} style={{
          padding: "6px 18px",
          borderRadius: "999px",
          border: value === a ? "1.5px solid #fff" : "1.5px solid #333",
          background: value === a ? "#fff" : "transparent",
          color: value === a ? "#000" : "#666",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.15s",
        }}>{a}</button>
      ))}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "#0d0d0d",
          border: "1px solid #222",
          borderRadius: 8,
          padding: "9px 12px",
          color: "#fff",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "#0d0d0d",
          border: "1px solid #222",
          borderRadius: 8,
          padding: "9px 12px",
          color: "#fff",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        style={{
          background: "#0d0d0d",
          border: "1px solid #222",
          borderRadius: 8,
          padding: "9px 12px",
          color: "#fff",
          fontSize: 14,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "inherit",
          resize: "vertical",
        }}
      />
    </div>
  );
}

// ── RUNNING RECORDS ───────────────────────────────────────────────────────────
function RunningRecords({ data }) {
  const col = SPORT_COLORS["Course à pied"];
  const [view, setView] = useState("PRs"); // "PRs" | "Progression"
  const [selectedRace, setSelectedRace] = useState("");

  const getPR = (athlete, distance) => {
    const runs = data.filter(r => r.athlete === athlete && r.distance === distance && r.secs);
    if (!runs.length) return null;
    return runs.reduce((best, r) => r.secs < best.secs ? r : best);
  };

  // Toutes les courses nommées ou distances ayant au moins 2 entrées combinées
  const raceOptions = [
    ...new Set(data.filter(r => r.raceName).map(r => r.raceName)),
    ...RUNNING_PR_DISTANCES.filter(d => data.filter(r => r.distance === d).length >= 2),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const getProgressionRuns = (key) => {
    const runs = data.filter(r => (r.raceName === key || r.distance === key) && r.secs && r.date);
    return [...runs].sort((a, b) => a.date.localeCompare(b.date));
  };

  const ATHLETE_COLORS = { [ATHLETES[0]]: col.main, [ATHLETES[1]]: "#fff" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* View toggle */}
      <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["PRs", "Progression"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 16px", borderRadius: 7, border: "none",
            background: view === v ? col.main : "transparent",
            color: view === v ? "#000" : "#555",
            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{v}</button>
        ))}
      </div>

      {view === "PRs" && <>
        <div style={{ color: "#555", fontSize: 13 }}>Meilleur temps enregistré par distance et par athlète.</div>
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
          <div style={{ minWidth: 420, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#0a0a0a" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a", color: "#444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Distance</div>
          {ATHLETES.map(a => (
            <div key={a} style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a", borderLeft: "1px solid #1a1a1a", color: "#fff", fontSize: 13, fontWeight: 800 }}>{a}</div>
          ))}
          {RUNNING_PR_DISTANCES.map((dist, i) => {
            const isLast = i === RUNNING_PR_DISTANCES.length - 1;
            const rowBg = i % 2 === 0 ? "#0a0a0a" : "#0d0d0d";
            return [
              <div key={dist + "_label"} style={{ padding: "16px 20px", background: rowBg, borderBottom: isLast ? "none" : "1px solid #161616" }}>
                <span style={{ color: "#888", fontWeight: 700, fontSize: 14 }}>{dist}</span>
              </div>,
              ...ATHLETES.map(a => {
                const pr = getPR(a, dist);
                return (
                  <div key={dist + a} style={{ padding: "16px 20px", background: rowBg, borderLeft: "1px solid #161616", borderBottom: isLast ? "none" : "1px solid #161616" }}>
                    {pr ? (
                      <div>
                        <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{formatTime(pr.secs)}</div>
                        <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>{pr.date}{pr.pace ? ` · ${pr.pace}/km` : ""}</div>
                      </div>
                    ) : <span style={{ color: "#2a2a2a", fontSize: 20, fontWeight: 800 }}>—</span>}
                  </div>
                );
              })
            ];
          })}
        </div>
        </div>

        {RUNNING_PR_DISTANCES.some(d => ATHLETES.some(a => getPR(a, d))) && (
          <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Comparaison visuelle</div>
            {RUNNING_PR_DISTANCES.map(dist => {
              const prs = ATHLETES.map(a => ({ athlete: a, pr: getPR(a, dist) })).filter(x => x.pr);
              if (!prs.length) return null;
              const maxSecs = Math.max(...prs.map(x => x.pr.secs));
              return (
                <div key={dist} style={{ marginBottom: 16 }}>
                  <div style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{dist}</div>
                  {prs.map(({ athlete, pr }) => (
                    <div key={athlete} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 60, color: "#777", fontSize: 12, fontWeight: 600 }}>{athlete}</div>
                      <div style={{ flex: 1, background: "#111", borderRadius: 4, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${(pr.secs / maxSecs) * 100}%`, height: "100%", background: col.main, borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                      <div style={{ color: col.main, fontWeight: 700, fontSize: 13, width: 80, textAlign: "right" }}>{formatTime(pr.secs)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </>}

      {view === "Progression" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Course ou distance</label>
            <select
              value={selectedRace}
              onChange={e => setSelectedRace(e.target.value)}
              style={{
                background: "#0d0d0d", border: "1px solid #222", borderRadius: 8,
                padding: "10px 14px", color: selectedRace ? "#fff" : "#555", fontSize: 14,
                outline: "none", fontFamily: "inherit", cursor: "pointer", maxWidth: 320,
              }}
            >
              <option value="">Choisir une course ou distance…</option>
              {raceOptions.length === 0 && <option disabled>Aucune donnée disponible</option>}
              {[...new Set(data.filter(r => r.raceName).map(r => r.raceName))].length > 0 && (
                <optgroup label="── Courses nommées">
                  {[...new Set(data.filter(r => r.raceName).map(r => r.raceName))].map(n => <option key={n} value={n}>{n}</option>)}
                </optgroup>
              )}
              {RUNNING_PR_DISTANCES.filter(d => data.filter(r => r.distance === d).length >= 1).length > 0 && (
                <optgroup label="── Par distance">
                  {RUNNING_PR_DISTANCES.filter(d => data.filter(r => r.distance === d).length >= 1).map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              )}
            </select>
          </div>

          {selectedRace && (() => {
            const runs = getProgressionRuns(selectedRace);
            if (!runs.length) return <div style={{ color: "#333", textAlign: "center", padding: 40 }}>Aucune donnée pour cette sélection.</div>;

            const allSecs = runs.map(r => r.secs);
            const minSecs = Math.min(...allSecs);
            const maxSecs = Math.max(...allSecs);
            const range = maxSecs - minSecs || 1;

            // Group by athlete
            const byAthlete = {};
            ATHLETES.forEach(a => { byAthlete[a] = runs.filter(r => r.athlete === a); });

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Legend */}
                <div style={{ display: "flex", gap: 20 }}>
                  {ATHLETES.filter(a => byAthlete[a].length > 0).map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ATHLETE_COLORS[a] }} />
                      <span style={{ color: "#888", fontSize: 12, fontWeight: 600 }}>{a}</span>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                {(() => {
                  const PAD_L = 70, PAD_R = 20, PAD_T = 16, PAD_B = 36;
                  const W = 800, H = 220;
                  const chartW = W - PAD_L - PAD_R;
                  const chartH = H - PAD_T - PAD_B;

                  const allDates = [...new Set(runs.map(r => r.date))].sort();
                  const minDate = new Date(allDates[0]).getTime();
                  const maxDate = new Date(allDates[allDates.length - 1]).getTime();
                  const dateSpan = maxDate - minDate || 1;

                  const toX = (date) => PAD_L + ((new Date(date).getTime() - minDate) / dateSpan) * chartW;
                  const toY = (secs) => PAD_T + ((maxSecs - secs) / range) * chartH;

                  // Dates à afficher sur l'axe X (max 6)
                  const xLabels = allDates.length <= 6 ? allDates : allDates.filter((_, i) => i % Math.ceil(allDates.length / 6) === 0 || i === allDates.length - 1);

                  // Y labels (3 niveaux)
                  const yLabels = [maxSecs, minSecs + (maxSecs - minSecs) / 2, minSecs];

                  return (
                    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "8px 0 0", overflow: "hidden" }}>
                      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                        {/* Grid lines horizontales */}
                        {yLabels.map((s, i) => {
                          const y = toY(s);
                          return (
                            <g key={i}>
                              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1e1e1e" strokeWidth="1" />
                              <text x={PAD_L - 8} y={y + 4} fill="#555" fontSize="11" textAnchor="end">{formatTime(Math.round(s))}</text>
                            </g>
                          );
                        })}

                        {/* Axe X */}
                        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#222" strokeWidth="1" />

                        {/* Labels X */}
                        {xLabels.map((d, i) => (
                          <text key={d} x={toX(d)} y={H - PAD_B + 18} fill="#555" fontSize="11" textAnchor="middle">{d.slice(0, 7)}</text>
                        ))}

                        {/* Courbes et points par athlète */}
                        {ATHLETES.filter(a => byAthlete[a].length > 0).map(a => {
                          const pts = byAthlete[a].map(r => ({ x: toX(r.date), y: toY(r.secs), r }));
                          const acol = ATHLETE_COLORS[a];
                          const isPR = (r) => r.secs === Math.min(...byAthlete[a].map(x => x.secs));

                          return (
                            <g key={a}>
                              {/* Ligne */}
                              {pts.length > 1 && (
                                <polyline
                                  points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                                  fill="none"
                                  stroke={acol}
                                  strokeWidth="2.5"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                  opacity="0.9"
                                />
                              )}
                              {/* Points */}
                              {pts.map((p, i) => {
                                const pr = isPR(p.r);
                                return (
                                  <g key={i}>
                                    {pr && <circle cx={p.x} cy={p.y} r="10" fill={acol} opacity="0.15" />}
                                    <circle cx={p.x} cy={p.y} r={pr ? 6 : 5} fill={acol} stroke="#0a0a0a" strokeWidth="2" />
                                    {pr && <text x={p.x} y={p.y - 14} fill={acol} fontSize="10" textAnchor="middle" fontWeight="700">★PR</text>}
                                    {/* Tooltip temps */}
                                    <text x={p.x} y={p.y + (p.y < PAD_T + 30 ? 20 : -14)} fill={acol} fontSize="10" textAnchor="middle" opacity="0.8">
                                      {pr ? "" : formatTime(p.r.secs)}
                                    </text>
                                  </g>
                                );
                              })}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  );
                })()}

                {/* Data table */}
                <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
                  <div style={{ minWidth: 500, display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 90px 90px 80px", borderBottom: "1px solid #1a1a1a", background: "#0d0d0d" }}>
                    {["Date", "Athlète", "Temps", "Allure", "Général", "Genre", "Évol."].map(h => (
                      <div key={h} style={{ padding: "10px 14px", color: "#444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                    ))}
                  </div>
                  {runs.map((r, i) => {
                    const prev = runs.slice(0, i).filter(p => p.athlete === r.athlete).pop();
                    const diff = prev ? r.secs - prev.secs : null;
                    const improved = diff !== null && diff < 0;
                    const acol = ATHLETE_COLORS[r.athlete];
                    const isPR = r.secs === Math.min(...runs.filter(x => x.athlete === r.athlete).map(x => x.secs));
                    return (
                      <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 90px 90px 80px", minWidth: 500, borderBottom: i < runs.length - 1 ? "1px solid #111" : "none", background: i % 2 === 0 ? "#0a0a0a" : "#0d0d0d" }}>
                        <div style={{ padding: "12px 14px", color: "#777", fontSize: 13 }}>
                          {r.date}
                          {isPR && <span style={{ marginLeft: 8, color: col.main, fontSize: 10, fontWeight: 800 }}>★ PR</span>}
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: acol, display: "inline-block", marginRight: 6 }} />
                          <span style={{ color: acol, fontSize: 12, fontWeight: 700 }}>{r.athlete}</span>
                        </div>
                        <div style={{ padding: "12px 14px", color: "#fff", fontWeight: 800, fontSize: 13 }}>{formatTime(r.secs)}</div>
                        <div style={{ padding: "12px 14px", color: "#555", fontSize: 12 }}>{r.pace ? `${r.pace}/km` : "—"}</div>
                        <div style={{ padding: "12px 14px" }}>
                          {r.rankOverall ? (
                            <div>
                              <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{r.rankOverall}</span>
                              {r.totalOverall && <span style={{ color: "#444", fontSize: 11 }}>/{r.totalOverall}</span>}
                              {calcPct(r.rankOverall, r.totalOverall) && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {calcPct(r.rankOverall, r.totalOverall)}%</div>}
                            </div>
                          ) : <span style={{ color: "#333" }}>—</span>}
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          {r.rankGender ? (
                            <div>
                              <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{r.rankGender}</span>
                              {r.totalGender && <span style={{ color: "#444", fontSize: 11 }}>/{r.totalGender}</span>}
                              {calcPct(r.rankGender, r.totalGender) && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {calcPct(r.rankGender, r.totalGender)}%</div>}
                            </div>
                          ) : <span style={{ color: "#333" }}>—</span>}
                        </div>
                        <div style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: diff === null ? "#333" : improved ? "#4ade80" : "#f87171" }}>
                          {diff === null ? "—" : `${improved ? "▼" : "▲"} ${formatTime(Math.abs(diff))}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {!selectedRace && raceOptions.length === 0 && (
            <div style={{ color: "#333", textAlign: "center", padding: 40, fontSize: 14 }}>
              Enregistrez au moins une activité pour voir la progression.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RUNNING TAB ───────────────────────────────────────────────────────────────
function RunningTab({ data, setData, raceNames, setRaceNames }) {
  const [subTab, setSubTab] = useState("Historique");
  const [form, setForm] = useState(defaultRunForm);
  const [filter, setFilter] = useState("Tous");
  const [editingId, setEditingId] = useState(null);
  const [newRaceName, setNewRaceName] = useState("");
  const [showAddRace, setShowAddRace] = useState(false);

  const addRaceName = () => {
    const trimmed = newRaceName.trim();
    if (!trimmed || raceNames.includes(trimmed)) return;
    setRaceNames([...raceNames, trimmed]);
    setNewRaceName("");
    setShowAddRace(false);
    update("raceName", trimmed);
  };

  const col = SPORT_COLORS["Course à pied"];

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.date || !form.distance || !form.time) return;
    const secs = parseTimeInput(form.time);
    const pace = calcPace(form.distance, form.time);
    if (editingId) {
      setData(d => d.map(r => r.id === editingId ? { ...form, secs, pace, id: editingId } : r));
      setEditingId(null);
    } else {
      setData(d => [...d, { ...form, secs, pace, id: Date.now() }]);
    }
    setForm(defaultRunForm);
  };

  const startEdit = (r) => {
    setForm({ ...r, time: r.secs ? `${String(Math.floor(r.secs/3600)).padStart(2,"0")}:${String(Math.floor((r.secs%3600)/60)).padStart(2,"0")}:${String(r.secs%60).padStart(2,"0")}` : "" });
    setEditingId(r.id);
    setSubTab("+");
  };

  const deleteRun = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = filter === "Tous" ? data : data.filter(r => r.athlete === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const best = (athlete) => {
    const runs = data.filter(r => r.athlete === athlete && r.secs);
    if (!runs.length) return null;
    return runs.reduce((b, r) => r.secs < b.secs ? r : b);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Records"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: subTab === t ? col.main : "transparent",
              color: subTab === t ? "#000" : "#555",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={() => setSubTab("+")} style={{
          width: 36, height: 36,
          borderRadius: 10,
          border: `1.5px solid ${subTab === "+" ? col.main : "#222"}`,
          background: subTab === "+" ? col.main : "transparent",
          color: subTab === "+" ? "#000" : "#555",
          fontWeight: 900,
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      </div>

      {subTab === "Records" && <RunningRecords data={data} />}

      {subTab === "+" && (
        <>
          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {ATHLETES.map(a => {
              const b = best(a);
              const runs = data.filter(r => r.athlete === a);
              return (
                <div key={a} style={{ flex: 1, minWidth: 200, background: "#0f0f0f", border: `1px solid ${col.border}`, borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{a}</span>
                    <span style={{ color: col.main, fontSize: 22 }}>🏃</span>
                  </div>
                  <div style={{ color: "#555", fontSize: 12 }}>{runs.length} sortie{runs.length > 1 ? "s" : ""}</div>
                  {b && <div style={{ color: col.main, fontSize: 13, marginTop: 6, fontWeight: 700 }}>PR: {b.distance} en {formatTime(b.secs)}</div>}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div style={{ background: "#0a0a0a", border: `1px solid #1a1a1a`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier la sortie" : "+ Ajouter une sortie"}</div>
              {editingId && <button onClick={() => { setEditingId(null); setForm(defaultRunForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#555", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }} className="form-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
                <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
              </div>
              <Input label="Date" type="date" value={form.date} onChange={v => update("date", v)} />
              <Select label="Distance" value={form.distance} onChange={v => update("distance", v)} options={RUNNING_DISTANCES} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Nom de la course</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select
                    value={form.raceName}
                    onChange={e => update("raceName", e.target.value)}
                    style={{
                      flex: 1, background: "#0d0d0d", border: "1px solid #222", borderRadius: 8,
                      padding: "9px 12px", color: form.raceName ? "#fff" : "#555", fontSize: 14,
                      outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    <option value="">— Optionnel —</option>
                    {raceNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button
                    onClick={() => setShowAddRace(v => !v)}
                    title="Ajouter une course"
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${showAddRace ? col.main : "#222"}`,
                      background: showAddRace ? col.main + "22" : "transparent",
                      color: showAddRace ? col.main : "#555", fontWeight: 900, fontSize: 18,
                      cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                </div>
                {showAddRace && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                      value={newRaceName}
                      onChange={e => setNewRaceName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addRaceName()}
                      placeholder="Nom de la nouvelle course..."
                      style={{
                        flex: 1, background: "#0d0d0d", border: `1px solid ${col.main}44`, borderRadius: 8,
                        padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <button onClick={addRaceName} style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: col.main, color: "#000", fontWeight: 800, fontSize: 12,
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    }}>Ajouter</button>
                  </div>
                )}
              </div>
              <Input label="Temps (hh:mm:ss)" value={form.time} onChange={v => update("time", v)} placeholder="00:45:30" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Allure /km</label>
                <div style={{
                  background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8,
                  padding: "9px 12px", fontSize: 14, minHeight: 38,
                  color: calcPace(form.distance, form.time) ? SPORT_COLORS["Course à pied"].main : "#333",
                  fontWeight: calcPace(form.distance, form.time) ? 700 : 400,
                }}>
                  {calcPace(form.distance, form.time) ? `${calcPace(form.distance, form.time)} /km` : "calculé auto."}
                </div>
              </div>
            </div>

            {/* Ranking section */}
            <div style={{ marginTop: 16, padding: "16px 18px", background: "#060606", border: "1px solid #161616", borderRadius: 10 }}>
              <div style={{ color: "#555", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Classement (optionnel)</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Rang général", rankKey: "rankOverall", totalKey: "totalOverall" },
                  { label: "Rang par genre", rankKey: "rankGender", totalKey: "totalGender" },
                ].map(({ label, rankKey, totalKey }) => (
                  <div key={rankKey} style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <label style={{ color: "#555", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#0d0d0d", border: "1px solid #222", borderRadius: 8, overflow: "hidden" }}>
                      <input
                        value={form[rankKey]}
                        onChange={e => update(rankKey, e.target.value)}
                        placeholder="Rang"
                        type="number" min="1"
                        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "9px 10px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      />
                      <span style={{ color: "#333", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>/</span>
                      <input
                        value={form[totalKey]}
                        onChange={e => update(totalKey, e.target.value)}
                        placeholder="Total"
                        type="number" min="1"
                        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", borderLeft: "1px solid #1a1a1a", padding: "9px 10px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      />
                    </div>
                    {calcPct(form[rankKey], form[totalKey]) && (
                      <div style={{ color: SPORT_COLORS["Course à pied"].main, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                        Top {calcPct(form[rankKey], form[totalKey])}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <Textarea label="Notes" value={form.notes} onChange={v => update("notes", v)} />
            </div>
            <button onClick={submit} style={{
              marginTop: 16,
              background: col.main,
              color: "#000",
              border: "none",
              borderRadius: 10,
              padding: "10px 24px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}>ENREGISTRER</button>
          </div>
        </>
      )}

      {subTab === "Historique" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 16px",
                borderRadius: "999px",
                border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222",
                background: filter === f ? col.light : "transparent",
                color: filter === f ? col.main : "#555",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}>{f}</button>
            ))}
          </div>
          {sorted.length === 0 ? (
            <div style={{ color: "#333", textAlign: "center", padding: 40, fontSize: 14 }}>Aucune sortie enregistrée</div>
          ) : sorted.map(r => (
            <div key={r.id} style={{
              padding: "14px 18px",
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: 12,
              marginBottom: 8,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Badge color={col.main}>{r.athlete}</Badge>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{r.distance}</span>
                    {r.raceName && <span style={{ color: "#666", fontSize: 12 }}>· {r.raceName}</span>}
                  </div>
                  <div style={{ color: "#555", fontSize: 12 }}>{r.date}{r.notes && ` · ${r.notes}`}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteRun(r.id)} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{formatTime(r.secs)}</div>
                    {r.pace && <div style={{ color: "#555", fontSize: 12 }}>{r.pace}/km</div>}
                  </div>
                </div>
              </div>
              {(r.rankOverall || r.rankGender) && (
                <div style={{ display: "flex", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid #141414" }}>
                  {r.rankOverall && (
                    <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ color: "#444", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Général</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexWrap: "nowrap" }}>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{r.rankOverall}</span>
                        {r.totalOverall && <span style={{ color: "#444", fontSize: 12, whiteSpace: "nowrap" }}>/ {r.totalOverall}</span>}
                      </div>
                      {calcPct(r.rankOverall, r.totalOverall) && (
                        <div style={{ color: col.main, fontSize: 11, fontWeight: 700, marginTop: 2 }}>top {calcPct(r.rankOverall, r.totalOverall)}%</div>
                      )}
                    </div>
                  )}
                  {r.rankGender && (
                    <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ color: "#444", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Par genre</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexWrap: "nowrap" }}>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{r.rankGender}</span>
                        {r.totalGender && <span style={{ color: "#444", fontSize: 12, whiteSpace: "nowrap" }}>/ {r.totalGender}</span>}
                      </div>
                      {calcPct(r.rankGender, r.totalGender) && (
                        <div style={{ color: col.main, fontSize: 11, fontWeight: 700, marginTop: 2 }}>top {calcPct(r.rankGender, r.totalGender)}%</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── HYROX RECORDS ─────────────────────────────────────────────────────────────
function HyroxRecords({ data }) {
  const col = SPORT_COLORS["Hyrox"];

  const getPR = (athlete) => {
    const records = data.filter(r => r.athlete === athlete && r.totalSecs);
    return records.length ? records.reduce((b, r) => r.totalSecs < b.totalSecs ? r : b) : null;
  };

  const allRaces = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PRs side by side */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {ATHLETES.map(a => {
          const pr = getPR(a);
          return (
            <div key={a} style={{ flex: 1, minWidth: 220, background: "#0a0a0a", border: `1px solid ${col.border}`, borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{a}</span>
                <span style={{ fontSize: 24 }}>⚡</span>
              </div>
              {pr ? (
                <>
                  <div style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 4 }}>Meilleur temps</div>
                  <div style={{ color: col.main, fontWeight: 900, fontSize: 32 }}>{formatTime(pr.totalSecs)}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                    <span style={{ color: "#444", fontSize: 12 }}>{pr.date}</span>
                    {pr.category && pr.category !== "Solo" && <Badge color="#555">{pr.category}</Badge>}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    {pr.runSecs && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#555", fontSize: 12 }}>Run</span><span style={{ color: "#aaa", fontSize: 12, fontWeight: 700 }}>{formatTime(pr.runSecs)}</span></div>}
                    {pr.roxzoneSecs && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#555", fontSize: 12 }}>Roxzone</span><span style={{ color: col.main, fontSize: 12, fontWeight: 700 }}>{formatTime(pr.roxzoneSecs)}</span></div>}
                  </div>
                  {pr.stationSecs && Object.values(pr.stationSecs).some(Boolean) && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: "#444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Stations</div>
                      {Object.entries(pr.stationSecs).map(([s, t]) => t && (
                        <div key={s} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#555", fontSize: 12 }}>{s}</span>
                          <span style={{ color: col.main, fontWeight: 700, fontSize: 12 }}>{formatTime(t)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: "#333", fontSize: 14 }}>Aucune course enregistrée</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progression chronologique */}
      {allRaces.length > 0 && (
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Toutes les performances</div>
          {ATHLETES.map(a => {
            const races = allRaces.filter(r => r.athlete === a);
            if (!races.length) return null;
            const best = races.filter(r => r.totalSecs).reduce((b, r) => r.totalSecs < b.totalSecs ? r : b, races[0]);
            return (
              <div key={a} style={{ marginBottom: 20 }}>
                <div style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{a}</div>
                {races.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ color: "#555", fontSize: 12, width: 80 }}>{r.date}</div>
                    <div style={{ flex: 1, background: "#111", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      {r.totalSecs && <div style={{
                        width: `${(best.totalSecs / r.totalSecs) * 100}%`,
                        height: "100%",
                        background: r.id === best.id ? col.main : col.main + "66",
                        borderRadius: 4,
                      }} />}
                    </div>
                    <div style={{ color: r.id === best.id ? col.main : "#777", fontWeight: r.id === best.id ? 800 : 600, fontSize: 13, width: 80, textAlign: "right" }}>
                      {formatTime(r.totalSecs)}
                      {r.id === best.id && <span style={{ fontSize: 10, marginLeft: 4 }}>★PR</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HYROX TAB ─────────────────────────────────────────────────────────────────
function HyroxTab({ data, setData }) {
  const [subTab, setSubTab] = useState("Historique");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultHyroxForm);
  const [filter, setFilter] = useState("Tous");

  const col = SPORT_COLORS["Hyrox"];

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateStation = (s, v) => setForm(f => ({ ...f, stations: { ...f.stations, [s]: v } }));

  const submit = () => {
    if (!form.date || !form.totalTime) return;
    const totalSecs = parseTimeInput(form.totalTime);
    const runSecs = parseTimeInput(form.runTime);
    const roxzoneSecs = parseTimeInput(form.roxzoneTime);
    const stationSecs = {};
    Object.entries(form.stations).forEach(([k, v]) => { stationSecs[k] = parseTimeInput(v); });
    if (editingId) {
      setData(d => d.map(r => r.id === editingId ? { ...form, totalSecs, runSecs, roxzoneSecs, stationSecs, id: editingId } : r));
      setEditingId(null);
    } else {
      setData(d => [...d, { ...form, totalSecs, runSecs, roxzoneSecs, stationSecs, id: Date.now() }]);
    }
    setForm(defaultHyroxForm);
  };

  const secsToStr = (s) => s ? `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}` : "";

  const startEdit = (r) => {
    const stationsStr = {};
    if (r.stationSecs) Object.entries(r.stationSecs).forEach(([k, v]) => { stationsStr[k] = v ? `${String(Math.floor(v/60)).padStart(2,"0")}:${String(v%60).padStart(2,"0")}` : ""; });
    setForm({ ...r, totalTime: secsToStr(r.totalSecs), runTime: secsToStr(r.runSecs), roxzoneTime: secsToStr(r.roxzoneSecs), stations: stationsStr });
    setEditingId(r.id);
    setSubTab("+");
  };

  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = filter === "Tous" ? data : data.filter(r => r.athlete === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Records"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: subTab === t ? col.main : "transparent",
              color: subTab === t ? "#000" : "#555",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={() => setSubTab("+")} style={{
          width: 36, height: 36,
          borderRadius: 10,
          border: `1.5px solid ${subTab === "+" ? col.main : "#222"}`,
          background: subTab === "+" ? col.main : "transparent",
          color: subTab === "+" ? "#000" : "#555",
          fontWeight: 900,
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      </div>

      {subTab === "Records" && <HyroxRecords data={data} />}

      {subTab === "+" && (
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier la course" : "+ Ajouter une course Hyrox"}</div>
            {editingId && <button onClick={() => { setEditingId(null); setForm(defaultHyroxForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#555", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }} className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
              <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
            </div>
            <Input label="Date" type="date" value={form.date} onChange={v => update("date", v)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Catégorie</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HYROX_CATEGORIES.map(c => (
                  <button key={c} onClick={() => update("category", c)} style={{
                    padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${form.category === c ? col.main : "#222"}`,
                    background: form.category === c ? col.main + "22" : "transparent",
                    color: form.category === c ? col.main : "#555",
                    fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <Input label="Temps total" value={form.totalTime} onChange={v => update("totalTime", v)} placeholder="01:15:00" />
            <Input label="Temps de run" value={form.runTime} onChange={v => update("runTime", v)} placeholder="00:35:00" />
            <Input label="Temps Roxzone" value={form.roxzoneTime} onChange={v => update("roxzoneTime", v)} placeholder="00:40:00" />
          </div>
          <div style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Temps par station</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
            {HYROX_STATIONS.map(s => (
              <Input key={s} label={s} value={form.stations[s] || ""} onChange={v => updateStation(s, v)} placeholder="mm:ss" />
            ))}
          </div>
          <Textarea label="Notes" value={form.notes} onChange={v => update("notes", v)} />
          <button onClick={submit} style={{
            marginTop: 16, background: col.main, color: "#000", border: "none",
            borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>ENREGISTRER</button>
        </div>
      )}

      {subTab === "Historique" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 16px", borderRadius: "999px",
                border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222",
                background: filter === f ? col.light : "transparent",
                color: filter === f ? col.main : "#555",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}>{f}</button>
            ))}
          </div>
          {sorted.length === 0 ? (
            <div style={{ color: "#333", textAlign: "center", padding: 40, fontSize: 14 }}>Aucune course Hyrox enregistrée</div>
          ) : sorted.map(r => (
            <div key={r.id} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "16px 20px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                    <Badge color={col.main}>{r.athlete}</Badge>
                    {r.category && r.category !== "Solo" && <Badge color="#555">{r.category}</Badge>}
                    <span style={{ color: "#555", fontSize: 12 }}>{r.date}</span>
                  </div>
                  {r.notes && <div style={{ color: "#555", fontSize: 12 }}>{r.notes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteEntry(r.id)} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: col.main, fontWeight: 800, fontSize: 20 }}>{formatTime(r.totalSecs)}</div>
                    {r.runSecs && <div style={{ color: "#555", fontSize: 12 }}>Run: {formatTime(r.runSecs)}</div>}
                    {r.roxzoneSecs && <div style={{ color: "#555", fontSize: 12 }}>Roxzone: {formatTime(r.roxzoneSecs)}</div>}
                  </div>
                </div>
              </div>
              {r.stationSecs && Object.keys(r.stationSecs).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {Object.entries(r.stationSecs).map(([s, t]) => t && (
                    <div key={s} style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                      <span style={{ color: "#666" }}>{s}: </span>
                      <span style={{ color: col.main, fontWeight: 700 }}>{formatTime(t)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MUSCULATION RECORDS ───────────────────────────────────────────────────────
function MusculationRecords({ data }) {
  const col = SPORT_COLORS["Musculation"];
  const allExercises = [...new Set(data.map(r => r.exercise))].sort();

  const getPR = (athlete, exercise) => {
    const sets = data.filter(r => r.athlete === athlete && r.exercise === exercise && r.weight);
    if (!sets.length) return null;
    return sets.reduce((b, r) => parseFloat(r.weight) > parseFloat(b.weight) ? r : b);
  };

  if (!allExercises.length) return (
    <div style={{ color: "#333", textAlign: "center", padding: 60, fontSize: 14 }}>Aucun exercice enregistré pour l'instant.</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ color: "#555", fontSize: 13 }}>Meilleure charge enregistrée par exercice.</div>

      <div style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 14,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ padding: "12px 20px", color: "#444", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Exercice</div>
          {ATHLETES.map(a => (
            <div key={a} style={{ padding: "12px 20px", borderLeft: "1px solid #1a1a1a", color: "#fff", fontSize: 13, fontWeight: 800 }}>{a}</div>
          ))}
        </div>

        {allExercises.map((ex, i) => {
          const isLast = i === allExercises.length - 1;
          const rowBg = i % 2 === 0 ? "#0a0a0a" : "#0d0d0d";
          const prs = ATHLETES.map(a => getPR(a, ex));
          const maxWeight = Math.max(...prs.filter(Boolean).map(p => parseFloat(p.weight)));
          return (
            <div key={ex} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: isLast ? "none" : "1px solid #161616" }}>
              <div style={{ padding: "14px 20px", background: rowBg }}>
                <span style={{ color: "#888", fontWeight: 700, fontSize: 14 }}>{ex}</span>
              </div>
              {ATHLETES.map((a, ai) => {
                const pr = getPR(a, ex);
                const isTop = pr && parseFloat(pr.weight) === maxWeight;
                return (
                  <div key={a} style={{ padding: "14px 20px", background: rowBg, borderLeft: "1px solid #161616" }}>
                    {pr ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ color: isTop ? col.main : "#aaa", fontWeight: 800, fontSize: 20 }}>{pr.weight}</span>
                          <span style={{ color: isTop ? col.main + "99" : "#555", fontSize: 12, fontWeight: 600 }}>kg</span>
                          {isTop && prs.filter(Boolean).length > 1 && <span style={{ fontSize: 10, color: col.main, marginLeft: 4 }}>★</span>}
                        </div>
                        <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>{pr.sets && pr.reps ? `${pr.sets}×${pr.reps}` : ""} {pr.date}</div>
                      </div>
                    ) : (
                      <span style={{ color: "#2a2a2a", fontSize: 20, fontWeight: 800 }}>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Barre visuelle par exercice */}
      <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 16 }}>Comparaison visuelle</div>
        {allExercises.map(ex => {
          const prs = ATHLETES.map(a => ({ athlete: a, pr: getPR(a, ex) })).filter(x => x.pr);
          if (!prs.length) return null;
          const maxW = Math.max(...prs.map(x => parseFloat(x.pr.weight)));
          return (
            <div key={ex} style={{ marginBottom: 16 }}>
              <div style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{ex}</div>
              {prs.map(({ athlete, pr }) => (
                <div key={athlete} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 60, color: "#777", fontSize: 12, fontWeight: 600 }}>{athlete}</div>
                  <div style={{ flex: 1, background: "#111", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{
                      width: `${(parseFloat(pr.weight) / maxW) * 100}%`,
                      height: "100%",
                      background: col.main,
                      borderRadius: 4,
                    }} />
                  </div>
                  <div style={{ color: col.main, fontWeight: 700, fontSize: 13, width: 60, textAlign: "right" }}>{pr.weight} kg</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MUSCULATION TAB ───────────────────────────────────────────────────────────
function MusculationTab({ data, setData }) {
  const [subTab, setSubTab] = useState("Historique");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultMuscuForm);
  const [filter, setFilter] = useState("Tous");
  const [exFilter, setExFilter] = useState("");

  const col = SPORT_COLORS["Musculation"];

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const finalExercise = form.exercise === "Autre (personnalisé)" ? (form.customExercise || "Autre") : form.exercise;
    if (!form.date || !finalExercise) return;
    if (editingId) {
      setData(d => d.map(r => r.id === editingId ? { ...form, exercise: finalExercise, id: editingId } : r));
      setEditingId(null);
    } else {
      setData(d => [...d, { ...form, exercise: finalExercise, id: Date.now() }]);
    }
    setForm(prev => ({ ...defaultMuscuForm, athlete: prev.athlete, date: prev.date, exercise: prev.exercise }));
  };

  const startEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setSubTab("+"); };
  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = data
    .filter(r => filter === "Tous" || r.athlete === filter)
    .filter(r => !exFilter || r.exercise.toLowerCase().includes(exFilter.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  // PRs per exercise per athlete
  const prs = {};
  data.forEach(r => {
    if (!r.weight) return;
    const key = `${r.athlete}::${r.exercise}`;
    if (!prs[key] || parseFloat(r.weight) > parseFloat(prs[key])) prs[key] = r.weight;
  });

  const allExercises = [...new Set(data.map(r => r.exercise))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Records"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: subTab === t ? col.main : "transparent",
              color: subTab === t ? "#000" : "#555",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={() => setSubTab("+")} style={{
          width: 36, height: 36,
          borderRadius: 10,
          border: `1.5px solid ${subTab === "+" ? col.main : "#222"}`,
          background: subTab === "+" ? col.main : "transparent",
          color: subTab === "+" ? "#000" : "#555",
          fontWeight: 900,
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      </div>

      {subTab === "Records" && <MusculationRecords data={data} />}

      {subTab === "+" && (
        <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier la série" : "+ Ajouter une série"}</div>
            {editingId && <button onClick={() => { setEditingId(null); setForm(defaultMuscuForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#555", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }} className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
              <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
            </div>
            <Input label="Date" type="date" value={form.date} onChange={v => update("date", v)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Exercice</label>
              <select
                value={form.exercise}
                onChange={e => update("exercise", e.target.value)}
                style={{
                  background: "#0d0d0d", border: "1px solid #222", borderRadius: 8,
                  padding: "9px 12px", color: form.exercise ? "#fff" : "#555", fontSize: 14,
                  outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer",
                }}
              >
                <option value="" disabled>Choisir...</option>
                {Object.entries(EXERCISES).map(([group, exList]) => (
                  <optgroup key={group} label={"── " + group}>
                    {exList.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </optgroup>
                ))}
              </select>
              {form.exercise === "Autre (personnalisé)" && (
                <input
                  value={form.customExercise || ""}
                  onChange={e => update("customExercise", e.target.value)}
                  placeholder="Nom de l'exercice..."
                  style={{
                    background: "#0d0d0d", border: "1px solid #333", borderRadius: 8,
                    padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none",
                    width: "100%", boxSizing: "border-box", fontFamily: "inherit", marginTop: 6,
                  }}
                />
              )}
            </div>
            <Input label="Séries" type="number" value={form.sets} onChange={v => update("sets", v)} placeholder="4" />
            <Input label="Répétitions" type="number" value={form.reps} onChange={v => update("reps", v)} placeholder="8" />
            <Input label="Charge (kg)" type="number" value={form.weight} onChange={v => update("weight", v)} placeholder="80" />
          </div>
          <div style={{ marginTop: 12 }}>
            <Textarea label="Notes" value={form.notes} onChange={v => update("notes", v)} />
          </div>
          <button onClick={submit} style={{
            marginTop: 16, background: col.main, color: "#000", border: "none",
            borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>ENREGISTRER</button>
        </div>
      )}

      {subTab === "Historique" && (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["Tous", ...ATHLETES].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "5px 16px", borderRadius: "999px",
                  border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222",
                  background: filter === f ? col.light : "transparent",
                  color: filter === f ? col.main : "#555",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>{f}</button>
              ))}
            </div>
            <input
              value={exFilter}
              onChange={e => setExFilter(e.target.value)}
              placeholder="Filtrer exercice..."
              style={{
                background: "#0d0d0d", border: "1px solid #222", borderRadius: 8,
                padding: "6px 12px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
              }}
            />
          </div>
          {sorted.length === 0 ? (
            <div style={{ color: "#333", textAlign: "center", padding: 40, fontSize: 14 }}>Aucune séance enregistrée</div>
          ) : (
            <div>
              {sorted.map(r => (
                <div key={r.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 18px", background: "#0a0a0a", border: "1px solid #1a1a1a",
                  borderRadius: 12, marginBottom: 8,
                }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <Badge color={col.main}>{r.athlete}</Badge>
                      <span style={{ color: "#fff", fontWeight: 700 }}>{r.exercise}</span>
                    </div>
                    <div style={{ color: "#555", fontSize: 12 }}>{r.date}{r.notes && ` · ${r.notes}`}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      {r.weight && <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{r.weight} kg</div>}
                      {(r.sets || r.reps) && <div style={{ color: "#555", fontSize: 12 }}>{r.sets && `${r.sets} séries`}{r.reps && ` × ${r.reps} reps`}</div>}
                    </div>
                    <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteEntry(r.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── PR NOTIFICATION ───────────────────────────────────────────────────────────
function PRToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: "#1a1a1a", border: "1px solid #A8FF3E44",
      borderRadius: 14, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px #00000088",
      animation: "slideIn 0.3s ease",
    }}>
      <span style={{ fontSize: 24 }}>🏆</span>
      <div>
        <div style={{ color: "#A8FF3E", fontWeight: 800, fontSize: 13 }}>Nouveau record personnel !</div>
        <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{message}</div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", marginLeft: 8 }}>×</button>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ runData, hyroxData, muscuData }) {
  const recent = [
    ...runData.map(r => ({ ...r, sport: "Course à pied" })),
    ...hyroxData.map(r => ({ ...r, sport: "Hyrox" })),
    ...muscuData.map(r => ({ ...r, sport: "Musculation" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  // PRs par athlète
  const getRunPRs = (athlete) => {
    const prs = {};
    RUNNING_PR_DISTANCES.forEach(dist => {
      const runs = runData.filter(r => r.athlete === athlete && r.distance === dist && r.secs);
      if (runs.length) prs[dist] = runs.reduce((b, r) => r.secs < b.secs ? r : b);
    });
    return prs;
  };

  const getHyroxPR = (athlete) => {
    const races = hyroxData.filter(r => r.athlete === athlete && r.totalSecs);
    return races.length ? races.reduce((b, r) => r.totalSecs < b.totalSecs ? r : b) : null;
  };

  const getMuscuPRs = (athlete) => {
    const prs = {};
    muscuData.filter(r => r.athlete === athlete && r.weight).forEach(r => {
      if (!prs[r.exercise] || parseFloat(r.weight) > parseFloat(prs[r.exercise].weight)) prs[r.exercise] = r;
    });
    return prs;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cartes athlètes */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {ATHLETES.map(a => {
          const runPRs = getRunPRs(a);
          const hyroxPR = getHyroxPR(a);
          const muscuPRs = getMuscuPRs(a);
          const totalActivities = runData.filter(r => r.athlete === a).length + hyroxData.filter(r => r.athlete === a).length + muscuData.filter(r => r.athlete === a).length;

          return (
            <div key={a} style={{ flex: 1, minWidth: 260, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{a}</div>
                <div style={{ color: "#444", fontSize: 12 }}>{totalActivities} activité{totalActivities > 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <StatCard label="Sorties run" value={runData.filter(r => r.athlete === a).length} color={SPORT_COLORS["Course à pied"].main} />
                <StatCard label="Hyrox" value={hyroxData.filter(r => r.athlete === a).length} color={SPORT_COLORS["Hyrox"].main} />
                <StatCard label="Muscu" value={muscuData.filter(r => r.athlete === a).length} color={SPORT_COLORS["Musculation"].main} />
              </div>

              {/* PRs résumé */}
              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14 }}>
                <div style={{ color: "#444", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>🏆 Records</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(runPRs).slice(0, 3).map(([dist, pr]) => (
                    <div key={dist} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#555", fontSize: 12 }}>🏃 {dist}</span>
                      <span style={{ color: SPORT_COLORS["Course à pied"].main, fontWeight: 700, fontSize: 12 }}>{formatTime(pr.secs)}</span>
                    </div>
                  ))}
                  {hyroxPR && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#555", fontSize: 12 }}>⚡ Hyrox</span>
                      <span style={{ color: SPORT_COLORS["Hyrox"].main, fontWeight: 700, fontSize: 12 }}>{formatTime(hyroxPR.totalSecs)}</span>
                    </div>
                  )}
                  {Object.entries(muscuPRs).slice(0, 2).map(([ex, pr]) => (
                    <div key={ex} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#555", fontSize: 12 }}>🏋️ {ex}</span>
                      <span style={{ color: SPORT_COLORS["Musculation"].main, fontWeight: 700, fontSize: 12 }}>{pr.weight} kg</span>
                    </div>
                  ))}
                  {!Object.keys(runPRs).length && !hyroxPR && !Object.keys(muscuPRs).length && (
                    <div style={{ color: "#333", fontSize: 12 }}>Aucun record encore</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activité récente */}
      <div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Activité récente</div>
        {recent.length === 0 ? (
          <div style={{ color: "#333", textAlign: "center", padding: 40 }}>Aucune activité pour l'instant. Commencez à enregistrer !</div>
        ) : recent.map(r => {
          const col = SPORT_COLORS[r.sport];
          return (
            <div key={r.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 18px", background: "#0a0a0a", border: "1px solid #1a1a1a",
              borderRadius: 12, marginBottom: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{SPORT_ICONS[r.sport]}</span>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Badge color={col.main}>{r.athlete}</Badge>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.sport}</span>
                    {r.raceName && <span style={{ color: "#555", fontSize: 12 }}>· {r.raceName}</span>}
                  </div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{r.date}</div>
                </div>
              </div>
              <div style={{ color: col.main, fontWeight: 700, fontSize: 15 }}>
                {r.sport === "Course à pied" && r.secs ? formatTime(r.secs) : ""}
                {r.sport === "Hyrox" && r.totalSecs ? formatTime(r.totalSecs) : ""}
                {r.sport === "Musculation" && r.weight ? `${r.weight}kg` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── FIREBASE ──────────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDl3eJd7g-CHsqR2omtKueVcv8bxOHswao",
  authDomain: "spinetovic-sport-tracker.firebaseapp.com",
  databaseURL: "https://spinetovic-sport-tracker-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "spinetovic-sport-tracker",
  storageBucket: "spinetovic-sport-tracker.firebasestorage.app",
  messagingSenderId: "445883101396",
  appId: "1:445883101396:web:f71c0c653b12d50b2ecb41"
};

// Initialisation Firebase partagée
let _firebaseDb = null;

async function getFirebaseDb() {
  if (_firebaseDb) return _firebaseDb;
  const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getDatabase } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  _firebaseDb = getDatabase(app);
  return _firebaseDb;
}

function useFirebase(path) {
  const [data, setData] = useState([]);
  const [ready, setReady] = useState(false);
  const dbRef = useRef(null);

  useEffect(() => {
    let unsubscribe;
    (async () => {
      try {
        const db = await getFirebaseDb();
        const { ref, onValue, set } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
        const r = ref(db, path);
        dbRef.current = { ref: r, set };
        unsubscribe = onValue(r, snap => {
          const val = snap.val();
          setData(val ? Object.values(val) : []);
          setReady(true);
        });
      } catch (e) {
        console.error("Firebase error:", e);
        setReady(true);
      }
    })();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [path]);

  const setAndSync = (updater) => {
    setData(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (dbRef.current) {
        const obj = {};
        next.forEach(item => { obj[item.id] = item; });
        dbRef.current.set(dbRef.current.ref, Object.keys(obj).length ? obj : null);
      }
      return next;
    });
  };

  return [data, setAndSync, ready];
}

function useFirebaseValue(path, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const dbRef = useRef(null);

  useEffect(() => {
    let unsubscribe;
    (async () => {
      try {
        const db = await getFirebaseDb();
        const { ref, onValue, set } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
        const r = ref(db, path);
        dbRef.current = { ref: r, set };
        unsubscribe = onValue(r, snap => {
          const val = snap.val();
          setValue(val !== null ? val : defaultValue);
        });
      } catch (e) { console.error(e); }
    })();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [path]);

  const setAndSync = (newVal) => {
    setValue(newVal);
    if (dbRef.current) dbRef.current.set(dbRef.current.ref, newVal);
  };

  return [value, setAndSync];
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [prToast, setPrToast] = useState(null);

  const [runData, setRunDataRaw, runReady] = useFirebase("runs");
  const [hyroxData, setHyroxDataRaw, hyroxReady] = useFirebase("hyrox");
  const [muscuData, setMuscuDataRaw, muscuReady] = useFirebase("muscu");
  const [raceNames, setRaceNamesRaw] = useFirebaseValue("raceNames", DEFAULT_RACE_NAMES);

  const allReady = runReady && hyroxReady && muscuReady;
  const tabs = ["Dashboard", "Course à pied", "Hyrox", "Musculation"];

  const setRunData = (updater) => {
    setRunDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.length > prev.length) {
        const newEntry = next[next.length - 1];
        if (newEntry?.secs && newEntry?.distance) {
          const prevBest = prev.filter(r => r.athlete === newEntry.athlete && r.distance === newEntry.distance && r.secs);
          const wasPR = !prevBest.length || newEntry.secs < Math.min(...prevBest.map(r => r.secs));
          if (wasPR) setPrToast(`${newEntry.athlete} — ${newEntry.distance} en ${formatTime(newEntry.secs)} 🎉`);
        }
      }
      return next;
    });
  };

  const setHyroxData = (updater) => {
    setHyroxDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.length > prev.length) {
        const newEntry = next[next.length - 1];
        if (newEntry?.totalSecs) {
          const prevBest = prev.filter(r => r.athlete === newEntry.athlete && r.totalSecs);
          const wasPR = !prevBest.length || newEntry.totalSecs < Math.min(...prevBest.map(r => r.totalSecs));
          if (wasPR) setPrToast(`${newEntry.athlete} — Hyrox en ${formatTime(newEntry.totalSecs)} 🎉`);
        }
      }
      return next;
    });
  };

  const setMuscuData = (updater) => {
    setMuscuDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.length > prev.length) {
        const newEntry = next[next.length - 1];
        if (newEntry?.weight && newEntry?.exercise) {
          const prevBest = prev.filter(r => r.athlete === newEntry.athlete && r.exercise === newEntry.exercise && r.weight);
          const wasPR = !prevBest.length || parseFloat(newEntry.weight) > Math.max(...prevBest.map(r => parseFloat(r.weight)));
          if (wasPR) setPrToast(`${newEntry.athlete} — ${newEntry.exercise} : ${newEntry.weight}kg 🎉`);
        }
      }
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#fff", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.4; }
        select option { background: #111; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input, select, textarea, button { font-size: 16px !important; }
        @media (max-width: 640px) {
          .header-pad { padding: 16px 16px 0 !important; }
          .content-pad { padding: 16px !important; }
          .header-title { font-size: 20px !important; }
          .nav-btn { padding: 8px 10px !important; font-size: 11px !important; }
          .grid-auto { grid-template-columns: 1fr 1fr !important; }
          .grid-single { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
          .pr-table { font-size: 11px !important; }
          .pr-table-col { grid-template-columns: 1fr 1fr 1fr !important; }
          .form-grid { grid-template-columns: 1fr 1fr !important; }
          .prog-table { grid-template-columns: 80px 60px 70px 60px !important; overflow-x: auto; }
        }
      `}</style>

      {prToast && <PRToast message={prToast} onClose={() => setPrToast(null)} />}

      {/* Header */}
      <div className="header-pad" style={{ padding: "28px 32px 0", borderBottom: "1px solid #111" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div className="header-title" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
            TOM <span style={{ color: "#333" }}>&</span> CAMILLE
          </div>
          <div className="hide-mobile" style={{ color: "#444", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sport Tracker</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {allReady ? (
              <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} /><span style={{ color: "#444", fontSize: 11 }}>Synchronisé</span></>
            ) : (
              <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B35", animation: "spin 1s linear infinite" }} /><span style={{ color: "#555", fontSize: 11 }}>Connexion…</span></>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map(t => {
            const isActive = tab === t;
            const col = t !== "Dashboard" ? SPORT_COLORS[t]?.main : "#fff";
            return (
              <button key={t} className="nav-btn" onClick={() => setTab(t)} style={{
                padding: "10px 20px", background: "transparent", border: "none",
                borderBottom: isActive ? `2px solid ${col}` : "2px solid transparent",
                color: isActive ? col : "#444", fontWeight: isActive ? 800 : 600,
                fontSize: 13, cursor: "pointer", letterSpacing: "0.02em",
                transition: "all 0.15s", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {SPORT_ICONS[t] ? SPORT_ICONS[t] + " " : ""}{t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="content-pad" style={{ padding: "28px 32px", maxWidth: 960, margin: "0 auto" }}>
        {!allReady ? (
          <div style={{ textAlign: "center", padding: 80, color: "#444" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 14 }}>Connexion à Firebase…</div>
          </div>
        ) : (
          <>
            {tab === "Dashboard" && <Dashboard runData={runData} hyroxData={hyroxData} muscuData={muscuData} />}
            {tab === "Course à pied" && <RunningTab data={runData} setData={setRunData} raceNames={raceNames} setRaceNames={setRaceNamesRaw} />}
            {tab === "Hyrox" && <HyroxTab data={hyroxData} setData={setHyroxData} />}
            {tab === "Musculation" && <MusculationTab data={muscuData} setData={setMuscuData} />}
          </>
        )}
      </div>
    </div>
  );
}
