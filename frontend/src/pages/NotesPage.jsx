import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const C = {
  bg: "#0F0E17",
  card: "#1A1826",
  cardHover: "#211F31",
  border: "rgba(255,255,255,0.07)",
  text: "#F0EBF8",
  muted: "#9B93AF",
  purple: "#7C3AED",
  blue: "#3B82F6",
  green: "#10B981",
  amber: "#F59E0B",
  pink: "#EC4899",
};

function Badge({ color, children }) {
  return (
    <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
      {children}
    </span>
  );
}

export default function NotesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const incomingTopic = location.state?.topicId ? location.state : null;

  const [notes, setNotes] = useState([]);
  const [filterTopic, setFilterTopic] = useState(incomingTopic?.topicName || "All");
  const [showForm, setShowForm] = useState(!!incomingTopic);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    topicName: incomingTopic?.topicName || "",
    topicId: incomingTopic?.topicId || null,
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);

      if (incomingTopic?.topicId) {
        const res = await axiosClient.get(`/topics/${incomingTopic.topicId}/notes`);
        setNotes(res.data || []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Load notes error:", error);
      alert("Unable to load notes");
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!form.title.trim()) {
      alert("Please enter note title");
      return;
    }

    if (!form.content.trim()) {
      alert("Please enter note content");
      return;
    }

    if (!form.topicId) {
      alert("Topic not selected. Please open notes from a topic card.");
      return;
    }

    try {
      await axiosClient.post(`/topics/${form.topicId}/notes`, {
        title: form.title.trim(),
        content: form.content.trim(),
      });

      await loadNotes();

      setForm({
        title: "",
        content: "",
        topicName: incomingTopic?.topicName || "",
        topicId: incomingTopic?.topicId || null,
      });

      setShowForm(false);

      navigate("/dashboard", {
        state: { refreshDashboard: true },
      });
    } catch (error) {
      console.error("Save note error:", error);
      alert("Note not saved. Check backend or Network tab.");
    }
  };

  const topicOptions = ["All", ...Array.from(new Set([incomingTopic?.topicName, ...notes.map(n => n.topicTitle || n.topicName)].filter(Boolean)))];

  const filteredNotes = filterTopic === "All"
    ? notes
    : notes.filter(n => (n.topicTitle || n.topicName) === filterTopic);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ padding: "28px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>STUDY BUDDY</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>📝 Notes</div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{ background: `linear-gradient(135deg, ${C.purple}, #4F46E5)`, border: "none", borderRadius: 12, padding: "10px 20px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          + New Note
        </button>
      </div>

      <div style={{ padding: "24px 36px" }}>
        {incomingTopic && (
          <div style={{ background: `linear-gradient(135deg, ${C.purple}22, ${C.blue}11)`, border: `1px solid ${C.purple}44`, borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: C.muted }}>Creating note for topic</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{incomingTopic.topicName}</div>
            </div>

            <button
              onClick={() => navigate("/dashboard", { state: { refreshDashboard: true } })}
              style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "8px 14px", color: C.muted, fontSize: 13, cursor: "pointer" }}
            >
              ← Back to Dashboard
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {topicOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setFilterTopic(opt)}
              style={{
                background: filterTopic === opt ? C.purple : "rgba(255,255,255,0.05)",
                border: `1px solid ${filterTopic === opt ? C.purple : C.border}`,
                borderRadius: 20,
                padding: "6px 16px",
                color: filterTopic === opt ? "#fff" : C.muted,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {showForm && (
          <div style={{ background: C.card, border: `1px solid ${C.purple}44`, borderRadius: 20, padding: "24px", marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              {incomingTopic ? `New note for "${incomingTopic.topicName}"` : "New Note"}
            </div>

            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Note title..."
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
            />

            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write your note here..."
              rows={4}
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 13, resize: "vertical", marginBottom: 16, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", color: C.muted, fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>

              <button onClick={saveNote} style={{ background: C.purple, border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Save Note
              </button>
            </div>
          </div>
        )}

        {loading && <div style={{ color: C.muted }}>Loading notes...</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredNotes.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>No notes yet</div>
              <div style={{ fontSize: 14 }}>Click "+ New Note" to write your first note.</div>
            </div>
          ) : filteredNotes.map(note => (
            <div key={note.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{note.title}</div>
                <Badge color={C.purple}>{note.topicTitle || incomingTopic?.topicName || "Topic"}</Badge>
              </div>

              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>
                {note.content}
              </div>

              <div style={{ fontSize: 11, color: C.muted + "88" }}>
                📂 {note.topicTitle || incomingTopic?.topicName || "Topic"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}