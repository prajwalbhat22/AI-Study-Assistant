// src/components/topics/TopicModal.jsx

import { useEffect, useState } from "react";
import { X, Loader2, BookOpen } from "lucide-react";

export default function TopicModal({ topic, onClose, onSubmit, submitting, error }) {
  const isEdit = !!topic;

  const [form, setForm] = useState({ name: "", description: "" });
  const [validationError, setValidationError] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (topic) {
      setForm({ name: topic.name ?? "", description: topic.description ?? "" });
    } else {
      setForm({ name: "", description: "" });
    }
    setValidationError("");
  }, [topic]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setValidationError("Topic name is required.");
      return;
    }
    onSubmit({ name: form.name.trim(), description: form.description.trim() });
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const displayError = validationError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Edit topic" : "New topic"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        {displayError && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Topic name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800
                text-white placeholder-gray-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
              <span className="text-gray-600 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What is this topic about?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800
                text-white placeholder-gray-600 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
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
                bg-gradient-to-r from-violet-600 to-indigo-600
                hover:from-violet-500 hover:to-indigo-500
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-semibold shadow-lg shadow-violet-600/20
                transition-all"
            >
              {submitting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : isEdit ? "Save changes" : "Create topic"
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}