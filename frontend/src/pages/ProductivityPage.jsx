import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

// ─── API helpers ──────────────────────────────────────────────────────────────
import axiosClient from "../api/axiosClient";
import {
  startPomodoro,
  completePomodoro,
  getPomodoroHistory,
  startStudySession,
  endStudySession,
  getActiveStudySession,
  getStudySessionHistory,
} from "../services/productivityService";

const api = {
  startPomodoro: async (body) => {
    const res = await startPomodoro(body);
    return res.data;
  },
  completePomodoro: async (id, body) => {
    const res = await completePomodoro(id, body);
    return res.data;
  },
  pomodoroHistory: async () => {
    const res = await getPomodoroHistory();
    return res.data;
  },
  startStudy: async (body) => {
    const res = await startStudySession(body);
    return res.data;
  },
  endStudy: async (id, body) => {
    const res = await endStudySession(id, body);
    return res.data;
  },
  activeStudy: async () => {
    const res = await getActiveStudySession();
    return res.data;
  },
  studyHistory: async () => {
    const res = await getStudySessionHistory();
    return res.data;
  },
  dashStats: async () => {
    const res = await axiosClient.get("/dashboard/stats");
    return res.data;
  },
};

// ─── constants ────────────────────────────────────────────────────────────────
const MODES = {
  FOCUS:       { label: "Focus",       minutes: 25, color: "#7C3AED", glow: "rgba(124,58,237,0.4)",  bg: "rgba(124,58,237,0.08)" },
  SHORT_BREAK: { label: "Short Break", minutes: 5,  color: "#10B981", glow: "rgba(16,185,129,0.4)",  bg: "rgba(16,185,129,0.08)" },
  LONG_BREAK:  { label: "Long Break",  minutes: 15, color: "#3B82F6", glow: "rgba(59,130,246,0.4)",  bg: "rgba(59,130,246,0.08)" },
};

const STATUS = { IDLE: "IDLE", RUNNING: "RUNNING", PAUSED: "PAUSED", DONE: "DONE" };

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
const fmtDate = (iso) => new Date(iso).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const typeColor = { FOCUS: "#7C3AED", SHORT_BREAK: "#10B981", LONG_BREAK: "#3B82F6" };
const statusColor = { COMPLETED: "#10B981", INTERRUPTED: "#EF4444", SKIPPED: "#F59E0B", ENDED: "#10B981", ACTIVE: "#7C3AED" };

// ─── Glassmorphism card ───────────────────────────────────────────────────────
function GlassCard({ children, className = "", style = {}, glow }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(26,24,38,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        boxShadow: glow
          ? `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.4)`
          : "0 8px 32px rgba(0,0,0,0.3)",
        transition: "box-shadow 0.4s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Circular SVG timer ───────────────────────────────────────────────────────
function CircularTimer({ seconds, total, color, glow, status, children }) {
  const R = 110;
  const C = 2 * Math.PI * R;
  const progress = total > 0 ? seconds / total : 1;
  const dash = C * progress;

  return (
    <div style={{ position: "relative", width: 280, height: 280, margin: "0 auto" }}>
      {/* ambient glow ring */}
      <div style={{
        position: "absolute", inset: -16,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        opacity: status === STATUS.RUNNING ? 0.6 : 0.2,
        transition: "opacity 0.5s",
        animation: status === STATUS.RUNNING ? "glowPulse 2.5s ease-in-out infinite" : "none",
        pointerEvents: "none",
      }} />

      <svg width="280" height="280" style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        {/* track */}
        <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* progress arc */}
        <circle
          cx="140" cy="140" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1), stroke 0.5s" }}
          filter={`drop-shadow(0 0 8px ${color})`}
        />
        {/* tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI;
          const inner = i % 5 === 0 ? 96 : 102;
          const outer = 108;
          return (
            <line
              key={i}
              x1={140 + inner * Math.cos(angle)} y1={140 + inner * Math.sin(angle)}
              x2={140 + outer * Math.cos(angle)} y2={140 + outer * Math.sin(angle)}
              stroke={i % 5 === 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}
      </svg>

      {/* center content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, delay = 0 }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShown(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <GlassCard style={{
      padding: "20px 22px",
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: color + "20",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginBottom: 4, fontWeight: 500 }}>{label.toUpperCase()}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#F0EBF8", lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{sub}</div>}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Mode pill ────────────────────────────────────────────────────────────────
function ModePill({ id, active, onClick }) {
  const m = MODES[id];
  return (
    <button onClick={() => onClick(id)} style={{
      padding: "8px 18px", borderRadius: 30,
      border: active ? `1.5px solid ${m.color}` : "1.5px solid rgba(255,255,255,0.1)",
      background: active ? m.bg : "transparent",
      color: active ? m.color : "rgba(255,255,255,0.45)",
      fontSize: 13, fontWeight: active ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
      boxShadow: active ? `0 0 16px ${m.glow}` : "none",
    }}>
      {m.label}
    </button>
  );
}

// ─── Timer button ─────────────────────────────────────────────────────────────
function TimerBtn({ onClick, color, glow, children, outline }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 28px", borderRadius: 14,
        border: outline ? `1.5px solid ${color}` : "none",
        background: outline ? "transparent" : `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: "#fff", fontSize: 14, fontWeight: 600,
        cursor: "pointer",
        boxShadow: hover ? `0 0 24px ${glow}` : outline ? "none" : `0 4px 16px ${glow}`,
        transform: hover ? "translateY(-2px) scale(1.03)" : "none",
        transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      {children}
    </button>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(26,24,38,0.95)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12, padding: "10px 16px",
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.value}{p.name === "Focus (min)" ? " min" : ""}
        </div>
      ))}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent || "#7C3AED" }} />
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#F0EBF8", margin: 0 }}>{children}</h2>
    </div>
  );
}

// ─── Inject keyframes ────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes glowPulse { 0%,100%{opacity:0.4;} 50%{opacity:0.75;} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  @keyframes spin { to{transform:rotate(360deg);} }
  @keyframes tickIn { from{opacity:0;transform:scale(0.8);} to{opacity:1;transform:scale(1);} }
`;
if (!document.getElementById("pp-kf")) {
  const s = document.createElement("style");
  s.id = "pp-kf"; s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductivityPage() {
  // ── pomodoro state ───────────────────────────────────────────────────────
  const [mode, setMode]           = useState("FOCUS");
  const [timerStatus, setStatus]  = useState(STATUS.IDLE);
  const [secondsLeft, setSeconds] = useState(MODES.FOCUS.minutes * 60);
  const [activePomId, setActivePomId] = useState(null);
  const [pomHistory, setPomHistory]   = useState([]);
  const intervalRef = useRef(null);
  const startEpoch  = useRef(null); // real wall-clock start for drift correction

  // ── study session state ──────────────────────────────────────────────────
  const [activeStudy,   setActiveStudy]   = useState(null);
  const [studyElapsed,  setStudyElapsed]  = useState(0); // seconds
  const [studyHistory,  setStudyHistory]  = useState([]);
  const [endNotes,      setEndNotes]      = useState("");
  const [endRating,     setEndRating]     = useState(0);
  const [showEndForm,   setShowEndForm]   = useState(false);
  const studyTimerRef = useRef(null);

  // ── stats & chart ────────────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  // ── UI ───────────────────────────────────────────────────────────────────
  const [toast, setToast]   = useState(null);
  const [loading, setLoading] = useState({});

  // ── total seconds for current mode ───────────────────────────────────────
  const totalSeconds = MODES[mode].minutes * 60;
  const currentMode  = MODES[mode];

  // ─── toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── load initial data ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [ph, sa, sh, st] = await Promise.all([
          api.pomodoroHistory(),
          api.activeStudy(),
          api.studyHistory(),
          api.dashStats(),
        ]);
        setPomHistory(Array.isArray(ph) ? ph.slice(0, 20) : []);
        if (sa && sa.id) {
          setActiveStudy(sa);
          const elapsed = Math.floor((Date.now() - new Date(sa.startTime).getTime()) / 1000);
          setStudyElapsed(elapsed);
          startStudyTimer(elapsed);
        }
        setStudyHistory(Array.isArray(sh) ? sh.slice(0, 20) : []);
        setStats(st);
      } catch (e) {
        showToast("Could not load data — check your connection", "error");
      }
    })();
    return () => { clearInterval(intervalRef.current); clearInterval(studyTimerRef.current); };
  }, []);

  // ─── pomodoro tick ────────────────────────────────────────────────────────
  const startTick = useCallback(() => {
    clearInterval(intervalRef.current);
    startEpoch.current = Date.now();
    const initialSeconds = secondsLeft; // capture at start

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startEpoch.current) / 1000);
      const remaining = initialSeconds - elapsed;
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setSeconds(0);
        setStatus(STATUS.DONE);
      } else {
        setSeconds(remaining);
      }
    }, 500);
  }, [secondsLeft]);

  // ─── mode change resets timer ─────────────────────────────────────────────
  const handleModeChange = (m) => {
    if (timerStatus === STATUS.RUNNING) return; // don't switch mid-session
    clearInterval(intervalRef.current);
    setMode(m);
    setSeconds(MODES[m].minutes * 60);
    setStatus(STATUS.IDLE);
    setActivePomId(null);
  };

  // ─── START pomodoro ───────────────────────────────────────────────────────
  const handleStart = async () => {
    setLoading(l => ({ ...l, pom: true }));
    try {
      const res = await api.startPomodoro({
        sessionType: mode,
        plannedDurationMinutes: MODES[mode].minutes,
      });
      setActivePomId(res.id);
      setStatus(STATUS.RUNNING);
      startEpoch.current = Date.now();
      startTick();
      showToast(`${currentMode.label} session started 🎯`);
    } catch {
      showToast("Failed to start session", "error");
    } finally {
      setLoading(l => ({ ...l, pom: false }));
    }
  };

  // ─── PAUSE / RESUME ───────────────────────────────────────────────────────
  const handlePause = () => {
    clearInterval(intervalRef.current);
    setStatus(STATUS.PAUSED);
  };

  const handleResume = () => {
    setStatus(STATUS.RUNNING);
    startEpoch.current = Date.now(); // reset epoch; secondsLeft already updated
    startTick();
  };

  // ─── COMPLETE / SKIP ──────────────────────────────────────────────────────
  const handleComplete = async (statusStr) => {
    if (!activePomId) return;
    clearInterval(intervalRef.current);
    setLoading(l => ({ ...l, pom: true }));
    const actual = Math.round((totalSeconds - secondsLeft) / 60) || 1;
    try {
      await api.completePomodoro(activePomId, { status: statusStr, actualDurationMinutes: actual });
      const ph = await api.pomodoroHistory();
      setPomHistory(Array.isArray(ph) ? ph.slice(0, 20) : []);
      const st = await api.dashStats();
      setStats(st);
      showToast(statusStr === "COMPLETED" ? "Pomodoro completed! 🎉" : "Session skipped");
    } catch {
      showToast("Failed to complete session", "error");
    } finally {
      setSeconds(MODES[mode].minutes * 60);
      setStatus(STATUS.IDLE);
      setActivePomId(null);
      setLoading(l => ({ ...l, pom: false }));
    }
  };

  // ─── study session ────────────────────────────────────────────────────────
  const startStudyTimer = (initialElapsed = 0) => {
    clearInterval(studyTimerRef.current);
    const epoch = Date.now() - initialElapsed * 1000;
    studyTimerRef.current = setInterval(() => {
      setStudyElapsed(Math.floor((Date.now() - epoch) / 1000));
    }, 1000);
  };

  const handleStartStudy = async () => {
    setLoading(l => ({ ...l, study: true }));
    try {
      const res = await api.startStudy({});
      setActiveStudy(res);
      setStudyElapsed(0);
      startStudyTimer(0);
      showToast("Study session started 📚");
    } catch {
      showToast("Failed to start study session", "error");
    } finally {
      setLoading(l => ({ ...l, study: false }));
    }
  };

  const handleEndStudy = async () => {
    if (!activeStudy) return;
    setLoading(l => ({ ...l, study: true }));
    try {
      await api.endStudy(activeStudy.id, { notes: endNotes, productivityRating: endRating || null });
      clearInterval(studyTimerRef.current);
      setActiveStudy(null); setStudyElapsed(0);
      setEndNotes(""); setEndRating(0); setShowEndForm(false);
      const [sh, st] = await Promise.all([api.studyHistory(), api.dashStats()]);
      setStudyHistory(Array.isArray(sh) ? sh.slice(0, 20) : []);
      setStats(st);
      showToast("Study session saved ✅");
    } catch {
      showToast("Failed to end session", "error");
    } finally {
      setLoading(l => ({ ...l, study: false }));
    }
  };

  // ─── productivity stats calculated from Pomodoro history ────────────────
  const completedPomodoros = pomHistory.filter(
    (p) => p.status === "COMPLETED" && p.sessionType === "FOCUS"
  );

  const todayDate = new Date().toDateString();

  const todayCompletedPomodoros = completedPomodoros.filter(
    (p) => new Date(p.startTime).toDateString() === todayDate
  );

  const todayFocusMinutes = todayCompletedPomodoros.reduce(
    (sum, p) => sum + (p.actualDurationMinutes || 0),
    0
  );

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weekCompletedPomodoros = completedPomodoros.filter(
    (p) => new Date(p.startTime) >= weekStart
  );

  const weekFocusMinutes = weekCompletedPomodoros.reduce(
    (sum, p) => sum + (p.actualDurationMinutes || 0),
    0
  );

  const currentStreakDays = todayCompletedPomodoros.length > 0 ? 1 : 0;
  const longestStreakDays = Math.max(currentStreakDays, stats?.longestStreakDays ?? 0);

  // ─── chart data calculated from Pomodoro history ─────────────────────────
  const chartData = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const dayPomodoros = completedPomodoros.filter(
      (p) => new Date(p.startTime).toDateString() === date.toDateString()
    );

    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      "Focus (min)": dayPomodoros.reduce(
        (sum, p) => sum + (p.actualDurationMinutes || 0),
        0
      ),
      Pomodoros: dayPomodoros.length,
    };
  });

  // ─── combined recent activity ─────────────────────────────────────────────
  const recentActivity = [
    ...pomHistory.slice(0, 10).map(p => ({
      key: `p-${p.id}`, kind: "Pomodoro",
      label: `${p.sessionType?.replace("_", " ")} · ${p.plannedDurationMinutes}min`,
      status: p.status, time: p.startTime,
      color: typeColor[p.sessionType] || "#7C3AED",
    })),
    ...studyHistory.slice(0, 5).map(s => ({
      key: `s-${s.id}`, kind: "Study",
      label: s.topicTitle ? `Topic: ${s.topicTitle}` : "General study",
      status: s.status, time: s.startTime,
      color: "#F59E0B",
      duration: s.durationMinutes,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F0E17 0%, #130E1F 50%, #0A0E1A 100%)",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#F0EBF8",
      padding: "32px 24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%",  width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)", animation: "glowPulse 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", animation: "glowPulse 10s ease-in-out 2s infinite" }} />
        <div style={{ position: "absolute", top: "55%", left: "40%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)", animation: "glowPulse 12s ease-in-out 4s infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 36, animation: "fadeUp 0.5s ease both" }}>
          <div style={{ fontSize: 11, color: "#7C3AED", letterSpacing: 2, fontWeight: 600, marginBottom: 6 }}>PRODUCTIVITY</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, #F0EBF8 30%, #A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Focus Studio
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "6px 0 0" }}>Track your deep work, build your streak.</p>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 32 }}>
          <StatCard icon="🎯" label="Today Focus"   value={fmtMin(todayFocusMinutes)} sub={`${todayCompletedPomodoros.length} pomodoros`}    color="#7C3AED" delay={80}  />
          <StatCard icon="📅" label="This Week"     value={fmtMin(weekFocusMinutes)}       sub={`${weekCompletedPomodoros.length} sessions`}     color="#3B82F6" delay={160} />
          <StatCard icon="🔥" label="Current Streak" value={`${currentStreakDays}d`}        sub={`Best: ${longestStreakDays} days`}                color="#F59E0B" delay={240} />
          <StatCard icon="⏱️" label="Study Timer"   value={activeStudy ? fmt(studyElapsed) : "—"}             sub={activeStudy ? "Session running" : "No active session"} color="#10B981" delay={320} />
        </div>

        {/* ── Main grid: Pomodoro + Study session ─────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 24, alignItems: "start" }}>

          {/* ── Pomodoro card ──────────────────────────────────────── */}
          <GlassCard glow={timerStatus === STATUS.RUNNING ? currentMode.glow : undefined} style={{ padding: "36px 32px", animation: "fadeUp 0.5s ease 0.1s both" }}>

            {/* mode tabs */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
              {Object.keys(MODES).map(m => (
                <ModePill key={m} id={m} active={mode === m} onClick={handleModeChange} />
              ))}
            </div>

            {/* circular timer */}
            <CircularTimer seconds={secondsLeft} total={totalSeconds} color={currentMode.color} glow={currentMode.glow} status={timerStatus}>
              <div style={{
                fontSize: 52, fontWeight: 800, letterSpacing: -2,
                color: "#F0EBF8",
                fontVariantNumeric: "tabular-nums",
                animation: timerStatus === STATUS.RUNNING && secondsLeft <= 10 ? "blink 0.8s ease infinite" : "none",
              }}>
                {fmt(secondsLeft)}
              </div>
              <div style={{ fontSize: 12, color: currentMode.color, fontWeight: 600, letterSpacing: 1 }}>
                {currentMode.label.toUpperCase()}
              </div>
              {timerStatus === STATUS.PAUSED && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>PAUSED</div>
              )}
              {timerStatus === STATUS.DONE && (
                <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, marginTop: 4, animation: "tickIn 0.4s ease" }}>DONE ✓</div>
              )}
            </CircularTimer>

            {/* control buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              {timerStatus === STATUS.IDLE && (
                <TimerBtn onClick={handleStart} color={currentMode.color} glow={currentMode.glow} disabled={loading.pom}>
                  {loading.pom ? "Starting…" : "▶ Start"}
                </TimerBtn>
              )}
              {timerStatus === STATUS.RUNNING && (
                <>
                  <TimerBtn onClick={handlePause} color={currentMode.color} glow={currentMode.glow} outline>
                    ⏸ Pause
                  </TimerBtn>
                  <TimerBtn onClick={() => handleComplete("COMPLETED")} color={currentMode.color} glow={currentMode.glow}>
                    ✓ Complete
                  </TimerBtn>
                  <TimerBtn onClick={() => handleComplete("INTERRUPTED")} color="#EF4444" glow="rgba(239,68,68,0.4)" outline>
                    ✕ Skip
                  </TimerBtn>
                </>
              )}
              {timerStatus === STATUS.PAUSED && (
                <>
                  <TimerBtn onClick={handleResume} color={currentMode.color} glow={currentMode.glow}>
                    ▶ Resume
                  </TimerBtn>
                  <TimerBtn onClick={() => handleComplete("INTERRUPTED")} color="#EF4444" glow="rgba(239,68,68,0.4)" outline>
                    ✕ Abandon
                  </TimerBtn>
                </>
              )}
              {timerStatus === STATUS.DONE && (
                <>
                  <TimerBtn onClick={() => handleComplete("COMPLETED")} color="#10B981" glow="rgba(16,185,129,0.4)">
                    ✓ Save & Next
                  </TimerBtn>
                  <TimerBtn onClick={() => { setStatus(STATUS.IDLE); setSeconds(totalSeconds); }} color="#9B93AF" glow="none" outline>
                    Reset
                  </TimerBtn>
                </>
              )}
            </div>

            {/* pomodoro mini progress */}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => {
                const done = pomHistory.filter(p => p.sessionType === "FOCUS" && p.status === "COMPLETED").length;
                const filled = i < (done % 4);
                return (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: filled ? currentMode.color : "rgba(255,255,255,0.1)",
                    boxShadow: filled ? `0 0 8px ${currentMode.color}` : "none",
                    transition: "all 0.3s",
                  }} />
                );
              })}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>
                {pomHistory.filter(p => p.sessionType === "FOCUS" && p.status === "COMPLETED").length % 4}/4 to long break
              </span>
            </div>
          </GlassCard>

          {/* ── Study session card ─────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GlassCard style={{ padding: "28px 24px", animation: "fadeUp 0.5s ease 0.15s both" }}>
              <SectionHeading accent="#F59E0B">Study Session</SectionHeading>

              {activeStudy ? (
                <>
                  {/* live timer */}
                  <div style={{
                    textAlign: "center", padding: "24px 0 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: 20,
                  }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1, marginBottom: 8 }}>ELAPSED TIME</div>
                    <div style={{ fontSize: 48, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "#F59E0B", letterSpacing: -1, textShadow: "0 0 24px rgba(245,158,11,0.4)" }}>
                      {fmt(studyElapsed)}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
                      Started {fmtDate(activeStudy.startTime)}
                    </div>
                    {activeStudy.topicTitle && (
                      <div style={{ marginTop: 10, display: "inline-block", background: "rgba(245,158,11,0.12)", color: "#F59E0B", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.3)" }}>
                        📂 {activeStudy.topicTitle}
                      </div>
                    )}
                  </div>

                  {/* end form */}
                  {showEndForm ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <textarea
                        value={endNotes}
                        onChange={e => setEndNotes(e.target.value)}
                        placeholder="What did you study? (optional)"
                        rows={3}
                        style={{
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12, padding: "10px 14px", color: "#F0EBF8", fontSize: 13,
                          resize: "none", outline: "none", fontFamily: "inherit",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Productivity rating</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1,2,3,4,5].map(n => (
                            <button key={n} onClick={() => setEndRating(n)} style={{
                              width: 36, height: 36, borderRadius: 10,
                              border: endRating >= n ? "1.5px solid #F59E0B" : "1.5px solid rgba(255,255,255,0.1)",
                              background: endRating >= n ? "rgba(245,158,11,0.15)" : "transparent",
                              color: endRating >= n ? "#F59E0B" : "rgba(255,255,255,0.3)",
                              cursor: "pointer", fontSize: 16,
                              transition: "all 0.2s",
                            }}>⭐</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button onClick={() => setShowEndForm(false)} style={{ flex: 1, padding: "10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>
                          Back
                        </button>
                        <button onClick={handleEndStudy} disabled={loading.study} style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          {loading.study ? "Saving…" : "End Session"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowEndForm(true)} style={{
                      width: "100%", padding: "12px", borderRadius: 14,
                      border: "1.5px solid rgba(245,158,11,0.4)",
                      background: "rgba(245,158,11,0.08)",
                      color: "#F59E0B", fontSize: 14, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.2s",
                    }}>
                      ■ End Session
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>No active study session</div>
                  <button onClick={handleStartStudy} disabled={loading.study} style={{
                    width: "100%", padding: "13px", borderRadius: 14,
                    border: "none", background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                    transition: "all 0.2s",
                  }}>
                    {loading.study ? "Starting…" : "▶ Start Studying"}
                  </button>
                </div>
              )}
            </GlassCard>

            {/* ── Topic time breakdown ─────────────────────────────── */}
            {stats?.timeByTopic?.length > 0 && (
              <GlassCard style={{ padding: "22px 24px", animation: "fadeUp 0.5s ease 0.2s both" }}>
                <SectionHeading accent="#3B82F6">Time by Topic</SectionHeading>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stats.timeByTopic.slice(0, 5).map((t, i) => {
                    const max = stats.timeByTopic[0]?.totalMinutes || 1;
                    const pct = Math.round((t.totalMinutes / max) * 100);
                    const colors = ["#7C3AED","#3B82F6","#10B981","#F59E0B","#EC4899"];
                    const c = colors[i % colors.length];
                    return (
                      <div key={t.topicId}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{t.topicTitle}</span>
                          <span style={{ color: c, fontWeight: 600 }}>{fmtMin(t.totalMinutes)}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: pct + "%", background: c, borderRadius: 3, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* ── Weekly chart ────────────────────────────────────────── */}
        <GlassCard style={{ padding: "28px 28px 20px", marginBottom: 24, animation: "fadeUp 0.5s ease 0.25s both" }}>
          <SectionHeading accent="#3B82F6">Weekly Overview</SectionHeading>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <Area type="monotone" dataKey="Focus (min)" stroke="#7C3AED" strokeWidth={2} fill="url(#focusGrad)" dot={{ fill: "#7C3AED", r: 3 }} activeDot={{ r: 5, fill: "#A78BFA" }} />
                <Area type="monotone" dataKey="Pomodoros"   stroke="#10B981" strokeWidth={2} fill="url(#pomGrad)"   dot={{ fill: "#10B981", r: 3 }} activeDot={{ r: 5, fill: "#34D399" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
              No data yet — complete your first session to see the chart
            </div>
          )}
        </GlassCard>

        {/* ── Recent activity ──────────────────────────────────────── */}
        <GlassCard style={{ padding: "28px", animation: "fadeUp 0.5s ease 0.3s both" }}>
          <SectionHeading accent="#EC4899">Recent Activity</SectionHeading>
          {recentActivity.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
              No activity yet — start a session above
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Type","Details","Status","Time","Duration"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "0 12px 12px", color: "rgba(255,255,255,0.3)", fontWeight: 500, fontSize: 11, letterSpacing: 0.8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((row, i) => (
                    <tr key={row.key} style={{ animation: `fadeUp 0.35s ease ${i * 0.04}s both` }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ background: row.color + "20", color: row.color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {row.kind}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "rgba(255,255,255,0.7)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{row.label}</td>
                      <td style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ background: (statusColor[row.status] || "#9B93AF") + "20", color: statusColor[row.status] || "#9B93AF", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "rgba(255,255,255,0.4)", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{fmtDate(row.time)}</td>
                      <td style={{ padding: "12px", color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {row.duration ? fmtMin(row.duration) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
          borderRadius: 16, padding: "14px 20px",
          backdropFilter: "blur(16px)",
          color: toast.type === "error" ? "#FCA5A5" : "#6EE7B7",
          fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.35s ease",
          maxWidth: 320,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
