import { useState } from 'react';
import { explainTopic } from '../../services/aiService';

const LEVELS = [
  { value: 'beginner', label: '🌱 Beginner', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  { value: 'intermediate', label: '⚡ Intermediate', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  { value: 'advanced', label: '🔥 Advanced', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
];

export default function ExplainPanel() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [topicError, setTopicError] = useState('');

  const selectedLevel = LEVELS.find(l => l.value === level);

  const handleGenerate = async () => {
    setTopicError('');
    setError('');

    if (!topic.trim()) {
      setTopicError('Please enter a topic to explain.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await explainTopic(topic.trim(), level);
      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to generate explanation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const formatExplanation = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} style={styles.h3}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} style={styles.h4}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} style={styles.bold}>{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- **')) {
        const parts = line.replace('- **', '').split('**:');
        return (
          <p key={i} style={styles.bullet}>
            <span style={styles.bulletDot}>•</span>
            <strong style={{ color: selectedLevel.color }}>{parts[0]}</strong>
            {parts[1] ? `:${parts[1]}` : ''}
          </p>
        );
      }
      if (line.match(/^\d+\. \*\*/)) {
        const num = line.match(/^(\d+)\./)[1];
        const rest = line.replace(/^\d+\. \*\*/, '').split('**:');
        return (
          <p key={i} style={styles.numbered}>
            <span style={{ ...styles.numBadge, background: selectedLevel.color + '22', color: selectedLevel.color }}>{num}</span>
            <strong style={{ color: selectedLevel.color }}>{rest[0]}</strong>
            {rest[1] ? `:${rest[1]}` : ''}
          </p>
        );
      }
      if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
      return <p key={i} style={styles.paragraph}>{line}</p>;
    });
  };

  return (
    <div style={styles.container}>
      {/* Input Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.icon}>💡</span>
          <div>
            <h2 style={styles.cardTitle}>Explain a Topic</h2>
            <p style={styles.cardSubtitle}>Get a clear explanation tailored to your level</p>
          </div>
        </div>

        {/* Topic Input */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Topic</label>
          <input
            type="text"
            value={topic}
            onChange={e => { setTopic(e.target.value); setTopicError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. Machine Learning, REST APIs, Recursion..."
            style={{
              ...styles.input,
              ...(topicError ? styles.inputError : {}),
            }}
          />
          {topicError && <span style={styles.errorText}>{topicError}</span>}
        </div>

        {/* Level Selector */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Explanation Level</label>
          <div style={styles.levelGrid}>
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                style={{
                  ...styles.levelBtn,
                  ...(level === l.value ? {
                    background: l.bg,
                    borderColor: l.color,
                    color: l.color,
                    boxShadow: `0 0 12px ${l.color}33`,
                  } : {}),
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p style={styles.levelHint}>
            {level === 'beginner' && '🌱 Simple language, no prior knowledge needed'}
            {level === 'intermediate' && '⚡ Technical concepts with practical context'}
            {level === 'advanced' && '🔥 Deep dive with architecture, trade-offs & research'}
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            ...styles.generateBtn,
            ...(loading ? styles.generateBtnDisabled : {}),
          }}
        >
          {loading ? (
            <span style={styles.loadingRow}>
              <span style={styles.spinner} />
              Generating Explanation...
            </span>
          ) : (
            '✨ Generate Explanation'
          )}
        </button>

        {/* API Error */}
        {error && (
          <div style={styles.errorBanner}>
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div style={{ ...styles.card, ...styles.resultCard, borderColor: selectedLevel.color + '44' }}>
          {/* Result Header */}
          <div style={styles.resultHeader}>
            <div style={styles.badges}>
              <span style={{ ...styles.badge, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                📚 {result.topic}
              </span>
              <span style={{ ...styles.badge, background: selectedLevel.bg, color: selectedLevel.color, border: `1px solid ${selectedLevel.color}44` }}>
                {selectedLevel.label}
              </span>
            </div>
            <button
              onClick={handleCopy}
              style={{ ...styles.copyBtn, ...(copied ? styles.copyBtnSuccess : {}) }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>

          {/* Divider */}
          <div style={{ ...styles.divider, background: selectedLevel.color + '33' }} />

          {/* Explanation Content */}
          <div style={styles.explanationBody}>
            {formatExplanation(result.explanation)}
          </div>

          {/* Footer */}
          <div style={styles.resultFooter}>
            <span style={styles.footerText}>
              🕐 Generated at {new Date(result.generatedAt).toLocaleTimeString()}
            </span>
            <button
              onClick={() => { setResult(null); setTopic(''); }}
              style={styles.resetBtn}
            >
              ↺ New Explanation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  resultCard: {
    border: '1px solid rgba(139,92,246,0.3)',
    background: 'rgba(139,92,246,0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  icon: {
    fontSize: '32px',
    lineHeight: 1,
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  cardSubtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#94a3b8',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '15px',
    color: '#f1f5f9',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: 'rgba(248,113,113,0.6)',
  },
  errorText: {
    fontSize: '12px',
    color: '#f87171',
    marginTop: '2px',
  },
  levelGrid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  levelBtn: {
    flex: 1,
    minWidth: '130px',
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  levelHint: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
    fontStyle: 'italic',
  },
  generateBtn: {
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.02em',
  },
  generateBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  errorBanner: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: '14px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
  },
  badges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
  },
  copyBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  copyBtnSuccess: {
    background: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.4)',
    color: '#4ade80',
  },
  divider: {
    height: '1px',
    width: '100%',
    borderRadius: '1px',
  },
  explanationBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  paragraph: {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.75',
    color: '#cbd5e1',
  },
  bold: {
    margin: '8px 0 4px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#e2e8f0',
  },
  h3: {
    margin: '12px 0 6px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.2px',
  },
  h4: {
    margin: '10px 0 4px',
    fontSize: '15px',
    fontWeight: 700,
    color: '#e2e8f0',
  },
  bullet: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  bulletDot: {
    marginTop: '2px',
    flexShrink: 0,
    color: '#64748b',
  },
  numbered: {
    margin: '6px 0',
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  numBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
    marginTop: '1px',
  },
  resultFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    paddingTop: '4px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerText: {
    fontSize: '12px',
    color: '#475569',
  },
  resetBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};