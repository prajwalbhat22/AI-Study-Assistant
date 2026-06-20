import { useState, useEffect, useCallback } from 'react';
import { generateFlashcards } from '../../services/aiService';

// ── Flip card styles injected once ───────────────────────────────────────────
const FLIP_STYLE = `
  .fc-scene { perspective: 1200px; }
  .fc-card  { position: relative; width: 100%; transform-style: preserve-3d; transition: transform 0.55s cubic-bezier(.4,0,.2,1); }
  .fc-card.flipped { transform: rotateY(180deg); }
  .fc-face  { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .fc-back  { transform: rotateY(180deg); }
`;

export default function FlashcardsPanel() {
  // ── Form state ──────────────────────────────────────────────────────────
  const [content,  setContent]  = useState('');

  // ── Deck state ──────────────────────────────────────────────────────────
  const [cards,    setCards]    = useState([]);          // FlashcardResponse[]
  const [index,    setIndex]    = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [revealed, setRevealed] = useState(new Set());   // indices seen

  // ── UI state ────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // ── Keyboard navigation ─────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (index < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 180);
    }
  }, [index, cards.length]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setTimeout(() => setIndex(i => i - 1), 180);
    }
  }, [index]);

  const flipCard = useCallback(() => {
    setFlipped(f => !f);
    setRevealed(r => new Set(r).add(index));
  }, [index]);

  useEffect(() => {
    const handler = (e) => {
      if (!cards.length) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === ' ')          { e.preventDefault(); flipCard(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cards.length, goNext, goPrev, flipCard]);

  // ── Generate handler ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!content.trim()) {
      setError('Please paste some notes or content first.');
      return;
    }
    setError('');
    setLoading(true);
    setCards([]);
    setIndex(0);
    setFlipped(false);
    setRevealed(new Set());

    try {
      const data = await generateFlashcards(content.trim());
      setCards(data.flashcards || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to generate flashcards. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCards([]);
    setIndex(0);
    setFlipped(false);
    setRevealed(new Set());
    setError('');
  };

  // ── Derived ─────────────────────────────────────────────────────────────
  const current    = cards[index];
  const progress   = cards.length ? Math.round((revealed.size / cards.length) * 100) : 0;
  const allRevealed = revealed.size === cards.length && cards.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      <style>{FLIP_STYLE}</style>

      {/* ── Input form ── */}
      {!cards.length && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-300 tracking-wide">
              Study Content
            </label>
            <textarea
              rows={7}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste your notes, definitions, or study material here to generate flashcards…"
              className="
                w-full resize-none rounded-xl border border-white/10
                bg-white/5 px-4 py-3 text-sm text-slate-200
                placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-violet-500/50
                transition-all duration-200
              "
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="
              rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white
              shadow-lg shadow-violet-900/40 hover:bg-violet-500
              active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Generating Flashcards…
              </span>
            ) : (
              '✦ Generate Flashcards'
            )}
          </button>
        </div>
      )}

      {/* ── Deck ── */}
      {cards.length > 0 && current && (
        <div className="flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-200">
                {cards.length} Flashcards
              </span>
              {allRevealed && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  ✓ All reviewed
                </span>
              )}
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              ← New Deck
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{revealed.size} of {cards.length} cards revealed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Flip card */}
          <div className="fc-scene" style={{ height: '280px' }}>
            <div
              className={`fc-card cursor-pointer select-none ${flipped ? 'flipped' : ''}`}
              style={{ height: '280px' }}
              onClick={flipCard}
            >
              {/* Front — Question */}
              <div className="fc-face fc-front rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/40 via-slate-900/60 to-slate-900/80 backdrop-blur-sm flex flex-col">
                <CardFace
                  label="Question"
                  labelColor="text-violet-400"
                  text={current.question}
                  hint="Click to reveal answer"
                  icon="?"
                  iconBg="bg-violet-500/20 text-violet-300"
                />
              </div>

              {/* Back — Answer */}
              <div className="fc-face fc-back rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-800/30 via-indigo-900/40 to-slate-900/80 backdrop-blur-sm flex flex-col">
                <CardFace
                  label="Answer"
                  labelColor="text-emerald-400"
                  text={current.answer}
                  hint="Click to see question"
                  icon="✓"
                  iconBg="bg-emerald-500/20 text-emerald-300"
                />
              </div>
            </div>
          </div>

          {/* Card counter */}
          <div className="flex items-center justify-center gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFlipped(false); setTimeout(() => setIndex(i), 180); }}
                className={`
                  h-1.5 rounded-full transition-all duration-200
                  ${i === index
                    ? 'w-6 bg-violet-500'
                    : revealed.has(i)
                      ? 'w-1.5 bg-violet-700/60'
                      : 'w-1.5 bg-white/15'
                  }
                `}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <NavButton onClick={goPrev} disabled={index === 0} label="← Previous" />

            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-slate-300">
                {index + 1} <span className="text-slate-500">/</span> {cards.length}
              </span>
              <span className="text-[10px] text-slate-600 tracking-wide">
                ← → keys or Space to flip
              </span>
            </div>

            <NavButton
              onClick={goNext}
              disabled={index === cards.length - 1}
              label="Next →"
              primary
            />
          </div>

          {/* Flip hint button */}
          <button
            onClick={flipCard}
            className="
              w-full rounded-xl border border-white/10 bg-white/5
              py-2.5 text-sm text-slate-400 hover:bg-white/10 hover:text-slate-200
              transition-all duration-200
            "
          >
            {flipped ? '↩ Show Question' : '↩ Reveal Answer'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CardFace({ label, labelColor, text, hint, icon, iconBg }) {
  return (
    <div className="flex flex-col h-full p-6">
      {/* Label row */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-bold uppercase tracking-widest ${labelColor}`}>
          {label}
        </span>
        <span className={`rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold ${iconBg}`}>
          {icon}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 flex items-center justify-center">
        <p className="text-center text-slate-200 text-sm leading-relaxed font-medium">
          {text}
        </p>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-slate-600 mt-4">{hint}</p>
    </div>
  );
}

function NavButton({ onClick, disabled, label, primary = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 rounded-xl py-2.5 text-sm font-semibold
        transition-all duration-200 active:scale-[0.97]
        disabled:opacity-30 disabled:cursor-not-allowed
        ${primary
          ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-900/30'
          : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
        }
      `}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}