import { useEffect, useState } from "react";
import {
  RiFolderLine,
  RiFileTextLine,
  RiBookOpenLine,
  RiHardDriveLine,
  RiAddLine,
  RiArrowRightLine,
  RiSparklingLine,
  RiTimeLine,
  RiTrophyLine,
  RiCalendarLine,
  RiRefreshLine,
  RiErrorWarningLine,
} from "react-icons/ri";

import Sidebar from "../components/layout/Sidebar.jsx";
import { getDashboardStats } from "../services/dashboardService.js";

const RECENT = [
  {
    icon: RiCalendarLine,
    text: "No recent activity yet",
    sub: "Your notes will appear here",
    color: "text-text2",
  },
  {
    icon: RiTrophyLine,
    text: "Complete your first topic",
    sub: "Create a topic to get started",
    color: "text-accent",
  },
  {
    icon: RiTimeLine,
    text: "Upload your first material",
    sub: "PDF, images, Word docs supported",
    color: "text-warning",
  },
];

/* ── Glassmorphism stat card ──────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, border, hint, delay, glowColor }) {
  return (
    <div
      className={`
        glass-stat border ${border} p-5
        flex flex-col gap-4
        animate-fade-up ${delay}
        hover-scale cursor-default
      `}
    >
      <div className="flex items-center justify-between">
        {/* Animated icon */}
        <span
          className={`
            w-11 h-11 rounded-xl flex items-center justify-center shrink-0
            transition-all duration-300 group
          `}
          style={{
            background: `${glowColor}18`,
            boxShadow: `0 0 16px 0 ${glowColor}22`,
          }}
        >
          <Icon
            className={`text-xl ${color} transition-transform duration-300 hover:scale-110`}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor}88)` }}
          />
        </span>
        <span className="text-text2 text-xs font-medium tracking-wide">{hint}</span>
      </div>

      <div>
        <p
          className={`font-display font-700 text-3xl ${color} leading-none animate-count-up ${delay}`}
          style={{ filter: `drop-shadow(0 0 8px ${glowColor}66)` }}
        >
          {value}
        </p>
        <p className="text-text2 text-sm mt-1.5">{label}</p>
      </div>
    </div>
  );
}

/* ── Skeleton loader ──────────────────────────────────────────── */
function StatSkeleton() {
  return (
    <div className="glass-stat border border-border/40 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="skeleton w-11 h-11 rounded-xl" />
        <div className="skeleton w-20 h-3 rounded" />
      </div>
      <div className="skeleton w-16 h-8 rounded mb-2" />
      <div className="skeleton w-24 h-3 rounded" />
    </div>
  );
}

/* ── Quick action row ─────────────────────────────────────────── */
function QuickAction({ icon: Icon, label, description, color, glowColor }) {
  return (
    <button
      className="
        glass-card p-4
        flex items-center gap-4 w-full text-left
        group animate-fade-up
      "
    >
      <span
        className="
          w-10 h-10 rounded-xl flex items-center justify-center shrink-0
          transition-all duration-200 group-hover:scale-110
        "
        style={{
          background: `${glowColor}18`,
          boxShadow: `0 0 12px 0 ${glowColor}22`,
        }}
      >
        <Icon
          className={`text-xl ${color}`}
          style={{ filter: `drop-shadow(0 0 4px ${glowColor}88)` }}
        />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-text1 text-sm font-medium">{label}</p>
        <p className="text-text2 text-xs mt-0.5 truncate">{description}</p>
      </div>

      <RiArrowRightLine
        className="
          text-text2 text-base shrink-0
          group-hover:text-accent group-hover:translate-x-1
          transition-all duration-200
        "
      />
    </button>
  );
}

/* ── Main dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  async function fetchStats() {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  const statCards = [
    {
      label: "Topics",
      value: stats?.totalTopics ?? 0,
      icon: RiFolderLine,
      color: "text-accent",
      border: "border-accent/20",
      hint: "Study areas",
      delay: "delay-100",
      glowColor: "#6C63FF",
    },
    {
      label: "Notes",
      value: stats?.totalNotes ?? 0,
      icon: RiFileTextLine,
      color: "text-success",
      border: "border-success/20",
      hint: "Written notes",
      delay: "delay-200",
      glowColor: "#34D399",
    },
    {
      label: "Materials",
      value: stats?.totalStudyMaterials ?? 0,
      icon: RiBookOpenLine,
      color: "text-warning",
      border: "border-warning/20",
      hint: "Uploaded files",
      delay: "delay-300",
      glowColor: "#FBBF24",
    },
    {
      label: "Storage Used",
      value: stats?.totalStorageUsed ?? "0 B",
      icon: RiHardDriveLine,
      color: "text-text2",
      border: "border-border",
      hint: "Total size",
      delay: "delay-400",
      glowColor: "#9094A6",
    },
  ];

  return (
    <div className="flex min-h-screen bg-dashboard-gradient">
      <Sidebar />

      {/* ── Floating decorative blobs ──────────────────────── */}
      <div
        className="fixed top-20 right-32 w-80 h-80 rounded-full pointer-events-none animate-blob"
        style={{
          background: "radial-gradient(circle, #6C63FF18 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-32 left-72 w-64 h-64 rounded-full pointer-events-none animate-blob-2"
        style={{
          background: "radial-gradient(circle, #34D39912 0%, transparent 70%)",
          filter: "blur(36px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed top-1/2 right-10 w-48 h-48 rounded-full pointer-events-none animate-blob"
        style={{
          background: "radial-gradient(circle, #9B5DE50E 0%, transparent 70%)",
          filter: "blur(32px)",
          zIndex: 0,
          animationDelay: "3s",
        }}
      />

      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* ── Header ──────────────────────────────────────── */}
        <header
          className="
            sticky top-0 z-20
            backdrop-blur-md border-b border-border/60
            px-6 py-4
            flex items-center justify-between gap-4
            animate-fade-in
          "
          style={{ background: "rgba(15,17,23,0.75)" }}
        >
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 md:hidden">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center animate-pulse-glow"
              style={{
                background: "linear-gradient(135deg, #6C63FF 0%, #9B5DE5 100%)",
              }}
            >
              <RiSparklingLine className="text-white text-sm" />
            </span>
            <div>
              <p
                className="font-display font-700 text-sm leading-tight"
                style={{
                  background: "linear-gradient(135deg, #F0F0F5 0%, #C8C5FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                StuddyBuddy
              </p>
              <p className="text-[9px] text-accent/70 uppercase tracking-widest leading-tight">
                AI Study Assistant
              </p>
            </div>
          </div>

          {/* Desktop breadcrumb */}
          <div className="hidden md:block">
            <p className="eyebrow">Overview</p>
            <h1 className="font-display text-xl font-600 text-text1 mt-0.5">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="btn-primary text-sm">
              <RiAddLine className="text-base relative z-10" />
              <span className="relative z-10">New Topic</span>
            </button>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────── */}
        <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">

          {/* ── Welcome banner ────────────────────────────── */}
          <div
            className="
              relative mb-10 rounded-2xl overflow-hidden
              border border-accent/15 p-8
              animate-fade-up welcome-gradient
            "
            style={{
              background:
                "linear-gradient(135deg, rgba(108,99,255,0.10) 0%, rgba(155,93,229,0.07) 50%, rgba(52,211,153,0.05) 100%)",
              boxShadow: "0 0 60px 0 #6C63FF12, inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Radial glow overlay */}
            <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

            {/* Decorative large blurred circle */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none animate-float"
              style={{
                background: "radial-gradient(circle, #6C63FF22 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <div
              className="absolute -bottom-10 left-1/3 w-36 h-36 rounded-full pointer-events-none animate-blob-2"
              style={{
                background: "radial-gradient(circle, #34D39914 0%, transparent 70%)",
                filter: "blur(24px)",
              }}
            />

            <div className="relative z-10">
              <p className="eyebrow mb-3">Welcome back</p>
              <h2 className="font-display text-3xl font-700 text-text1 leading-tight">
                Ready to study smarter?
              </h2>
              <p className="text-text2 mt-2 text-sm max-w-md leading-relaxed">
                Organise your topics, capture notes, and upload materials.
                Your AI assistant is standing by to help you learn faster.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn-primary">
                  <RiAddLine className="relative z-10" />
                  <span className="relative z-10">Create First Topic</span>
                </button>
                <button className="btn-ghost">
                  Take a tour
                  <RiArrowRightLine />
                </button>
              </div>
            </div>
          </div>

          {/* ── Error banner ──────────────────────────────── */}
          {error && (
            <div className="mb-6 glass-card border border-red-500/25 p-4 flex items-center justify-between gap-4 animate-scale-in">
              <div className="flex items-center gap-3">
                <RiErrorWarningLine className="text-red-400 text-xl shrink-0" />
                <div>
                  <p className="text-red-400 text-sm font-medium">
                    Could not load dashboard statistics
                  </p>
                  <p className="text-text2 text-xs mt-0.5">{error}</p>
                </div>
              </div>
              <button onClick={fetchStats} className="btn-ghost shrink-0">
                <RiRefreshLine />
                Retry
              </button>
            </div>
          )}

          {/* ── Stat cards ────────────────────────────────── */}
          <section className="mb-10">
            <p className="eyebrow mb-4">Your Statistics</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
                : statCards.map((s) => <StatCard key={s.label} {...s} />)
              }
            </div>
          </section>

          {/* ── Quick actions + Recent activity ───────────── */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="animate-fade-up delay-200">
              <p className="eyebrow mb-4">Quick Actions</p>
              <div className="flex flex-col gap-3">
                <QuickAction
                  icon={RiFolderLine}
                  label="Create a Topic"
                  description="Group your notes by subject or course"
                  color="text-accent"
                  glowColor="#6C63FF"
                />
                <QuickAction
                  icon={RiFileTextLine}
                  label="Write a Note"
                  description="Capture ideas, summaries, and key points"
                  color="text-success"
                  glowColor="#34D399"
                />
                <QuickAction
                  icon={RiBookOpenLine}
                  label="Upload Material"
                  description="PDF, images, Word docs — all supported"
                  color="text-warning"
                  glowColor="#FBBF24"
                />
              </div>
            </section>

            <section className="animate-fade-up delay-300">
              <p className="eyebrow mb-4">Recent Activity</p>
              <div className="glass-card divide-y divide-border/50">
                {RECENT.map(({ icon: Icon, text, sub, color }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 transition-colors duration-150 hover:bg-accent/5 rounded-xl"
                  >
                    <span
                      className="
                        w-8 h-8 rounded-lg
                        flex items-center justify-center shrink-0 mt-0.5
                        border border-border/60
                      "
                      style={{ background: "rgba(22,24,31,0.6)" }}
                    >
                      <Icon className={`text-base ${color}`} />
                    </span>
                    <div>
                      <p className="text-text1 text-sm font-medium">{text}</p>
                      <p className="text-text2 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────── */}
        <footer className="border-t border-border/40 px-6 py-4 text-center animate-fade-in delay-700">
          <p className="text-text2 text-xs">
            StuddyBuddy · AI Study Assistant ·{" "}
            <span className="text-accent">v1.0.0</span>
          </p>
        </footer>
      </main>
    </div>
  );
}