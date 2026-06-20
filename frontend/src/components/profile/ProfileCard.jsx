// ProfileCard.jsx
// Displays avatar, name, email and action buttons

import React from "react";

const Avatar = ({ name }) => {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="pc-avatar" aria-hidden="true">
      <span>{initials}</span>
    </div>
  );
};

const ProfileCard = ({
  profile,
  onEdit,
  onChangePassword,
  onLogout,
  isLoggingOut,
}) => {
  const joinedDate = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <>
      <style>{`
        /* ── ProfileCard ── */
        .pc-root {
          background: linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
          border: 1px solid rgba(99, 102, 241, 0.18);
          border-radius: 24px;
          padding: 40px 36px 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
        }

        /* subtle top-right glow */
        .pc-root::before {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .pc-avatar {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 1px;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.22), 0 4px 24px rgba(99,102,241,0.35);
          flex-shrink: 0;
          margin-bottom: 20px;
          user-select: none;
        }

        .pc-name {
          font-size: 1.45rem;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
          margin: 0 0 6px;
          text-align: center;
        }

        .pc-email {
          font-size: 0.88rem;
          color: #94a3b8;
          margin: 0 0 6px;
          text-align: center;
          word-break: break-all;
        }

        .pc-joined {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0 0 28px;
        }

        .pc-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 20px;
          padding: 4px 14px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #818cf8;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .pc-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pc-btn {
          width: 100%;
          padding: 11px 18px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.2px;
        }

        .pc-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
        }
        .pc-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.48);
        }

        .pc-btn-ghost {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .pc-btn-ghost:hover {
          background: rgba(255,255,255,0.09);
          color: #cbd5e1;
        }

        .pc-btn-danger {
          background: rgba(239,68,68,0.08);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.18);
        }
        .pc-btn-danger:hover {
          background: rgba(239,68,68,0.14);
          color: #fca5a5;
        }

        .pc-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none !important;
        }

        .pc-divider {
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 4px 0;
        }
      `}</style>

      <div className="pc-root">
        <Avatar name={profile?.full_name || profile?.username} />

        <h2 className="pc-name">
          {profile?.full_name || profile?.username || "Student"}
        </h2>
        <p className="pc-email">{profile?.email || "—"}</p>
        <p className="pc-joined">Member since {joinedDate}</p>

        <span className="pc-badge">
          <span>✦</span> Pro Student
        </span>

        <div className="pc-actions">
          <button className="pc-btn pc-btn-primary" onClick={onEdit}>
            ✏️ Edit Profile
          </button>
          <button className="pc-btn pc-btn-ghost" onClick={onChangePassword}>
            🔒 Change Password
          </button>
          <div className="pc-divider" />
          <button
            className="pc-btn pc-btn-danger"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out…" : "⎋ Sign Out"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
