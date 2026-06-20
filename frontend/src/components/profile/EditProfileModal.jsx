// EditProfileModal.jsx
// Modal for editing the user's full name

import React, { useState, useEffect, useRef } from "react";

const EditProfileModal = ({ profile, onSave, onClose, isSaving, error }) => {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    onSave({ full_name: fullName.trim() });
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <style>{`
        /* ── EditProfileModal ── */
        .epm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: epm-fadein 0.18s ease;
        }

        @keyframes epm-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .epm-card {
          background: #1e1e2e;
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 20px;
          padding: 36px 32px 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
          animation: epm-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }

        @keyframes epm-slidein {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }

        .epm-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #94a3b8;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.15s;
        }
        .epm-close:hover {
          background: rgba(255,255,255,0.12);
          color: #e2e8f0;
        }

        .epm-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
          border: 1px solid rgba(99,102,241,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 18px;
        }

        .epm-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }

        .epm-subtitle {
          font-size: 0.84rem;
          color: #64748b;
          margin: 0 0 28px;
        }

        .epm-field {
          margin-bottom: 20px;
        }

        .epm-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .epm-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #f1f5f9;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .epm-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
        }
        .epm-input:disabled {
          opacity: 0.5;
        }

        .epm-input-static {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          color: #64748b;
          font-size: 0.95rem;
          box-sizing: border-box;
          cursor: not-allowed;
        }

        .epm-hint {
          font-size: 0.76rem;
          color: #475569;
          margin-top: 6px;
        }

        .epm-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          color: #f87171;
          font-size: 0.84rem;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .epm-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .epm-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
        }

        .epm-btn-cancel {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .epm-btn-cancel:hover {
          background: rgba(255,255,255,0.09);
          color: #cbd5e1;
        }

        .epm-btn-save {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }
        .epm-btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .epm-btn-save:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .epm-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: epm-spin 0.7s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes epm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="epm-backdrop" onClick={handleBackdrop}>
        <div className="epm-card" role="dialog" aria-modal="true" aria-labelledby="epm-title">
          <button className="epm-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="epm-icon">✏️</div>
          <h2 className="epm-title" id="epm-title">Edit Profile</h2>
          <p className="epm-subtitle">Update your display name</p>

          {error && (
            <div className="epm-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="epm-field">
              <label className="epm-label" htmlFor="epm-name">Full Name</label>
              <input
                ref={inputRef}
                id="epm-name"
                className="epm-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={isSaving}
                maxLength={80}
                required
              />
            </div>

            <div className="epm-field">
              <label className="epm-label">Email</label>
              <div className="epm-input-static">{profile?.email}</div>
              <p className="epm-hint">Email address cannot be changed here.</p>
            </div>

            <div className="epm-actions">
              <button
                type="button"
                className="epm-btn epm-btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="epm-btn epm-btn-save"
                disabled={isSaving || !fullName.trim()}
              >
                {isSaving && <span className="epm-spinner" />}
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
