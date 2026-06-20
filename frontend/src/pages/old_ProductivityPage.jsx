import { useEffect, useState } from "react";
import {
  startPomodoro,
  completePomodoro,
  getPomodoroHistory,
  startStudySession,
  endStudySession,
  getActiveStudySession,
  getStudySessionHistory,
} from "../services/productivityService";

export default function ProductivityPage() {
  const [pomodoro, setPomodoro] = useState(null);
  const [pomodoroHistory, setPomodoroHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const pomodoroRes = await getPomodoroHistory();
      const activeRes = await getActiveStudySession();
      const sessionRes = await getStudySessionHistory();

      setPomodoroHistory(pomodoroRes.data);
      setActiveSession(activeRes.data);
      setSessionHistory(sessionRes.data);
    } catch (error) {
      console.error("Failed to load productivity data", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartPomodoro = async () => {
    try {
      setLoading(true);
      const res = await startPomodoro({
        sessionType: "FOCUS",
        plannedDurationMinutes: 25,
      });
      setPomodoro(res.data);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start pomodoro");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePomodoro = async () => {
    if (!pomodoro?.id) return;

    try {
      setLoading(true);
      await completePomodoro(pomodoro.id, {
        status: "COMPLETED",
        actualDurationMinutes: 25,
      });
      setPomodoro(null);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to complete pomodoro");
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudySession = async () => {
    try {
      setLoading(true);
      const res = await startStudySession({});
      setActiveSession(res.data);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start study session");
    } finally {
      setLoading(false);
    }
  };

  const handleEndStudySession = async () => {
    if (!activeSession?.id) return;

    try {
      setLoading(true);
      await endStudySession(activeSession.id, {
        notes: "Frontend study session completed",
        productivityRating: 5,
      });
      setActiveSession(null);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to end study session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white space-y-6">
      <h1 className="text-3xl font-bold">Productivity</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Pomodoro Timer</h2>

          <div className="text-5xl font-bold mb-4">25:00</div>

          {!pomodoro ? (
            <button
              onClick={handleStartPomodoro}
              disabled={loading}
              className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Pomodoro
            </button>
          ) : (
            <button
              onClick={handleCompletePomodoro}
              disabled={loading}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Complete Pomodoro
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Study Session</h2>

          <p className="mb-4">
            Status:{" "}
            <span className="font-semibold">
              {activeSession ? "ACTIVE" : "NOT STARTED"}
            </span>
          </p>

          {!activeSession ? (
            <button
              onClick={handleStartStudySession}
              disabled={loading}
              className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Start Study Session
            </button>
          ) : (
            <button
              onClick={handleEndStudySession}
              disabled={loading}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
            >
              End Study Session
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Pomodoros</h2>
        <p>Total: {pomodoroHistory.length}</p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Study Session History</h2>
        <p>Total: {sessionHistory.length}</p>
      </div>
    </div>
  );
}