import { useState, useEffect, useRef } from "react";

const ATHLETES = ["Tom", "Camille"];

const SPORT_ICONS = {
  "Course à pied": "🏃",
  "Hyrox": "⚡",
  "Karting": "🏎️",
  "Poids & Corps": "⚖️",
};

const SPORT_COLORS = {
  "Course à pied": { main: "#FF6B35", light: "#FF6B3520", border: "#FF6B3540" },
  "Hyrox": { main: "#00D4FF", light: "#00D4FF20", border: "#00D4FF40" },
  "Karting": { main: "#F5C518", light: "#F5C51820", border: "#F5C51840" },
  "Poids & Corps": { main: "#C084FC", light: "#C084FC20", border: "#C084FC40" },
};

const HYROX_STATIONS = [
  "1000m SkiErg", "50m Sled Push", "50m Sled Pull", "80m Burpee Broad Jump",
  "1000m Rowing", "200m Farmers Carry", "100m Sandbag Lunges", "100 Wall Balls",
];

// 16 checkpoints dans l'ordre de course : Run puis Station alternés
const HYROX_CHECKPOINTS = [
  "Fin Run 1", "Fin SkiErg",
  "Fin Run 2", "Fin Sled Push",
  "Fin Run 3", "Fin Sled Pull",
  "Fin Run 4", "Fin Burpee BJ",
  "Fin Run 5", "Fin Rowing",
  "Fin Run 6", "Fin Farmers Carry",
  "Fin Run 7", "Fin Sandbag Lunges",
  "Fin Run 8", "Fin Wall Balls",
];

const HYROX_RUNS = [
  "Run 1 (avant SkiErg)",
  "Run 2 (avant Sled Push)",
  "Run 3 (avant Sled Pull)",
  "Run 4 (avant Burpee BJ)",
  "Run 5 (avant Rowing)",
  "Run 6 (avant Farmers)",
  "Run 7 (avant Sandbag)",
  "Run 8 (avant Wall Ball)",
];

const RUNNING_DISTANCES = ["5km", "10km", "20km", "Semi-marathon", "Marathon", "Autre"];
const RUNNING_PR_DISTANCES = ["5km", "10km", "20km", "Semi-marathon", "Marathon"];
const DISTANCE_KM = { "5km": 5, "10km": 10, "20km": 20, "Semi-marathon": 21.0975, "Marathon": 42.195 };

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
          <span style={{ color: "#71717a", fontSize: 12 }}>/ {total}</span>
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
        background: "transparent", color: "#888", fontSize: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#3f3f46"; e.currentTarget.style.color = "#888"; }}
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
            background: "transparent", color: "#888", fontWeight: 700, fontSize: 11, cursor: "pointer",
          }}>Annuler</button>
        </>
      ) : (
        <button onClick={() => setConfirmDelete(true)} title="Supprimer" style={{
          width: 30, height: 30, borderRadius: 7, border: "1px solid #222",
          background: "transparent", color: "#888", fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#f87144"; e.currentTarget.style.color = "#f87144"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#3f3f46"; e.currentTarget.style.color = "#888"; }}
        >×</button>
      )}
    </div>
  );
}

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
const defaultHyroxForm = { date: "", eventName: "", totalTime: "", runTime: "", roxzoneTime: "", category: "Solo", partner: "", stations: {}, runs: {}, checkpoints: {}, notes: "", athlete: "Tom" };

const MOIS = ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sep.", "oct.", "nov.", "déc."];
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${parseInt(d)} ${MOIS[parseInt(m) - 1]} ${y}`;
}

function formatTime(seconds) {  if (!seconds) return "-";
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

// ── ACTIVITY MODAL ────────────────────────────────────────────────────────────
function ActivityModal({ entry, onClose, onEdit, templates }) {
  if (!entry) return null;
  const type = entry._modalType;
  const col = SPORT_COLORS[
    type === "run" ? "Course à pied" :
    type === "hyrox" ? "Hyrox" :
    type === "karting" ? "Karting" :
    "Poids & Corps"
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.7)", display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1f1f23", border: `1px solid ${col.border}`,
        borderRadius: 20, padding: "24px 28px", width: "100%", maxWidth: 520,
        maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <Badge color={col.main}>{entry.athlete}</Badge>
              {type === "hyrox" && entry._isTraining && <Badge color="#a78bfa">Entraînement</Badge>}
              {type === "hyrox" && !entry._isTraining && <Badge color={col.main}>Course</Badge>}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>
              {type === "run" && (entry.raceName || entry.distance)}
              {type === "hyrox" && !entry._isTraining && (entry.eventName || "Hyrox")}
              {type === "hyrox" && entry._isTraining && (templates?.find(t => String(t.id) === String(entry.templateId))?.name || "Entraînement")}
              {type === "karting" && (entry.circuit || "RKO Angerville")}
            </div>
            <div style={{ color: "#71717a", fontSize: 13, marginTop: 2 }}>{formatDate(entry.date)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {onEdit && (
              <button onClick={() => { onEdit(entry); onClose(); }} style={{
                background: "transparent", border: `1px solid ${col.main}55`,
                borderRadius: 8, color: col.main, fontSize: 13, cursor: "pointer",
                padding: "0 14px", height: 32, fontFamily: "inherit", fontWeight: 700,
                display: "flex", alignItems: "center", gap: 5,
              }}>✎ Modifier</button>
            )}
            <button onClick={onClose} style={{
              background: "transparent", border: "1px solid #3f3f46",
              borderRadius: 8, color: "#888", fontSize: 18, cursor: "pointer",
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        {/* ── COURSE À PIED ── */}
        {type === "run" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {entry.distance && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Distance</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{entry.distance}</div>
              </div>}
              {entry.secs && <div style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Temps</div>
                <div style={{ color: col.main, fontWeight: 900, fontSize: 22 }}>{formatTime(entry.secs)}</div>
              </div>}
              {entry.pace && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Allure</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{entry.pace}/km</div>
              </div>}
            </div>
            {(entry.rankOverall || entry.rankGender) && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {entry.rankOverall && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                  <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Classement général</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{entry.rankOverall}{entry.totalOverall ? `/${entry.totalOverall}` : ""}</div>
                  {calcPct(entry.rankOverall, entry.totalOverall) && <div style={{ color: col.main, fontSize: 11 }}>top {calcPct(entry.rankOverall, entry.totalOverall)}%</div>}
                </div>}
                {entry.rankGender && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                  <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Classement genre</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{entry.rankGender}{entry.totalGender ? `/${entry.totalGender}` : ""}</div>
                  {calcPct(entry.rankGender, entry.totalGender) && <div style={{ color: col.main, fontSize: 11 }}>top {calcPct(entry.rankGender, entry.totalGender)}%</div>}
                </div>}
              </div>
            )}
            {entry.notes && <div style={{ color: "#71717a", fontSize: 13, fontStyle: "italic" }}>{entry.notes}</div>}
          </div>
        )}

        {/* ── HYROX COURSE ── */}
        {type === "hyrox" && !entry._isTraining && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {entry.totalSecs && <div style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Temps total</div>
                <div style={{ color: col.main, fontWeight: 900, fontSize: 22 }}>{formatTime(entry.totalSecs)}</div>
              </div>}
              {entry.runSecs && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Run total</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{formatTime(entry.runSecs)}</div>
              </div>}
              {entry.roxzoneSecs && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Roxzone</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{formatTime(entry.roxzoneSecs)}</div>
              </div>}
            </div>
            {entry.category && entry.category !== "Solo" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge color="#888">{entry.category}</Badge>
                {entry.partner && <span style={{ color: "#888", fontSize: 13 }}>avec {entry.partner}</span>}
              </div>
            )}
            {entry.stationSecs && Object.values(entry.stationSecs).some(Boolean) && (
              <div>
                <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Stations</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {HYROX_STATIONS.map(s => entry.stationSecs[s] ? (
                    <div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #27272a" }}>
                      <span style={{ color: "#888", fontSize: 13 }}>{s}</span>
                      <span style={{ color: col.main, fontWeight: 700, fontSize: 13 }}>{formatTime(entry.stationSecs[s])}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
            {entry.runSecs_splits && Object.values(entry.runSecs_splits).some(Boolean) && (
              <div>
                <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Splits de run</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {HYROX_RUNS.map((run, i) => entry.runSecs_splits[run] ? (
                    <div key={run} style={{ background: "#27272a", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                      <span style={{ color: "#555" }}>R{i+1} </span>
                      <span style={{ color: "#aaa", fontWeight: 700 }}>{formatTime(entry.runSecs_splits[run])}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
            {entry.notes && <div style={{ color: "#71717a", fontSize: 13, fontStyle: "italic" }}>{entry.notes}</div>}
          </div>
        )}

        {/* ── HYROX ENTRAÎNEMENT ── */}
        {type === "hyrox" && entry._isTraining && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {entry.totalTime && <div style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Temps total</div>
                <div style={{ color: col.main, fontWeight: 900, fontSize: 22 }}>{entry.totalTime}</div>
              </div>}
              {entry.isShared && entry.trainingPartner && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Partenaire</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>{entry.trainingPartner}</div>
              </div>}
            </div>
            {(() => {
              const tpl = templates?.find(t => String(t.id) === String(entry.templateId));
              if (!tpl || !entry.segments) return null;
              return (
                <div>
                  <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Segments</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {tpl.segments.map((seg, i) => {
                      const timeStr = entry.segments[i];
                      if (!timeStr) return null;
                      const isRun = seg.type === "Run" || seg.type === "Vélo";
                      const distKm = seg.distance ? (seg.unit === "km" ? parseFloat(seg.distance) : parseFloat(seg.distance) / 1000) : null;
                      const secs = parseTimeInput(timeStr);
                      const pace = isRun && secs && distKm ? (() => {
                        const spk = secs / distKm;
                        return `${Math.floor(spk/60)}:${String(Math.round(spk%60)).padStart(2,"0")}/km`;
                      })() : null;
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #27272a" }}>
                          <span style={{ color: "#888", fontSize: 13 }}>{seg.distance ? `${seg.distance}${seg.unit} ` : ""}{seg.type}</span>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {pace && <span style={{ color: "#a78bfa", fontSize: 11 }}>{pace}</span>}
                            <span style={{ color: col.main, fontWeight: 700, fontSize: 13 }}>{timeStr}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {entry.notes && <div style={{ color: "#71717a", fontSize: 13, fontStyle: "italic" }}>{entry.notes}</div>}
          </div>
        )}

        {/* ── KARTING ── */}
        {type === "karting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Session</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>{entry.session}</div>
              </div>
              {entry.group && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Groupe</div>
                <div style={{ color: "#fff", fontWeight: 700 }}>{entry.group}</div>
              </div>}
              {entry.rank && <div style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Place</div>
                <div style={{ color: col.main, fontWeight: 900, fontSize: 22 }}>P{entry.rank}{entry.total ? <span style={{ color: "#555", fontSize: 14, fontWeight: 400 }}>/{entry.total}</span> : ""}</div>
                {calcPct(entry.rank, entry.total) && <div style={{ color: col.main, fontSize: 11 }}>top {calcPct(entry.rank, entry.total)}%</div>}
              </div>}
              {entry.bestLap && <div style={{ background: "#27272a", borderRadius: 10, padding: "10px 16px" }}>
                <div style={{ color: "#71717a", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Meilleur tour</div>
                <div style={{ color: "#fff", fontWeight: 700, fontFamily: "monospace", fontSize: 16 }}>{entry.bestLap}</div>
              </div>}
            </div>
            {entry.notes && <div style={{ color: "#71717a", fontSize: 13, fontStyle: "italic" }}>{entry.notes}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Rechercher…" }) {
  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#52525b", fontSize: 14, pointerEvents: "none" }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: "#27272a", border: "1px solid #3f3f46",
          borderRadius: 8, padding: "7px 12px 7px 32px", color: "#fff",
          fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        }}
      />
      {value && (
        <button onClick={() => onChange("")} style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "#52525b", fontSize: 16,
          cursor: "pointer", lineHeight: 1, padding: 0,
        }}>×</button>
      )}
    </div>
  );
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
      background: "#1f1f23",
      border: `1px solid #1e1e1e`,
      borderRadius: "12px",
      padding: "16px 20px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ color: color || "#fff", fontSize: "26px", fontWeight: 800, lineHeight: 1 }}>{value || "—"}</div>
      {sub && <div style={{ color: "#888", fontSize: "12px", marginTop: 4 }}>{sub}</div>}
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
          background: "#27272a",
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
          background: "#27272a",
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
          background: "#27272a",
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
  const [selectedRaceNames, setSelectedRaceNames] = useState(null);

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
      <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["PRs", "Progression"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 16px", borderRadius: 7, border: "none",
            background: view === v ? col.main : "transparent",
            color: view === v ? "#000" : "#888",
            fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{v}</button>
        ))}
      </div>

      {view === "PRs" && <>
        <div style={{ color: "#888", fontSize: 13 }}>Meilleur temps enregistré par distance et par athlète.</div>
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
          <div style={{ minWidth: 420, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#1f1f23" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a", color: "#71717a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Distance</div>
          {ATHLETES.map(a => (
            <div key={a} style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a", borderLeft: "1px solid #1a1a1a", color: "#fff", fontSize: 13, fontWeight: 800 }}>{a}</div>
          ))}
          {RUNNING_PR_DISTANCES.map((dist, i) => {
            const isLast = i === RUNNING_PR_DISTANCES.length - 1;
            const rowBg = i % 2 === 0 ? "#1f1f23" : "#27272a";
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
                        <div style={{ color: "#71717a", fontSize: 11, marginTop: 2 }}>{formatDate(pr.date)}{pr.pace ? ` · ${pr.pace}/km` : ""}</div>
                      </div>
                    ) : <span style={{ color: "#3f3f46", fontSize: 20, fontWeight: 800 }}>—</span>}
                  </div>
                );
              })
            ];
          })}
        </div>
        </div>

        {RUNNING_PR_DISTANCES.some(d => ATHLETES.some(a => getPR(a, d))) && (
          <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
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
                      <div style={{ flex: 1, background: "#2a2a2e", borderRadius: 4, height: 8, overflow: "hidden" }}>
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
              onChange={e => { setSelectedRace(e.target.value); setSelectedRaceNames(null); }}
              style={{
                background: "#27272a", border: "1px solid #222", borderRadius: 8,
                padding: "10px 14px", color: selectedRace ? "#fff" : "#888", fontSize: 14,
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
            const allRuns = getProgressionRuns(selectedRace);
            if (!allRuns.length) return <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Aucune donnée pour cette sélection.</div>;

            // Noms de courses disponibles dans cette sélection (si vue par distance)
            const availableRaceNames = [...new Set(allRuns.filter(r => r.raceName).map(r => r.raceName))];
            const isDistanceView = RUNNING_PR_DISTANCES.includes(selectedRace);
            const activeNames = selectedRaceNames ?? availableRaceNames;

            // Filtrer les runs selon les courses sélectionnées
            const runs = isDistanceView && availableRaceNames.length > 1
              ? allRuns.filter(r => !r.raceName || activeNames.includes(r.raceName))
              : allRuns;

            const toggleRaceName = (name) => {
              const current = selectedRaceNames ?? availableRaceNames;
              if (current.includes(name)) {
                if (current.length === 1) return; // garder au moins 1
                setSelectedRaceNames(current.filter(n => n !== name));
              } else {
                setSelectedRaceNames([...current, name]);
              }
            };

            const allSecs = runs.map(r => r.secs);
            if (!runs.length) return (
              <div style={{ color: "#71717a", textAlign: "center", padding: 40, fontSize: 13 }}>
                Aucune sortie pour cette sélection de courses.
              </div>
            );
            const minSecs = Math.min(...allSecs);
            const maxSecs = Math.max(...allSecs);
            const range = maxSecs - minSecs || 1;

            // Group by athlete
            const byAthlete = {};
            ATHLETES.forEach(a => { byAthlete[a] = runs.filter(r => r.athlete === a); });

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Filtre par nom de course (si vue par distance avec plusieurs courses) */}
                {isDistanceView && availableRaceNames.length > 1 && (
                  <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 16px" }}>
                    <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Filtrer par course</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availableRaceNames.map(name => {
                        const isActive = activeNames.includes(name);
                        return (
                          <button key={name} onClick={() => toggleRaceName(name)} style={{
                            padding: "5px 14px", borderRadius: 999,
                            border: `1.5px solid ${isActive ? col.main : "#3f3f46"}`,
                            background: isActive ? col.main + "22" : "transparent",
                            color: isActive ? col.main : "#888",
                            fontWeight: 700, fontSize: 12, cursor: "pointer",
                            fontFamily: "inherit", transition: "all 0.15s",
                          }}>
                            {isActive ? "✓ " : ""}{name}
                          </button>
                        );
                      })}
                      <button onClick={() => setSelectedRaceNames(availableRaceNames)} style={{
                        padding: "5px 14px", borderRadius: 999, border: "1px solid #1a1a1a",
                        background: "transparent", color: "#52525b", fontWeight: 600, fontSize: 11,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>Tout sélectionner</button>
                    </div>
                  </div>
                )}
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
                    <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, padding: "8px 0 0", overflow: "hidden" }}>
                      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                        {/* Grid lines horizontales */}
                        {yLabels.map((s, i) => {
                          const y = toY(s);
                          return (
                            <g key={i}>
                              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#2e2e33" strokeWidth="1" />
                              <text x={PAD_L - 8} y={y + 4} fill="#888" fontSize="11" textAnchor="end">{formatTime(Math.round(s))}</text>
                            </g>
                          );
                        })}

                        {/* Axe X */}
                        <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="#3f3f46" strokeWidth="1" />

                        {/* Labels X */}
                        {xLabels.map((d, i) => (
                          <text key={d} x={toX(d)} y={H - PAD_B + 18} fill="#888" fontSize="11" textAnchor="middle">{d.slice(0, 7)}</text>
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
                                    <circle cx={p.x} cy={p.y} r={pr ? 6 : 5} fill={acol} stroke="#1f1f23" strokeWidth="2" />
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
                <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
                  <div style={{ minWidth: 500, display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 90px 90px 80px", borderBottom: "1px solid #1a1a1a", background: "#27272a" }}>
                    {["Date", "Athlète", "Temps", "Allure", "Général", "Genre", "Évol."].map(h => (
                      <div key={h} style={{ padding: "10px 14px", color: "#71717a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                    ))}
                  </div>
                  {runs.map((r, i) => {
                    const prev = runs.slice(0, i).filter(p => p.athlete === r.athlete).pop();
                    const diff = prev ? r.secs - prev.secs : null;
                    const improved = diff !== null && diff < 0;
                    const acol = ATHLETE_COLORS[r.athlete];
                    const isPR = r.secs === Math.min(...runs.filter(x => x.athlete === r.athlete).map(x => x.secs));
                    return (
                      <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 90px 90px 80px", minWidth: 500, borderBottom: i < runs.length - 1 ? "1px solid #111" : "none", background: i % 2 === 0 ? "#1f1f23" : "#27272a" }}>
                        <div style={{ padding: "12px 14px", color: "#777", fontSize: 13 }}>
                          {formatDate(r.date)}
                          {isPR && <span style={{ marginLeft: 8, color: col.main, fontSize: 10, fontWeight: 800 }}>★ PR</span>}
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: acol, display: "inline-block", marginRight: 6 }} />
                          <span style={{ color: acol, fontSize: 12, fontWeight: 700 }}>{r.athlete}</span>
                        </div>
                        <div style={{ padding: "12px 14px", color: "#fff", fontWeight: 800, fontSize: 13 }}>{formatTime(r.secs)}</div>
                        <div style={{ padding: "12px 14px", color: "#888", fontSize: 12 }}>{r.pace ? `${r.pace}/km` : "—"}</div>
                        <div style={{ padding: "12px 14px" }}>
                          {r.rankOverall ? (
                            <div>
                              <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{r.rankOverall}</span>
                              {r.totalOverall && <span style={{ color: "#71717a", fontSize: 11 }}>/{r.totalOverall}</span>}
                              {calcPct(r.rankOverall, r.totalOverall) && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {calcPct(r.rankOverall, r.totalOverall)}%</div>}
                            </div>
                          ) : <span style={{ color: "#52525b" }}>—</span>}
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          {r.rankGender ? (
                            <div>
                              <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{r.rankGender}</span>
                              {r.totalGender && <span style={{ color: "#71717a", fontSize: 11 }}>/{r.totalGender}</span>}
                              {calcPct(r.rankGender, r.totalGender) && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {calcPct(r.rankGender, r.totalGender)}%</div>}
                            </div>
                          ) : <span style={{ color: "#52525b" }}>—</span>}
                        </div>
                        <div style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: diff === null ? "#52525b" : improved ? "#4ade80" : "#f87171" }}>
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
            <div style={{ color: "#52525b", textAlign: "center", padding: 40, fontSize: 14 }}>
              Enregistrez au moins une activité pour voir la progression.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── RUNNING TAB ───────────────────────────────────────────────────────────────
function RunningTab({ data, setData, raceNames, setRaceNames, upcomingEvents, setUpcomingEvents }) {
  const [subTab, setSubTab] = useState("Historique");
  const [form, setForm] = useState(defaultRunForm);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
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
  const searchFiltered = search.trim() ? filtered.filter(r => [r.raceName, r.distance, r.notes].some(v => v?.toLowerCase().includes(search.toLowerCase()))) : filtered;
  const sorted = [...searchFiltered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const best = (athlete) => {
    const runs = data.filter(r => r.athlete === athlete && r.secs);
    if (!runs.length) return null;
    return runs.reduce((b, r) => r.secs < b.secs ? r : b);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <UpcomingEventsBanner sport="Course à pied" upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Records"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding: "7px 18px",
              borderRadius: 7,
              border: "none",
              background: subTab === t ? col.main : "transparent",
              color: subTab === t ? "#000" : "#888",
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
          border: `1.5px solid ${subTab === "+" ? "#e53e3e" : "#52525b"}`,
          background: subTab === "+" ? "#e53e3e" : "transparent",
          color: subTab === "+" ? "#fff" : "#888",
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
                <div key={a} style={{ flex: 1, minWidth: 200, background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 14, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{a}</span>
                    <span style={{ color: col.main, fontSize: 22 }}>🏃</span>
                  </div>
                  <div style={{ color: "#888", fontSize: 12 }}>{runs.length} sortie{runs.length > 1 ? "s" : ""}</div>
                  {b && <div style={{ color: col.main, fontSize: 13, marginTop: 6, fontWeight: 700 }}>PR: {b.distance} en {formatTime(b.secs)}</div>}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div style={{ background: "#1f1f23", border: `1px solid #1a1a1a`, borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier la sortie" : "+ Ajouter une sortie"}</div>
              {editingId && <button onClick={() => { setEditingId(null); setForm(defaultRunForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
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
                      flex: 1, background: "#27272a", border: "1px solid #222", borderRadius: 8,
                      padding: "9px 12px", color: form.raceName ? "#fff" : "#888", fontSize: 14,
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
                      width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${showAddRace ? col.main : "#3f3f46"}`,
                      background: showAddRace ? col.main + "22" : "transparent",
                      color: showAddRace ? col.main : "#888", fontWeight: 900, fontSize: 18,
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
                        flex: 1, background: "#27272a", border: `1px solid ${col.main}44`, borderRadius: 8,
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
                  background: "#27272a", border: "1px solid #1a1a1a", borderRadius: 8,
                  padding: "9px 12px", fontSize: 14, minHeight: 38,
                  color: calcPace(form.distance, form.time) ? SPORT_COLORS["Course à pied"].main : "#52525b",
                  fontWeight: calcPace(form.distance, form.time) ? 700 : 400,
                }}>
                  {calcPace(form.distance, form.time) ? `${calcPace(form.distance, form.time)} /km` : "calculé auto."}
                </div>
              </div>
            </div>

            {/* Ranking section */}
            <div style={{ marginTop: 16, padding: "16px 18px", background: "#18181b", border: "1px solid #161616", borderRadius: 10 }}>
              <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Classement (optionnel)</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Rang général", rankKey: "rankOverall", totalKey: "totalOverall" },
                  { label: "Rang par genre", rankKey: "rankGender", totalKey: "totalGender" },
                ].map(({ label, rankKey, totalKey }) => (
                  <div key={rankKey} style={{ flex: "1 1 200px", minWidth: 0 }}>
                    <label style={{ color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#27272a", border: "1px solid #222", borderRadius: 8, overflow: "hidden" }}>
                      <input
                        value={form[rankKey]}
                        onChange={e => update(rankKey, e.target.value)}
                        placeholder="Rang"
                        type="number" min="1"
                        style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", padding: "9px 10px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                      />
                      <span style={{ color: "#52525b", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>/</span>
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
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 16px",
                borderRadius: "999px",
                border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222",
                background: filter === f ? col.light : "transparent",
                color: filter === f ? col.main : "#888",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}>{f}</button>
            ))}
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une course, distance…" />
          </div>
          {sorted.length === 0 ? (
            <div style={{ color: "#52525b", textAlign: "center", padding: 40, fontSize: 14 }}>{search ? "Aucun résultat pour cette recherche" : "Aucune sortie enregistrée"}</div>
          ) : sorted.map(r => (
            <div key={r.id} onClick={() => setSelectedEntry({ ...r, _modalType: "run" })} style={{
              padding: "14px 18px",
              background: "#1f1f23",
              border: "1px solid #303036",
              borderRadius: 12,
              marginBottom: 8,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = col.main + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#303036"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Badge color={col.main}>{r.athlete}</Badge>
                    <span style={{ color: "#fff", fontWeight: 700 }}>{r.distance}</span>
                    {r.raceName && <span style={{ color: "#666", fontSize: 12 }}>· {r.raceName}</span>}
                  </div>
                  <div style={{ color: "#aaa", fontSize: 12, fontWeight: 600 }}>{formatDate(r.date)}{r.notes && <span style={{ color: "#555", fontWeight: 400 }}> · {r.notes}</span>}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }} onClick={e => e.stopPropagation()}>
                  <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteRun(r.id)} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{formatTime(r.secs)}</div>
                    {r.pace && <div style={{ color: "#888", fontSize: 12 }}>{r.pace}/km</div>}
                  </div>
                </div>
              </div>
              {(r.rankOverall || r.rankGender) && (
                <div style={{ display: "flex", gap: 10, marginTop: 10, paddingTop: 10, borderTop: "1px solid #141414" }}>
                  {r.rankOverall && (
                    <div style={{ flex: 1, background: "#27272a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Général</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexWrap: "nowrap" }}>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{r.rankOverall}</span>
                        {r.totalOverall && <span style={{ color: "#71717a", fontSize: 12, whiteSpace: "nowrap" }}>/ {r.totalOverall}</span>}
                      </div>
                      {calcPct(r.rankOverall, r.totalOverall) && (
                        <div style={{ color: col.main, fontSize: 11, fontWeight: 700, marginTop: 2 }}>top {calcPct(r.rankOverall, r.totalOverall)}%</div>
                      )}
                    </div>
                  )}
                  {r.rankGender && (
                    <div style={{ flex: 1, background: "#27272a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Par genre</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 3, flexWrap: "nowrap" }}>
                        <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{r.rankGender}</span>
                        {r.totalGender && <span style={{ color: "#71717a", fontSize: 12, whiteSpace: "nowrap" }}>/ {r.totalGender}</span>}
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
      <ActivityModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} onEdit={r => startEdit(r)} />
    </div>
  );
}

// ── HYROX COMPARISON ──────────────────────────────────────────────────────────
function HyroxComparison({ data }) {
  const col = SPORT_COLORS["Hyrox"];
  const [raceA, setRaceA] = useState("");
  const [raceB, setRaceB] = useState("");

  const raceLabel = (r) => `${r.eventName ? r.eventName + " — " : ""}${formatDate(r.date)} · ${r.athlete}${r.category !== "Solo" ? ` (${r.category})` : ""}`;

  const races = [...data].filter(r => r.totalSecs).sort((a, b) => b.date.localeCompare(a.date));
  const a = races.find(r => String(r.id) === String(raceA));
  const b = races.find(r => String(r.id) === String(raceB));

  const SelectRow = ({ label, value, onChange }) => (
    <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: "#27272a", border: `1px solid ${col.border}`, borderRadius: 8, padding: "9px 12px", color: value ? "#fff" : "#888", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
        <option value="">Choisir une course…</option>
        {races.map(r => <option key={r.id} value={r.id}>{raceLabel(r)}</option>)}
      </select>
    </div>
  );

  const diffStyle = (sA, sB) => {
    if (!sA || !sB) return {};
    return sA < sB
      ? { color: "#4ade80", fontWeight: 800 }
      : sA > sB
      ? { color: "#f87171", fontWeight: 800 }
      : { color: "#888" };
  };

  const diffLabel = (sA, sB) => {
    if (!sA || !sB) return "";
    const d = sA - sB;
    if (d === 0) return "=";
    return `${d < 0 ? "▼" : "▲"} ${formatTime(Math.abs(d))}`;
  };

  const CompRow = ({ label, sA, sB, highlight }) => {
    const best = sA && sB ? (sA <= sB ? "A" : "B") : null;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #111", background: highlight ? "#27272a" : "#1f1f23" }}>
        <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#777", fontSize: 12 }}>{label}</span>
        </div>
        <div style={{ padding: "11px 16px", borderLeft: "1px solid #161616" }}>
          {sA ? (
            <span style={{ ...diffStyle(sA, sB), fontSize: 14 }}>
              {formatTime(sA)}
              {best === "A" && sA !== sB && <span style={{ marginLeft: 6, fontSize: 10, color: "#4ade80" }}>★</span>}
            </span>
          ) : <span style={{ color: "#3f3f46" }}>—</span>}
        </div>
        <div style={{ padding: "11px 16px", borderLeft: "1px solid #161616" }}>
          {sB ? (
            <span style={{ ...diffStyle(sB, sA), fontSize: 14 }}>
              {formatTime(sB)}
              {best === "B" && sA !== sB && <span style={{ marginLeft: 6, fontSize: 10, color: "#4ade80" }}>★</span>}
            </span>
          ) : <span style={{ color: "#3f3f46" }}>—</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Sélecteurs */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <SelectRow label="Course A" value={raceA} onChange={setRaceA} />
        <SelectRow label="Course B" value={raceB} onChange={setRaceB} />
      </div>

      {!a && !b && raceA === "" && raceB === "" && (
        <div style={{ color: "#52525b", textAlign: "center", padding: 40, fontSize: 14 }}>
          Sélectionnez deux courses pour les comparer.
        </div>
      )}

      {(a || b) && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#27272a", borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ padding: "12px 16px", color: "#71717a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Segment</div>
            <div style={{ padding: "12px 16px", borderLeft: "1px solid #1a1a1a" }}>
              {a ? (
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{a.eventName || a.athlete}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{formatDate(a.date)} · {a.athlete}</div>
                </div>
              ) : <span style={{ color: "#52525b" }}>—</span>}
            </div>
            <div style={{ padding: "12px 16px", borderLeft: "1px solid #1a1a1a" }}>
              {b ? (
                <div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{b.eventName || b.athlete}</div>
                  <div style={{ color: "#888", fontSize: 11 }}>{formatDate(b.date)} · {b.athlete}</div>
                </div>
              ) : <span style={{ color: "#52525b" }}>—</span>}
            </div>
          </div>

          {/* Totaux */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#2a2a2e", borderBottom: "2px solid #222" }}>
            <div style={{ padding: "14px 16px", color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Temps total</div>
            <div style={{ padding: "14px 16px", borderLeft: "1px solid #222" }}>
              <span style={{ ...diffStyle(a?.totalSecs, b?.totalSecs), fontSize: 20 }}>{a ? formatTime(a.totalSecs) : "—"}</span>
            </div>
            <div style={{ padding: "14px 16px", borderLeft: "1px solid #222" }}>
              <span style={{ ...diffStyle(b?.totalSecs, a?.totalSecs), fontSize: 20 }}>{b ? formatTime(b.totalSecs) : "—"}</span>
            </div>
          </div>
          <CompRow label="Run total" sA={a?.runSecs} sB={b?.runSecs} />
          <CompRow label="Roxzone total" sA={a?.roxzoneSecs} sB={b?.roxzoneSecs} />

          {/* Séparateur Runs */}
          <div style={{ padding: "8px 16px", background: "#2a2a2e", color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Splits de run
          </div>
          {HYROX_RUNS.map((run, i) => (
            <CompRow key={run} label={`Run ${i + 1}`}
              sA={a?.runSecs_splits?.[run]}
              sB={b?.runSecs_splits?.[run]}
            />
          ))}

          {/* Séparateur Stations */}
          <div style={{ padding: "8px 16px", background: "#2a2a2e", color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Stations
          </div>
          {HYROX_STATIONS.map((station, i) => (
            <CompRow key={station} label={station}
              sA={a?.stationSecs?.[station]}
              sB={b?.stationSecs?.[station]}
              highlight={i % 2 === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── HYROX RECORDS ─────────────────────────────────────────────────────────────
// ── HYROX LIVE TRACKER ───────────────────────────────────────────────────────
function HyroxLiveTracker({ data }) {
  const col = SPORT_COLORS["Hyrox"];

  // Modes : "manual" (saisie libre) | "coach" (mode live)
  const [mode, setMode] = useState("coach");

  // ── Mode Manuel ──
  const [currentTime, setCurrentTime] = useState("");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState("");
  const [manualAthlete, setManualAthlete] = useState(ATHLETES[0]);

  // ── Mode Coach ──
  const [coachAthlete, setCoachAthlete] = useState(ATHLETES[0]);
  const [coachRunning, setCoachRunning] = useState(false);
  const [coachStartTime, setCoachStartTime] = useState(null);
  const [coachElapsed, setCoachElapsed] = useState(0);
  const [coachCheckpointIdx, setCoachCheckpointIdx] = useState(0);
  const [coachSplits, setCoachSplits] = useState({});
  const timerRef = useRef(null);

  const allRacesWithCheckpoints = data.filter(r => r.checkpointSecs && Object.keys(r.checkpointSecs).length > 0);
  const racesWithCheckpoints = allRacesWithCheckpoints.filter(r => r.athlete === coachAthlete);
  const manualRaces = allRacesWithCheckpoints.filter(r => r.athlete === manualAthlete);

  const raceLabel = (r) => {
    const cat = r.category && r.category !== "Solo" ? r.category : "Solo";
    const partner = r.partner ? ` · ${r.partner}` : "";
    return `${r.eventName || formatDate(r.date)} (${cat}${partner})`;
  };

  // Chrono coach — on utilise une ref pour startTime pour éviter les problèmes de closure
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (coachRunning) {
      timerRef.current = setInterval(() => {
        setCoachElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 250);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [coachRunning]);

  const startCoach = () => {
    const now = Date.now();
    startTimeRef.current = now;
    setCoachStartTime(now);
    setCoachElapsed(0);
    setCoachCheckpointIdx(0);
    setCoachSplits({});
    setCoachRunning(true);
  };

  const resetCoach = () => {
    setCoachRunning(false);
    setCoachElapsed(0);
    setCoachCheckpointIdx(0);
    setCoachSplits({});
    setCoachStartTime(null);
  };

  const validateCheckpoint = () => {
    if (!coachRunning || coachCheckpointIdx >= HYROX_CHECKPOINTS.length) return;
    const cp = HYROX_CHECKPOINTS[coachCheckpointIdx];
    setCoachSplits(prev => ({ ...prev, [cp]: coachElapsed }));
    setCoachCheckpointIdx(i => i + 1);
  };

  const formatElapsed = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + "h" : ""}${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const formatDiff = (diff) => {
    const abs = Math.abs(diff);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    const str = m > 0 ? `${m}m${String(s).padStart(2,"0")}s` : `${s}s`;
    return diff < 0 ? `+${str}` : `-${str}`; // négatif = en avance = +, positif = retard = -
  };

  // Pas de course de référence unique — on compare à toutes
  const lastValidatedIdx = coachCheckpointIdx - 1;
  const lastCp = lastValidatedIdx >= 0 ? HYROX_CHECKPOINTS[lastValidatedIdx] : null;
  const nextCp = coachCheckpointIdx < HYROX_CHECKPOINTS.length ? HYROX_CHECKPOINTS[coachCheckpointIdx] : null;

  // Mode manuel
  const currentSecs = parseTimeInput(currentTime);
  const formatDiffManual = (diff) => {
    const abs = Math.abs(diff);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    const str = h > 0 ? `${h}h${String(m).padStart(2,"0")}m${String(s).padStart(2,"0")}s` : `${m}m${String(s).padStart(2,"0")}s`;
    return diff < 0 ? `▲ ${str} d'avance` : `▼ ${str} de retard`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Toggle mode */}
      <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #303036", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["coach", "🏃 Mode Coach"], ["manual", "✏️ Saisie manuelle"]].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "7px 16px", borderRadius: 7, border: "none", fontFamily: "inherit", cursor: "pointer",
            background: mode === m ? col.main : "transparent",
            color: mode === m ? "#000" : "#888",
            fontWeight: 700, fontSize: 12, transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {/* ── MODE COACH ── */}
      {mode === "coach" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Sélection athlète */}
          {!coachRunning && (
            <div style={{ background: "#1f1f23", border: "1px solid #303036", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Qui participe ?</div>
              <div style={{ display: "flex", gap: 8 }}>
                {ATHLETES.map(a => (
                  <button key={a} onClick={() => setCoachAthlete(a)} style={{
                    padding: "10px 28px", borderRadius: 10, border: `2px solid ${coachAthlete === a ? col.main : "#303036"}`,
                    background: coachAthlete === a ? col.main + "22" : "transparent",
                    color: coachAthlete === a ? col.main : "#888",
                    fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                  }}>{a}</button>
                ))}
              </div>
              {racesWithCheckpoints.length === 0 && (
                <div style={{ color: "#52525b", fontSize: 12, marginTop: 10 }}>
                  Aucune course avec temps de passage pour {coachAthlete}.
                </div>
              )}
              {racesWithCheckpoints.length > 0 && (
                <div style={{ color: "#71717a", fontSize: 12, marginTop: 10 }}>
                  {racesWithCheckpoints.length} course{racesWithCheckpoints.length > 1 ? "s" : ""} de référence : {racesWithCheckpoints.map(r => raceLabel(r)).join(", ")}
                </div>
              )}
            </div>
          )}

          {coachRunning && (
            <div style={{ background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Badge color={col.main}>{coachAthlete}</Badge>
              <span style={{ color: "#71717a", fontSize: 12 }}>
                Comparé à {racesWithCheckpoints.length} course{racesWithCheckpoints.length > 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Chrono principal */}
          <div style={{
            background: "#1f1f23", border: `2px solid ${coachRunning ? col.main : "#303036"}`,
            borderRadius: 20, padding: "28px 24px", textAlign: "center",
            transition: "border-color 0.3s",
          }}>
            {/* Chrono */}
            <div style={{
              fontFamily: "monospace", fontSize: 56, fontWeight: 900,
              color: coachRunning ? col.main : "#52525b",
              letterSpacing: "0.04em", marginBottom: 8,
              textShadow: coachRunning ? `0 0 30px ${col.main}44` : "none",
              transition: "color 0.3s",
            }}>
              {formatElapsed(coachElapsed)}
            </div>

            {/* Prochain checkpoint + temps de référence de toutes les courses */}
            {coachRunning && nextCp && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#71717a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Prochain checkpoint
                </div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>{nextCp}</div>
                {racesWithCheckpoints.filter(r => r.checkpointSecs?.[nextCp]).length > 0 && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {racesWithCheckpoints.map(r => {
                      const refSecs = r.checkpointSecs?.[nextCp];
                      if (!refSecs) return null;
                      return (
                        <div key={r.id} style={{ background: "#27272a", borderRadius: 8, padding: "5px 12px", fontSize: 12 }}>
                          <span style={{ color: "#71717a" }}>{r.eventName || formatDate(r.date)} · </span>
                          <span style={{ color: col.main, fontWeight: 700 }}>{formatTime(refSecs)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Comparaison dernier checkpoint — toutes les courses */}
            {lastCp && coachSplits[lastCp] && racesWithCheckpoints.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#71717a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                  {lastCp} — {formatElapsed(coachSplits[lastCp])}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {racesWithCheckpoints.map(r => {
                    const refSecs = r.checkpointSecs?.[lastCp];
                    if (!refSecs) return null;
                    const diff = coachSplits[lastCp] - refSecs;
                    const isAhead = diff < 0;
                    return (
                      <div key={r.id} style={{
                        background: isAhead ? "#4ade8022" : "#f8717122",
                        border: `1px solid ${isAhead ? "#4ade8044" : "#f8717144"}`,
                        borderRadius: 10, padding: "10px 16px", minWidth: 130,
                      }}>
                        <div style={{ color: "#888", fontSize: 11, marginBottom: 2 }}>{r.eventName || formatDate(r.date)}</div>
                        <div style={{ color: "#555", fontSize: 10, marginBottom: 6 }}>
                          {r.category || "Solo"}{r.partner ? ` · ${r.partner}` : ""}
                        </div>
                        <div style={{ color: isAhead ? "#4ade80" : "#f87171", fontWeight: 900, fontSize: 22 }}>
                          {formatDiff(diff)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Fin de course */}
            {coachRunning && !nextCp && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: "#4ade80", fontWeight: 900, fontSize: 24 }}>🏁 Course terminée !</div>
              </div>
            )}

            {/* Boutons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {!coachRunning ? (
                <button onClick={startCoach} style={{
                  padding: "16px 40px", borderRadius: 14, border: "none",
                  background: col.main, color: "#000",
                  fontWeight: 900, fontSize: 18, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                }}>
                  ▶ Démarrer
                </button>
              ) : (
                <>
                  {nextCp && (
                    <button onClick={validateCheckpoint} style={{
                      padding: "18px 0", width: "100%", maxWidth: 360,
                      borderRadius: 14, border: "none",
                      background: col.main, color: "#000",
                      fontWeight: 900, fontSize: 20, cursor: "pointer",
                      fontFamily: "inherit", letterSpacing: "0.02em",
                      boxShadow: `0 4px 24px ${col.main}44`,
                    }}>
                      ✓ {nextCp}
                    </button>
                  )}
                  <button onClick={resetCoach} style={{
                    padding: "12px 24px", borderRadius: 12, border: "1px solid #3f3f46",
                    background: "transparent", color: "#888",
                    fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                  }}>
                    ✕ Arrêter
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Historique des checkpoints validés */}
          {Object.keys(coachSplits).length > 0 && (
            <div style={{ background: "#1f1f23", border: "1px solid #303036", borderRadius: 14, overflow: "auto" }}>
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #303036", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                Checkpoints validés
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: "#27272a" }}>
                      <th style={{ padding: "8px 14px", color: "#71717a", fontWeight: 700, textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #303036" }}>Checkpoint</th>
                      <th style={{ padding: "8px 14px", color: col.main, fontWeight: 700, textAlign: "center", fontSize: 11, borderBottom: "1px solid #303036" }}>Mon temps</th>
                      {racesWithCheckpoints.map(r => (
                        <th key={r.id} style={{ padding: "8px 14px", color: "#888", fontWeight: 700, textAlign: "center", fontSize: 11, borderBottom: "1px solid #303036", whiteSpace: "nowrap" }}>
                          <div>{r.eventName || formatDate(r.date)}</div>
                          <div style={{ color: "#555", fontWeight: 400, fontSize: 10 }}>{r.category || "Solo"}{r.partner ? ` · ${r.partner}` : ""}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(coachSplits).map(([cp, secs], i) => (
                      <tr key={cp} style={{ background: i % 2 === 0 ? "#1f1f23" : "#27272a" }}>
                        <td style={{ padding: "10px 14px", color: "#888", fontSize: 12, borderBottom: "1px solid #2a2a2e", whiteSpace: "nowrap" }}>{cp}</td>
                        <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700, fontFamily: "monospace", textAlign: "center", borderBottom: "1px solid #2a2a2e" }}>{formatElapsed(secs)}</td>
                        {racesWithCheckpoints.map(r => {
                          const refSecs = r.checkpointSecs?.[cp];
                          const diff = refSecs ? secs - refSecs : null;
                          return (
                            <td key={r.id} style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #2a2a2e" }}>
                              {diff !== null ? (
                                <span style={{ color: diff < 0 ? "#4ade80" : "#f87171", fontWeight: 700, fontSize: 12 }}>
                                  {formatDiff(diff)}
                                </span>
                              ) : <span style={{ color: "#3f3f46" }}>—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE MANUEL ── */}
      {mode === "manual" && (
        <div style={{ background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {ATHLETES.map(a => (
              <button key={a} onClick={() => setManualAthlete(a)} style={{
                padding: "8px 22px", borderRadius: 10, border: `2px solid ${manualAthlete === a ? col.main : "#303036"}`,
                background: manualAthlete === a ? col.main + "22" : "transparent",
                color: manualAthlete === a ? col.main : "#888",
                fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>{a}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Temps actuel</label>
              <input value={currentTime} onChange={e => setCurrentTime(e.target.value)} placeholder="hh:mm:ss"
                style={{ background: "#27272a", border: `1px solid ${col.main}55`, borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 18, fontWeight: 700, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Checkpoint</label>
              <select value={selectedCheckpoint} onChange={e => setSelectedCheckpoint(e.target.value)}
                style={{ background: "#27272a", border: "1px solid #3f3f46", borderRadius: 8, padding: "10px 14px", color: selectedCheckpoint ? "#fff" : "#888", fontSize: 14, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="">Choisir…</option>
                {HYROX_CHECKPOINTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {manualRaces.length === 0 && (
            <div style={{ color: "#52525b", textAlign: "center", padding: 24, fontSize: 13 }}>
              Aucune course avec temps de passage pour {manualAthlete}.
            </div>
          )}

          {manualRaces.length > 0 && currentSecs && selectedCheckpoint && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {manualRaces.sort((a, b) => (a.date || "").localeCompare(b.date || "")).map(race => {
                const refSecs = race.checkpointSecs?.[selectedCheckpoint];
                if (!refSecs) return null;
                const diff = currentSecs - refSecs;
                const isAhead = diff < 0;
                const diffColor = isAhead ? "#4ade80" : "#f87171";
                return (
                  <div key={race.id} style={{ background: "#27272a", border: `1px solid ${diffColor}44`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span style={{ color: "#fff", fontWeight: 700 }}>{race.eventName || race.date}</span>
                        {race.eventName && <span style={{ color: "#71717a", fontSize: 12 }}>{formatDate(race.date)}</span>}
                      </div>
                      <div style={{ color: "#555", fontSize: 11 }}>{race.category || "Solo"}{race.partner ? ` · ${race.partner}` : ""}</div>
                      <div style={{ color: "#71717a", fontSize: 12, marginTop: 2 }}>
                        Réf : <span style={{ color: "#aaa", fontWeight: 600 }}>{formatTime(refSecs)}</span>
                        {race.totalSecs && <span style={{ marginLeft: 10 }}>Final : <span style={{ color: col.main, fontWeight: 600 }}>{formatTime(race.totalSecs)}</span></span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: diffColor, fontWeight: 900, fontSize: 22 }}>{isAhead ? "▲" : "▼"}</div>
                      <div style={{ color: diffColor, fontWeight: 700, fontSize: 13 }}>{formatDiffManual(diff)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tableau de référence */}
          {manualRaces.length > 0 && (
            <div style={{ marginTop: 24, overflowX: "auto" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Tableau de référence</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
                <thead>
                  <tr style={{ background: "#27272a" }}>
                    <th style={{ padding: "8px 12px", color: "#71717a", fontWeight: 700, textAlign: "left", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.07em", borderBottom: "1px solid #303036" }}>Checkpoint</th>
                    {manualRaces.map(r => (
                      <th key={r.id} style={{ padding: "8px 12px", color: col.main, fontWeight: 700, textAlign: "center", fontSize: 11, borderBottom: "1px solid #303036", whiteSpace: "nowrap" }}>
                        <div>{r.eventName || formatDate(r.date)}</div>
                        <div style={{ color: "#555", fontWeight: 400, fontSize: 10 }}>{r.category || "Solo"}{r.partner ? ` · ${r.partner}` : ""}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HYROX_CHECKPOINTS.map((cp, i) => {
                    const isSelected = cp === selectedCheckpoint;
                    return (
                      <tr key={cp} onClick={() => setSelectedCheckpoint(cp)} style={{ background: isSelected ? col.main + "15" : i % 2 === 0 ? "#1f1f23" : "#27272a", cursor: "pointer", borderLeft: isSelected ? `3px solid ${col.main}` : "3px solid transparent" }}>
                        <td style={{ padding: "8px 12px", color: isSelected ? col.main : "#888", fontWeight: isSelected ? 700 : 400, borderBottom: "1px solid #303036", whiteSpace: "nowrap" }}>{cp}</td>
                        {manualRaces.map(r => {
                          const secs = r.checkpointSecs?.[cp];
                          return <td key={r.id} style={{ padding: "8px 12px", color: secs ? "#fff" : "#3f3f46", textAlign: "center", fontWeight: 600, borderBottom: "1px solid #303036", fontFamily: "monospace" }}>{secs ? formatTime(secs) : "—"}</td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HyroxRecords({ data, trainingData, templates }) {
  const col = SPORT_COLORS["Hyrox"];
  const [includeTraining, setIncludeTraining] = useState(true);

  const getPR = (athlete) => {
    const records = data.filter(r => r.athlete === athlete && r.totalSecs);
    return records.length ? records.reduce((b, r) => r.totalSecs < b.totalSecs ? r : b) : null;
  };

  // Correspondance station Hyrox → type de segment dans les templates
  // Ex: "1000m SkiErg" → correspond à un segment de type "SkiErg" avec distance "1000"
  const matchesStation = (station, seg) => {
    const stationBase = HYROX_STATIONS.indexOf(station);
    const stationTypes = ["SkiErg", "Sled Push", "Sled Pull", "Burpee Broad Jump", "Rowing", "Farmers Carry", "Sandbag Lunges", "Wall Balls"];
    const officialDist = ["1000", "50", "50", "80", "1000", "200", "100", "100"];
    if (stationBase === -1) return false;
    return seg.type === stationTypes[stationBase] && seg.distance === officialDist[stationBase];
  };

  const allRaces = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* PRs globaux côte à côte */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {ATHLETES.map(a => {
          const pr = getPR(a);
          return (
            <div key={a} style={{ flex: 1, minWidth: 220, background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{a}</span>
                <span style={{ fontSize: 24 }}>⚡</span>
              </div>
              {pr ? (
                <>
                  <div style={{ color: "#888", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 4 }}>Meilleur temps</div>
                  <div style={{ color: col.main, fontWeight: 900, fontSize: 32 }}>{formatTime(pr.totalSecs)}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                    {pr.eventName && <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{pr.eventName}</span>}
                    <span style={{ color: "#71717a", fontSize: 12 }}>{formatDate(pr.date)}</span>
                    {pr.category && pr.category !== "Solo" && <Badge color="#888">{pr.category}</Badge>}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    {pr.runSecs && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#888", fontSize: 12 }}>Run</span><span style={{ color: "#aaa", fontSize: 12, fontWeight: 700 }}>{formatTime(pr.runSecs)}</span></div>}
                    {pr.roxzoneSecs && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#888", fontSize: 12 }}>Roxzone</span><span style={{ color: col.main, fontSize: 12, fontWeight: 700 }}>{formatTime(pr.roxzoneSecs)}</span></div>}
                  </div>
                  {pr.stationSecs && Object.values(pr.stationSecs).some(Boolean) && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: "#71717a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Stations</div>
                      {HYROX_STATIONS.map(s => pr.stationSecs[s] ? (
                        <div key={s} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#888", fontSize: 12 }}>{s}</span>
                          <span style={{ color: col.main, fontWeight: 700, fontSize: 12 }}>{formatTime(pr.stationSecs[s])}</span>
                        </div>
                      ) : null)}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: "#52525b", fontSize: 14 }}>Aucune course enregistrée</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top 10 par station */}
      {(() => {
        const getTop10ForStation = (station) => {
          const entries = [];

          // Depuis les courses officielles
          data.forEach(r => {
            if (r.stationSecs?.[station]) {
              const modeLabel = r.category && r.category !== "Solo"
                ? `${r.category}${r.partner ? ` · ${r.partner}` : ""}`
                : "Solo";
              entries.push({
                secs: r.stationSecs[station],
                athlete: r.athlete,
                date: r.date,
                label: r.eventName || "Course officielle",
                mode: modeLabel,
                isTraining: false,
                id: r.id + station,
              });
            }
          });

          // Depuis les entraînements via template
          if (includeTraining) {
            (trainingData || []).forEach(r => {
              if (!r.segments || !r.templateId) return;
              const tpl = templates.find(t => String(t.id) === String(r.templateId));
              if (!tpl) return;
              tpl.segments.forEach((seg, idx) => {
                if (!matchesStation(station, seg)) return;
                const timeStr = r.segments?.[idx];
                if (!timeStr) return;
                const secs = parseTimeInput(timeStr);
                if (!secs) return;
                const modeLabel = r.isShared
                  ? `Partagé${r.trainingPartner ? ` · ${r.trainingPartner}` : ""}`
                  : "Solo";
                entries.push({
                  secs,
                  athlete: r.athlete,
                  date: r.date,
                  label: tpl.name,
                  mode: modeLabel,
                  isTraining: true,
                  id: String(r.id) + station + idx,
                });
              });
            });
          }

          return entries.sort((a, b) => a.secs - b.secs).slice(0, 10);
        };

        const hasAnyStation = HYROX_STATIONS.some(s => getTop10ForStation(s).length > 0);
        if (!hasAnyStation) return null;

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Top 10 par station</div>
              <button onClick={() => setIncludeTraining(v => !v)} style={{
                padding: "5px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11,
                border: `1.5px solid ${includeTraining ? col.main : "#52525b"}`,
                background: includeTraining ? col.main + "22" : "transparent",
                color: includeTraining ? col.main : "#888",
              }}>
                {includeTraining ? "✓ " : ""}Inclure entraînements
              </button>
            </div>
            {HYROX_STATIONS.map(station => {
              const top10 = getTop10ForStation(station);
              if (!top10.length) return null;
              return (
                <div key={station} style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a1a", background: "#27272a" }}>
                    <span style={{ color: col.main, fontWeight: 800, fontSize: 13 }}>{station}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "36px 80px 1fr 90px 80px", background: "#27272a", borderBottom: "1px solid #1a1a1a" }}>
                    {["#", "Athlète", "Source · Mode", "Temps", "Type"].map(h => (
                      <div key={h} style={{ padding: "8px 12px", color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                    ))}
                  </div>
                  {top10.map((entry, i) => {
                    const rankColor = i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#71717a";
                    return (
                      <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "36px 80px 1fr 90px 80px", borderBottom: i < top10.length - 1 ? "1px solid #111" : "none", background: i % 2 === 0 ? "#1f1f23" : "#27272a" }}>
                        <div style={{ padding: "10px 12px", color: rankColor, fontWeight: 800, fontSize: 13 }}>{i + 1}</div>
                        <div style={{ padding: "10px 12px" }}><Badge color={col.main}>{entry.athlete}</Badge></div>
                        <div style={{ padding: "10px 12px" }}>
                          <div style={{ color: "#888", fontSize: 12 }}>{entry.label}</div>
                          <div style={{ color: "#888", fontSize: 11 }}>{entry.mode} · {formatDate(entry.date)}</div>
                        </div>
                        <div style={{ padding: "10px 12px", color: i === 0 ? col.main : "#fff", fontWeight: i === 0 ? 800 : 600, fontSize: 14 }}>
                          {formatTime(entry.secs)}{i === 0 && <span style={{ marginLeft: 4, fontSize: 9, color: col.main }}>★</span>}
                        </div>
                        <div style={{ padding: "10px 12px" }}>
                          <span style={{ color: entry.isTraining ? "#888" : col.main + "99", fontSize: 10, fontWeight: 700 }}>
                            {entry.isTraining ? "Entraîn." : "Course"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Progression chronologique */}
      {allRaces.length > 0 && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, padding: "20px 24px" }}>
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
                    <div style={{ color: "#888", fontSize: 12, width: 80 }}>{formatDate(r.date)}</div>
                    <div style={{ flex: 1, background: "#2a2a2e", borderRadius: 4, height: 8, overflow: "hidden" }}>
                      {r.totalSecs && <div style={{ width: `${(best.totalSecs / r.totalSecs) * 100}%`, height: "100%", background: r.id === best.id ? col.main : col.main + "66", borderRadius: 4 }} />}
                    </div>
                    <div style={{ color: r.id === best.id ? col.main : "#777", fontWeight: r.id === best.id ? 800 : 600, fontSize: 13, width: 80, textAlign: "right" }}>
                      {formatTime(r.totalSecs)}{r.id === best.id && <span style={{ fontSize: 10, marginLeft: 4 }}>★PR</span>}
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
function HyroxTab({ data, setData, partners, setPartners, trainingData, setTrainingData, templates, setTemplates, upcomingEvents, setUpcomingEvents }) {
  const [subTab, setSubTab] = useState("Historique");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultHyroxForm);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [newPartner, setNewPartner] = useState("");
  const [showTraining, setShowTraining] = useState(true);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [trainingEditId, setTrainingEditId] = useState(null);

  const handleEditTraining = (r) => {
    setTrainingEditId(r.id);
    setSubTab("Entraînements");
  };

  const col = SPORT_COLORS["Hyrox"];
  const isDouble = form.category !== "Solo";

  const addPartner = () => {
    const trimmed = newPartner.trim();
    if (!trimmed || partners.includes(trimmed)) return;
    setPartners([...partners, trimmed]);
    setNewPartner("");
    setShowAddPartner(false);
    update("partner", trimmed);
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateStation = (s, v) => setForm(f => ({ ...f, stations: { ...f.stations, [s]: v } }));
  const updateRun = (r, v) => setForm(f => ({ ...f, runs: { ...f.runs, [r]: v } }));
  const updateCheckpoint = (c, v) => setForm(f => ({ ...f, checkpoints: { ...f.checkpoints, [c]: v } }));

  // Calcul auto du total run depuis les splits
  const autoRunTotal = (() => {
    const splits = HYROX_RUNS.map(r => parseTimeInput(form.runs[r])).filter(Boolean);
    if (splits.length !== HYROX_RUNS.length) return null;
    return splits.reduce((a, b) => a + b, 0);
  })();

  const submit = () => {
    if (!form.date || !form.totalTime) return;
    const totalSecs = parseTimeInput(form.totalTime);
    const roxzoneSecs = parseTimeInput(form.roxzoneTime);
    const stationSecs = {};
    Object.entries(form.stations).forEach(([k, v]) => { stationSecs[k] = parseTimeInput(v); });
    const runSecs_splits = {};
    Object.entries(form.runs || {}).forEach(([k, v]) => { runSecs_splits[k] = parseTimeInput(v); });
    const checkpointSecs = {};
    Object.entries(form.checkpoints || {}).forEach(([k, v]) => { checkpointSecs[k] = parseTimeInput(v); });
    const runSecs = autoRunTotal ?? parseTimeInput(form.runTime);
    const entry = { ...form, totalSecs, runSecs, roxzoneSecs, stationSecs, runSecs_splits, checkpointSecs, id: editingId || Date.now() };
    if (editingId) {
      setData(d => d.map(r => r.id === editingId ? entry : r));
      setEditingId(null);
    } else {
      setData(d => [...d, entry]);
    }
    setForm(defaultHyroxForm);
  };

  const secsToStr = (s) => s ? `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}` : "";
  const minsStr = (s) => s ? `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}` : "";

  const startEdit = (r) => {
    const stationsStr = {};
    if (r.stationSecs) Object.entries(r.stationSecs).forEach(([k, v]) => { stationsStr[k] = v ? minsStr(v) : ""; });
    const runsStr = {};
    if (r.runSecs_splits) Object.entries(r.runSecs_splits).forEach(([k, v]) => { runsStr[k] = v ? minsStr(v) : ""; });
    const checkpointsStr = {};
    if (r.checkpointSecs) Object.entries(r.checkpointSecs).forEach(([k, v]) => { checkpointsStr[k] = v ? secsToStr(v) : ""; });
    setForm({ ...r, totalTime: secsToStr(r.totalSecs), runTime: secsToStr(r.runSecs), roxzoneTime: secsToStr(r.roxzoneSecs), stations: stationsStr, runs: runsStr, checkpoints: checkpointsStr });
    setEditingId(r.id);
    setSubTab("+");
  };


  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = filter === "Tous" ? data : data.filter(r => r.athlete === filter);
  const searchFiltered = search.trim() ? filtered.filter(r => [r.eventName, r.category, r.partner, r.notes].some(v => v?.toLowerCase().includes(search.toLowerCase()))) : filtered;
  const sorted = [...searchFiltered].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-tabs */}
      <UpcomingEventsBanner sport="Hyrox" upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #303036", borderRadius: 10, padding: 4, overflowX: "auto", flex: 1, minWidth: 0 }}>
          {["Historique", "Records", "Comparaison", "Suivi", "Entraînements"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: "none",
              background: subTab === t ? col.main : "transparent",
              color: subTab === t ? "#000" : "#888",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>{t}</button>
          ))}
        </div>
        <button onClick={() => setSubTab("+")} style={{
          width: 36, height: 36,
          borderRadius: 10,
          border: `1.5px solid ${subTab === "+" ? "#e53e3e" : "#52525b"}`,
          background: subTab === "+" ? "#e53e3e" : "transparent",
          color: subTab === "+" ? "#fff" : "#888",
          fontWeight: 900,
          fontSize: 20,
          lineHeight: 1,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>+</button>
      </div>

      {subTab === "Records" && <HyroxRecords data={data} trainingData={trainingData || []} templates={templates || []} />}
      {subTab === "Comparaison" && <HyroxComparison data={data} />}
      {subTab === "Suivi" && <HyroxLiveTracker data={data} />}
      {subTab === "Entraînements" && <HyroxTrainingTab data={trainingData || []} setData={setTrainingData} templates={templates || []} setTemplates={setTemplates} partners={partners || []} setPartners={setPartners} editId={trainingEditId} onEditDone={() => setTrainingEditId(null)} />}

      {subTab === "+" && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier la course" : "+ Ajouter une course Hyrox"}</div>
            {editingId && <button onClick={() => { setEditingId(null); setForm(defaultHyroxForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }} className="form-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
              <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
            </div>
            <Input label="Date" type="date" value={form.date} onChange={v => update("date", v)} />
            <Input label="Ville / Événement" value={form.eventName || ""} onChange={v => update("eventName", v)} placeholder="ex: Paris, Lyon…" />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Catégorie</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HYROX_CATEGORIES.map(c => (
                  <button key={c} onClick={() => update("category", c)} style={{
                    padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${form.category === c ? col.main : "#3f3f46"}`,
                    background: form.category === c ? col.main + "22" : "transparent",
                    color: form.category === c ? col.main : "#888",
                    fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <Input label="Temps total" value={form.totalTime} onChange={v => update("totalTime", v)} placeholder="01:15:00" />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Temps de run total</label>
              {autoRunTotal ? (
                <div style={{ background: "#27272a", border: `1px solid ${col.main}44`, borderRadius: 8, padding: "9px 12px", fontSize: 14, color: col.main, fontWeight: 700 }}>
                  {secsToStr(autoRunTotal)} <span style={{ color: "#888", fontSize: 11, fontWeight: 400 }}>calculé depuis les splits</span>
                </div>
              ) : (
                <input value={form.runTime} onChange={e => update("runTime", e.target.value)} placeholder="00:35:00"
                  style={{ background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              )}
            </div>
            <Input label="Temps Roxzone" value={form.roxzoneTime} onChange={v => update("roxzoneTime", v)} placeholder="00:40:00" />
            {isDouble && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Partenaire</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select
                    value={form.partner}
                    onChange={e => update("partner", e.target.value)}
                    style={{
                      flex: 1, background: "#27272a", border: "1px solid #222", borderRadius: 8,
                      padding: "9px 12px", color: form.partner ? "#fff" : "#888", fontSize: 14,
                      outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    <option value="">— Choisir —</option>
                    {partners.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={() => setShowAddPartner(v => !v)} title="Ajouter un partenaire"
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      border: `1.5px solid ${showAddPartner ? col.main : "#3f3f46"}`,
                      background: showAddPartner ? col.main + "22" : "transparent",
                      color: showAddPartner ? col.main : "#888",
                      fontWeight: 900, fontSize: 18, cursor: "pointer", fontFamily: "inherit",
                      flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                </div>
                {showAddPartner && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <input
                      value={newPartner}
                      onChange={e => setNewPartner(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addPartner()}
                      placeholder="Prénom du partenaire..."
                      style={{
                        flex: 1, background: "#27272a", border: `1px solid ${col.main}44`, borderRadius: 8,
                        padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
                      }}
                    />
                    <button onClick={addPartner} style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      background: col.main, color: "#000", fontWeight: 800, fontSize: 12,
                      cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                    }}>Ajouter</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Temps par station</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
            {HYROX_STATIONS.map(s => (
              <Input key={s} label={s} value={form.stations[s] || ""} onChange={v => updateStation(s, v)} placeholder="mm:ss" />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 }}>
            <div style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Splits de run (optionnel)
            </div>
            {autoRunTotal && (
              <span style={{ color: col.main, fontSize: 11, fontWeight: 700 }}>
                Total auto : {secsToStr(autoRunTotal)}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
            {HYROX_RUNS.map(r => (
              <Input key={r} label={r} value={form.runs[r] || ""} onChange={v => updateRun(r, v)} placeholder="mm:ss" />
            ))}
          </div>

          {/* Temps de passage */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 }}>
            <div style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Temps de passage cumulés (optionnel)</div>
          </div>
          <div style={{ background: "#27272a", border: "1px solid #303036", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
            <div style={{ color: "#71717a", fontSize: 11, marginBottom: 12 }}>Temps écoulé depuis le départ à chaque checkpoint — disponible sur l'app Hyrox après la course.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {HYROX_CHECKPOINTS.map(c => (
                <Input key={c} label={c} value={form.checkpoints?.[c] || ""} onChange={v => updateCheckpoint(c, v)} placeholder="hh:mm:ss" />
              ))}
            </div>
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
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 16px", borderRadius: "999px",
                border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222",
                background: filter === f ? col.light : "transparent",
                color: filter === f ? col.main : "#888",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}>{f}</button>
            ))}
            <button onClick={() => setShowTraining(v => !v)} style={{
              padding: "5px 14px", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12,
              border: `1.5px solid ${showTraining ? "#a78bfa" : "#303036"}`,
              background: showTraining ? "#a78bfa22" : "transparent",
              color: showTraining ? "#a78bfa" : "#555",
            }}>
              {showTraining ? "✓ " : ""}Entraînements
            </button>
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher ville, événement…" />
          </div>
          {(() => {
            // Fusionner courses et entraînements (selon toggle)
            const trainingFiltered = showTraining
              ? (filter === "Tous" ? (trainingData || []) : (trainingData || []).filter(r => r.athlete === filter))
              : [];
            const allEntries = [
              ...sorted.map(r => ({ ...r, _type: "course" })),
              ...trainingFiltered.map(r => ({ ...r, _type: "training" })),
            ].sort((a, b) => (b.date || "").localeCompare(a.date || ""))
            .filter(r => !search.trim() || [r.eventName, r.category, r.partner, r.notes, r.trainingPartner].some(v => v?.toLowerCase().includes(search.toLowerCase())));

            if (allEntries.length === 0) return (
              <div style={{ color: "#52525b", textAlign: "center", padding: 40, fontSize: 14 }}>{search ? "Aucun résultat pour cette recherche" : "Aucune activité Hyrox enregistrée"}</div>
            );

            return allEntries.map(r => {
              const isCourse = r._type === "course";
              const tpl = !isCourse ? (templates || []).find(t => String(t.id) === String(r.templateId)) : null;
              const entryColor = isCourse ? col.main : "#a78bfa"; // cyan pour course, violet pour entraînement
              const entryIcon = isCourse ? "⚡" : "🏋️";

              return (
                <div key={r.id}
                  onClick={() => setSelectedEntry({ ...r, _modalType: "hyrox", _isTraining: !isCourse })}
                  style={{
                    background: "#1f1f23",
                    border: "1px solid #303036",
                    borderLeft: `4px solid ${entryColor}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    marginBottom: 10,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = entryColor}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#303036"; e.currentTarget.style.borderLeftColor = entryColor; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        {/* Picto + type */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: entryColor + "22", border: `1px solid ${entryColor}44`,
                          borderRadius: 6, padding: "2px 8px",
                        }}>
                          <span style={{ fontSize: 12 }}>{entryIcon}</span>
                          <span style={{ color: entryColor, fontSize: 11, fontWeight: 700 }}>
                            {isCourse ? "Course" : "Entraînement"}
                          </span>
                        </div>
                        <Badge color={col.main}>{r.athlete}</Badge>
                        {isCourse && r.category && r.category !== "Solo" && <Badge color="#888">{r.category}</Badge>}
                        {isCourse && r.partner && <span style={{ color: "#888", fontSize: 12 }}>avec {r.partner}</span>}
                        {!isCourse && r.isShared && r.trainingPartner && <span style={{ color: "#888", fontSize: 12 }}>avec {r.trainingPartner}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                          {isCourse ? (r.eventName || "Hyrox") : (tpl?.name || "—")}
                        </span>
                        <span style={{ color: "#71717a", fontSize: 12 }}>{formatDate(r.date)}</span>
                      </div>
                      {r.notes && <div style={{ color: "#71717a", fontSize: 12, marginTop: 4 }}>{r.notes}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 12 }} onClick={e => e.stopPropagation()}>
                      <ActionButtons accentColor={entryColor}
                        onEdit={() => isCourse ? startEdit(r) : handleEditTraining(r)}
                        onDelete={() => isCourse ? deleteEntry(r.id) : setTrainingData(d => d.filter(x => x.id !== r.id))}
                      />
                      <div style={{ textAlign: "right" }}>
                        {isCourse ? (
                          <>
                            <div style={{ color: entryColor, fontWeight: 800, fontSize: 20 }}>{formatTime(r.totalSecs)}</div>
                            {r.runSecs && <div style={{ color: "#888", fontSize: 12 }}>Run: {formatTime(r.runSecs)}</div>}
                            {r.roxzoneSecs && <div style={{ color: "#888", fontSize: 12 }}>Roxzone: {formatTime(r.roxzoneSecs)}</div>}
                          </>
                        ) : (
                          <div style={{ color: entryColor, fontWeight: 800, fontSize: 20 }}>{r.totalTime || "—"}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stations (courses) */}
                  {isCourse && r.stationSecs && Object.keys(r.stationSecs).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Stations</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {HYROX_STATIONS.map(s => r.stationSecs[s] ? (
                          <div key={s} style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                            <span style={{ color: "#888" }}>{s}: </span>
                            <span style={{ color: col.main, fontWeight: 700 }}>{formatTime(r.stationSecs[s])}</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* Splits de run (courses) */}
                  {isCourse && r.runSecs_splits && Object.values(r.runSecs_splits).some(Boolean) && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Splits de run</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {HYROX_RUNS.map((run, i) => r.runSecs_splits[run] && (
                          <div key={run} style={{ background: "#27272a", border: "1px solid #303036", borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                            <span style={{ color: "#888" }}>R{i + 1}: </span>
                            <span style={{ color: "#aaa", fontWeight: 700 }}>{formatTime(r.runSecs_splits[run])}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segments (entraînements) */}
                  {!isCourse && tpl && r.segments && Object.keys(r.segments).length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Segments</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {tpl.segments.map((seg, i) => {
                          if (!r.segments[i]) return null;
                          const isRun = seg.type === "Run" || seg.type === "Vélo";
                          const secs = parseTimeInput(r.segments[i]);
                          const distKm = seg.distance
                            ? seg.unit === "km" ? parseFloat(seg.distance) : parseFloat(seg.distance) / 1000
                            : null;
                          const pace = isRun && secs && distKm ? (() => {
                            const spk = secs / distKm;
                            const m = Math.floor(spk / 60);
                            const s = Math.round(spk % 60);
                            return `${m}:${String(s).padStart(2,"0")}/km`;
                          })() : null;
                          return (
                            <div key={i} style={{ background: "#27272a", border: "1px solid #303036", borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                              <span style={{ color: "#888" }}>{seg.distance ? `${seg.distance}${seg.unit} ` : ""}{seg.type}: </span>
                              <span style={{ color: col.main, fontWeight: 700 }}>{r.segments[i]}</span>
                              {pace && <span style={{ color: "#a78bfa", fontSize: 10, fontWeight: 600, marginLeft: 5 }}>{pace}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}
      <ActivityModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} templates={templates} onEdit={r => r._isTraining ? handleEditTraining(r) : startEdit(r)} />
    </div>
  );
}


// ── KARTING TAB ───────────────────────────────────────────────────────────────
const KARTING_SESSIONS = ["Qualifications", "Course 1", "Course 2", "Course 3", "Course 4"];
const defaultKartForm = { date: "", circuit: "RKO Angerville", format: "Sprint", session: "", athlete: "Tom", group: "", rank: "", total: "", bestLap: "", notes: "" };

function KartingTab({ data, setData, upcomingEvents, setUpcomingEvents }) {
  const [subTab, setSubTab] = useState("Historique");
  const [form, setForm] = useState(defaultKartForm);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkForms, setBulkForms] = useState(
    KARTING_SESSIONS.map(s => ({ ...defaultKartForm, session: s }))
  );
  const col = SPORT_COLORS["Karting"];
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.date || !form.session) return;
    const entry = { ...form, id: editingId || Date.now() };
    if (editingId) { setData(d => d.map(r => r.id === editingId ? entry : r)); setEditingId(null); }
    else setData(d => [...d, entry]);
    setForm(defaultKartForm);
    setSubTab("Historique");
  };

  const submitBulk = () => {
    const date = bulkForms[0].date;
    if (!date) return;
    const entries = bulkForms
      .filter(f => f.rank || f.bestLap)
      .map((f, i) => ({ ...f, id: Date.now() + i }));
    setData(d => [...d, ...entries]);
    setBulkForms(KARTING_SESSIONS.map(s => ({ ...defaultKartForm, session: s })));
    setBulkMode(false);
    setSubTab("Historique");
  };

  const startEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setSubTab("+"); setBulkMode(false); };
  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = filter === "Tous" ? data : data.filter(r => r.athlete === filter);
  const searchFiltered = search.trim() ? filtered.filter(r => [r.circuit, r.session, r.notes].some(v => v?.toLowerCase().includes(search.toLowerCase()))) : filtered;
  const sorted = [...searchFiltered].sort((a, b) => b.date?.localeCompare(a.date));

  // Group by date+format for display
  const groupedDates = [...new Set(sorted.map(r => r.date))];

  const inputStyle = { background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <UpcomingEventsBanner sport="Karting" upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Circuit"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: subTab === t ? col.main : "transparent", color: subTab === t ? "#000" : "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{t}</button>
          ))}
        </div>
        <button onClick={() => { setSubTab("+"); setBulkMode(false); }} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${subTab === "+" ? "#e53e3e" : "#52525b"}`, background: subTab === "+" ? "#e53e3e" : "transparent", color: subTab === "+" ? "#fff" : "#888", fontWeight: 900, fontSize: 20, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>


      {subTab === "Circuit" && (() => {
        const allLaps = data
          .filter(r => r.bestLap)
          .sort((a, b) => a.bestLap.localeCompare(b.bestLap));
        const top10 = allLaps.slice(0, 10);
        const allRaces = [...data].filter(r => r.rank).sort((a, b) => b.date?.localeCompare(a.date));
        const allDates = [...new Set(allRaces.map(r => r.date))];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Top 10 — Meilleurs tours</span>
                <span style={{ color: "#888", fontSize: 12 }}>RKO Angerville</span>
              </div>
              {allLaps.length === 0 ? (
                <div style={{ color: "#52525b", textAlign: "center", padding: 32, fontSize: 13 }}>Aucun temps enregistré</div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 130px 110px", background: "#27272a", borderBottom: "1px solid #1a1a1a" }}>
                    {["#", "Athlète", "Temps", "Session", "Date"].map(h => (
                      <div key={h} style={{ padding: "10px 14px", color: "#71717a", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                    ))}
                  </div>
                  {top10.map((r, i) => {
                    const rankColor = i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#888";
                    return (
                      <div key={r.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px 130px 110px", borderBottom: i < top10.length - 1 ? "1px solid #111" : "none", background: i % 2 === 0 ? "#1f1f23" : "#27272a" }}>
                        <div style={{ padding: "12px 14px", color: rankColor, fontWeight: 800, fontSize: 14 }}>{i + 1}</div>
                        <div style={{ padding: "12px 14px" }}><Badge color={col.main}>{r.athlete}</Badge></div>
                        <div style={{ padding: "12px 14px", color: i === 0 ? col.main : "#fff", fontWeight: i === 0 ? 800 : 600, fontSize: 14, fontFamily: "monospace" }}>
                          {r.bestLap}{i === 0 && <span style={{ marginLeft: 6, fontSize: 10 }}>★</span>}
                        </div>
                        <div style={{ padding: "12px 14px", color: "#666", fontSize: 12 }}>{r.session}</div>
                        <div style={{ padding: "12px 14px", color: "#888", fontSize: 12 }}>{formatDate(r.date)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Toutes les courses</div>
              {allDates.length === 0 ? (
                <div style={{ color: "#52525b", textAlign: "center", padding: 32, fontSize: 13 }}>Aucune course enregistrée</div>
              ) : allDates.map(date => {
                const dayRaces = allRaces.filter(r => r.date === date);
                return (
                  <div key={date} style={{ marginBottom: 16 }}>
                    <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{date}</div>
                    <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "auto" }}>
                      <div style={{ minWidth: 450, display: "grid", gridTemplateColumns: "1fr 70px 130px 120px 100px", background: "#27272a", borderBottom: "1px solid #1a1a1a" }}>
                        {["Session", "Groupe", "Place", "Meilleur tour", "Athlète"].map(h => (
                          <div key={h} style={{ padding: "9px 14px", color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                        ))}
                      </div>
                      {KARTING_SESSIONS.map(sess => {
                        const sessRaces = dayRaces.filter(r => r.session === sess);
                        if (!sessRaces.length) return null;
                        return sessRaces.map((r, ri) => {
                          const pct = calcPct(r.rank, r.total);
                          return (
                            <div key={r.id} style={{ minWidth: 450, display: "grid", gridTemplateColumns: "1fr 70px 130px 120px 100px", borderBottom: "1px solid #111", background: ri % 2 === 0 ? "#1f1f23" : "#27272a" }}>
                              <div style={{ padding: "10px 14px", color: "#888", fontWeight: 600, fontSize: 13 }}>{sess}</div>
                              <div style={{ padding: "10px 14px", color: "#888", fontSize: 12 }}>{r.group ? `G${r.group}` : "—"}</div>
                              <div style={{ padding: "10px 14px" }}>
                                {r.rank ? <div>
                                  <span style={{ color: col.main, fontWeight: 800, fontSize: 15 }}>P{r.rank}</span>
                                  {r.total && <span style={{ color: "#71717a", fontSize: 12 }}>/{r.total}</span>}
                                  {pct && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {pct}%</div>}
                                </div> : <span style={{ color: "#52525b" }}>—</span>}
                              </div>
                              <div style={{ padding: "10px 14px", color: "#888", fontSize: 13, fontFamily: "monospace" }}>{r.bestLap || "—"}</div>
                              <div style={{ padding: "10px 14px" }}><Badge color={col.main}>{r.athlete}</Badge></div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {subTab === "+" && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier" : "Ajouter un résultat"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {!editingId && (
                <button onClick={() => setBulkMode(v => !v)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${bulkMode ? col.main : "#3f3f46"}`, background: bulkMode ? col.main + "22" : "transparent", color: bulkMode ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Saisie Sprint complète
                </button>
              )}
              {editingId && <button onClick={() => { setEditingId(null); setForm(defaultKartForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
            </div>
          </div>

          {bulkMode ? (
            // Saisie en bloc pour un Sprint complet
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Date</label>
                  <input type="date" value={bulkForms[0].date} onChange={e => setBulkForms(f => f.map(x => ({ ...x, date: e.target.value })))} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
                  <AthleteSelector value={bulkForms[0].athlete} onChange={v => setBulkForms(f => f.map(x => ({ ...x, athlete: v })))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                {KARTING_SESSIONS.map((sess, i) => (
                  <div key={sess} style={{ background: "#18181b", border: "1px solid #1a1a1a", borderRadius: 10, padding: "12px" }}>
                    <div style={{ color: col.main, fontWeight: 700, fontSize: 12, marginBottom: 10 }}>{sess}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div>
                        <label style={{ color: "#888", fontSize: 10, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Groupe</label>
                        <input type="number" min="1" value={bulkForms[i].group} onChange={e => setBulkForms(f => f.map((x, j) => j === i ? { ...x, group: e.target.value } : x))} placeholder="1" style={{ ...inputStyle, padding: "7px 8px", fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ color: "#888", fontSize: 10, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Place</label>
                        <input type="number" min="1" value={bulkForms[i].rank} onChange={e => setBulkForms(f => f.map((x, j) => j === i ? { ...x, rank: e.target.value } : x))} placeholder="P" style={{ ...inputStyle, padding: "7px 8px", fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ color: "#888", fontSize: 10, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>/ Total</label>
                        <input type="number" min="1" value={bulkForms[i].total} onChange={e => setBulkForms(f => f.map((x, j) => j === i ? { ...x, total: e.target.value } : x))} placeholder="N" style={{ ...inputStyle, padding: "7px 8px", fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ color: "#888", fontSize: 10, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Meilleur tour</label>
                        <input value={bulkForms[i].bestLap} onChange={e => setBulkForms(f => f.map((x, j) => j === i ? { ...x, bestLap: e.target.value } : x))} placeholder="mm:ss.000" style={{ ...inputStyle, padding: "7px 8px", fontSize: 13 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={submitBulk} style={{ marginTop: 8, background: col.main, color: "#000", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>ENREGISTRER LE SPRINT</button>
            </div>
          ) : (
            // Saisie individuelle
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
                  <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Date</label>
                  <input type="date" value={form.date} onChange={e => update("date", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Session</label>
                  <select value={form.session} onChange={e => update("session", e.target.value)} style={inputStyle}>
                    <option value="">Choisir…</option>
                    {KARTING_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Groupe</label>
                  <input type="number" min="1" value={form.group} onChange={e => update("group", e.target.value)} placeholder="ex: 1" style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Place</label>
                  <input type="number" min="1" value={form.rank} onChange={e => update("rank", e.target.value)} placeholder="ex: 3" style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Participants</label>
                  <input type="number" min="1" value={form.total} onChange={e => update("total", e.target.value)} placeholder="ex: 20" style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Meilleur tour</label>
                  <input value={form.bestLap} onChange={e => update("bestLap", e.target.value)} placeholder="mm:ss.000" style={inputStyle} />
                  <span style={{ color: "#71717a", fontSize: 10 }}>ex: 01:23.456</span>
                </div>
              </div>
              {form.rank && form.total && <div style={{ color: col.main, fontWeight: 700, fontSize: 13 }}>→ Top {calcPct(form.rank, form.total)}%</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Notes</label>
                <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button onClick={submit} style={{ marginTop: 4, background: col.main, color: "#000", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>ENREGISTRER</button>
            </div>
          )}
        </div>
      )}

      {subTab === "Historique" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 16px", borderRadius: "999px", border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222", background: filter === f ? col.light : "transparent", color: filter === f ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{f}</button>
            ))}
            <SearchBar value={search} onChange={setSearch} placeholder="Rechercher session, circuit…" />
          </div>
          {groupedDates.length === 0 ? (
            <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>{search ? "Aucun résultat pour cette recherche" : "Aucun résultat enregistré"}</div>
          ) : groupedDates.map(date => {
            const dayEntries = sorted.filter(r => r.date === date);
            const athletes = [...new Set(dayEntries.map(r => r.athlete))];
            return (
              <div key={date} style={{ marginBottom: 16, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
                {/* En-tête de journée */}
                <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#27272a" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{formatDate(date)}</span>
                    <span style={{ color: "#888", fontSize: 12 }}>{dayEntries[0]?.circuit || "RKO Angerville"}</span>
                    {athletes.map(a => <Badge key={a} color={col.main}>{a}</Badge>)}
                  </div>
                </div>
                {/* Lignes par session */}
                {KARTING_SESSIONS.map(sess => {
                  const sessEntries = dayEntries.filter(r => r.session === sess);
                  if (!sessEntries.length) return null;
                  return sessEntries.map(r => {
                    const pct = calcPct(r.rank, r.total);
                    return (
                      <div key={r.id}
                        onClick={() => setSelectedEntry({ ...r, _modalType: "karting" })}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid #111", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#27272a"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                          <div style={{ color: "#666", fontSize: 12, width: 110, flexShrink: 0 }}>{r.session}</div>
                          <div style={{ color: "#888", fontSize: 12, width: 60, flexShrink: 0 }}>{r.group ? `Gr. ${r.group}` : ""}</div>
                          <div style={{ width: 100, flexShrink: 0 }}>
                            {r.rank && <span style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>P{r.rank}<span style={{ color: "#71717a", fontWeight: 400, fontSize: 12 }}>{r.total ? `/${r.total}` : ""}</span></span>}
                            {pct && <div style={{ color: col.main, fontSize: 10, fontWeight: 700 }}>top {pct}%</div>}
                          </div>
                          <div style={{ color: "#888", fontSize: 13, fontFamily: "monospace" }}>{r.bestLap || "—"}</div>
                        </div>
                        <div onClick={e => e.stopPropagation()}>
                          <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteEntry(r.id)} />
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            );
          })}
        </div>
      )}
      <ActivityModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} onEdit={r => startEdit(r)} />
    </div>
  );
}

// ── BODY TAB ──────────────────────────────────────────────────────────────────
const BODY_METRICS = [
  { key: "hydration", label: "Hydratation", unit: "%", min: 40, max: 80 },
  { key: "waterBalance", label: "Équilibre hydrique", unit: "L", min: -5, max: 5 },
  { key: "boneMass", label: "Contenu minéral osseux", unit: "kg", min: 1, max: 5 },
  { key: "muscle", label: "Muscle", unit: "%", min: 20, max: 60 },
  { key: "bmi", label: "IMC", unit: "", min: 15, max: 35 },
  { key: "fatMass", label: "Masse grasse", unit: "%", min: 5, max: 40 },
];

const defaultBodyForm = { date: "", athlete: "Tom", weight: "", hydration: "", waterBalance: "", boneMass: "", muscle: "", bmi: "", fatMass: "", notes: "" };

function RadarChart({ dataA, dataB, labelA, labelB, color }) {
  const N = BODY_METRICS.length;
  const cx = 150, cy = 150, R = 110;
  const angles = BODY_METRICS.map((_, i) => (i / N) * 2 * Math.PI - Math.PI / 2);

  const normalize = (val, metric) => {
    const v = parseFloat(val);
    if (isNaN(v)) return 0;
    return Math.max(0, Math.min(1, (v - metric.min) / (metric.max - metric.min)));
  };

  const toXY = (angle, r) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

  const polyPoints = (data) => BODY_METRICS.map((m, i) => {
    const n = normalize(data?.[m.key], m);
    return toXY(angles[i], n * R);
  });

  const ptsA = polyPoints(dataA);
  const ptsB = dataB ? polyPoints(dataB) : null;

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 320 }}>
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map(r => (
        <circle key={r} cx={cx} cy={cy} r={R * r} fill="none" stroke="#303036" strokeWidth="1" />
      ))}
      {/* Axes */}
      {angles.map((angle, i) => {
        const end = toXY(angle, R);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#3f3f46" strokeWidth="1" />;
      })}
      {/* Labels */}
      {BODY_METRICS.map((m, i) => {
        const pos = toXY(angles[i], R + 22);
        return (
          <text key={m.key} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="9" fontFamily="DM Sans, sans-serif">
            {m.label}
          </text>
        );
      })}
      {/* Data polygon B (behind) */}
      {ptsB && <path d={toPath(ptsB)} fill="#fff" fillOpacity="0.08" stroke="#fff" strokeWidth="1.5" strokeOpacity="0.5" />}
      {/* Data polygon A */}
      {ptsA && <path d={toPath(ptsA)} fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />}
      {/* Dots A */}
      {ptsA.map((p, i) => dataA?.[BODY_METRICS[i].key] && (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#18181b" strokeWidth="1.5" />
      ))}
      {/* Dots B */}
      {ptsB && ptsB.map((p, i) => dataB?.[BODY_METRICS[i].key] && (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#18181b" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function BodyTab({ data, setData }) {
  const [subTab, setSubTab] = useState("Suivi");
  const [form, setForm] = useState(defaultBodyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedAthlete, setSelectedAthlete] = useState("Tom");
  const [compareDateA, setCompareDateA] = useState("");
  const [compareDateB, setCompareDateB] = useState("");
  const col = SPORT_COLORS["Poids & Corps"];
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.date || !form.athlete) return;
    const entry = { ...form, id: editingId || Date.now() };
    if (editingId) { setData(d => d.map(r => r.id === editingId ? entry : r)); setEditingId(null); }
    else setData(d => [...d, entry]);
    setForm(defaultBodyForm);
    setSubTab("Suivi");
  };

  const startEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setSubTab("+"); };
  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const athleteData = data.filter(r => r.athlete === selectedAthlete).sort((a, b) => b.date?.localeCompare(a.date));
  const availableDates = athleteData.map(r => r.date);
  const entryA = athleteData.find(r => r.date === compareDateA);
  const entryB = athleteData.find(r => r.date === compareDateB);
  const latest = athleteData[0];

  const inputStyle = { background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Suivi", "Comparaison"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: subTab === t ? col.main : "transparent", color: subTab === t ? "#000" : "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{t}</button>
          ))}
        </div>
        <button onClick={() => { setSubTab("+"); setEditingId(null); setForm(defaultBodyForm); }} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${subTab === "+" ? "#e53e3e" : "#52525b"}`, background: subTab === "+" ? "#e53e3e" : "transparent", color: subTab === "+" ? "#fff" : "#888", fontWeight: 900, fontSize: 20, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>

      {subTab === "+" && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier" : "Ajouter une mesure"}</div>
            {editingId && <button onClick={() => { setEditingId(null); setForm(defaultBodyForm); setSubTab("Suivi"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
              <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Date</label>
              <input type="date" value={form.date} onChange={e => update("date", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Poids (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={e => update("weight", e.target.value)} placeholder="ex: 72.5" style={inputStyle} />
            </div>
            {BODY_METRICS.map(m => (
              <div key={m.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{m.label}{m.unit ? ` (${m.unit})` : ""}</label>
                <input type="number" step="0.1" value={form[m.key]} onChange={e => update(m.key, e.target.value)} placeholder="—" style={inputStyle} />
              </div>
            ))}
          </div>
          <button onClick={submit} style={{ marginTop: 16, background: col.main, color: "#000", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>ENREGISTRER</button>
        </div>
      )}

      {subTab === "Suivi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {ATHLETES.map(a => (
              <button key={a} onClick={() => setSelectedAthlete(a)} style={{ padding: "6px 18px", borderRadius: "999px", border: selectedAthlete === a ? `1.5px solid ${col.main}` : "1.5px solid #222", background: selectedAthlete === a ? col.light : "transparent", color: selectedAthlete === a ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{a}</button>
            ))}
          </div>
          {latest && (
            <div style={{ background: "#1f1f23", border: `1px solid ${col.border}`, borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Dernière mesure · {formatDate(latest.date)}</div>
                  {latest.weight && <div style={{ color: "#fff", fontWeight: 900, fontSize: 36, marginTop: 4 }}>{latest.weight} <span style={{ color: "#888", fontSize: 16, fontWeight: 400 }}>kg</span></div>}
                </div>
                <ActionButtons accentColor={col.main} onEdit={() => startEdit(latest)} onDelete={() => deleteEntry(latest.id)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                {BODY_METRICS.map(m => latest[m.key] && (
                  <div key={m.key} style={{ background: "#27272a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{latest[m.key]}<span style={{ color: "#888", fontSize: 12, fontWeight: 400 }}> {m.unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {athleteData.length === 0 && <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Aucune mesure enregistrée pour {selectedAthlete}.</div>}
          {athleteData.slice(1).map(r => (
            <div key={r.id} style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>{formatDate(r.date)}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {r.weight && <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.weight} kg</span>}
                  {BODY_METRICS.filter(m => r[m.key]).map(m => (
                    <span key={m.key} style={{ color: "#888", fontSize: 12 }}>{m.label}: <span style={{ color: "#888" }}>{r[m.key]}{m.unit}</span></span>
                  ))}
                </div>
              </div>
              <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteEntry(r.id)} />
            </div>
          ))}
        </div>
      )}

      {subTab === "Comparaison" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {ATHLETES.map(a => (
              <button key={a} onClick={() => setSelectedAthlete(a)} style={{ padding: "6px 18px", borderRadius: "999px", border: selectedAthlete === a ? `1.5px solid ${col.main}` : "1.5px solid #222", background: selectedAthlete === a ? col.light : "transparent", color: selectedAthlete === a ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{a}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[{ label: "Date A", val: compareDateA, set: setCompareDateA, color: col.main }, { label: "Date B", val: compareDateB, set: setCompareDateB, color: "#fff" }].map(({ label, val, set, color }) => (
              <div key={label} style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, marginRight: 6 }} />{label}</label>
                <select value={val} onChange={e => set(e.target.value)} style={{ background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "9px 12px", color: val ? "#fff" : "#888", fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="">Choisir une date…</option>
                  {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            ))}
          </div>
          {(entryA || entryB) && (
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: "0 0 auto" }}>
                <RadarChart dataA={entryA} dataB={entryB} labelA={compareDateA} labelB={compareDateB} color={col.main} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {entryA?.weight && <div style={{ marginBottom: 12 }}>
                  <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Poids</div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {entryA && <span style={{ color: col.main, fontWeight: 800, fontSize: 16 }}>{entryA.weight} kg <span style={{ color: "#888", fontSize: 11 }}>{compareDateA}</span></span>}
                    {entryB && entryB.weight && <span style={{ color: "#888", fontWeight: 800, fontSize: 16 }}>{entryB.weight} kg <span style={{ color: "#888", fontSize: 11 }}>{compareDateB}</span></span>}
                  </div>
                </div>}
                {BODY_METRICS.map(m => {
                  const vA = entryA?.[m.key], vB = entryB?.[m.key];
                  if (!vA && !vB) return null;
                  const diff = vA && vB ? (parseFloat(vA) - parseFloat(vB)).toFixed(1) : null;
                  return (
                    <div key={m.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #111" }}>
                      <span style={{ color: "#888", fontSize: 12 }}>{m.label}</span>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {vA && <span style={{ color: col.main, fontWeight: 700, fontSize: 13 }}>{vA}{m.unit}</span>}
                        {vB && <span style={{ color: "#888", fontWeight: 700, fontSize: 13 }}>{vB}{m.unit}</span>}
                        {diff !== null && <span style={{ color: parseFloat(diff) > 0 ? "#4ade80" : parseFloat(diff) < 0 ? "#f87171" : "#888", fontSize: 11, fontWeight: 700 }}>{parseFloat(diff) > 0 ? "+" : ""}{diff}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!entryA && !entryB && <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Sélectionnez deux dates pour comparer.</div>}
        </div>
      )}
    </div>
  );
}

// ── HYROX TRAINING TAB ────────────────────────────────────────────────────────
const HYROX_STATION_BASES = ["SkiErg", "Sled Push", "Sled Pull", "Burpee Broad Jump", "Rowing", "Farmers Carry", "Sandbag Lunges", "Wall Balls", "Run", "Vélo"];

const HYROX_STATION_DEFAULTS = {
  "SkiErg":           { distance: "1000", unit: "m" },
  "Sled Push":        { distance: "50",   unit: "m" },
  "Sled Pull":        { distance: "50",   unit: "m" },
  "Burpee Broad Jump":{ distance: "80",   unit: "m" },
  "Rowing":           { distance: "1000", unit: "m" },
  "Farmers Carry":    { distance: "200",  unit: "m" },
  "Sandbag Lunges":   { distance: "100",  unit: "m" },
  "Wall Balls":       { distance: "100",  unit: "reps" },
  "Run":              { distance: "1000", unit: "m" },
  "Vélo":             { distance: "",     unit: "m" },
};
const defaultTrainingForm = { date: "", athlete: "Tom", templateId: "", totalTime: "", isShared: false, trainingPartner: "", notes: "", segments: {} };

function HyroxTrainingTab({ data, setData, templates, setTemplates, partners, setPartners, editId, onEditDone }) {
  const [subTab, setSubTab] = useState("Historique");
  const [form, setForm] = useState(defaultTrainingForm);
  const [editingId, setEditingId] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: "", segments: [] });
  const [filter, setFilter] = useState("Tous");
  const [compareTemplate, setCompareTemplate] = useState("");
  const [newPartner, setNewPartner] = useState("");
  const [showAddPartner, setShowAddPartner] = useState(false);
  const col = SPORT_COLORS["Hyrox"];

  // Ouvrir le formulaire d'édition si editId est passé depuis l'historique
  useEffect(() => {
    if (editId && data.length > 0) {
      const r = data.find(x => String(x.id) === String(editId));
      if (r) {
        setForm({ ...r });
        setEditingId(r.id);
        setSubTab("+");
        if (onEditDone) onEditDone();
      }
    }
  }, [editId, data]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateSegment = (idx, v) => setForm(f => ({ ...f, segments: { ...f.segments, [idx]: v } }));

  const addPartner = () => {
    const trimmed = newPartner.trim();
    if (!trimmed || (partners || []).includes(trimmed)) return;
    setPartners([...(partners || []), trimmed]);
    setNewPartner("");
    setShowAddPartner(false);
    setForm(f => ({ ...f, trainingPartner: trimmed }));
  };

  const selectedTemplate = templates.find(t => String(t.id) === String(form.templateId));

  const submit = () => {
    if (!form.date || !form.templateId) return;
    if (editingId) {
      setData(d => d.map(r => r.id === editingId ? { ...form, id: editingId } : r));
      setEditingId(null);
    } else {
      const sharedId = Date.now();
      const entryA = { ...form, id: sharedId };
      if (form.isShared && form.trainingPartner) {
        // Créer une entrée miroir pour le partenaire
        const entryB = {
          ...form,
          id: sharedId + 1,
          athlete: form.trainingPartner,
          trainingPartner: form.athlete,
          sharedId,
        };
        entryA.sharedId = sharedId;
        setData(d => [...d, entryA, entryB]);
      } else {
        setData(d => [...d, entryA]);
      }
    }
    setForm(defaultTrainingForm);
    setSubTab("Historique");
  };

  const saveTemplate = () => {
    if (!templateForm.name || !templateForm.segments.length) return;
    if (editingTemplate) {
      setTemplates(t => t.map(x => String(x.id) === String(editingTemplate) ? { ...templateForm, id: editingTemplate } : x));
      setEditingTemplate(null);
    } else {
      setTemplates(t => [...t, { ...templateForm, id: Date.now() }]);
    }
    setTemplateForm({ name: "", segments: [] });
  };

  const addSegment = () => {
    const def = HYROX_STATION_DEFAULTS["SkiErg"];
    setTemplateForm(f => ({ ...f, segments: [...f.segments, { type: "SkiErg", distance: def.distance, unit: def.unit }] }));
  };
  const updateTplSegment = (i, k, v) => setTemplateForm(f => ({
    ...f,
    segments: f.segments.map((s, j) => {
      if (j !== i) return s;
      if (k === "type") {
        const def = HYROX_STATION_DEFAULTS[v] || { distance: "", unit: "m" };
        return { ...s, type: v, distance: def.distance, unit: def.unit };
      }
      return { ...s, [k]: v };
    })
  }));
  const removeSegment = (i) => setTemplateForm(f => ({ ...f, segments: f.segments.filter((_, j) => j !== i) }));
  const duplicateSegment = (i) => setTemplateForm(f => ({
    ...f,
    segments: [...f.segments.slice(0, i + 1), { ...f.segments[i] }, ...f.segments.slice(i + 1)]
  }));

  const dragIndex = useRef(null);
  const onDragStart = (i) => { dragIndex.current = i; };
  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === i) return;
    setTemplateForm(f => {
      const segs = [...f.segments];
      const [moved] = segs.splice(dragIndex.current, 1);
      segs.splice(i, 0, moved);
      dragIndex.current = i;
      return { ...f, segments: segs };
    });
  };
  const onDragEnd = () => { dragIndex.current = null; };
  const deleteTemplate = (id) => setTemplates(t => t.filter(x => String(x.id) !== String(id)));
  const startEdit = (r) => { setForm({ ...r }); setEditingId(r.id); setSubTab("+"); };
  const deleteEntry = (id) => setData(d => d.filter(r => r.id !== id));

  const filtered = filter === "Tous" ? data : data.filter(r => r.athlete === filter);
  const sorted = [...filtered].sort((a, b) => b.date?.localeCompare(a.date));

  // Progression data for compare
  const progressionData = compareTemplate
    ? [...data].filter(r => r.templateId === compareTemplate && r.totalTime).sort((a, b) => a.date?.localeCompare(b.date))
    : [];

  const inputStyle = { background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 10, padding: 4 }}>
          {["Historique", "Progression", "Templates"].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={{ padding: "7px 14px", borderRadius: 7, border: "none", background: subTab === t ? col.main : "transparent", color: subTab === t ? "#000" : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{t}</button>
          ))}
        </div>
        <button onClick={() => { setSubTab("+"); setEditingId(null); setForm(defaultTrainingForm); }} style={{ width: 36, height: 36, borderRadius: 10, border: `1.5px solid ${subTab === "+" ? "#e53e3e" : "#52525b"}`, background: subTab === "+" ? "#e53e3e" : "transparent", color: subTab === "+" ? "#fff" : "#888", fontWeight: 900, fontSize: 20, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>

      {subTab === "+" && (
        <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{editingId ? "✎ Modifier" : "Ajouter une séance"}</div>
            {editingId && <button onClick={() => { setEditingId(null); setForm(defaultTrainingForm); setSubTab("Historique"); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Athlète</label>
              <AthleteSelector value={form.athlete} onChange={v => update("athlete", v)} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Date</label>
              <input type="date" value={form.date} onChange={e => update("date", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Template</label>
              <select value={form.templateId} onChange={e => { update("templateId", e.target.value); update("segments", {}); }} style={inputStyle}>
                <option value="">Choisir un template…</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Temps total</label>
              <input value={form.totalTime} onChange={e => update("totalTime", e.target.value)} placeholder="mm:ss" style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Solo", "Partagé"].map(t => (
                  <button key={t} onClick={() => update("isShared", t === "Partagé")} style={{
                    padding: "7px 16px", borderRadius: 8, fontFamily: "inherit", cursor: "pointer", fontWeight: 700, fontSize: 12,
                    border: `1.5px solid ${(t === "Partagé") === form.isShared ? col.main : "#3f3f46"}`,
                    background: (t === "Partagé") === form.isShared ? col.main + "22" : "transparent",
                    color: (t === "Partagé") === form.isShared ? col.main : "#888",
                  }}>{t}</button>
                ))}
              </div>
              {form.isShared && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ color: "#888", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Partenaire</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <select value={form.trainingPartner} onChange={e => update("trainingPartner", e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                      <option value="">— Choisir —</option>
                      {ATHLETES.filter(a => a !== form.athlete).map(a => <option key={a} value={a}>{a}</option>)}
                      {(partners || []).filter(p => !ATHLETES.includes(p)).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={() => setShowAddPartner(v => !v)} style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      border: `1.5px solid ${showAddPartner ? col.main : "#3f3f46"}`,
                      background: showAddPartner ? col.main + "22" : "transparent",
                      color: showAddPartner ? col.main : "#888",
                      fontWeight: 900, fontSize: 18, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                  {showAddPartner && (
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <input value={newPartner} onChange={e => setNewPartner(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addPartner()}
                        placeholder="Prénom du partenaire..."
                        style={{ ...inputStyle, flex: 1, border: `1px solid ${col.main}44` }} />
                      <button onClick={addPartner} style={{
                        padding: "8px 14px", borderRadius: 8, border: "none",
                        background: col.main, color: "#000", fontWeight: 800, fontSize: 12,
                        cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                      }}>Ajouter</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedTemplate && (
            <div>
              <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Temps par segment (optionnel)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 16 }}>
                {selectedTemplate.segments.map((seg, i) => {
                  const timeStr = form.segments?.[i] || "";
                  const secs = parseTimeInput(timeStr);
                  // Calcul allure pour les segments Run ou Vélo en m ou km
                  const isRun = seg.type === "Run" || seg.type === "Vélo";
                  const distKm = seg.distance
                    ? seg.unit === "km" ? parseFloat(seg.distance) : parseFloat(seg.distance) / 1000
                    : null;
                  const pace = isRun && secs && distKm
                    ? (() => {
                        const secsPerKm = secs / distKm;
                        const m = Math.floor(secsPerKm / 60);
                        const s = Math.round(secsPerKm % 60);
                        return `${m}:${String(s).padStart(2, "0")}/km`;
                      })()
                    : null;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ color: "#666", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        {seg.distance ? `${seg.distance}${seg.unit} ` : ""}{seg.type}
                      </label>
                      <input value={timeStr} onChange={e => updateSegment(i, e.target.value)} placeholder="mm:ss" style={inputStyle} />
                      {pace && (
                        <div style={{ color: col.main, fontSize: 11, fontWeight: 700 }}>→ {pace}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Notes</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <button onClick={submit} style={{ background: col.main, color: "#000", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>ENREGISTRER</button>
        </div>
      )}

      {subTab === "Templates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Créer un template */}
          <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 14 }}>{editingTemplate ? "✎ Modifier le template" : "Créer un template"}</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <input value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} placeholder="Nom du template (ex: Roxzone, Full Hyrox…)" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={saveTemplate} style={{ padding: "9px 18px", background: col.main, color: "#000", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                {editingTemplate ? "Sauvegarder" : "Créer"}
              </button>
            </div>
            {templateForm.segments.map((seg, i) => (
              <div key={i}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragOver={e => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", cursor: "grab", opacity: 1, transition: "opacity 0.15s" }}>
                {/* Drag handle */}
                <div style={{ color: "#52525b", fontSize: 16, cursor: "grab", flexShrink: 0, userSelect: "none", paddingTop: 2 }}>⠿</div>
                <select value={seg.type} onChange={e => updateTplSegment(i, "type", e.target.value)} style={{ ...inputStyle, flex: 2 }}>
                  {HYROX_STATION_BASES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={seg.distance} onChange={e => updateTplSegment(i, "distance", e.target.value)} placeholder="Distance" style={{ ...inputStyle, flex: 1 }} />
                <select value={seg.unit} onChange={e => updateTplSegment(i, "unit", e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                  {["m", "km", "reps", "cal"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                {/* Duplicate */}
                <button onClick={() => duplicateSegment(i)} title="Dupliquer" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#888", fontSize: 14, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>⧉</button>
                {/* Remove */}
                <button onClick={() => removeSegment(i)} title="Supprimer" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #333", background: "transparent", color: "#f87144", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>×</button>
              </div>
            ))}
            <button onClick={addSegment} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${col.main}44`, background: "transparent", color: col.main, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>+ Ajouter un segment</button>
          </div>

          {/* Liste des templates */}
          {templates.length === 0 ? (
            <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Aucun template créé.</div>
          ) : templates.map(t => (
            <div key={t.id} style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{t.name}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setTemplateForm({ name: t.name, segments: t.segments }); setEditingTemplate(t.id); }} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #222", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer" }}>✎</button>
                  <button onClick={() => deleteTemplate(t.id)} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #222", background: "transparent", color: "#f87144", fontSize: 12, cursor: "pointer" }}>×</button>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {t.segments.map((s, i) => (
                  <span key={i} style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, color: col.main }}>
                    {s.distance ? `${s.distance}${s.unit} ` : ""}{s.type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "Progression" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ color: "#666", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>Template</label>
            <select value={compareTemplate} onChange={e => setCompareTemplate(e.target.value)} style={{ background: "#27272a", border: "1px solid #222", borderRadius: 8, padding: "10px 14px", color: compareTemplate ? "#fff" : "#888", fontSize: 14, outline: "none", fontFamily: "inherit", cursor: "pointer", maxWidth: 320 }}>
              <option value="">Choisir un template…</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {compareTemplate && progressionData.length === 0 && <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Aucune séance enregistrée avec ce template.</div>}

          {progressionData.length > 0 && (() => {
            const allSecs = progressionData.map(r => parseTimeInput(r.totalTime)).filter(Boolean);
            const minS = Math.min(...allSecs), maxS = Math.max(...allSecs), range = maxS - minS || 1;
            const PAD_L = 70, PAD_R = 20, PAD_T = 16, PAD_B = 36, W = 800, H = 200;
            const cW = W - PAD_L - PAD_R, cH = H - PAD_T - PAD_B;
            const tpl = templates.find(t => String(t.id) === String(compareTemplate));
            const byAthlete = {};
            ATHLETES.forEach(a => { byAthlete[a] = progressionData.filter(r => r.athlete === a); });
            const ATHLETE_COLORS = { [ATHLETES[0]]: col.main, [ATHLETES[1]]: "#fff" };
            const allDates = [...new Set(progressionData.map(r => r.date))].sort();
            const minD = new Date(allDates[0]).getTime(), maxD = new Date(allDates[allDates.length-1]).getTime(), dSpan = maxD - minD || 1;
            const toX = d => PAD_L + ((new Date(d).getTime() - minD) / dSpan) * cW;
            const toY = s => PAD_T + ((maxS - s) / range) * cH;
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 16 }}>
                  {ATHLETES.filter(a => byAthlete[a].length).map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ATHLETE_COLORS[a] }} />
                      <span style={{ color: "#888", fontSize: 12, fontWeight: 600 }}>{a}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
                    {[minS, minS + range/2, maxS].map((s, i) => (
                      <g key={i}>
                        <line x1={PAD_L} y1={toY(s)} x2={W-PAD_R} y2={toY(s)} stroke="#2e2e33" strokeWidth="1" />
                        <text x={PAD_L-8} y={toY(s)+4} fill="#888" fontSize="10" textAnchor="end">{formatTime(Math.round(s))}</text>
                      </g>
                    ))}
                    {allDates.filter((_, i) => i % Math.max(1, Math.ceil(allDates.length/6)) === 0 || i === allDates.length-1).map(d => (
                      <text key={d} x={toX(d)} y={H-PAD_B+18} fill="#888" fontSize="10" textAnchor="middle">{d.slice(0,7)}</text>
                    ))}
                    {ATHLETES.filter(a => byAthlete[a].length).map(a => {
                      const acol = ATHLETE_COLORS[a];
                      const pts = byAthlete[a].map(r => ({ x: toX(r.date), y: toY(parseTimeInput(r.totalTime)), r })).filter(p => !isNaN(p.y));
                      const isPR = s => s === Math.min(...byAthlete[a].map(r => parseTimeInput(r.totalTime)).filter(Boolean));
                      return (
                        <g key={a}>
                          {pts.length > 1 && <polyline points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={acol} strokeWidth="2.5" strokeLinejoin="round" />}
                          {pts.map((p, i) => {
                            const s = parseTimeInput(p.r.totalTime);
                            const pr = isPR(s);
                            return (
                              <g key={i}>
                                {pr && <circle cx={p.x} cy={p.y} r="10" fill={acol} opacity="0.15" />}
                                <circle cx={p.x} cy={p.y} r={pr ? 6 : 5} fill={acol} stroke="#1f1f23" strokeWidth="2" />
                                {pr && <text x={p.x} y={p.y-14} fill={acol} fontSize="10" textAnchor="middle" fontWeight="700">★PR</text>}
                                <text x={p.x} y={p.y+(p.y < PAD_T+30 ? 18 : -12)} fill={acol} fontSize="10" textAnchor="middle" opacity="0.8">{pr ? "" : formatTime(s)}</text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Tableau détail */}
                <div style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "auto" }}>
                  <div style={{ minWidth: 400, display: "grid", gridTemplateColumns: `100px 80px 90px 80px${tpl ? tpl.segments.map(() => " 90px").join("") : ""}`, background: "#27272a", borderBottom: "1px solid #1a1a1a" }}>
                    {["Date", "Athlète", "Total", "Évol.", ...(tpl?.segments.map(s => `${s.distance||""}${s.unit||""} ${s.type}`) || [])].map(h => (
                      <div key={h} style={{ padding: "10px 12px", color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                    ))}
                  </div>
                  {progressionData.map((r, i) => {
                    const secs = parseTimeInput(r.totalTime);
                    const prev = progressionData.slice(0, i).filter(p => p.athlete === r.athlete).pop();
                    const prevSecs = prev ? parseTimeInput(prev.totalTime) : null;
                    const diff = prevSecs ? secs - prevSecs : null;
                    const isPR = secs === Math.min(...progressionData.filter(x => x.athlete === r.athlete).map(x => parseTimeInput(x.totalTime)).filter(Boolean));
                    const acol = ATHLETE_COLORS[r.athlete];
                    return (
                      <div key={r.id} style={{ minWidth: 400, display: "grid", gridTemplateColumns: `100px 80px 90px 80px${tpl ? tpl.segments.map(() => " 90px").join("") : ""}`, borderBottom: i < progressionData.length-1 ? "1px solid #111" : "none", background: i%2===0 ? "#1f1f23" : "#27272a" }}>
                        <div style={{ padding: "10px 12px", color: "#777", fontSize: 12 }}>{formatDate(r.date)}{isPR && <span style={{ marginLeft: 6, color: col.main, fontSize: 9, fontWeight: 800 }}>★PR</span>}</div>
                        <div style={{ padding: "10px 12px" }}><span style={{ color: acol, fontSize: 12, fontWeight: 700 }}>{r.athlete}</span></div>
                        <div style={{ padding: "10px 12px", color: "#fff", fontWeight: 800, fontSize: 13 }}>{r.totalTime}</div>
                        <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: diff === null ? "#52525b" : diff < 0 ? "#4ade80" : "#f87171" }}>{diff === null ? "—" : `${diff < 0 ? "▼" : "▲"} ${formatTime(Math.abs(diff))}`}</div>
                        {tpl?.segments.map((seg, si) => (
                          <div key={si} style={{ padding: "10px 12px", color: "#666", fontSize: 12 }}>{r.segments?.[si] || "—"}</div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {subTab === "Historique" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Tous", ...ATHLETES].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "5px 16px", borderRadius: "999px", border: filter === f ? `1.5px solid ${col.main}` : "1.5px solid #222", background: filter === f ? col.light : "transparent", color: filter === f ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>{f}</button>
            ))}
          </div>
          {sorted.length === 0 ? (
            <div style={{ color: "#52525b", textAlign: "center", padding: 40 }}>Aucune séance enregistrée</div>
          ) : sorted.map(r => {
            const tpl = templates.find(t => String(t.id) === String(r.templateId));
            return (
              <div key={r.id} style={{ background: "#1f1f23", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                      <Badge color={col.main}>{r.athlete}</Badge>
                      <span style={{ color: "#fff", fontWeight: 700 }}>{tpl?.name || "—"}</span>
                      {r.trainingPartner && <span style={{ color: "#888", fontSize: 12 }}>avec {r.trainingPartner}</span>}
                      <span style={{ color: "#888", fontSize: 12 }}>{formatDate(r.date)}</span>
                    </div>
                    {r.notes && <div style={{ color: "#888", fontSize: 12 }}>{r.notes}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <ActionButtons accentColor={col.main} onEdit={() => startEdit(r)} onDelete={() => deleteEntry(r.id)} />
                    <div style={{ color: col.main, fontWeight: 800, fontSize: 18 }}>{r.totalTime}</div>
                  </div>
                </div>
                {tpl && r.segments && Object.keys(r.segments).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {tpl.segments.map((seg, i) => r.segments[i] && (
                      <div key={i} style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>
                        <span style={{ color: "#888" }}>{seg.distance ? `${seg.distance}${seg.unit} ` : ""}{seg.type}: </span>
                        <span style={{ color: col.main, fontWeight: 700 }}>{r.segments[i]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── PR NOTIFICATION ───────────────────────────────────────────────────────────
// ── UPCOMING EVENTS ───────────────────────────────────────────────────────────
function UpcomingEventsBanner({ sport, upcomingEvents, setUpcomingEvents }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", athletes: [], sport });
  const col = SPORT_COLORS[sport];

  const upcoming = (upcomingEvents || [])
    .filter(e => e.sport === sport && e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date));

  const addEvent = () => {
    if (!form.name || !form.date) return;
    setUpcomingEvents(d => [...d, { ...form, id: Date.now(), athletes: form.athletes.length ? form.athletes : ATHLETES }]);
    setForm({ name: "", date: "", athletes: [], sport });
    setShowForm(false);
  };

  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (upcoming.length === 0 && !showForm) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#27272a", borderRadius: 10, marginBottom: 16 }}>
        <span style={{ color: "#52525b", fontSize: 13 }}>Aucune course à venir</span>
        <button onClick={() => setShowForm(true)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${col.main}44`, background: "transparent", color: col.main, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Ajouter</button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {upcoming.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: showForm ? 10 : 0 }}>
          {upcoming.map(e => {
            const days = daysUntil(e.date);
            return (
              <div key={e.id} style={{ background: col.light, border: `1px solid ${col.border}`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{e.name}</div>
                  <div style={{ color: "#71717a", fontSize: 11 }}>{formatDate(e.date)} · {e.athletes?.join(", ")}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: col.main, fontWeight: 900, fontSize: 16 }}>{days}j</div>
                  <button onClick={() => setUpcomingEvents(d => d.filter(x => x.id !== e.id))} style={{ background: "none", border: "none", color: "#52525b", fontSize: 14, cursor: "pointer", padding: 0 }}>×</button>
                </div>
              </div>
            );
          })}
          <button onClick={() => setShowForm(v => !v)} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${col.main}44`, background: "transparent", color: col.main, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+</button>
        </div>
      )}
      {showForm && (
        <div style={{ background: "#27272a", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 2, minWidth: 140 }}>
            <label style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Nom</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Paris Hyrox" style={{ background: "#1f1f23", border: "1px solid #3f3f46", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 120 }}>
            <label style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ background: "#1f1f23", border: "1px solid #3f3f46", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: "#71717a", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Athlètes</label>
            <div style={{ display: "flex", gap: 6 }}>
              {ATHLETES.map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, athletes: f.athletes.includes(a) ? f.athletes.filter(x => x !== a) : [...f.athletes, a] }))} style={{ padding: "6px 12px", borderRadius: 7, border: `1.5px solid ${form.athletes.includes(a) ? col.main : "#3f3f46"}`, background: form.athletes.includes(a) ? col.main + "22" : "transparent", color: form.athletes.includes(a) ? col.main : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={addEvent} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: col.main, color: "#000", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Ajouter</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #3f3f46", background: "transparent", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PRToast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: "#303036", border: "1px solid #A8FF3E44",
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
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer", marginLeft: 8 }}>×</button>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function RecentActivity({ runData, hyroxData, kartingData, visibleSports, collapsed }) {
  if (collapsed["recent"]) return null;
  const recent = [
    ...runData.filter(r => visibleSports.includes("Course à pied")).map(r => ({ ...r, sport: "Course à pied" })),
    ...hyroxData.filter(r => visibleSports.includes("Hyrox")).map(r => ({ ...r, sport: "Hyrox" })),
    ...(kartingData||[]).filter(r => visibleSports.includes("Karting")).map(r => ({ ...r, sport: "Karting" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  if (!recent.length) {
    return <div style={{ color: "#52525b", textAlign: "center", padding: 32 }}>Aucune activité pour l'instant.</div>;
  }

  return (
    <div>
      {recent.map(r => {
        const col = SPORT_COLORS[r.sport];
        return (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "#1f1f23", border: "1px solid #303036", borderLeft: `3px solid ${col.main}`, borderRadius: 12, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{SPORT_ICONS[r.sport]}</span>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge color={col.main}>{r.athlete}</Badge>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{r.sport}</span>
                  {r.raceName && <span style={{ color: "#71717a", fontSize: 12 }}>· {r.raceName}</span>}
                  {r.eventName && <span style={{ color: "#71717a", fontSize: 12 }}>· {r.eventName}</span>}
                </div>
                <div style={{ color: "#71717a", fontSize: 11, marginTop: 2 }}>{formatDate(r.date)}</div>
              </div>
            </div>
            <div style={{ color: col.main, fontWeight: 700, fontSize: 15 }}>
              {r.sport === "Course à pied" && r.secs ? formatTime(r.secs) : ""}
              {r.sport === "Hyrox" && r.totalSecs ? formatTime(r.totalSecs) : ""}
              {r.sport === "Karting" && r.rank ? ("P" + r.rank + (r.total ? "/" + r.total : "") + " · " + r.session) : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KartingCharts({ kartingData, visibleSports, collapsed, SectionHeader }) {
  if (!visibleSports.includes("Karting")) return null;
  const circuits = [...new Set((kartingData||[]).map(r => r.circuit).filter(Boolean))];
  const hasData = circuits.some(c =>
    ATHLETES.some(a => (kartingData||[]).filter(r => r.athlete === a && r.circuit === c && r.bestLap).length > 1)
  );
  if (!hasData) return null;

  const ATHLETE_COLORS = { Tom: "#60a5fa", Camille: "#f472b6" };
  const secsFmt = (s) => {
    if (s >= 3600) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h + "h" + String(m).padStart(2,"0"); }
    const m = Math.floor(s / 60); const sec = s % 60;
    return m + ":" + String(sec).padStart(2,"0");
  };

  const getDatasets = (circuit) => ATHLETES.map(a => ({
    label: a, color: ATHLETE_COLORS[a],
    points: (kartingData||[])
      .filter(r => r.athlete === a && r.circuit === circuit && r.bestLap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => {
        const parts = r.bestLap.split(".");
        const timePart = parts[0];
        const timeSplit = timePart.split(":");
        const secs = parseInt(timeSplit[0]) * 60 + parseInt(timeSplit[1] || "0");
        return { x: new Date(r.date).getTime(), y: secs };
      }),
  }));

  return (
    <div>
      <SectionHeader sectionKey="kartCharts" label="📈 Progression Karting" />
      {!collapsed["kartCharts"] && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {circuits.map(circuit => {
            const ds = getDatasets(circuit);
            if (!ds.some(d => d.points.length > 1)) return null;
            return <LineChart key={circuit} title={circuit} datasets={ds} yFormat={secsFmt} sport="Karting" />;
          })}
        </div>
      )}
    </div>
  );
}

function Dashboard({ runData, hyroxData, kartingData, bodyData, upcomingEvents, setUpcomingEvents }) {
  const [visibleSports, setVisibleSports] = useState(["Course à pied", "Hyrox", "Karting"]);
  const toggleSport = (sport) => setVisibleSports(v => v.includes(sport) ? v.filter(s => s !== sport) : [...v, sport]);
  const [collapsed, setCollapsed] = useState({});
  const toggleSection = (key) => setCollapsed(v => ({ ...v, [key]: !v[key] }));
  const SectionHeader = ({ sectionKey, label }) => (
    <div
      onClick={() => toggleSection(sectionKey)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: collapsed[sectionKey] ? 0 : 12, cursor: "pointer", userSelect: "none" }}
    >
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{label}</div>
      <span style={{ color: "#52525b", fontSize: 13 }}>{collapsed[sectionKey] ? "▼" : "▲"}</span>
    </div>
  );

  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const today = new Date().toISOString().slice(0, 10);
  const oneYearAgo = new Date(Date.now() - 365 * MS_PER_DAY).toISOString().slice(0, 10);

  // ── Courses à venir ──
  const upcoming = (upcomingEvents || [])
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const daysUntil = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / MS_PER_DAY);

  // ── Records de l'année (fil d'actualité) ──
  const yearRecords = [];

  // Run PRs par athlète+distance dans l'année
  ATHLETES.forEach(athlete => {
    RUNNING_PR_DISTANCES.forEach(dist => {
      const runs = runData.filter(r => r.athlete === athlete && r.distance === dist && r.secs && r.date >= oneYearAgo)
        .sort((a, b) => a.date.localeCompare(b.date));
      const allRuns = runData.filter(r => r.athlete === athlete && r.distance === dist && r.secs)
        .sort((a, b) => a.date.localeCompare(b.date));
      runs.forEach(run => {
        const before = allRuns.filter(r => r.date < run.date);
        const prevBest = before.length ? Math.min(...before.map(r => r.secs)) : null;
        if (!prevBest || run.secs < prevBest) {
          yearRecords.push({
            date: run.date, athlete, sport: "Course à pied",
            label: dist, value: formatTime(run.secs),
            delta: prevBest ? run.secs - prevBest : null,
            color: SPORT_COLORS["Course à pied"].main,
            icon: "🏃",
          });
        }
      });
    });
  });

  // Hyrox total PRs dans l'année
  ATHLETES.forEach(athlete => {
    const races = hyroxData.filter(r => r.athlete === athlete && r.totalSecs)
      .sort((a, b) => a.date.localeCompare(b.date));
    races.filter(r => r.date >= oneYearAgo).forEach(run => {
      const before = races.filter(r => r.date < run.date);
      const prevBest = before.length ? Math.min(...before.map(r => r.totalSecs)) : null;
      if (!prevBest || run.totalSecs < prevBest) {
        yearRecords.push({
          date: run.date, athlete, sport: "Hyrox",
          label: "Temps total", value: formatTime(run.totalSecs),
          sub: run.eventName || "",
          delta: prevBest ? run.totalSecs - prevBest : null,
          color: SPORT_COLORS["Hyrox"].main, icon: "⚡",
        });
      }
    });
    // Hyrox station PRs
    HYROX_STATIONS.forEach(station => {
      const stRaces = races.filter(r => r.stationSecs?.[station]);
      stRaces.filter(r => r.date >= oneYearAgo).forEach(run => {
        const before = stRaces.filter(r => r.date < run.date);
        const prevBest = before.length ? Math.min(...before.map(r => r.stationSecs[station])) : null;
        if (!prevBest || run.stationSecs[station] < prevBest) {
          yearRecords.push({
            date: run.date, athlete, sport: "Hyrox",
            label: station, value: formatTime(run.stationSecs[station]),
            delta: prevBest ? run.stationSecs[station] - prevBest : null,
            color: SPORT_COLORS["Hyrox"].main, icon: "⚡",
          });
        }
      });
    });
  });

  yearRecords.sort((a, b) => b.date.localeCompare(a.date));

  // ── Graphiques de progression ──
  const ATHLETE_COLORS = { Tom: "#60a5fa", Camille: "#f472b6" };

  const LineChart = ({ title, datasets, yFormat, sport }) => {
    if (!datasets.some(d => d.points.length > 1)) return null;
    const allPoints = datasets.flatMap(d => d.points);
    if (!allPoints.length) return null;
    const W = 320, H = 120, PAD = { top: 16, right: 16, bottom: 28, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const allVals = allPoints.map(p => p.y);
    const minY = Math.min(...allVals);
    const maxY = Math.max(...allVals);
    const rangeY = maxY - minY || 1;
    const allDates = allPoints.map(p => p.x);
    const minX = Math.min(...allDates);
    const maxX = Math.max(...allDates);
    const rangeX = maxX - minX || 1;

    const toSvgX = x => PAD.left + ((x - minX) / rangeX) * chartW;
    const toSvgY = y => PAD.top + ((maxY - y) / rangeY) * chartH;

    const col = SPORT_COLORS[sport];

    return (
      <div style={{ background: "#1f1f23", border: "1px solid #303036", borderRadius: 12, padding: "14px 16px", minWidth: 280, flex: 1 }}>
        <div style={{ color: "#888", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{title}</div>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {/* Y axis labels */}
          {[0, 0.5, 1].map(t => {
            const val = minY + t * rangeY;
            const y = toSvgY(val);
            return (
              <g key={t}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#27272a" strokeWidth="1" />
                <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#52525b">{yFormat(Math.round(val))}</text>
              </g>
            );
          })}
          {/* Lines + dots */}
          {datasets.map(d => {
            if (d.points.length < 2) return null;
            const pts = d.points.map(p => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(" ");
            return (
              <g key={d.label}>
                <polyline points={pts} fill="none" stroke={d.color} strokeWidth="2" strokeLinejoin="round" />
                {d.points.map((p, i) => (
                  <circle key={i} cx={toSvgX(p.x)} cy={toSvgY(p.y)} r="3" fill={d.color} />
                ))}
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          {datasets.filter(d => d.points.length).map(d => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: d.color }} />
              <span style={{ color: "#71717a", fontSize: 10 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const secsFmt = (s) => {
    if (s >= 3600) {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h${String(m).padStart(2,"0")}`;
    }
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m}:${String(sec).padStart(2,"0")}`;
  };

  const toDatasets = (distOrStation, getEntries, getVal) =>
    ATHLETES.map(a => ({
      label: a,
      color: ATHLETE_COLORS[a],
      points: getEntries(a).map(r => ({ x: new Date(r.date).getTime(), y: getVal(r) })),
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Filtres sports ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Course à pied", "Hyrox", "Karting"].map(sport => {
          const col = SPORT_COLORS[sport];
          const on = visibleSports.includes(sport);
          return (
            <button key={sport} onClick={() => toggleSport(sport)} style={{
              padding: "6px 16px", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${on ? col.main : "#303036"}`,
              background: on ? col.main + "22" : "transparent",
              color: on ? col.main : "#555", fontWeight: 700, fontSize: 12,
            }}>
              {SPORT_ICONS[sport]} {sport}
            </button>
          );
        })}
      </div>

      {/* ── Courses à venir ── */}
      {upcoming.length > 0 && (
        <div>
          <SectionHeader sectionKey="upcoming" label="📅 À venir" />
          {!collapsed["upcoming"] && (<div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {upcoming.filter(e => visibleSports.includes(e.sport) || !e.sport).map(e => {
              const col = SPORT_COLORS[e.sport] || SPORT_COLORS["Hyrox"];
              const days = daysUntil(e.date);
              return (
                <div key={e.id} style={{ background: "#1f1f23", border: `1px solid ${col.border}`, borderLeft: `3px solid ${col.main}`, borderRadius: 12, padding: "12px 16px", minWidth: 180, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{e.name}</div>
                      <div style={{ color: "#71717a", fontSize: 12, marginTop: 2 }}>{formatDate(e.date)}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {(e.athletes || []).map(a => <Badge key={a} color={col.main}>{a}</Badge>)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ color: col.main, fontWeight: 900, fontSize: 24 }}>{days}</div>
                      <div style={{ color: "#71717a", fontSize: 10 }}>jours</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>)}
        </div>
      )}

      {/* ── Fil d'actualité records de l'année ── */}
      {yearRecords.filter(r => visibleSports.includes(r.sport)).length > 0 && (
        <div>
          <SectionHeader sectionKey="records" label="🏆 Records de l'année" />
          {!collapsed["records"] && (<div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderLeft: "2px solid #303036", marginLeft: 8 }}>
            {yearRecords.filter(r => visibleSports.includes(r.sport)).map((rec, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingLeft: 20, paddingBottom: 16, position: "relative" }}>
                {/* Dot sur la ligne */}
                <div style={{ position: "absolute", left: -6, top: 4, width: 10, height: 10, borderRadius: "50%", background: rec.color, border: "2px solid #18181b" }} />
                <div style={{ color: "#52525b", fontSize: 11, whiteSpace: "nowrap", minWidth: 80, paddingTop: 2 }}>{formatDate(rec.date)}</div>
                <div style={{ background: "#1f1f23", border: `1px solid #303036`, borderLeft: `3px solid ${rec.color}`, borderRadius: 10, padding: "8px 14px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontSize: 12 }}>{rec.icon}</span>
                        <Badge color={rec.color}>{rec.athlete}</Badge>
                        <span style={{ color: "#888", fontSize: 12 }}>{rec.label}</span>
                        {rec.sub && <span style={{ color: "#52525b", fontSize: 11 }}>· {rec.sub}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: rec.color, fontWeight: 900, fontSize: 16 }}>{rec.value}</div>
                      {rec.delta !== null && (
                        <div style={{ color: "#4ade80", fontSize: 11, fontWeight: 700 }}>
                          ▼ {formatTime(Math.abs(rec.delta))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>)}
        </div>
      )}

      {/* ── Graphiques de progression ── */}
      {visibleSports.includes("Course à pied") && (
        <div>
          <SectionHeader sectionKey="runCharts" label="📈 Progression Course à pied" />
          {!collapsed["runCharts"] && (<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {RUNNING_PR_DISTANCES.map(dist => {
              const hasData = ATHLETES.some(a => runData.filter(r => r.athlete === a && r.distance === dist && r.secs).length > 1);
              if (!hasData) return null;
              const datasets = ATHLETES.map(a => ({
                label: a, color: ATHLETE_COLORS[a],
                points: runData.filter(r => r.athlete === a && r.distance === dist && r.secs)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(r => ({ x: new Date(r.date).getTime(), y: r.secs })),
              }));
              return <LineChart key={dist} title={dist} datasets={datasets} yFormat={secsFmt} sport="Course à pied" />;
            })}
          </div>)}
        </div>
      )}

      {visibleSports.includes("Hyrox") && (
        <div>
          <SectionHeader sectionKey="hyroxCharts" label="📈 Progression Hyrox" />
          {!collapsed["hyroxCharts"] && (<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {/* Temps total */}
            {(() => {
              const hasData = ATHLETES.some(a => hyroxData.filter(r => r.athlete === a && r.totalSecs).length > 1);
              if (!hasData) return null;
              const datasets = ATHLETES.map(a => ({
                label: a, color: ATHLETE_COLORS[a],
                points: hyroxData.filter(r => r.athlete === a && r.totalSecs)
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(r => ({ x: new Date(r.date).getTime(), y: r.totalSecs })),
              }));
              return <LineChart key="total" title="Temps total" datasets={datasets} yFormat={secsFmt} sport="Hyrox" />;
            })()}
            {/* Stations */}
            {HYROX_STATIONS.map(station => {
              const hasData = ATHLETES.some(a => hyroxData.filter(r => r.athlete === a && r.stationSecs?.[station]).length > 1);
              if (!hasData) return null;
              const datasets = ATHLETES.map(a => ({
                label: a, color: ATHLETE_COLORS[a],
                points: hyroxData.filter(r => r.athlete === a && r.stationSecs?.[station])
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map(r => ({ x: new Date(r.date).getTime(), y: r.stationSecs[station] })),
              }));
              return <LineChart key={station} title={station} datasets={datasets} yFormat={secsFmt} sport="Hyrox" />;
            })}
          </div>)}
        </div>
      )}

      <KartingCharts kartingData={kartingData} visibleSports={visibleSports} collapsed={collapsed} SectionHeader={SectionHeader} />

      {/* ── Activité récente ── */}
      <div>
        <SectionHeader sectionKey="recent" label="Activité récente" />
        <RecentActivity
          runData={runData}
          hyroxData={hyroxData}
          kartingData={kartingData}
          visibleSports={visibleSports}
          collapsed={collapsed}
        />
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

  const setAndSync = (updater) => {
    setValue(prev => {
      const newVal = typeof updater === "function" ? updater(prev) : updater;
      if (dbRef.current) dbRef.current.set(dbRef.current.ref, newVal);
      return newVal;
    });
  };

  return [value, setAndSync];
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [prToast, setPrToast] = useState(null);

  const [runData, setRunDataRaw, runReady] = useFirebase("runs");
  const [hyroxData, setHyroxDataRaw, hyroxReady] = useFirebase("hyrox");
  const [kartingData, setKartingDataRaw, kartingReady] = useFirebase("karting");
  const [bodyData, setBodyDataRaw, bodyReady] = useFirebase("body");
  const [hyroxTemplates, setHyroxTemplatesRaw, hyroxTemplatesReady] = useFirebase("hyroxTemplates");
  const setHyroxTemplatesRaw2 = (updater) => {
    setHyroxTemplatesRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  };
  const [hyroxTrainingData, setHyroxTrainingDataRaw, hyroxTrainingReady] = useFirebase("hyroxTraining");
  const [raceNames, setRaceNamesRaw] = useFirebaseValue("raceNames", DEFAULT_RACE_NAMES);
  const [hyroxPartners, setHyroxPartners] = useFirebaseValue("hyroxPartners", []);
  const [upcomingEvents, setUpcomingEvents, upcomingReady] = useFirebase("upcomingEvents");

  const allReady = runReady && hyroxReady && kartingReady && bodyReady && hyroxTrainingReady && upcomingReady;
  const tabs = ["Dashboard", "Course à pied", "Hyrox", "Karting", "Poids & Corps"];

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

  const setKartingData = (updater) => setKartingDataRaw(prev => typeof updater === "function" ? updater(prev) : updater);
  const setBodyData = (updater) => setBodyDataRaw(prev => typeof updater === "function" ? updater(prev) : updater);
  const setHyroxTrainingData = (updater) => setHyroxTrainingDataRaw(prev => typeof updater === "function" ? updater(prev) : updater);

  return (
    <div style={{ minHeight: "100vh", background: "#18181b", color: "#fff", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
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
            TOM <span style={{ color: "#52525b" }}>&</span> CAMILLE
          </div>
          <div className="hide-mobile" style={{ color: "#71717a", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sport Tracker</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {allReady ? (
              <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} /><span style={{ color: "#71717a", fontSize: 11 }}>Synchronisé</span></>
            ) : (
              <><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B35", animation: "spin 1s linear infinite" }} /><span style={{ color: "#888", fontSize: 11 }}>Connexion…</span></>
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
                color: isActive ? col : "#71717a", fontWeight: isActive ? 800 : 600,
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
          <div style={{ textAlign: "center", padding: 80, color: "#71717a" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 14 }}>Connexion à Firebase…</div>
          </div>
        ) : (
          <>
            {tab === "Dashboard" && <Dashboard runData={runData} hyroxData={hyroxData} kartingData={kartingData} bodyData={bodyData} upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />}
            {tab === "Course à pied" && <RunningTab data={runData} setData={setRunData} raceNames={raceNames} setRaceNames={setRaceNamesRaw} upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />}
            {tab === "Hyrox" && <HyroxTab data={hyroxData} setData={setHyroxData} partners={hyroxPartners} setPartners={setHyroxPartners} trainingData={hyroxTrainingData} setTrainingData={setHyroxTrainingData} templates={hyroxTemplates} setTemplates={setHyroxTemplatesRaw2} upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />}
            {tab === "Karting" && <KartingTab data={kartingData} setData={setKartingData} upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} />}
            {tab === "Poids & Corps" && <BodyTab data={bodyData} setData={setBodyData} />}
          </>
        )}
      </div>
    </div>
  );
}
