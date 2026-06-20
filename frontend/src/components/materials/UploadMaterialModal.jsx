// src/components/materials/UploadMaterialModal.jsx

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Upload, File, CheckCircle2,
  AlertCircle, ChevronDown, Loader2, CloudUpload,
} from "lucide-react";
import { getAllTopics } from "../../services/topicService";
import { getFileType } from "./MaterialCard";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// ── Upload progress bar ───────────────────────────────────────────────────────
function ProgressBar({ percent }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 font-medium">Uploading…</span>
        <span className="text-indigo-400 font-bold tabular-nums">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
            rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          {/* Shimmer sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
            -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ file, onFileSelect, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const fileType = file ? getFileType(file.name) : null;

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  }, [disabled, onFileSelect]);

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const formatBytes = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (file) {
    const FIcon = fileType.icon;
    return (
      <div className="relative flex items-center gap-4 p-4 rounded-xl
        bg-gray-950 border border-indigo-500/30 group">
        <div className={`w-11 h-11 rounded-xl ${fileType.bg} flex items-center justify-center flex-shrink-0`}>
          <FIcon className={`w-5 h-5 ${fileType.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{file.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => !disabled && onFileSelect(null)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600
            hover:text-white hover:bg-gray-800 transition-all flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${fileType.gradient} opacity-5 pointer-events-none`} />
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-3
        p-8 rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-200
        ${dragging
          ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]"
          : "border-gray-800 hover:border-gray-700 hover:bg-gray-950/50"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Animated upload icon */}
      <div className={`
        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200
        ${dragging ? "bg-indigo-500/15 scale-110" : "bg-gray-800/60"}
      `}>
        <CloudUpload className={`w-7 h-7 transition-colors ${dragging ? "text-indigo-400" : "text-gray-500"}`} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-gray-300">
          {dragging ? "Drop it here" : "Drag & drop your file"}
        </p>
        <p className="text-xs text-gray-600">
          or <span className="text-indigo-400 font-medium">browse</span> to choose · max {MAX_FILE_SIZE_MB} MB
        </p>
      </div>

      <p className="text-[11px] text-gray-700">
        PDF, DOCX, PPTX, ZIP, Images and more
      </p>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) onFileSelect(e.target.files[0]); }}
        disabled={disabled}
      />
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function UploadMaterialModal({ onClose, onUpload }) {
  const [file,          setFile]          = useState(null);
  const [topicId,       setTopicId]       = useState("");
  const [topics,        setTopics]        = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [progress,      setProgress]      = useState(0);
  const [uploading,     setUploading]     = useState(false);
  const [uploadDone,    setUploadDone]    = useState(false);
  const [error,         setError]         = useState("");
  const [fileError,     setFileError]     = useState("");

  // Load topics for selector
  useEffect(() => {
    getAllTopics()
      .then((d) => setTopics(Array.isArray(d) ? d : d.topics ?? []))
      .catch(() => setTopics([]))
      .finally(() => setTopicsLoading(false));
  }, []);

  const handleFileSelect = (f) => {
    setFileError("");
    setError("");
    if (!f) { setFile(null); return; }
    if (f.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setFileError("Please select a file."); return; }
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      await onUpload(file, topicId || null, (evt) => {
        if (evt.total) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      });
      setUploadDone(true);
      // Auto-close after success flash
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleBackdrop = (e) => {
    if (!uploading && e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 py-6"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg bg-gray-900/95 backdrop-blur-xl border border-gray-800/80
        rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* ── Gradient top accent ── */}
        <div className="h-px w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20
              border border-indigo-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Upload material</h2>
              <p className="text-xs text-gray-500">Add a file to your study library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
              hover:text-white hover:bg-gray-800 disabled:opacity-40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">

          {/* ── Drop zone ── */}
          <DropZone
            file={file}
            onFileSelect={handleFileSelect}
            disabled={uploading}
          />

          {/* File size error */}
          {fileError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* ── Topic selector ── */}
          <div className="space-y-1.5">
            <label htmlFor="mat-topic" className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
              Link to topic
              <span className="text-gray-700 font-normal normal-case ml-1">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="mat-topic"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={uploading || topicsLoading}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-xl
                  bg-gray-950 border border-gray-800 text-sm text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
                  disabled:opacity-50 transition-all [&>option]:bg-gray-900"
              >
                <option value="">{topicsLoading ? "Loading topics…" : "No topic"}</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* ── Progress bar ── */}
          {uploading && !uploadDone && (
            <ProgressBar percent={progress} />
          )}

          {/* ── Success flash ── */}
          {uploadDone && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl
              bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Upload complete!</span>
            </div>
          )}

          {/* ── API error ── */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl
              bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Actions ── */}
          {!uploadDone && (
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400
                  hover:text-white hover:border-gray-700 text-sm font-medium
                  disabled:opacity-40 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-white text-sm font-semibold
                  shadow-lg shadow-indigo-600/20
                  transition-all duration-200"
              >
                {uploading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
                  : <><Upload className="w-3.5 h-3.5" /> Upload file</>
                }
              </button>
            </div>
          )}

        </form>
      </div>

      {/* Global shimmer keyframe (injected once) */}
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}