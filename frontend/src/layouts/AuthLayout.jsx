// src/layouts/AuthLayout.jsx

import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Sparkles, BrainCircuit, FileText } from "lucide-react";

const features = [
  { icon: BrainCircuit, label: "AI-powered explanations" },
  { icon: FileText, label: "Smart notes & topics" },
  { icon: Sparkles, label: "Personalized study plans" },
  { icon: BookOpen, label: "Upload & query materials" },
];

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-gray-900 via-gray-950 to-violet-950 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">StudyAI</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your intelligent<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              study companion
            </span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Upload materials, take notes, and let AI explain complex concepts — all in one focused workspace.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 pt-2">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-gray-300 text-sm">
                <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <p className="relative z-10 text-gray-600 text-xs">
          "The secret of getting ahead is getting started."
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 lg:px-16 bg-gray-950">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BrainCircuit className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">StudyAI</span>
        </div>

        {/* Page-specific form rendered here */}
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}