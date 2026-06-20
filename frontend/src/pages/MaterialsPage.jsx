/**
 * MaterialsPage.jsx
 *
 * Reads optional Router state passed by Dashboard's TopicActionPanel:
 *   { topicId, topicName }
 *
 * If present, the "topic" filter is pre-selected and a banner guides
 * the user to upload material for that specific topic.
 *
 * Usage (from Dashboard):
 *   navigate("/materials", { state: { topicId: topic.id, topicName: topic.title } });
 */

import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ── Design tokens (match Dashboard) ─────────────────────────────────────────
const C = {
  bg:          "#0F0E17",
  card:        "#1A1826",
  cardHover:   "#211F31",
  border:      "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text:        "#F0EBF8",
  muted:       "#9B93AF",
  purple:      "#7C3AED",
  blue:        "#3B82F6",
  green:       "#10B981",
  amber:       "#F59E0B",
  pink:        "#EC4899",
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_MATERIALS = [
  { id: 1, title: "Feynman Lectures Vol 3",   type: "pdf",  size: "8.2 MB",  topicId: 1, topicName: "Quantum Mechanics", subject: "Physics",  color: C.blue,  uploaded: "2h ago"      },
  { id: 2, title: "Cell Bio Textbook Ch5",    type: "pdf",  size: "3.1 MB",  topicId: 2, topicName: "Cell Biology",      subject: "Biology",  color: C.green, uploaded: "5h ago"      },
  { id: 3, title: "Integration Cheat Sheet",  type: "docx", size: "0.4 MB",  topicId: 3, topicName: "Calculus",          subject: "Math",     color: C.amber, uploaded: "Yesterday"   },
  { id: 4, title: "WWI Primary Sources",      type: "pdf",  size: "12.7 MB", topicId: 4, topicName: "WWI Overview",      subject: "History",  color: C.pink,  uploaded: "2 days ago"  },
];

// ── File-type icon map ────────────────────────────────────────────────────────
const FILE_ICONS = { pdf: "📄", docx: "📝", pptx: "📊", png: "🖼️", jpg: "🖼️", default: "📎" };

function fileIcon(type) { return FILE_ICONS[type?.toLowerCase()] || FILE_ICONS.default; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
      {children}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MaterialsPage() {
  const location = useLocation();
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  // Passed from Dashboard via TopicActionPanel
  const incomingTopic = location.state?.topicId ? location.state : null; // { topicId, topicName } | null

  const [filterTopic, setFilterTopic]   = useState(incomingTopic?.topicName || "All");
  const [materials, setMaterials]       = useState(MOCK_MATERIALS);
  const [isDragging, setIsDragging]     = useState(false);
  const [uploadTopic, setUploadTopic]   = useState(incomingTopic?.topicName || "");

  const topicOptions = ["All", ...Array.from(new Set([incomingTopic?.topicName, ...materials.map(m => m.topicName)].filter(Boolean)))];

  const filteredMaterials = filterTopic === "All"
    ? materials
    : materials.filter(m => m.topicName === filterTopic);

  // Simulate adding an uploaded file to the list
  const handleFiles = (files) => {
    const newMaterials = Array.from(files).map((f, i) => ({
      id:        Date.now() + i,
      title:     f.name.replace(/\.[^.]+$/, ""), // strip extension
      type:      f.name.split(".").pop().toLowerCase(),
      size:      (f.size / 1048576).toFixed(1) + " MB",
      topicId:   incomingTopic?.topicId   || null,
      topicName: uploadTopic || incomingTopic?.topicName || "General",
      subject:   "General",
      color:     C.purple,
      uploaded:  "Just now",
    }));
    setMaterials([...newMaterials, ...materials]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ padding: "28px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>STUDY BUDDY</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>📁 Materials</div>
        </div>
        <button
          onClick={() => fileInput.current?.click()}
          style={{ background: `linear-gradient(135deg, ${C.green}, #059669)`, border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          📤 Upload File
        </button>
        <input ref={fileInput} type="file" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      <div style={{ padding: "24px 36px" }}>

        {/* ── Incoming-topic banner ── */}
        {incomingTopic && (
          <div style={{
            background: `linear-gradient(135deg, ${C.green}22, ${C.blue}11)`,
            border: `1px solid ${C.green}44`, borderRadius: 16,
            padding: "16px 20px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.green + "33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📂</div>
              <div>
                <div style={{ fontSize: 13, color: C.muted }}>Adding materials to topic</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{incomingTopic.topicName}</div>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "8px 14px", color: C.muted, fontSize: 13, cursor: "pointer" }}
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        {/* ── Filter bar ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {topicOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setFilterTopic(opt)}
              style={{
                background: filterTopic === opt ? C.green : "rgba(255,255,255,0.05)",
                border: `1px solid ${filterTopic === opt ? C.green : C.border}`,
                borderRadius: 20, padding: "6px 16px",
                color: filterTopic === opt ? "#fff" : C.muted,
                fontSize: 13, cursor: "pointer", fontWeight: filterTopic === opt ? 600 : 400,
                transition: "all 0.18s",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* ── Drop zone ── */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInput.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? C.green : C.border}`,
            borderRadius: 20, padding: "36px", textAlign: "center",
            cursor: "pointer", marginBottom: 28, transition: "all 0.2s",
            background: isDragging ? C.green + "0A" : "transparent",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>📤</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: isDragging ? C.green : C.text, marginBottom: 4 }}>
            {isDragging ? "Release to upload" : "Drop files here or click to browse"}
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            PDF, DOCX, PPTX, PNG, JPG — up to 50 MB
            {incomingTopic && (
              <span> · Will be added to <strong style={{ color: C.text }}>{incomingTopic.topicName}</strong></span>
            )}
          </div>
        </div>

        {/* ── Materials list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredMaterials.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>No materials yet</div>
              <div style={{ fontSize: 14 }}>Upload your first file{incomingTopic ? ` for ${incomingTopic.topicName}` : ""} using the drop zone above.</div>
            </div>
          ) : filteredMaterials.map(m => (
            <div
              key={m.id}
              style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                cursor: "pointer", transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color + "55"; e.currentTarget.style.background = C.cardHover; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;       e.currentTarget.style.background = C.card; }}
            >
              {/* File type icon */}
              <div style={{ width: 48, height: 48, borderRadius: 14, background: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {fileIcon(m.type)}
              </div>

              {/* File info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {m.type?.toUpperCase()} · {m.size} · 📂 {m.topicName} · Uploaded {m.uploaded}
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Badge color={m.color}>{m.type}</Badge>
                <Badge color={m.color}>{m.subject}</Badge>
              </div>

              {/* Download icon */}
              <div style={{ color: C.muted, fontSize: 18, flexShrink: 0 }}>⬇️</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
