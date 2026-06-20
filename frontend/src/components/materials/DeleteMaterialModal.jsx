// src/components/materials/DeleteMaterialModal.jsx

import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { getFileType } from "./MaterialCard";

export default function DeleteMaterialModal({ material, onClose, onConfirm, deleting, error }) {
  const fileType  = getFileType(material?.fileName ?? material?.name ?? "");
  const FIcon     = fileType.icon;

  const handleBackdrop = (e) => { if (!deleting && e.target === e.currentTarget) onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-sm bg-gray-900/95 backdrop-blur-xl border border-gray-800/80
        rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Red top accent */}
        <div className="h-px w-full bg-gradient-to-r from-red-600 to-rose-600" />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20
                flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Delete material</h2>
                <p className="text-xs text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                hover:text-white hover:bg-gray-800 disabled:opacity-40 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* File preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-950 border border-gray-800">
            <div className={`w-9 h-9 rounded-lg ${fileType.bg} flex items-center justify-center flex-shrink-0`}>
              <FIcon className={`w-4 h-4 ${fileType.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {material?.fileName ?? material?.name ?? "Untitled"}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{fileType.label} file</p>
            </div>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">
            This file will be permanently removed from your study library and cannot be recovered.
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl
              bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400
                hover:text-white hover:border-gray-700 text-sm font-medium
                disabled:opacity-40 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-red-600 to-rose-600
                hover:from-red-500 hover:to-rose-500
                disabled:opacity-60 disabled:cursor-not-allowed
                text-white text-sm font-semibold shadow-lg shadow-red-600/20
                transition-all duration-200"
            >
              {deleting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                : <><Trash2 className="w-3.5 h-3.5" /> Delete file</>
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}