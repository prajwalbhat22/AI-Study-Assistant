import { useState } from 'react';
import { generateStudyPlan } from '../../services/aiService';

const PHASE_META = {
  Foundation: { color: '#60a5fa', icon: '🌱', bg: 'rgba(96,165,250,0.10)' },
  Core:       { color: '#a78bfa', icon: '⚡', bg: 'rgba(167,139,250,0.10)' },
  'Hands-On': { color: '#34d399', icon: '🛠️', bg: 'rgba(52,211,153,0.10)' },
  Final:      { color: '#fbbf24', icon: '🏆', bg: 'rgba(251,191,36,0.10)'  },
  Review:     { color: '#f87171', icon: '🔄', bg: 'rgba(248,113,113,0.10)' },
};

function getPhase(title) {
  if (title.startsWith('Foundation'))  return PHASE_META['Foundation'];
  if (title.startsWith('Core'))        return PHASE_META['Core'];
  if (title.startsWith('Hands-On'))    return PHASE_META['Hands-On'];
  if (title.startsWith('Final'))       return PHASE_META['Final'];
  return PHASE_META['Review'];
}

export default function StudyPlanPanel() {
  const [topic, setTopic]           = useState('');
  const [days, setDays]             = useState('');
  const [hours, setHours]           = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [expandedDay, setExpandedDay] = useState(null);
  const [copied, setCopied]         = useState(false);

  const validate = () => {
    const errs = {};
    if (!topic.trim())               errs.topic = 'Topic is required';
    if (!days || days < 1 || days > 30)   errs.days  = 'Enter a number between 1 and 30';
    if (!hours || hours < 1 || hours > 12) errs.hours = 'Enter a number between 1 and 12';
    return errs;
  };

  const handleGenerate = async () => {
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    setResult(null);
    setExpandedDay(null);
    try {
      const data = await generateStudyPlan(topic.trim(), Number(days), Number(hours));
      setResult(data);
      setExpandedDay(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const text = result.plan.map(day =>
      `Day ${day.dayNumber}: ${day.title}\n` +
      day.tasks.map(t => `  • ${t}`).join('\n')
    ).join('\n\n');
    await navigator.clipboard.writeText(
      `Study Plan: ${result.topic}\n${result.totalDays} days × ${result.hoursPerDay} hrs/day\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalHours = result ? result.totalDays * result.hoursPerDay : 0;

  return (
    <div style={s.container}>

      {/* ── Input Card ── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <span style={{ fontSize: 32 }}>🗓️</span>
          <div>
            <h2 style={s.cardTitle}>AI Study Planner</h2>
            <p style={s.cardSub}>Generate a personalised day-by-day study schedule</p>
          </div>
        </div>

        {/* Topic */}
        <div style={s.field}>
          <label style={s.label}>Topic</label>
          <input
            value={topic}
            onChange={e => { setTopic(e.target.value); setFieldErrors(p => ({ ...p, topic: '' })); }}
            placeholder="e.g. Machine Learning, JavaScript, Data Structures…"
            style={{ ...s.input, ...(fieldErrors.topic ? s.inputErr : {}) }}
          />
          {fieldErrors.topic && <span style={s.errText}>{fieldErrors.topic}</span>}
        </div>

        {/* Days + Hours row */}
        <div style={s.twoCol}>
          <div style={s.field}>
            <label style={s.label}>Days Available</label>
            <div style={s.inputWrap}>
              <input
                type="number" min="1" max="30"
                value={days}
                onChange={e => { setDays(e.target.value); setFieldErrors(p => ({ ...p, days: '' })); }}
                placeholder="e.g. 7"
                style={{ ...s.input, ...(fieldErrors.days ? s.inputErr : {}) }}
              />
              <span style={s.inputUnit}>days</span>
            </div>
            {fieldErrors.days && <span style={s.errText}>{fieldErrors.days}</span>}
          </div>
          <div style={s.field}>
            <label style={s.label}>Hours Per Day</label>
            <div style={s.inputWrap}>
              <input
                type="number" min="1" max="12"
                value={hours}
                onChange={e => { setHours(e.target.value); setFieldErrors(p => ({ ...p, hours: '' })); }}
                placeholder="e.g. 2"
                style={{ ...s.input, ...(fieldErrors.hours ? s.inputErr : {}) }}
              />
              <span style={s.inputUnit}>hrs</span>
            </div>
            {fieldErrors.hours && <span style={s.errText}>{fieldErrors.hours}</span>}
          </div>
        </div>

        {/* Quick presets */}
        <div style={s.presets}>
          <span style={s.presetLabel}>Quick presets:</span>
          {[
            { label: 'Weekend Sprint', days: 2, hours: 4 },
            { label: '1-Week Plan',    days: 7, hours: 2 },
            { label: '2-Week Deep',    days: 14, hours: 3 },
            { label: '30-Day Master',  days: 30, hours: 2 },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => { setDays(p.days); setHours(p.hours); setFieldErrors({}); }}
              style={s.presetBtn}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ ...s.genBtn, ...(loading ? s.genBtnDis : {}) }}
        >
          {loading
            ? <span style={s.loadRow}><span style={s.spinner} />Building your plan…</span>
            : '✨ Generate Study Plan'}
        </button>

        {error && (
          <div style={s.errBanner}><span>⚠️</span>{error}</div>
        )}
      </div>

      {/* ── Result ── */}
      {result && (
        <div style={s.resultWrap}>

          {/* Summary bar */}
          <div style={s.summaryBar}>
            <div style={s.summaryItem}>
              <span style={s.summaryVal}>{result.totalDays}</span>
              <span style={s.summaryKey}>Total Days</span>
            </div>
            <div style={s.summaryDivider} />
            <div style={s.summaryItem}>
              <span style={s.summaryVal}>{result.hoursPerDay}h</span>
              <span style={s.summaryKey}>Per Day</span>
            </div>
            <div style={s.summaryDivider} />
            <div style={s.summaryItem}>
              <span style={s.summaryVal}>{totalHours}h</span>
              <span style={s.summaryKey}>Total Hours</span>
            </div>
            <div style={s.summaryDivider} />
            <div style={s.summaryItem}>
              <span style={{ ...s.summaryVal, fontSize: 14, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.topic}</span>
              <span style={s.summaryKey}>Topic</span>
            </div>
            <button
              onClick={handleCopyAll}
              style={{ ...s.copyBtn, ...(copied ? s.copyBtnOk : {}) }}
            >
              {copied ? '✅ Copied!' : '📋 Copy All'}
            </button>
          </div>

          {/* Phase legend */}
          <div style={s.legend}>
            {Object.entries(PHASE_META).map(([k, v]) => (
              <span key={k} style={{ ...s.legendItem, color: v.color }}>
                {v.icon} {k}
              </span>
            ))}
          </div>

          {/* Day cards */}
          <div style={s.timeline}>
            {result.plan.map((day, idx) => {
              const phase   = getPhase(day.title);
              const isOpen  = expandedDay === day.dayNumber;
              const isLast  = idx === result.plan.length - 1;
              return (
                <div key={day.dayNumber} style={s.timelineRow}>

                  {/* Connector line */}
                  <div style={s.connectorCol}>
                    <div style={{ ...s.dot, background: phase.color, boxShadow: `0 0 10px ${phase.color}88` }} />
                    {!isLast && <div style={{ ...s.line, background: phase.color + '33' }} />}
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      ...s.dayCard,
                      borderColor: isOpen ? phase.color + '66' : 'rgba(255,255,255,0.07)',
                      background: isOpen ? phase.bg : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {/* Card header — clickable */}
                    <div
                      style={s.dayHeader}
                      onClick={() => setExpandedDay(isOpen ? null : day.dayNumber)}
                    >
                      <div style={s.dayLeft}>
                        <span style={{ ...s.dayBadge, background: phase.color + '22', color: phase.color }}>
                          Day {day.dayNumber}
                        </span>
                        <span style={s.dayTitle}>{day.title}</span>
                      </div>
                      <div style={s.dayRight}>
                        <span style={{ ...s.hoursBadge, color: phase.color }}>
                          ⏱ {day.estimatedHours}h
                        </span>
                        <span style={{ ...s.chevron, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* Task list */}
                    {isOpen && (
                      <div style={s.taskList}>
                        <div style={{ ...s.taskDivider, background: phase.color + '33' }} />
                        {day.tasks.map((task, ti) => (
                          <div key={ti} style={s.taskRow}>
                            <span style={{ ...s.taskNum, background: phase.color + '22', color: phase.color }}>
                              {ti + 1}
                            </span>
                            <span style={s.taskText}>{task}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={s.footer}>
            <span style={s.footerText}>
              🕐 Generated at {new Date(result.generatedAt).toLocaleTimeString()}
            </span>
            <button onClick={() => { setResult(null); setTopic(''); setDays(''); setHours(''); }} style={s.resetBtn}>
              ↺ New Plan
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  container: { display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 820, margin: '0 auto' },

  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  cardTitle:  { margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' },
  cardSub:    { margin: '4px 0 0', fontSize: 13, color: '#94a3b8' },

  field:     { display: 'flex', flexDirection: 'column', gap: 7 },
  label:     { fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' },
  inputWrap: { position: 'relative' },
  inputUnit: { position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#475569', pointerEvents: 'none' },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '12px 40px 12px 14px',
    fontSize: 15, color: '#f1f5f9', outline: 'none',
  },
  inputErr: { borderColor: 'rgba(248,113,113,0.6)' },
  errText:  { fontSize: 12, color: '#f87171' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },

  presets:     { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  presetLabel: { fontSize: 12, color: '#64748b', marginRight: 4 },
  presetBtn: {
    padding: '5px 12px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },

  genBtn: {
    padding: '14px 24px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  genBtnDis: { opacity: 0.6, cursor: 'not-allowed' },
  loadRow:   { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' },
  spinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  errBanner: {
    background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 10, padding: '12px 16px',
    color: '#fca5a5', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center',
  },

  resultWrap: { display: 'flex', flexDirection: 'column', gap: 20 },

  summaryBar: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '16px 24px',
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
  },
  summaryItem:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  summaryVal:     { fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' },
  summaryKey:     { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
  summaryDivider: { width: 1, height: 36, background: 'rgba(255,255,255,0.07)', flexShrink: 0 },

  copyBtn: {
    marginLeft: 'auto', padding: '7px 16px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  copyBtnOk: { background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.4)', color: '#4ade80' },

  legend: { display: 'flex', gap: 16, flexWrap: 'wrap', paddingLeft: 4 },
  legendItem: { fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 },

  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineRow: { display: 'flex', gap: 16, alignItems: 'flex-start' },

  connectorCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18, flexShrink: 0 },
  dot:  { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  line: { width: 2, flexGrow: 1, minHeight: 24, marginTop: 4 },

  dayCard: {
    flex: 1, marginBottom: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
  },
  dayHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', cursor: 'pointer', gap: 12,
  },
  dayLeft:  { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  dayBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, flexShrink: 0 },
  dayTitle: { fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dayRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  hoursBadge: { fontSize: 12, fontWeight: 700 },
  chevron:  { fontSize: 16, color: '#475569', transition: 'transform 0.2s' },

  taskDivider: { height: 1, marginBottom: 12 },
  taskList: { padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 },
  taskRow:  { display: 'flex', gap: 10, alignItems: 'flex-start' },
  taskNum: {
    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, marginTop: 1,
  },
  taskText: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 },

  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  footerText: { fontSize: 12, color: '#475569' },
  resetBtn: {
    padding: '6px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent', color: '#64748b',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
};