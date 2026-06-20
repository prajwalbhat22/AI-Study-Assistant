/**
 * AIAssistantPage.jsx
 */

import { useState } from "react";
import {
  FaRobot,
  FaMagic,
  FaListUl,
  FaBolt,
  FaCalendarAlt,
  FaComments,
  FaCopy,
  FaCheck,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";
import { generateSummary } from "../services/aiService";
import QuizPanel from "../components/ai/QuizPanel";
import FlashcardsPanel from "../components/ai/FlashcardsPanel";
import ExplainPanel from "../components/ai/ExplainPanel";
import StudyPlanPanel from "../components/ai/StudyPlanPanel";
import ChatPanel from "../components/ai/ChatPanel";

const TABS = [
  { id: "summary", label: "Summarise", icon: FaFileAlt, ready: true },
  { id: "quiz", label: "Quiz", icon: FaBolt, ready: true },
  { id: "flashcards", label: "Flashcards", icon: FaListUl, ready: true },
  { id: "explain", label: "Explain", icon: FaMagic, ready: true },
  { id: "studyplan", label: "Study Plan", icon: FaCalendarAlt, ready: true },
  { id: "chat", label: "Chat", icon: FaComments, ready: true },
];

const TONES = [
  { value: "concise", label: "Concise — Quick overview" },
  { value: "detailed", label: "Detailed — In-depth summary" },
  { value: "bullet-points", label: "Bullet Points — Key facts only" },
];

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("summary");
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("concise");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim() || content.trim().length < 20) {
      setError("Please enter at least 20 characters of study content.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateSummary(content.trim(), tone);
      setResult(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Something went wrong. Check your connection and try again.";

      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.summary) return;

    navigator.clipboard.writeText(result.summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    setContent("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <FaRobot className="text-white text-lg" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              AI Study Assistant
            </h1>
            <p className="text-sm text-gray-400">
              Powered by AI · Results in seconds
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(({ id, label, icon: Icon, ready }) => (
          <button
            key={id}
            onClick={() => ready && setActiveTab(id)}
            title={!ready ? "Coming soon" : label}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              whitespace-nowrap transition-all duration-200 border
              ${
                activeTab === id
                  ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white border-purple-500 shadow-lg shadow-purple-900/30"
                  : ready
                  ? "bg-gray-800/60 text-gray-300 border-gray-700/50 hover:bg-gray-700/60 hover:text-white hover:border-gray-600"
                  : "bg-gray-900/40 text-gray-600 border-gray-800/40 cursor-not-allowed"
              }
            `}
          >
            <Icon className="text-xs flex-shrink-0" />
            {label}

            {!ready && (
              <span className="ml-1 text-[10px] bg-gray-700/80 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-600/40">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "summary" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="backdrop-blur-sm bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 shadow-xl shadow-black/20">
            <h2 className="text-base font-semibold text-white mb-1">
              Study Content
            </h2>

            <p className="text-xs text-gray-500 mb-4">
              Paste your notes or type the material you want summarised.
            </p>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study notes here..."
              rows={10}
              className="w-full bg-gray-900/70 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-200 text-sm placeholder-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 leading-relaxed"
            />

            <div className="flex justify-between items-center mt-2 mb-5">
              <span
                className={`text-xs ${
                  content.length < 20 && content.length > 0
                    ? "text-amber-400"
                    : "text-gray-600"
                }`}
              >
                {content.trim().length < 20 && content.trim().length > 0
                  ? `${20 - content.trim().length} more characters needed`
                  : `${content.trim().split(/\s+/).filter(Boolean).length} words`}
              </span>

              {content && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-150"
                >
                  Clear
                </button>
              )}
            </div>

            <label className="block mb-1.5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Summary Style
              </span>
            </label>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-gray-900/70 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-200 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 appearance-none cursor-pointer"
            >
              {TONES.map((t) => (
                <option key={t.value} value={t.value} className="bg-gray-900">
                  {t.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              disabled={loading || content.trim().length < 20}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide
                transition-all duration-200 flex items-center justify-center gap-2
                ${
                  loading || content.trim().length < 20
                    ? "bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-700/30"
                    : "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:from-violet-500 hover:to-purple-600 active:scale-[0.98]"
                }
              `}
            >
              {loading ? "Generating summary…" : "Generate Summary"}
            </button>
          </div>

          <div className="backdrop-blur-sm bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 shadow-xl shadow-black/20 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Result</h2>

              {result && (
                <button
                  onClick={handleCopy}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    border transition-all duration-200
                    ${
                      copied
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-gray-700/50 text-gray-400 border-gray-600/40 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                >
                  {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>

            {error && (
              <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl mb-4">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gray-700/40 border border-gray-700/50 flex items-center justify-center mb-4">
                  <FaRobot className="text-2xl text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  No summary yet
                </p>
                <p className="text-gray-600 text-xs max-w-[220px] leading-relaxed">
                  Paste your notes on the left and hit Generate Summary to see the result here.
                </p>
              </div>
            )}

            {result && !loading && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <StatBadge label="Original" value={`${result.originalWordCount} w`} color="blue" />
                  <StatBadge label="Summary" value={`${result.summaryWordCount} w`} color="purple" />
                  <StatBadge label="Style" value={labelForTone(result.tone)} color="violet" />
                </div>

                <div className="flex-1 bg-gray-900/60 border border-gray-700/40 rounded-xl p-4 overflow-y-auto">
                  <pre className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {result.summary}
                  </pre>
                </div>

                <p className="text-xs text-gray-600 text-right">
                  Generated at {result.generatedAt}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "quiz" && <QuizPanel />}
      {activeTab === "flashcards" && <FlashcardsPanel />}
      {activeTab === "explain" && <ExplainPanel />}
      {activeTab === "studyplan" && <StudyPlanPanel />}
      {activeTab === "chat" && <ChatPanel />}


      {activeTab !== "summary" &&
      activeTab !== "quiz" &&
      activeTab !== "flashcards" &&
      activeTab !== "explain" &&
      activeTab !== "studyplan" &&
      activeTab !== "chat" && (
          <div className="mt-6 backdrop-blur-sm bg-gray-800/30 border border-dashed border-gray-700/50 rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🚧</div>
            <p className="text-gray-400 font-medium">
              {TABS.find((t) => t.id === activeTab)?.label} is coming in the next step.
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Switch to <span className="text-purple-400">Summarise</span> to try the live feature.
            </p>
          </div>
        )}
    </div>
  );
}

function StatBadge({ label, value, color }) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  };

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-center ${colors[color]}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function labelForTone(tone) {
  return (
    {
      concise: "Concise",
      detailed: "Detailed",
      "bullet-points": "Bullets",
    }[tone] ?? tone
  );
}