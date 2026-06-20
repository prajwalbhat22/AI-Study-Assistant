// src/components/topics/DeleteConfirmModal.jsx

import { Trash2, X, Loader2 } from "lucide-react";

export default function DeleteConfirmModal({ topic, onClose, onConfirm, deleting, error }) {
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-black/50 p-6 space-y-5">

        {/* Icon + heading */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Delete topic</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
              hover:text-white hover:bg-gray-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-400 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="text-white font-medium">"{topic?.name}"</span>?
          This action cannot be undone.
        </p>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400
              hover:text-white hover:border-gray-700 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-red-600 hover:bg-red-500
              disabled:opacity-60 disabled:cursor-not-allowed
              text-white text-sm font-semibold transition-all"
          >
            {deleting
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
              : "Yes, delete"
            }
          </button>
        </div>

      </div>
    </div>
  );
}