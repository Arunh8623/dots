import React, { useState, useRef, useEffect } from 'react';
import { streamVisualization } from '../services/api';
import LoadingAnimation from './LoadingAnimation';
import VideoPlayer from './VideoPlayer';
import NotesPanel from './NotesPanel';

const EXAMPLES = [
  "Explain the intuition behind Fourier Transform visually",
  "Why does the derivative of sin(x) equal cos(x)?",
  "Show eigenvalues and eigenvectors geometrically",
  "Visualize the epsilon-delta definition of a limit",
  "How does gradient descent find the minimum?",
  "Explain Euler's identity e^(iπ) + 1 = 0",
];

const AUDIENCES = [
  { value: 'child',      icon: '🧒', label: 'Kid'         },
  { value: 'highschool', icon: '📚', label: 'High School' },
  { value: 'undergrad',  icon: '🎓', label: 'Undergrad'   },
  { value: 'engineer',   icon: '⚙️', label: 'Engineer'    },
  { value: 'grad',       icon: '🔬', label: 'Researcher'  },
];

const QUALITIES = [
  { value: 'fast',   icon: '⚡', label: '480p',  sub: '~45s'  },
  { value: 'medium', icon: '✨', label: '720p',  sub: '~2min' },
  { value: 'high',   icon: '💎', label: '1080p', sub: '~5min' },
];

export default function ChatInterface({ initialItem }) {
  const [prompt, setPrompt]           = useState('');
  const [audience, setAudience]       = useState('highschool');
  const [quality, setQuality]         = useState('medium');
  const [status, setStatus]           = useState('idle');
  const [stage, setStage]             = useState('');
  const [stageMsg, setStageMsg]       = useState('');
  const [videoUrl, setVideoUrl]       = useState(null);
  const [notes, setNotes]             = useState(null);
  const [currentPrompt, setCurrentPrompt]   = useState('');
  const [currentAudience, setCurrentAudience] = useState('highschool');
  const [currentQuality, setCurrentQuality]   = useState('medium');
  const [error, setError]             = useState('');
  const textareaRef = useRef(null);

  // Keep refs so the submit closure always reads latest values
  const audienceRef = useRef(audience);
  const qualityRef  = useRef(quality);
  useEffect(() => { audienceRef.current = audience; }, [audience]);
  useEffect(() => { qualityRef.current  = quality;  }, [quality]);

  useEffect(() => {
    if (initialItem) {
      setVideoUrl(initialItem.videoUrl);
      setCurrentPrompt(initialItem.originalPrompt);
      setNotes(initialItem.notes || null);
      setStatus('done');
    }
  }, [initialItem]);

  const handleSubmit = async () => {
    const q = prompt.trim();
    if (!q || status === 'loading') return;

    // Read from refs to avoid stale closure
    const selectedAudience = audienceRef.current;
    const selectedQuality  = qualityRef.current;

    console.log('Submitting with:', { audience: selectedAudience, quality: selectedQuality });

    setStatus('loading'); setStage('engineering'); setStageMsg('');
    setError(''); setVideoUrl(null); setNotes(null);
    setCurrentPrompt(q);
    setCurrentAudience(selectedAudience);
    setCurrentQuality(selectedQuality);
    setPrompt('');

    try {
      await streamVisualization(q, selectedAudience, selectedQuality, (event) => {
        setStage(event.stage);
        setStageMsg(event.message);
        if (event.stage === 'completed') {
          setVideoUrl(event.videoUrl);
          setNotes(event.notes || null);
          setStatus('done');
        } else if (event.stage === 'error') {
          setError(event.message || 'Something went wrong.');
          setStatus('error');
        }
      });
    } catch (err) {
      setError('Connection error. Make sure the server is running on port 5000.');
      setStatus('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const reset = () => {
    setStatus('idle'); setVideoUrl(null); setNotes(null);
    setError(''); setStage(''); setCurrentPrompt('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const selAudience       = AUDIENCES.find(a => a.value === audience);
  const selCurrentAud     = AUDIENCES.find(a => a.value === currentAudience);
  const selCurrentQuality = QUALITIES.find(q => q.value === currentQuality);

  return (
    <div style={s.container}>
      <div style={s.main}>

        {/* IDLE */}
        {status === 'idle' && (
          <div style={s.idleContent}>
            <div style={s.heroSection}>
              <h1 style={s.heroTitle}>What math do you<br /><em style={{ color: '#58C4DD' }}>want to see?</em></h1>
              <p style={s.heroSub}>Ask any concept — calculus, geometry, linear algebra — and watch it come alive.</p>
            </div>
            <div style={s.examples}>
              <div style={s.examplesLabel}>Try one of these ↓</div>
              <div style={s.exampleGrid}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} style={s.exampleChip} className="example-chip"
                    onClick={() => { setPrompt(ex); textareaRef.current?.focus(); }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING */}
        {status === 'loading' && (
          <div style={s.centeredContent}>
            <div style={s.questionBubble}>
              <span style={s.questionLabel}>Your question</span>
              <p style={s.questionText}>"{currentPrompt}"</p>
              <div style={s.bubbleTags}>
                <span style={s.bubbleTag}>{selCurrentAud?.icon} {selCurrentAud?.label}</span>
                <span style={s.bubbleTag}>{selCurrentQuality?.icon} {selCurrentQuality?.label}</span>
              </div>
            </div>
            <LoadingAnimation currentStage={stage} message={stageMsg} />
          </div>
        )}

        {/* DONE */}
        {status === 'done' && videoUrl && (
          <div style={s.doneContent}>
            <VideoPlayer videoUrl={videoUrl} prompt={currentPrompt} />
            <NotesPanel notes={notes} />
            <button style={s.newBtn} onClick={reset}>+ Ask Another Question</button>
          </div>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <div style={s.centeredContent}>
            <div style={s.errorCard}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
              <div style={s.errorTitle}>Something went wrong</div>
              <div style={s.errorMsg}>{error}</div>
              <div style={s.errorHints}>
                <div>• Server running? <code>cd server && npm run dev</code></div>
                <div>• Manim installed? <code>python -m manim --version</code></div>
              </div>
              <button style={s.retryBtn} onClick={reset}>Try Again</button>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div style={s.inputArea}>
        <div style={s.inputWrapper}>

          {/* Compact settings bar */}
          <div style={s.settingsBar} className="settings-bar">
            {/* Audience */}
            <div style={s.settingsGroup}>
              <span style={s.settingsLabel}>Audience</span>
              <div style={s.pillRow}>
                {AUDIENCES.map(a => (
                  <button key={a.value}
                    style={{ ...s.pill, ...(audience === a.value ? s.pillActive : {}) }}
                    onClick={() => setAudience(a.value)}
                    disabled={status === 'loading'}
                    title={a.label}
                  >
                    <span>{a.icon}</span>
                    <span style={s.pillLabel}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={s.divider} />

            {/* Quality */}
            <div style={s.settingsGroup}>
              <span style={s.settingsLabel}>Quality</span>
              <div style={s.pillRow}>
                {QUALITIES.map(q => (
                  <button key={q.value}
                    style={{ ...s.pill, ...(quality === q.value ? s.pillActive : {}) }}
                    onClick={() => setQuality(q.value)}
                    disabled={status === 'loading'}
                    title={`${q.label} · ${q.sub}`}
                  >
                    <span>{q.icon}</span>
                    <span style={s.pillLabel}>{q.label}</span>
                    <span style={s.pillSub}>{q.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text input */}
          <div style={s.inputBox}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => { setPrompt(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask any math question..."
              style={s.textarea}
              rows={1}
              disabled={status === 'loading'}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!prompt.trim() || status === 'loading') ? 0.4 : 1, background: status === 'loading' ? '#1e2d42' : '#58C4DD' }}
              onClick={handleSubmit}
              disabled={!prompt.trim() || status === 'loading'}
            >
              {status === 'loading'
                ? <div style={s.btnSpinner} />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="#080c14"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              }
            </button>
          </div>

          <div style={s.inputHint}>
            <kbd style={s.kbd}>Enter</kbd> to generate &nbsp;·&nbsp;
            <kbd style={s.kbd}>Shift+Enter</kbd> for newline
          </div>
        </div>
      </div>

      <style>{`
        .example-chip:hover { background: #1a2332 !important; border-color: #58C4DD !important; color: #58C4DD !important; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #2a3a4a; }
        .settings-bar::-webkit-scrollbar { height: 2px; }
        .settings-bar::-webkit-scrollbar-track { background: transparent; }
        .settings-bar::-webkit-scrollbar-thumb { background: #2a4060; border-radius: 2px; }
      `}</style>
    </div>
  );
}

const s = {
  container: { flex:1, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' },
  main: { flex:1, overflowY:'auto', display:'flex', flexDirection:'column' },

  idleContent: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', gap:'36px', animation:'fadeUp 0.6s ease forwards' },
  heroSection: { textAlign:'center', maxWidth:'600px' },
  heroTitle: { fontFamily:'DM Serif Display, serif', fontSize:'clamp(28px,5vw,50px)', lineHeight:1.15, color:'#e8edf5', marginBottom:'14px', letterSpacing:'-1px' },
  heroSub: { fontSize:'16px', color:'#8899aa', lineHeight:1.7 },
  examples: { width:'100%', maxWidth:'700px' },
  examplesLabel: { fontSize:'11px', color:'#445566', fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'12px', textAlign:'center' },
  exampleGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' },
  exampleChip: { background:'#111827', border:'1px solid #1e2d42', borderRadius:'8px', color:'#8899aa', fontSize:'13px', padding:'12px 14px', textAlign:'left', cursor:'pointer', lineHeight:1.4, fontFamily:'Instrument Sans, sans-serif', transition:'all 0.2s' },

  centeredContent: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', gap:'24px' },
  questionBubble: { background:'#111827', border:'1px solid #1e2d42', borderRadius:'12px', padding:'14px 18px', maxWidth:'560px', width:'100%' },
  questionLabel: { fontSize:'10px', color:'#58C4DD', fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.1em', display:'block', marginBottom:'6px' },
  questionText: { fontSize:'15px', color:'#c8d4e0', lineHeight:1.5, fontStyle:'italic', margin:'0 0 10px' },
  bubbleTags: { display:'flex', gap:'8px' },
  bubbleTag: { fontSize:'11px', color:'#8899aa', background:'#1e2d42', borderRadius:'20px', padding:'2px 10px', fontFamily:'JetBrains Mono, monospace' },

  doneContent: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'16px', gap:'14px', animation:'fadeUp 0.4s ease', maxWidth:'900px', width:'100%', margin:'0 auto', boxSizing:'border-box' },
  newBtn: { background:'none', border:'1px solid #1e2d42', borderRadius:'8px', color:'#58C4DD', fontSize:'14px', padding:'10px 24px', cursor:'pointer', fontFamily:'Instrument Sans, sans-serif' },

  errorCard: { background:'#111827', border:'1px solid rgba(252,98,85,0.3)', borderRadius:'16px', padding:'28px', maxWidth:'480px', width:'100%', textAlign:'center' },
  errorTitle: { fontFamily:'DM Serif Display, serif', fontSize:'22px', color:'#FC6255', marginBottom:'8px' },
  errorMsg: { fontSize:'12px', color:'#8899aa', marginBottom:'16px', fontFamily:'JetBrains Mono, monospace', wordBreak:'break-word', lineHeight:1.6 },
  errorHints: { background:'#0d1420', borderRadius:'8px', padding:'12px 16px', textAlign:'left', marginBottom:'20px', fontSize:'12px', color:'#8899aa', fontFamily:'JetBrains Mono, monospace', lineHeight:2 },
  retryBtn: { background:'#FC6255', border:'none', borderRadius:'8px', color:'#080c14', fontSize:'14px', fontWeight:'600', padding:'10px 24px', cursor:'pointer' },

  // Compact settings bar
  inputArea: { flexShrink:0, padding:'8px 16px 12px', borderTop:'1px solid #1e2d42', background:'rgba(8,12,20,0.97)', backdropFilter:'blur(12px)' },
  inputWrapper: { maxWidth:'860px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'7px' },

  settingsBar: {
    display:'flex', alignItems:'center', gap:'8px',
    background:'#0d1420', border:'1px solid #1e2d42',
    borderRadius:'10px', padding:'5px 10px',
    flexWrap:'nowrap', overflowX:'auto',
    scrollbarWidth:'thin',
    scrollbarColor:'#2a4060 transparent',
  },
  settingsGroup: { display:'flex', alignItems:'center', gap:'6px', flexShrink:0 },
  settingsLabel: { fontSize:'10px', color:'#445566', fontFamily:'JetBrains Mono, monospace', textTransform:'uppercase', letterSpacing:'0.06em', flexShrink:0, whiteSpace:'nowrap' },
  pillRow: { display:'flex', gap:'3px', flexWrap:'nowrap' },
  divider: { width:'1px', minWidth:'1px', height:'24px', background:'#2a4060', flexShrink:0, margin:'0 6px' },

  pill: {
    display:'flex', alignItems:'center', gap:'3px',
    padding:'3px 8px', borderRadius:'6px',
    border:'1px solid transparent', background:'none',
    color:'#8899aa', fontSize:'12px', cursor:'pointer',
    fontFamily:'Instrument Sans, sans-serif',
    transition:'all 0.15s', whiteSpace:'nowrap', flexShrink:0,
  },
  pillActive: { background:'rgba(88,196,221,0.12)', borderColor:'#58C4DD', color:'#58C4DD' },
  pillLabel: { fontWeight:'500', fontSize:'12px' },
  pillSub: { fontSize:'10px', color:'#445566', fontFamily:'JetBrains Mono, monospace' },

  inputBox: { display:'flex', alignItems:'flex-end', gap:'10px', background:'#111827', border:'1px solid #1e2d42', borderRadius:'12px', padding:'10px 10px 10px 16px' },
  textarea: { flex:1, background:'none', border:'none', color:'#e8edf5', fontSize:'15px', lineHeight:1.6, resize:'none', minHeight:'26px', maxHeight:'140px', overflowY:'auto' },
  sendBtn: { width:'38px', height:'38px', borderRadius:'8px', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', cursor:'pointer' },
  btnSpinner: { width:'16px', height:'16px', border:'2px solid #445566', borderTopColor:'#58C4DD', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  inputHint: { fontSize:'10px', color:'#2a3a4a', fontFamily:'JetBrains Mono, monospace', textAlign:'center' },
  kbd: { background:'#1e2d42', borderRadius:'3px', padding:'1px 4px', fontSize:'10px', color:'#8899aa', border:'1px solid #2a4060', fontFamily:'JetBrains Mono, monospace' },
};