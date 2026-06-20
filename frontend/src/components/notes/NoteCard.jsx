// src/components/notes/NoteCard.jsx

import { useState, useRef, useEffect } from "react";
import { FileText, MoreVertical, Pencil, Trash2, BookOpen } from "lucide-react";

const ACCENTS = [
  { bg: "bg-indigo-500/10", icon: "text-indigo-400", ring: "hover:ring-indigo-500/20", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { bg: "bg-violet-500/10", icon: "text-violet-400", ring: "hover:ring-violet-500/20", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  { bg: "bg-sky-500/10",    icon: "text-sky-400",    ring: "hover:ring-sky-500/20",    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20"       },
  { bg: "bg-emerald-500/10",icon: "text-emerald-400",ring: "hover:ring-emerald-500/20",badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"},
  { bg: "bg-amber-500/10",  icon: "text-amber-400",  ring: "hover:ring-amber-500/20",  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"  },
  { bg: "bg-rose-500/10",   icon: "text-rose-400",   ring: "hover:ring-rose-500/20",   badge: "bg-rose-500/10 text-rose-400 border-rose-500/20"     },
];

const getAccent = (id) => ACCENTS[(id ?? 0) % ACCENTS.length];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function wordCount(text = "") {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function NoteCard({ note, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const accent = getAccent(note.id);
  const topicName = note.topicName ?? note.topic?.name ?? null;

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <div className={`relative bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4
      ring-1 ring-transparent ${accent.ring} hover:border-gray-700 transition-all duration-200 group`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center flex-shrink-0`}>
          <FileText className={`w-5 h-5 ${accent.icon}`} />
        </div>

        {/* ⋮ Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600
              hover:text-white hover:bg-gray-800
              opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Note options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-36 bg-gray-900 border border-gray-800
              rounded-xl shadow-xl shadow-black/40 overflow-hidden py-1">
              <button
                onClick={() => { setMenuOpen(false); onEdit(note); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300
                  hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(note); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400
                  hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2 min-w-0">
        <h3 className="text-base font-semibold text-white truncate leading-snug">
          {note.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
          {note.content || <span className="italic text-gray-700">No content</span>}
        </p>
      </div>

      {/* Topic badge */}
      {topicName && (
        <div className="flex items-center gap-1.5 min-w-0">
          <BookOpen className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
            border ${accent.badge} truncate max-w-[160px]`}>
            {topicName}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <span className="text-xs text-gray-600">
          {wordCount(note.content).toLocaleString()} words
        </span>
        <span className="text-xs text-gray-600">
          {formatDate(note.updatedAt ?? note.createdAt)}
        </span>
      </div>
    </div>
  );
}