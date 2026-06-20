// ProfilePage.jsx
// Main profile page — orchestrates data, modals, and stat cards

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/profile/ProfileCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";
import { profileService } from "../services/ProfileService";

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, accent, loading }) => (
  <div className="pf-stat-card" style={{ "--accent": accent }}>
    <div className="pf-stat-icon">{icon}</div>
    <div className="pf-stat-body">
      {loading ? (
        <div className="pf-stat-skeleton" />
      ) : (
        <span className="pf-stat-value">{value ?? "—"}</span>
      )}
      <span className="pf-stat-label">{label}</span>
    </div>
  </div>
);

// ─── Toast ───────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`pf-toast pf-toast-${type}`}>
      <span>{type === "success" ? "✓" : "⚠"}</span>
      {message}
    </div>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="pf-card-skeleton">
    <div className="pf-sk pf-sk-circle" />
    <div className="pf-sk pf-sk-line" style={{ width: "60%", marginTop: 20 }} />
    <div className="pf-sk pf-sk-line" style={{ width: "45%", marginTop: 8 }} />
    <div className="pf-sk pf-sk-line" style={{ width: "30%", marginTop: 8, marginBottom: 24 }} />
    <div className="pf-sk pf-sk-btn" />
    <div className="pf-sk pf-sk-btn" style={{ marginTop: 10 }} />
  </div>
);

// ─── Profile Page ─────────────────────────────────────────────────────────────

const STATS_CONFIG = [
  { key: "topics_count",    icon: "📚", label: "Topics",        accent: "#6366f1" },
  { key: "notes_count",     icon: "📝", label: "Notes",         accent: "#8b5cf6" },
  { key: "materials_count", icon: "📎", label: "Materials",     accent: "#06b6d4" },
  { key: "study_hours",     icon: "⏱️",  label: "Hours Studied", accent: "#10b981" },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState(null);

  const [showEdit, setShowEdit]       = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

  const [editError, setEditError]     = useState(null);
  const [pwdError, setPwdError]       = useState(null);
  const [isSaving, setIsSaving]       = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = "success") =>
    setToast({ message, type });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [profileData, statsData] = await Promise.all([
        profileService.getProfile(),
        profileService.getStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
    } catch (err) {
      setFetchError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Edit Profile ──────────────────────────────────────────────────────────
  const handleEditSave = async (data) => {
    setIsSaving(true);
    setEditError(null);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      setShowEdit(false);
      showToast("Profile updated successfully");
    } catch (err) {
      setEditError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const handlePasswordSave = async (data) => {
    setIsSaving(true);
    setPwdError(null);
    try {
      await profileService.changePassword(data);
      setShowChangePwd(false);
      showToast("Password changed successfully");
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (!window.confirm("Sign out of your account?")) return;
    setIsLoggingOut(true);
    await profileService.logout();
    navigate("/login");
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        /* ── ProfilePage layout ── */
        .pf-page {
          min-height: 100vh;
          background: #0d0d1a;
          color: #f1f5f9;
          padding: 32px 24px 64px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .pf-header {
          margin-bottom: 32px;
        }

        .pf-breadcrumb {
          font-size: 0.78rem;
          color: #475569;
          margin-bottom: 10px;
          letter-spacing: 0.3px;
        }

        .pf-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .pf-title span {
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pf-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
          max-width: 1100px;
        }

        @media (max-width: 860px) {
          .pf-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ── Right panel ── */
        .pf-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Section ── */
        .pf-section {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .pf-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6366f1;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin: 0 0 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pf-section-title::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(99,102,241,0.15);
        }

        /* ── Stats grid ── */
        .pf-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        @media (max-width: 540px) {
          .pf-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .pf-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: transform 0.18s, border-color 0.18s;
          position: relative;
          overflow: hidden;
        }

        .pf-stat-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--accent, #6366f1) 0%, transparent 80%);
          opacity: 0.04;
          pointer-events: none;
        }

        .pf-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99,102,241,0.22);
        }

        .pf-stat-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pf-stat-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pf-stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .pf-stat-label {
          font-size: 0.76rem;
          color: #64748b;
          font-weight: 500;
        }

        .pf-stat-skeleton {
          width: 48px;
          height: 24px;
          background: rgba(255,255,255,0.07);
          border-radius: 6px;
          animation: pf-pulse 1.4s ease-in-out infinite;
        }

        @keyframes pf-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* ── Account info rows ── */
        .pf-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .pf-info-row:last-child {
          border-bottom: none;
        }

        .pf-info-key {
          font-size: 0.82rem;
          color: #64748b;
          font-weight: 500;
        }

        .pf-info-val {
          font-size: 0.9rem;
          color: #cbd5e1;
          font-weight: 500;
          text-align: right;
          word-break: break-all;
          max-width: 60%;
        }

        .pf-badge-active {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: #34d399;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
        }

        .pf-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
          animation: pf-blink 1.8s ease-in-out infinite;
        }

        @keyframes pf-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* ── Card skeleton ── */
        .pf-card-skeleton {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 24px;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }

        .pf-sk {
          background: rgba(255,255,255,0.06);
          border-radius: 6px;
          animation: pf-pulse 1.4s ease-in-out infinite;
        }

        .pf-sk-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
        }

        .pf-sk-line {
          height: 14px;
          width: 100%;
        }

        .pf-sk-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
        }

        /* ── Error state ── */
        .pf-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          color: #f87171;
        }

        .pf-error p { margin: 0 0 16px; font-size: 0.9rem; }

        .pf-retry-btn {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
          padding: 9px 20px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .pf-retry-btn:hover { background: rgba(239,68,68,0.2); }

        /* ── Toast ── */
        .pf-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 2000;
          animation: pf-toastin 0.3s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        @keyframes pf-toastin {
          from { transform: translateX(-50%) translateY(20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }

        .pf-toast-success {
          background: rgba(16,185,129,0.18);
          border: 1px solid rgba(16,185,129,0.35);
          color: #34d399;
        }

        .pf-toast-error {
          background: rgba(239,68,68,0.14);
          border: 1px solid rgba(239,68,68,0.3);
          color: #f87171;
        }
      `}</style>

      <div className="pf-page">
        {/* Header */}
        <div className="pf-header">
          <p className="pf-breadcrumb">Dashboard / Profile</p>
          <h1 className="pf-title">
            My <span>Profile</span>
          </h1>
        </div>

        {fetchError ? (
          <div className="pf-error">
            <p>⚠️ {fetchError}</p>
            <button className="pf-retry-btn" onClick={fetchData}>
              Try again
            </button>
          </div>
        ) : (
          <div className="pf-grid">
            {/* Left — Profile Card */}
            {loading ? (
              <CardSkeleton />
            ) : (
              <ProfileCard
                profile={profile}
                onEdit={() => { setEditError(null); setShowEdit(true); }}
                onChangePassword={() => { setPwdError(null); setShowChangePwd(true); }}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            )}

            {/* Right panel */}
            <div className="pf-right">
              {/* Stats */}
              <div className="pf-section">
                <h2 className="pf-section-title">📊 Activity Stats</h2>
                <div className="pf-stats-grid">
                  {STATS_CONFIG.map((s) => (
                    <StatCard
                      key={s.key}
                      icon={s.icon}
                      label={s.label}
                      value={stats?.[s.key]}
                      accent={s.accent}
                      loading={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Account details */}
              <div className="pf-section">
                <h2 className="pf-section-title">👤 Account Details</h2>

                {[
                  { key: "Full Name",  val: profile?.full_name || profile?.username || "—" },
                  { key: "Username",   val: profile?.username || "—" },
                  { key: "Email",      val: profile?.email || "—" },
                  {
                    key: "Joined",
                    val: profile?.date_joined
                      ? new Date(profile.date_joined).toLocaleDateString("en-US", { dateStyle: "long" })
                      : "—",
                  },
                  { key: "Status", val: null },
                ].map((row) => (
                  <div className="pf-info-row" key={row.key}>
                    <span className="pf-info-key">{row.key}</span>
                    {row.key === "Status" ? (
                      <span className="pf-badge-active">
                        <span className="pf-badge-dot" />
                        Active
                      </span>
                    ) : (
                      <span className="pf-info-val">
                        {loading ? (
                          <span
                            className="pf-sk pf-sk-line"
                            style={{ display: "inline-block", width: 100, height: 12 }}
                          />
                        ) : (
                          row.val
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onSave={handleEditSave}
          onClose={() => setShowEdit(false)}
          isSaving={isSaving}
          error={editError}
        />
      )}

      {showChangePwd && (
        <ChangePasswordModal
          onSave={handlePasswordSave}
          onClose={() => setShowChangePwd(false)}
          isSaving={isSaving}
          error={pwdError}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ProfilePage;
