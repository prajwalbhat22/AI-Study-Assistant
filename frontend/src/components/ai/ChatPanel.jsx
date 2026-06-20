import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../services/aiService';

const WELCOME = {
  role: 'ai',
  text: "👋 Hi! I'm your AI Study Assistant.\n\nI can help you with Java, Spring Boot, React, SQL, JWT, REST APIs, Git, interview prep, and much more.\n\nWhat would you like to learn today?",
  time: new Date(),
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg }) {
  const isAI = msg.role === 'ai';

  // Render markdown-lite: bold (**text**), bullet (• or -), newlines
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      // Bold spans
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((p, j) =>
        j % 2 === 1
          ? <strong key={j} style={{ color: isAI ? '#a78bfa' : '#fff', fontWeight: 700 }}>{p}</strong>
          : p
      );
      return (
        <span key={i} style={{ display: 'block', lineHeight: '1.65' }}>
          {rendered}
        </span>
      );
    });
  };

  return (
    <div style={{ ...s.msgRow, justifyContent: isAI ? 'flex-start' : 'flex-end' }}>
      {isAI && <div style={s.avatar}>🤖</div>}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', gap: 4 }}>
        <div style={{ ...s.bubble, ...(isAI ? s.aiBubble : s.userBubble) }}>
          <div style={{ ...s.bubbleText, color: isAI ? '#e2e8f0' : '#fff' }}>
            {renderText(msg.text)}
          </div>
        </div>
        <span style={s.timeLabel}>{formatTime(msg.time)}</span>
      </div>
      {!isAI && <div style={s.userAvatar}>👤</div>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ ...s.msgRow, justifyContent: 'flex-start' }}>
      <div style={s.avatar}>🤖</div>
      <div style={{ ...s.bubble, ...s.aiBubble, padding: '12px 18px' }}>
        <div style={s.typingDots}>
          <span style={{ ...s.dot1 }} />
          <span style={{ ...s.dot2 }} />
          <span style={{ ...s.dot3 }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', text, time: new Date() }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(text);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.aiResponse,
        time: new Date(data.timestamp),
      }]);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ ' + msg,
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setError('');
    inputRef.current?.focus();
  };

  const suggestions = [
    'Explain Spring Boot',
    'How does JWT work?',
    'React hooks explained',
    'SQL joins cheatsheet',
    'Interview tips',
  ];

  const showSuggestions = messages.length === 1;

  return (
    <div style={s.wrapper}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>🤖</div>
          <div>
            <div style={s.headerTitle}>AI Study Assistant</div>
            <div style={s.headerStatus}>
              <span style={s.statusDot} />
              Online — ask me anything
            </div>
          </div>
        </div>
        <button onClick={clearChat} style={s.clearBtn} title="Clear chat">
          🗑 Clear
        </button>
      </div>

      {/* Message area */}
      <div style={s.messageArea}>

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {loading && <TypingIndicator />}

        {/* Suggestion chips — only on welcome screen */}
        {showSuggestions && !loading && (
          <div style={s.suggestions}>
            <span style={s.suggestLabel}>Try asking:</span>
            <div style={s.chips}>
              {suggestions.map(s2 => (
                <button
                  key={s2}
                  style={s.chip}
                  onClick={() => { setInput(s2); inputRef.current?.focus(); }}
                >
                  {s2}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={s.inputBar}>
        <div style={s.inputWrap}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={s.textarea}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              ...s.sendBtn,
              ...(!input.trim() || loading ? s.sendBtnDis : s.sendBtnActive),
            }}
          >
            {loading ? <span style={s.miniSpinner} /> : '➤'}
          </button>
        </div>
        <p style={s.hint}>Enter to send • Shift+Enter for new line</p>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes blink1 { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes blink2 { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        @keyframes blink3 { 0%,80%,100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '680px',
    maxWidth: 820,
    margin: '0 auto',
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
  },

  /* Header */
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon:  { fontSize: 28, lineHeight: 1 },
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' },
  headerStatus:{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 },
  statusDot:   { width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' },
  clearBtn: {
    padding: '6px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'transparent', color: '#64748b',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },

  /* Messages */
  messageArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.08) transparent',
  },
  msgRow:    { display: 'flex', alignItems: 'flex-end', gap: 10 },
  avatar:    { fontSize: 22, flexShrink: 0, marginBottom: 18 },
  userAvatar:{ fontSize: 22, flexShrink: 0, marginBottom: 18 },

  bubble: {
    padding: '13px 17px',
    borderRadius: 16,
    maxWidth: '100%',
    wordBreak: 'break-word',
  },
  aiBubble: {
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    border: 'none',
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 1.65 },
  timeLabel:  { fontSize: 11, color: '#475569' },

  /* Typing dots */
  typingDots: { display: 'flex', gap: 5, alignItems: 'center', height: 16 },
  dot1: { width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'blink1 1.2s ease-in-out infinite' },
  dot2: { width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'blink2 1.2s ease-in-out 0.2s infinite' },
  dot3: { width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'blink3 1.2s ease-in-out 0.4s infinite' },

  /* Suggestions */
  suggestions: { display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 44 },
  suggestLabel:{ fontSize: 12, color: '#475569' },
  chips:       { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    padding: '6px 14px', borderRadius: 20,
    border: '1px solid rgba(139,92,246,0.3)',
    background: 'rgba(139,92,246,0.08)',
    color: '#a78bfa', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    transition: 'all 0.15s',
  },

  /* Input bar */
  inputBar: {
    padding: '14px 18px 10px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
  },
  inputWrap: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  textarea: {
    flex: 1,
    resize: 'none',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: '#f1f5f9',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.55,
    maxHeight: 120,
    overflowY: 'auto',
  },
  sendBtn: {
    width: 44, height: 44,
    borderRadius: 12,
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  sendBtnActive: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff' },
  sendBtnDis:    { background: 'rgba(255,255,255,0.06)', color: '#475569', cursor: 'not-allowed' },
  miniSpinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  hint: { margin: '6px 0 0', fontSize: 11, color: '#334155', textAlign: 'center' },
};