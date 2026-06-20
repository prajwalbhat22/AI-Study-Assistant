import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const COLORS = {
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  purpleMid: "#A78BFA",
  indigo: "#4F46E5",
  bg: "#0F0E17",
  card: "#1A1826",
  cardHover: "#211F31",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.14)",
  text: "#F0EBF8",
  muted: "#9B93AF",
  green: "#10B981",
  amber: "#F59E0B",
  blue: "#3B82F6",
  pink: "#EC4899",
  red: "#EF4444",
};

const SUBJECTS = [
  { icon: "⚛️", color: "#3B82F6", label: "Physics", topics: 3 },
  { icon: "🧬", color: "#10B981", label: "Biology", topics: 5 },
  { icon: "📐", color: "#F59E0B", label: "Math", topics: 4 },
  { icon: "📜", color: "#EC4899", label: "History", topics: 2 },
  { icon: "💻", color: "#8B5CF6", label: "CS", topics: 6 },
];

const RECENT = [
  { title: "Quantum Mechanics Intro", type: "note", subject: "Physics", time: "2h ago", color: "#3B82F6" },
  { title: "Cell Division Lecture Slides", type: "material", subject: "Biology", time: "5h ago", color: "#10B981" },
  { title: "Integration by Parts", type: "note", subject: "Math", time: "Yesterday", color: "#F59E0B" },
  { title: "WWI Timeline", type: "flashcard", subject: "History", time: "2 days ago", color: "#EC4899" },
];

const MOCK_TOPICS = [
  {
    id: 1, title: "Quantum Mechanics", subject: "Physics", color: "#3B82F6",
    notes: [{ id: 1, title: "Wave-Particle Duality", content: "Light exhibits both wave and particle properties...", updated: "2h ago" }],
    materials: [{ id: 1, title: "Feynman Lectures Vol 3", type: "pdf", size: "8.2 MB" }],
    flashcards: [{ id: 1, q: "What is superposition?", a: "A quantum system exists in multiple states simultaneously until measured." }],
    tasks: [{ id: 1, text: "Read Chapter 4", done: false }, { id: 2, text: "Solve problem set 2", done: true }],
  },
  {
    id: 2, title: "Cell Biology", subject: "Biology", color: "#10B981",
    notes: [{ id: 1, title: "Mitosis Phases", content: "PMAT: Prophase, Metaphase, Anaphase, Telophase...", updated: "5h ago" }],
    materials: [{ id: 1, title: "Cell Bio Textbook Ch5", type: "pdf", size: "3.1 MB" }],
    flashcards: [{ id: 1, q: "What organelle produces ATP?", a: "Mitochondria" }],
    tasks: [{ id: 1, text: "Diagram cell cycle", done: false }],
  },
];

function Badge({ color, children }) {
  return (
    <span style={{
      background: color + "22", color, fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3,
    }}>
      {children}
    </span>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div
      style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column",
        gap: 12, transition: "border-color 0.2s", cursor: "default",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.borderHover}
      onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: color + "22",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function TopicCard({ topic, onClick }) {
  const noteCount = (topic.notes || []).length;
  const matCount = (topic.materials || []).length;
  const fcCount = (topic.flashcards || []).length;
  const taskDone = (topic.tasks || []).filter(t => t.done).length;
  const taskTotal = (topic.tasks || []).length;
  // Content-based progress until the Tasks module is fully connected.
  // Each saved item increases progress by 20%, max 100%.
  const itemCount = noteCount + matCount + fcCount + taskTotal;
  const progress = Math.min(itemCount * 20, 100);

  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 20, padding: "24px", cursor: "pointer",
        transition: "all 0.2s", position: "relative", overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = topic.color + "66";
        e.currentTarget.style.background = COLORS.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${topic.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.background = COLORS.card;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${topic.color}, ${topic.color}44)`,
        borderRadius: "20px 20px 0 0",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{topic.title}</div>
          <Badge color={topic.color}>{topic.subject}</Badge>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: topic.color + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: topic.color, fontWeight: 700,
        }}>
          {progress}%
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {[["📝", noteCount, "notes"], ["📁", matCount, "files"], ["🃏", fcCount, "cards"], ["✅", taskDone + "/" + taskTotal, "tasks"]].map(([ic, v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: COLORS.muted }}>{ic} {v}</div>
            <div style={{ fontSize: 10, color: COLORS.muted + "88" }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: COLORS.bg, borderRadius: 4, height: 4, overflow: "hidden" }}>
        <div style={{
          width: progress + "%", height: "100%",
          background: `linear-gradient(90deg, ${topic.color}, ${topic.color}aa)`,
          borderRadius: 4, transition: "width 0.4s",
        }} />
      </div>
    </div>
  );
}

// ─── NEW: Topic Action Panel ────────────────────────────────────────────────
//
// Replaces the old TopicModal. Shows 4 navigation actions for a selected topic.
// Uses glassmorphism styling consistent with the existing dark theme.

function TopicActionPanel({ topic, onClose }) {
  const navigate = useNavigate();
  const [hoveredAction, setHoveredAction] = useState(null);

  // The 4 actions — each navigates to its page and passes topic info via Router state
  const actions = [
    {
      id: "note",
      icon: "📝",
      title: "Create Note",
      description: "Write and save notes for this topic",
      color: "#3B82F6",
      onClick: () => navigate("/notes", {
        state: { topicId: topic.id, topicName: topic.title || topic.name },
      }),
    },
    {
      id: "material",
      icon: "📁",
      title: "Add Material",
      description: "Upload PDFs, slides, or reference files",
      color: "#10B981",
      onClick: () => navigate("/materials", {
        state: { topicId: topic.id, topicName: topic.title || topic.name },
      }),
    },
    {
      id: "flashcard",
      icon: "🃏",
      title: "Create Flashcards",
      description: "Let AI generate or build your own flashcards",
      color: "#F59E0B",
      onClick: () => navigate("/ai", {
        state: { topicId: topic.id, topicName: topic.title || topic.name, intent: "flashcards" },
      }),
    },
    {
      id: "task",
      icon: "✅",
      title: "Add Task",
      description: "Track what you need to do for this topic",
      color: "#EC4899",
      onClick: () => navigate("/tasks", {
        state: { topicId: topic.id, topicName: topic.title || topic.name },
      }),
    },
  ];

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        // Blurred backdrop
        background: "rgba(8, 7, 16, 0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 520,
        background: "rgba(26, 24, 38, 0.85)",
        border: `1px solid ${topic.color}44`,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), 0 0 60px ${topic.color}18`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "slideUp 0.22s cubic-bezier(0.34,1.2,0.64,1)",
      }}>

        {/* Header with topic colour accent */}
        <div style={{
          padding: "28px 28px 20px",
          background: `linear-gradient(135deg, ${topic.color}1A 0%, transparent 60%)`,
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          position: "relative",
        }}>
          {/* Decorative circle */}
          <div style={{
            position: "absolute", top: -20, right: -20, width: 120, height: 120,
            borderRadius: "50%", background: topic.color + "12",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              {/* Topic colour dot + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: topic.color, boxShadow: `0 0 8px ${topic.color}` }} />
                <span style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.1, fontWeight: 600 }}>
                  {(topic.subject || "TOPIC").toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, lineHeight: 1.2 }}>
                {topic.title || topic.name}
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 6 }}>
                What would you like to do?
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 10, border: "none",
                background: "rgba(255,255,255,0.07)", color: COLORS.muted,
                cursor: "pointer", fontSize: 16, display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, color 0.15s", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = COLORS.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = COLORS.muted; }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action buttons grid */}
        <div style={{ padding: "20px 20px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {actions.map((action) => {
            const isHovered = hoveredAction === action.id;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                style={{
                  background: isHovered ? action.color + "1A" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isHovered ? action.color + "55" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 18,
                  padding: "20px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s ease",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isHovered ? `0 8px 24px ${action.color}22` : "none",
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: isHovered ? action.color + "30" : action.color + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 14,
                  transition: "background 0.18s",
                }}>
                  {action.icon}
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 5, lineHeight: 1.2 }}>
                  {action.title}
                </div>
                <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
                  {action.description}
                </div>

                {/* Arrow that appears on hover */}
                <div style={{
                  marginTop: 14, fontSize: 13, color: action.color,
                  fontWeight: 600, opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "translateX(0)" : "translateX(-6px)",
                  transition: "all 0.18s ease",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  Go <span style={{ fontSize: 16 }}>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: "12px 28px 20px",
          fontSize: 12, color: COLORS.muted + "88",
          textAlign: "center",
        }}>
          Press <kbd style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 5, padding: "1px 6px", fontSize: 11, color: COLORS.muted,
            fontFamily: "inherit",
          }}>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

function Carousel() {
  const quotes = [
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Education is the passport to the future.", author: "Malcolm X" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Gandhi" },
  ];
  const slides = [
    { type: "welcome", title: "Ready to study smarter?", sub: "Organise topics, capture notes, and let AI assist your learning.", cta: "Create a Topic" },
    { type: "streak", title: "🔥 7-day streak!", sub: "You've studied every day this week. Keep it going!", stat: "42 min avg / day" },
    { type: "quote", ...quotes[0] },
  ];
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const s = slides[slide];
  const gradients = [
    "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    "linear-gradient(135deg, #DB2777 0%, #F59E0B 100%)",
    "linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)",
  ];

  return (
    <div style={{
      borderRadius: 24, overflow: "hidden", position: "relative",
      minHeight: 180, background: gradients[slide], transition: "background 0.6s", padding: "36px 40px",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)", transform: "translate(40px,-60px)" }} />
      <div style={{ position: "absolute", bottom: 0, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", transform: "translateY(40px)" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {s.type === "quote" ? (
          <>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, letterSpacing: 1 }}>QUOTE OF THE DAY</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", maxWidth: 500, lineHeight: 1.4, marginBottom: 8 }}>"{s.text}"</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>— {s.author}</div>
          </>
        ) : s.type === "streak" ? (
          <>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>{s.sub}</div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#fff", fontWeight: 500 }}>{s.stat}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8, letterSpacing: 1 }}>WELCOME BACK</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 20 }}>{s.sub}</div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openNewTopic"))}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 12, padding: "10px 20px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", backdropFilter: "blur(4px)", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            >
              + {s.cta}
            </button>
          </>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 16, right: 20, display: "flex", gap: 6 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)}
            style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 3, background: i === slide ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null); // now drives action panel
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicData, setNewTopicData] = useState({ title: "", subject: "", color: "#7C3AED" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [location.state?.refreshDashboard]);

  const getStatValue = (keys, fallback = 0) => {
    if (!stats) return fallback;
    for (const key of keys) {
      if (stats[key] !== undefined && stats[key] !== null) return stats[key];
    }
    return fallback;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [topicsRes, statsRes, materialsRes] = await Promise.all([
        axiosClient.get("/topics"),
        axiosClient.get("/dashboard/stats"),
        axiosClient.get("/materials").catch((materialError) => {
          console.warn("Could not load materials for dashboard", materialError);
          return { data: [] };
        }),
      ]);

      const backendTopics = Array.isArray(topicsRes.data) ? topicsRes.data : [];
      const allMaterials = Array.isArray(materialsRes.data) ? materialsRes.data : [];

      const colors = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#EF4444"];

      const normalize = (value) => String(value ?? "").trim().toLowerCase();

      const materialBelongsToTopic = (material, topic) => {
        const topicId = Number(topic.id);

        const possibleMaterialTopicIds = [
          material.topicId,
          material.topic_id,
          material.topic?.id,
          material.note?.topicId,
          material.note?.topic?.id,
        ].filter((value) => value !== undefined && value !== null);

        if (possibleMaterialTopicIds.some((id) => Number(id) === topicId)) {
          return true;
        }

        const topicName = normalize(topic.name || topic.title);
        const possibleMaterialTopicNames = [
          material.topicName,
          material.topicTitle,
          material.topic?.name,
          material.topic?.title,
          material.note?.topicName,
          material.note?.topicTitle,
          material.note?.topic?.name,
          material.note?.topic?.title,
        ].map(normalize);

        return possibleMaterialTopicNames.includes(topicName);
      };

      const formattedTopics = await Promise.all(
        backendTopics.map(async (topic, index) => {
          let notes = [];

          try {
            const notesRes = await axiosClient.get(`/topics/${topic.id}/notes`);
            notes = Array.isArray(notesRes.data) ? notesRes.data : [];
          } catch (noteError) {
            console.warn(`Could not load notes for topic ${topic.id}`, noteError);
          }

          const materials = allMaterials.filter((material) => materialBelongsToTopic(material, topic));

          return {
            id: topic.id,
            title: topic.name || topic.title || "Untitled Topic",
            subject: topic.description || "General",
            color: topic.color || colors[index % colors.length],
            notes,
            materials,
            flashcards: topic.flashcards || [],
            tasks: topic.tasks || [],
          };
        })
      );

      setTopics(formattedTopics);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error("Dashboard load error:", error);
      setError("Unable to load dashboard data. Please check backend, login token, and API routes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => setShowNewTopic(true);
    window.addEventListener("openNewTopic", handler);
    return () => window.removeEventListener("openNewTopic", handler);
  }, []);

  const createTopic = async () => {
    if (!newTopicData.title.trim()) return;

    try {
      await axiosClient.post("/topics", {
        name: newTopicData.title.trim(),
        description: newTopicData.subject?.trim() || "General",
      });

      setNewTopicData({ title: "", subject: "", color: "#7C3AED" });
      setShowNewTopic(false);
      await loadDashboard();
    } catch (error) {
      console.error("Create topic error:", error);
      setError("Topic was not saved. Please check backend and JWT login.");
    }
  };

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { id: "topics",    icon: "📂", label: "Topics", path: "/topics" },
    { id: "notes",     icon: "📝", label: "Notes", path: "/notes" },
    { id: "materials", icon: "📁", label: "Materials", path: "/materials" },
    { id: "ai",        icon: "🤖", label: "AI Assistant", path: "/ai" },
    { id: "profile",   icon: "👤", label: "Profile", path: "/profile" },
  ];

  const totalNotes = getStatValue(["totalNotes", "notesCount", "noteCount"], topics.reduce((a, t) => a + (t.notes || []).length, 0));
  // Use frontend-calculated material count because topic cards need per-topic materials.
  const totalMaterials = topics.reduce((a, t) => a + (t.materials || []).length, 0);
  const storageUsed = getStatValue(["storageUsed", "formattedStorage", "totalStorage", "storage"], "0 MB");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.text }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? 240 : 72, background: "#13111E",
        borderRight: `1px solid ${COLORS.border}`, display: "flex",
        flexDirection: "column", transition: "width 0.3s", flexShrink: 0,
        position: "relative", zIndex: 10,
      }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✦</div>
          {sidebarOpen && <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text }}>StudyBuddy</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>AI Study Assistant</div>
          </div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: "auto", background: "transparent", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 16, padding: 4, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && <div style={{ padding: "12px 16px 8px", fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: COLORS.muted }}>WORKSPACE</div>}
        <nav style={{ flex: 1, padding: "8px 8px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); navigate(item.path); }}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 12, padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius: 12, border: "none",
                background: activeNav === item.id ? "rgba(124,58,237,0.15)" : "transparent",
                color: activeNav === item.id ? COLORS.purple : COLORS.muted,
                cursor: "pointer", marginBottom: 2, fontSize: 14,
                fontWeight: activeNav === item.id ? 600 : 400,
                transition: "all 0.2s", justifyContent: sidebarOpen ? "flex-start" : "center",
              }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #EC4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>S</div>
            {sidebarOpen && <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text }}>Student</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>student@email.com</div>
            </div>}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "24px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.muted, letterSpacing: 1, marginBottom: 4 }}>OVERVIEW</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.text }}>Dashboard</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: COLORS.muted }}>
              <span>🔍</span> <span>Search...</span>
            </div>
            <button onClick={() => setShowNewTopic(true)}
              style={{ background: "linear-gradient(135deg, #7C3AED, #4F46E5)", border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              + New Topic
            </button>
          </div>
        </div>

        <div style={{ padding: "24px 32px" }}>
          <Carousel />

          {loading && (
            <div style={{ marginTop: 16, color: COLORS.muted, fontSize: 13 }}>Loading dashboard data...</div>
          )}

          {error && (
            <div style={{ marginTop: 16, background: COLORS.red + "18", border: `1px solid ${COLORS.red}44`, color: COLORS.text, borderRadius: 12, padding: "12px 14px", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, margin: "24px 0" }}>
            <StatCard icon="📂" label="Topics"     value={getStatValue(["totalTopics", "topicsCount", "topicCount"], topics.length)}  color="#7C3AED" />
            <StatCard icon="📝" label="Notes"      value={totalNotes}     color="#3B82F6" />
            <StatCard icon="📁" label="Materials"  value={totalMaterials} color="#10B981" />
            <StatCard icon="💾" label="Storage"    value={storageUsed}     color="#F59E0B" />
          </div>

          {/* Two-col layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>Your Topics</div>
                <button onClick={() => setShowNewTopic(true)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "6px 14px", color: COLORS.muted, fontSize: 12, cursor: "pointer" }}>+ Add topic</button>
              </div>

              {/* Topic cards — clicking opens action panel (not the old modal) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {topics.map(t => (
                  <TopicCard
                    key={t.id}
                    topic={t}
                    onClick={() => setSelectedTopic(t)}   // ← opens action panel
                  />
                ))}
                <div
                  onClick={() => setShowNewTopic(true)}
                  style={{ border: `2px dashed ${COLORS.border}`, borderRadius: 20, padding: "24px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 160, transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.purple + "66"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: COLORS.purple }}>+</div>
                  <div style={{ fontSize: 13, color: COLORS.muted }}>New Topic</div>
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Subjects */}
              <div style={{ background: COLORS.card, borderRadius: 20, padding: "20px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Subjects</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {SUBJECTS.map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{s.topics} topics</div>
                      </div>
                      <div style={{ height: 6, width: 60, background: COLORS.bg, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: (s.topics / 6 * 100) + "%", background: s.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div style={{ background: COLORS.card, borderRadius: 20, padding: "20px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>Recent Activity</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RECENT.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: COLORS.bg }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted }}>{r.subject} · {r.time}</div>
                      </div>
                      <Badge color={r.color}>{r.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ background: COLORS.card, borderRadius: 20, padding: "20px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 14 }}>Quick Actions</div>
                {[["📝", "Write a Note", "#3B82F6"], ["🃏", "Create Flashcards", "#F59E0B"], ["🤖", "Ask AI Assistant", "#7C3AED"]].map(([ic, l, c]) => (
                  <button key={l} style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", color: COLORS.text, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 8, transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = c + "66"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.border}>
                    <span style={{ fontSize: 16 }}>{ic}</span> {l}
                    <span style={{ marginLeft: "auto", color: COLORS.muted }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic Action Panel (replaces old TopicModal) ──────────────────── */}
      {selectedTopic && (
        <TopicActionPanel
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
        />
      )}

      {/* ── New Topic Modal ───────────────────────────────────────────────── */}
      {showNewTopic && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowNewTopic(false)}
        >
          <div style={{ background: COLORS.card, borderRadius: 24, width: "100%", maxWidth: 460, padding: "32px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>Create New Topic</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>Add a topic to organise your notes, materials and tasks.</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Topic title</div>
              <input
                value={newTopicData.title}
                onChange={e => setNewTopicData({ ...newTopicData, title: e.target.value })}
                placeholder="e.g. Organic Chemistry"
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", color: COLORS.text, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>Subject</div>
              <input
                value={newTopicData.subject}
                onChange={e => setNewTopicData({ ...newTopicData, subject: e.target.value })}
                placeholder="e.g. Chemistry"
                style={{ width: "100%", background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 16px", color: COLORS.text, fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 10 }}>Color</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#EF4444"].map(c => (
                  <button key={c} onClick={() => setNewTopicData({ ...newTopicData, color: c })}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: newTopicData.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", boxSizing: "border-box" }} />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNewTopic(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px", color: COLORS.muted, fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={createTopic} style={{ flex: 2, background: newTopicData.color || COLORS.purple, border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Create Topic</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
