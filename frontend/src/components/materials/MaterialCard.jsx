// src/components/materials/MaterialCard.jsx

import { useState, useRef, useEffect } from "react";
import {
  FileText, FileImage, FileArchive, File,
  MoreVertical, Download, Trash2,
  Presentation, BookOpen,
} from "lucide-react";

// ── File type configuration ───────────────────────────────────────────────────
const FILE_TYPES = {
  pdf: {
    icon: FileText,
    label: "PDF",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-500/10",
    iconColor: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    glow: "group-hover:shadow-red-500/10",
  },
  docx: {
    icon: FileText,
    label: "DOCX",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    glow: "group-hover:shadow-blue-500/10",
  },
  doc: {
    icon: FileText,
    label: "DOC",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    glow: "group-hover:shadow-blue-500/10",
  },
  pptx: {
    icon: Presentation,
    label: "PPTX",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    glow: "group-hover:shadow-orange-500/10",
  },
  ppt: {
    icon: Presentation,
    label: "PPT",
    gradient: "from-orange-500 to-amber-600",
    bg: "bg-orange-500/10",
    iconColor: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    glow: "group-hover:shadow-orange-500/10",
  },
  zip: {
    icon: FileArchive,
    label: "ZIP",
    gradient: "from-yellow-500 to-amber-600",
    bg: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    glow: "group-hover:shadow-yellow-500/10",
  },
  rar: {
    icon: FileArchive,
    label: "RAR",
    gradient: "from-yellow-500 to-amber-600",
    bg: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    glow: "group-hover:shadow-yellow-500/10",
  },
  png: {
    icon: FileImage,
    label: "PNG",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  jpg: {
    icon: FileImage,
    label: "JPG",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
  jpeg: {
    icon: FileImage,
    label: "JPEG",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/10",
  },
};

const DEFAULT_TYPE = {
  icon: File,
  label: "FILE",
  gradient: "from-violet-500 to-indigo-600",
  bg: "bg-violet-500/10",
  iconColor: "text-violet-400",
  badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  glow: "group-hover:shadow-violet-500/10",
};

export function getFileType(fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return FILE_TYPES[ext] ?? DEFAULT_TYPE;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60)     return "Just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MaterialCard({ material, onDownload, onDelete, downloading }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const fileType  = getFileType(material.fileName ?? material.name ?? "");
  const Icon      = fileType.icon;
  const topicName = material.topicName ?? material.topic?.name ?? null;

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <div className={`
      group relative flex flex-col
      bg-gray-900/80 backdrop-blur-sm
      border border-gray-800/80
      rounded-2xl overflow-hidden
      shadow-lg ${fileType.glow} hover:shadow-xl
      hover:border-gray-700/80
      transition-all duration-300 ease-out
      hover:-translate-y-0.5
    `}>

      {/* ── Gradient header strip ── */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${fileType.gradient} opacity-80`} />

      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* ── Top row: icon + menu ── */}
        <div className="flex items-start justify-between gap-3">

          {/* File icon with glassmorphism bubble */}
          <div className={`
            relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
            ${fileType.bg} border border-white/5
            shadow-inner
          `}>
            <Icon className={`w-6 h-6 ${fileType.iconColor}`} />
            {/* Subtle inner glow */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${fileType.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          </div>

          {/* File type badge */}
          <span className={`
            px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase
            border ${fileType.badge}
          `}>
            {fileType.label}
          </span>
        </div>

        {/* ── File name + size ── */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 break-all">
            {material.fileName ?? material.name ?? "Untitled"}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            {formatBytes(material.fileSize ?? material.size ?? 0)}
          </p>
        </div>

        {/* ── Topic badge ── */}
        {topicName && (
          <div className="flex items-center gap-1.5 min-w-0">
            <BookOpen className="w-3 h-3 text-gray-600 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate max-w-[160px]">{topicName}</span>
          </div>
        )}

        {/* ── Footer: date + actions ── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
          <span className="text-xs text-gray-600">
            {formatDate(material.uploadedAt ?? material.createdAt)}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Download */}
            <button
              onClick={() => onDownload(material)}
              disabled={downloading}
              title="Download"
              className="
                w-7 h-7 rounded-lg flex items-center justify-center
                text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(material)}
              title="Delete"
              className="
                w-7 h-7 rounded-lg flex items-center justify-center
                text-gray-500 hover:text-red-400 hover:bg-red-500/10
                transition-all duration-150
              "
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}