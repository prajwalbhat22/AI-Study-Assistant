import { NavLink } from "react-router-dom";
import {
  RiDashboardLine,
  RiBookOpenLine,
  RiFileTextLine,
  RiFolderLine,
  RiSettings3Line,
  RiUserLine,
  RiSparklingLine,
  RiRobot2Line,
  RiTimerFlashLine,
} from "react-icons/ri";

const NAV_ITEMS = [
  { icon: RiDashboardLine,  label: "Dashboard",    path: "/dashboard" },
  { icon: RiFolderLine,     label: "Topics",       path: "/topics" },
  { icon: RiFileTextLine,   label: "Notes",        path: "/notes" },
  { icon: RiBookOpenLine,   label: "Materials",    path: "/materials" },
  { icon: RiRobot2Line,     label: "AI Assistant", path: "/ai" },
  { icon: RiTimerFlashLine, label: "Productivity", path: "/productivity" },
  { icon: RiUserLine,       label: "Profile",      path: "/profile" },
];

const BOTTOM_ITEMS = [
  { icon: RiSettings3Line, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside
      className="
        hidden md:flex flex-col
        w-64 shrink-0 h-screen sticky top-0
        border-r border-border
        px-3 py-5 gap-6
        animate-fade-in
      "
      style={{
        background: "linear-gradient(180deg, #13151E 0%, #0F1117 100%)",
      }}
    >
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 mb-2 group cursor-default">
        {/* Icon container */}
        <div className="relative shrink-0">
          {/* Main icon button */}
          <span
            className="
              w-10 h-10 rounded-xl
              flex items-center justify-center
              animate-pulse-glow
              transition-transform duration-300 group-hover:scale-110
            "
            style={{
              background: "linear-gradient(135deg, #6C63FF 0%, #9B5DE5 100%)",
              boxShadow: "0 0 20px 6px #6C63FF44",
            }}
          >
            <RiSparklingLine className="text-white text-lg" />
          </span>

          {/* Rotating dashed ring */}
          <span
            className="
              absolute -inset-1.5 rounded-xl border border-accent/25
              animate-spin-slow pointer-events-none
            "
            style={{ borderStyle: "dashed" }}
          />

          {/* Tiny glow dot bottom-right */}
          <span
            className="
              absolute -bottom-0.5 -right-0.5
              w-2.5 h-2.5 rounded-full bg-success
              border-2 border-ink
              glow-success
            "
          />
        </div>

        {/* Brand text */}
        <div className="flex flex-col">
          {/* "StuddyBuddy" — large bold display */}
          <p
            className="font-display font-700 text-text1 leading-tight tracking-tight"
            style={{
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #F0F0F5 0%, #C8C5FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            StuddyBuddy
          </p>

          {/* "AI Study Assistant" — small subtitle */}
          <p
            className="text-[10px] leading-tight tracking-widest uppercase"
            style={{ color: "#6C63FF", opacity: 0.8 }}
          >
            AI Study Assistant
          </p>
        </div>
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="eyebrow px-3 mb-2">Workspace</p>

        {NAV_ITEMS.map(({ icon: Icon, label, path }, idx) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `nav-link group animate-fade-up ${isActive ? "active" : ""}`
            }
            style={{ animationDelay: `${idx * 50 + 80}ms` }}
          >
            {({ isActive }) => (
              <>
                {/* Icon badge */}
                <span
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                    transition-all duration-200
                    ${isActive
                      ? "bg-accent/20 text-accent shadow-[0_0_10px_#6C63FF33]"
                      : "text-text2 group-hover:text-text1 group-hover:bg-surface"
                    }
                  `}
                >
                  <Icon className="text-base" />
                </span>

                <span className="transition-colors duration-150">{label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse-glow shrink-0"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom ────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 border-t border-border pt-4">
        {BOTTOM_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) =>
              `nav-link group ${isActive ? "active" : ""}`
            }
          >
            <span
              className="
                w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                text-text2 group-hover:text-text1 group-hover:bg-surface
                transition-all duration-200
              "
            >
              <Icon className="text-base" />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}

        {/* User chip */}
        <div
          className="
            flex items-center gap-3 mt-3 px-3 py-2.5
            rounded-xl border border-border/60
            transition-all duration-250
            hover:border-accent/30 hover:shadow-[0_0_16px_#6C63FF18]
            cursor-default
          "
          style={{ background: "rgba(22,24,31,0.75)" }}
        >
          {/* Avatar */}
          <div
            className="
              w-7 h-7 rounded-lg
              flex items-center justify-center shrink-0
              transition-transform duration-200 hover:scale-105
            "
            style={{
              background: "linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(155,93,229,0.15) 100%)",
            }}
          >
            <RiUserLine className="text-accent text-sm" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-text1 text-xs font-medium truncate">Student</p>
            <p className="text-text2 text-[10px] truncate">student@email.com</p>
          </div>

          {/* Online dot */}
          <span className="w-2 h-2 rounded-full bg-success shrink-0 glow-success" />
        </div>
      </div>
    </aside>
  );
}