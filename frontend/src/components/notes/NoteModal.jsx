// src/components/notes/NoteModal.jsx

import { useEffect, useState } from "react";
import { X, Loader2, FileText, ChevronDown } from "lucide-react";
import { getAllTopics } from "../../services/topicService";

const WORD_LIMIT = 10000;

export default function NoteModal({ note, onClose, onSubmit, submitting, error }) {
  const isEdit = !!note;

  const [form, setForm]               = useState({ title: "", content: "", topicId: "" });
  const [topics, setTopics]           = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [validationError, setValidationError] = useState("");
  const wordCount = form.content.trim() === "" ? 0 : form.content.trim().split(/\s+/).length;

  // Pre-fill when editing
  useEffect(() => {
    setForm(
      note
        ? {
            title:   note.title   ?? "",
            content: note.content ?? "",
            topicId: note.topicId ?? note.topic?.id ?? "",
          }
        : { title: "", content: "", topicId: "" }
    );
    setValidationError("");
  }, [note]);

  // Load topics for the dropdown
  useEffect(() => {
    setTopicsLoading(true);
    getAllTopics()
      .then((data) => setTopics(Array.isArray(data) ? data : data.topics ?? []))
      .catch(() => setTopics([]))
      .finally(() => setTopicsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setValidationError("Title is required."); return; }
    if (!form.content.trim()) { setValidationError("Content cannot be empty."); return; }
    onSubmit({
      title:   form.title.trim(),
      content: form.content.trim(),
      topicId: form.topicId ? Number(form.topicId) : null,
    });
  };

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  const displayError = validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl
        shadow-2xl shadow-black/50 flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Edit note" : "New note"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
              hover:text-white hover:bg-gray-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden" noValidate>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Error banner */}
            {displayError && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10
                border border-red-500/20 text-red-400 text-sm">
                <span className="mt-0.5 flex-shrink-0">⚠</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Note title…"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800
                  text-white placeholder-gray-600 text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                  transition-all"
              />
            </div>

            {/* Topic selector */}
            <div className="space-y-1.5">
              <label htmlFor="topicId" className="block text-sm font-medium text-gray-300">
                Topic
                <span className="text-gray-600 font-normal ml-1">(optional)</span>
              </label>
              <div className="relative">
                <select
                  id="topicId"
                  name="topicId"
                  value={form.topicId}
                  onChange={handleChange}
                  disabled={topicsLoading}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-gray-950
                    border border-gray-800 text-sm
                    text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                    focus:border-indigo-500/50 transition-all disabled:opacity-50
                    [&>option]:bg-gray-900"
                >
                  <option value="">
                    {topicsLoading ? "Loading topics…" : "No topic selected"}
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                  text-gray-600 pointer-events-none" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                  Content <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs ${wordCount > WORD_LIMIT ? "text-red-400" : "text-gray-600"}`}>
                  {wordCount.toLocaleString()} words
                </span>
              </div>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your note here…"
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800
                  text-white placeholder-gray-600 text-sm resize-none leading-relaxed
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                  transition-all"
              />
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400
                hover:text-white hover:border-gray-700 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              {submitting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : isEdit ? "Save changes" : "Create note"
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}