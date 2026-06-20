import { useState } from 'react';
import { generateQuiz } from '../../services/aiService';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const QUESTION_COUNTS = [3, 5, 7, 10];

const difficultyMeta = {
  easy:   { label: 'Easy',   color: 'text-emerald-400', ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10' },
  medium: { label: 'Medium', color: 'text-amber-400',   ring: 'ring-amber-500/40',   bg: 'bg-amber-500/10'   },
  hard:   { label: 'Hard',   color: 'text-rose-400',    ring: 'ring-rose-500/40',    bg: 'bg-rose-500/10'    },
};

export default function QuizPanel() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [content,    setContent]    = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQ,       setNumQ]       = useState(5);

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [quiz,       setQuiz]       = useState(null);   // QuizResponse
  const [selected,   setSelected]   = useState({});     // { [qIndex]: optionStr }
  const [submitted,  setSubmitted]  = useState(false);
  const [score,      setScore]      = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please paste some notes or content before generating a quiz.');
      return;
    }
    setError('');
    setLoading(true);
    setQuiz(null);
    setSelected({});
    setSubmitted(false);
    setScore(null);

    try {
      const data = await generateQuiz(content, difficulty, numQ);
      setQuiz(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to generate quiz. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIdx, option) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selected[idx] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const handleReset = () => {
    setQuiz(null);
    setSelected({});
    setSubmitted(false);
    setScore(null);
    setError('');
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const allAnswered = quiz && Object.keys(selected).length === quiz.questions.length;
  const meta        = difficultyMeta[difficulty];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Input form ── */}
      {!quiz && (
        <div className="flex flex-col gap-5">

          {/* Notes textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300 tracking-wide">
              Study Content
            </label>
            <textarea
              rows={7}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your notes, textbook content, or any study material here…"
              className="
                w-full resize-none rounded-xl border border-white/10
                bg-white/5 px-4 py-3 text-sm text-slate-200
                placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-violet-500/50
                transition-all duration-200
              "
            />
          </div>

          {/* Difficulty + Count row */}
          <div className="grid grid-cols-2 gap-4">

            {/* Difficulty */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 tracking-wide">
                Difficulty
              </label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => {
                  const m   = difficultyMeta[d];
                  const sel = difficulty === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`
                        flex-1 rounded-lg py-2 text-xs font-semibold capitalize
                        ring-1 transition-all duration-200
                        ${sel
                          ? `${m.bg} ${m.color} ${m.ring}`
                          : 'bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of questions */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300 tracking-wide">
                Questions
              </label>
              <select
                value={numQ}
                onChange={e => setNumQ(Number(e.target.value))}
                className="
                  rounded-lg border border-white/10 bg-white/5
                  px-3 py-2 text-sm text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50
                  transition-all duration-200 cursor-pointer
                "
              >
                {QUESTION_COUNTS.map(n => (
                  <option key={n} value={n} className="bg-slate-900">
                    {n} questions
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="
              relative overflow-hidden rounded-xl bg-violet-600 px-6 py-3
              text-sm font-semibold text-white shadow-lg shadow-violet-900/40
              hover:bg-violet-500 active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Generating Quiz…
              </span>
            ) : (
              '✦ Generate Quiz'
            )}
          </button>
        </div>
      )}

      {/* ── Quiz cards ── */}
      {quiz && (
        <div className="flex flex-col gap-6">

          {/* Header bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-slate-200">
                {quiz.totalQuestions} Questions
              </span>
              <span className={`
                rounded-full px-3 py-0.5 text-xs font-semibold capitalize
                ${difficultyMeta[quiz.difficulty]?.bg}
                ${difficultyMeta[quiz.difficulty]?.color}
              `}>
                {quiz.difficulty}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← New Quiz
            </button>
          </div>

          {/* Score banner */}
          {submitted && score !== null && (
            <ScoreBanner score={score} total={quiz.totalQuestions} />
          )}

          {/* Question cards */}
          <div className="flex flex-col gap-4">
            {quiz.questions.map((q, qIdx) => (
              <QuestionCard
                key={qIdx}
                question={q}
                index={qIdx}
                selected={selected[qIdx]}
                submitted={submitted}
                onSelect={opt => handleSelect(qIdx, opt)}
              />
            ))}
          </div>

          {/* Submit / Done */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="
                rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white
                shadow-lg shadow-violet-900/40 hover:bg-violet-500
                active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {allAnswered
                ? `Submit Quiz (${Object.keys(selected).length}/${quiz.totalQuestions} answered)`
                : `Answer all questions to submit (${Object.keys(selected).length}/${quiz.totalQuestions})`
              }
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="
                rounded-xl border border-white/10 bg-white/5 px-6 py-3
                text-sm font-semibold text-slate-300 hover:bg-white/10
                transition-all duration-200
              "
            >
              ← Try Another Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBanner({ score, total }) {
  const pct      = Math.round((score / total) * 100);
  const perfect  = score === total;
  const good     = pct >= 70;

  return (
    <div className={`
      rounded-2xl border px-6 py-5 text-center
      ${perfect
        ? 'border-emerald-500/30 bg-emerald-500/10'
        : good
          ? 'border-violet-500/30 bg-violet-500/10'
          : 'border-amber-500/30 bg-amber-500/10'
      }
    `}>
      <div className={`text-4xl font-bold mb-1
        ${perfect ? 'text-emerald-400' : good ? 'text-violet-400' : 'text-amber-400'}
      `}>
        {score} / {total}
      </div>
      <div className="text-sm text-slate-400">
        {pct}% correct —{' '}
        {perfect
          ? '🎉 Perfect score!'
          : good
            ? '✦ Great job! Review the explanations below.'
            : '📖 Keep studying — explanations below will help.'
        }
      </div>
    </div>
  );
}

function QuestionCard({ question, index, selected, submitted, onSelect }) {
  const isCorrect = submitted && selected === question.correctAnswer;
  const isWrong   = submitted && selected && selected !== question.correctAnswer;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col gap-4">

      {/* Question text */}
      <p className="text-sm font-medium text-slate-200 leading-relaxed">
        <span className="text-violet-400 font-bold mr-2">Q{index + 1}.</span>
        {question.question}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, oIdx) => {
          const isSelected  = selected === opt;
          const isAnswer    = question.correctAnswer === opt;

          let optClass = 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20';

          if (submitted) {
            if (isAnswer) {
              optClass = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300';
            } else if (isSelected && !isAnswer) {
              optClass = 'border-rose-500/50 bg-rose-500/15 text-rose-300';
            } else {
              optClass = 'border-white/5 bg-white/[0.02] text-slate-500';
            }
          } else if (isSelected) {
            optClass = 'border-violet-500/60 bg-violet-500/15 text-violet-300';
          }

          const labels = ['A', 'B', 'C', 'D'];

          return (
            <button
              key={oIdx}
              onClick={() => onSelect(opt)}
              disabled={submitted}
              className={`
                flex items-start gap-3 rounded-xl border px-4 py-3
                text-left text-sm transition-all duration-150
                disabled:cursor-default
                ${optClass}
              `}
            >
              <span className="shrink-0 font-semibold text-xs mt-0.5 opacity-60">
                {labels[oIdx]}
              </span>
              <span className="leading-relaxed">{opt}</span>
              {submitted && isAnswer && (
                <span className="ml-auto shrink-0 text-emerald-400">✓</span>
              )}
              {submitted && isSelected && !isAnswer && (
                <span className="ml-auto shrink-0 text-rose-400">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after submit) */}
      {submitted && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-xs font-semibold text-violet-400 mb-1 uppercase tracking-wider">
            Explanation
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}