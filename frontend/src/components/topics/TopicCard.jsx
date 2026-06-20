// src/components/topics/TopicCard.jsx

import { BookOpen, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Deterministic accent color per topic id
const ACCENTS = [
  { ring: "ring-violet-500/20", icon: "text-violet-400", bg: "bg-violet-500/10", dot: "bg-violet-400" },
  { ring: "ring-indigo-500/20",  icon: "text-indigo-400",  bg: "bg-indigo-500/10",  dot: "bg-indigo-400"  },
  { ring: "ring-emerald-500/20", icon: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  { ring: "ring-amber-500/20",   icon: "text-amber-400",   bg: "bg-amber-500/10",   dot: "bg-amber-400"   },
  { ring: "ring-sky-500/20",     icon: "text-sky-400",     bg: "bg-sky-500/10",     dot: "bg-sky-400"     },
  { ring: "ring-rose-500/20",    icon: "text-rose-400",    bg: "bg-rose-500/10",    dot: "bg-rose-400"    },
];

function getAccent(id) {
  return ACCENTS[(id ?? 0) % ACCENTS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function TopicCard({ topic, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const accent = getAccent(topic.id);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <div
      className={`relative bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4
        hover:border-gray-700 ring-1 ring-transparent hover:${accent.ring}
        transition-all duration-200 group`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center flex-shrink-0`}>
          <BookOpen className={`w-5 h-5 ${accent.icon}`} />
        </div>

        {/* ⋮ Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600
              hover:text-white hover:bg-gray-800 opacity-0 group-hover:opacity-100
              transition-all"
            aria-label="Topic options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-36 bg-gray-900 border border-gray-800
              rounded-xl shadow-xl shadow-black/40 overflow-hidden py-1">
              <button
                onClick={() => { setMenuOpen(false); onEdit(topic); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300
                  hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); onDelete(topic); }}
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
      <div className="flex-1 space-y-1.5 min-w-0">
        <h3 className="text-base font-semibold text-white truncate">{topic.name}</h3>
        {topic.description ? (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{topic.description}</p>
        ) : (
          <p className="text-sm text-gray-700 italic">No description</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          <span className="text-xs text-gray-600">Active</span>
        </div>
        {topic.createdAt && (
          <span className="text-xs text-gray-600">{formatDate(topic.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
