// ChangePasswordModal.jsx
// Modal for changing user's password with strength meter

import React, { useState, useRef, useEffect } from "react";

const strengthConfig = [
  { label: "Too short", color: "#ef4444", width: "15%" },
  { label: "Weak",      color: "#f97316", width: "35%" },
  { label: "Fair",      color: "#eab308", width: "60%" },
  { label: "Good",      color: "#22c55e", width: "85%" },
  { label: "Strong",    color: "#10b981", width: "100%" },
];

const getStrength = (pwd) => {
  if (!pwd || pwd.length < 6) return 0;
  let score = 1;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
};

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const PasswordField = ({ id, label, value, onChange, disabled, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="cpm-field">
      <label className="cpm-label" htmlFor={id}>{label}</label>
      <div className="cpm-input-wrap">
        <input
          id={id}
          className="cpm-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder || "••••••••"}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="cpm-eye"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onSave, onClose, isSaving, error }) => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const strength = getStrength(form.new_password);
  const strengthInfo = strengthConfig[strength];

  const mismatch =
    form.confirm_password && form.new_password !== form.confirm_password;
  const canSubmit =
    form.old_password &&
    form.new_password.length >= 6 &&
    form.new_password === form.confirm_password &&
    !isSaving;

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave(form);
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <style>{`
        /* ── ChangePasswordModal ── */
        .cpm-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: cpm-fadein 0.18s ease;
        }

        @keyframes cpm-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .cpm-card {
          background: #1e1e2e;
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 20px;
          padding: 36px 32px 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6);
          animation: cpm-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }

        @keyframes cpm-slidein {
          from { transform: translateY(24px) scale(0.97); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }

        .cpm-close {
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
        .cpm-close:hover {
          background: rgba(255,255,255,0.12);
          color: #e2e8f0;
        }

        .cpm-icon {
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

        .cpm-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }

        .cpm-subtitle {
          font-size: 0.84rem;
          color: #64748b;
          margin: 0 0 24px;
        }

        .cpm-error {
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

        .cpm-field {
          margin-bottom: 18px;
        }

        .cpm-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .cpm-input-wrap {
          position: relative;
        }

        .cpm-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 44px 12px 16px;
          color: #f1f5f9;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .cpm-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
        }
        .cpm-input:disabled { opacity: 0.5; }

        .cpm-eye {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .cpm-eye:hover { color: #94a3b8; }

        /* Strength meter */
        .cpm-strength {
          margin-top: 8px;
        }
        .cpm-strength-bar-bg {
          height: 4px;
          background: rgba(255,255,255,0.07);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        .cpm-strength-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
        .cpm-strength-label {
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* mismatch hint */
        .cpm-mismatch {
          font-size: 0.76rem;
          color: #f87171;
          margin-top: 6px;
        }

        .cpm-actions {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }

        .cpm-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.18s;
        }

        .cpm-btn-cancel {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .cpm-btn-cancel:hover {
          background: rgba(255,255,255,0.09);
          color: #cbd5e1;
        }

        .cpm-btn-save {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }
        .cpm-btn-save:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }
        .cpm-btn-save:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .cpm-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cpm-spin 0.7s linear infinite;
          margin-right: 6px;
          vertical-align: middle;
        }

        @keyframes cpm-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="cpm-backdrop" onClick={handleBackdrop}>
        <div className="cpm-card" role="dialog" aria-modal="true" aria-labelledby="cpm-title">
          <button className="cpm-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="cpm-icon">🔒</div>
          <h2 className="cpm-title" id="cpm-title">Change Password</h2>
          <p className="cpm-subtitle">Keep your account secure with a strong password</p>

          {error && (
            <div className="cpm-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="cpm-field">
              <label className="cpm-label" htmlFor="cpm-old">Current Password</label>
              <div className="cpm-input-wrap">
                <input
                  ref={firstRef}
                  id="cpm-old"
                  className="cpm-input"
                  type="password"
                  value={form.old_password}
                  onChange={set("old_password")}
                  disabled={isSaving}
                  placeholder="Your current password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="cpm-field">
              <label className="cpm-label" htmlFor="cpm-new">New Password</label>
              <div className="cpm-input-wrap">
                <input
                  id="cpm-new"
                  className="cpm-input"
                  type="password"
                  value={form.new_password}
                  onChange={set("new_password")}
                  disabled={isSaving}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              {form.new_password && (
                <div className="cpm-strength">
                  <div className="cpm-strength-bar-bg">
                    <div
                      className="cpm-strength-bar"
                      style={{
                        width: strengthInfo.width,
                        backgroundColor: strengthInfo.color,
                      }}
                    />
                  </div>
                  <span
                    className="cpm-strength-label"
                    style={{ color: strengthInfo.color }}
                  >
                    {strengthInfo.label}
                  </span>
                </div>
              )}
            </div>

            <div className="cpm-field">
              <label className="cpm-label" htmlFor="cpm-confirm">Confirm New Password</label>
              <div className="cpm-input-wrap">
                <input
                  id="cpm-confirm"
                  className="cpm-input"
                  type="password"
                  value={form.confirm_password}
                  onChange={set("confirm_password")}
                  disabled={isSaving}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
              {mismatch && (
                <p className="cpm-mismatch">Passwords don't match</p>
              )}
            </div>

            <div className="cpm-actions">
              <button
                type="button"
                className="cpm-btn cpm-btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cpm-btn cpm-btn-save"
                disabled={!canSubmit}
              >
                {isSaving && <span className="cpm-spinner" />}
                {isSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
