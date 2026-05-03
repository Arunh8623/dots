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
  { value:'child',      icon:'🧒', label:'Kid'        },
  { value:'highschool', icon:'📚', label:'High School' },
  { value:'undergrad',  icon:'🎓', label:'Undergrad'   },
  { value:'engineer',   icon:'⚙️', label:'Engineer'   },
  { value:'grad',       icon:'🔬', label:'Researcher'  },
];

const QUALITIES = [
  { value:'fast',   icon:'⚡', label:'480p', sub:'~45s'  },
  { value:'medium', icon:'✨', label:'720p', sub:'~2min' },
  { value:'high',   icon:'💎', label:'1080p',sub:'~5min' },
];

export default function ChatInterface({ initialItem }) {
  const [prompt, setPrompt]             = useState('');
  const [audience, setAudience]         = useState('highschool');
  const [quality, setQuality]           = useState('medium');
  const [status, setStatus]             = useState('idle');
  const [stage, setStage]               = useState('');
  const [stageMsg, setStageMsg]         = useState('');
  const [videoUrl, setVideoUrl]         = useState(null);
  const [notes, setNotes]               = useState(null);
  const [currentPrompt, setCurrentPrompt]   = useState('');
  const [currentAudience, setCurrentAudience] = useState('highschool');
  const [currentQuality, setCurrentQuality]   = useState('medium');
  const [error, setError]               = useState('');
  const textareaRef = useRef(null);
  const audienceRef = useRef(audience);
  const qualityRef  = useRef(quality);
  useEffect(() => { audienceRef.current = audience; }, [audience]);
  useEffect(() => { qualityRef.current  = quality;  }, [quality]);

  useEffect(() => {
    if (initialItem) {
      setVideoUrl(initialItem.videoUrl); setCurrentPrompt(initialItem.originalPrompt);
      setNotes(initialItem.notes || null); setStatus('done');
    }
  }, [initialItem]);

  const handleSubmit = async () => {
    const q = prompt.trim(); if (!q || status === 'loading') return;
    const a = audienceRef.current, ql = qualityRef.current;
    setStatus('loading'); setStage('engineering'); setStageMsg('');
    setError(''); setVideoUrl(null); setNotes(null);
    setCurrentPrompt(q); setCurrentAudience(a); setCurrentQuality(ql); setPrompt('');
    try {
      await streamVisualization(q, a, ql, (event) => {
        setStage(event.stage); setStageMsg(event.message);
        if (event.stage === 'completed') { setVideoUrl(event.videoUrl); setNotes(event.notes||null); setStatus('done'); }
        else if (event.stage === 'error') { setError(event.message||'Something went wrong.'); setStatus('error'); }
      });
    } catch { setError('Connection error. Make sure the server is running on port 5000.'); setStatus('error'); }
  };

  const handleKeyDown = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const autoResize = (e) => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,140)+'px'; };
  const reset = () => { setStatus('idle'); setVideoUrl(null); setNotes(null); setError(''); setStage(''); setCurrentPrompt(''); setTimeout(()=>textareaRef.current?.focus(),100); };

  const selAud  = AUDIENCES.find(a=>a.value===currentAudience);
  const selQual = QUALITIES.find(q=>q.value===currentQuality);

  return (
    <div style={s.container}>
      <div style={s.main}>

        {/* ── IDLE ── */}
        {status==='idle' && (
          <div style={s.idleContent}>
            <div style={s.hero}>
              <div style={s.heroGlow}/>
              <h1 style={s.heroTitle}>What math do you<br/><em style={s.heroAccent}>want to see?</em></h1>
              <p style={s.heroSub}>Ask any concept — calculus, geometry, linear algebra — and watch it come alive as a 3Blue1Brown-style animation.</p>
            </div>
            <div style={s.examplesWrap}>
              <div style={s.exLabel}>Try one of these</div>
              <div style={s.exGrid}>
                {EXAMPLES.map((ex,i)=>(
                  <button key={i} style={s.exChip} className="ex-chip"
                    onClick={()=>{setPrompt(ex);textareaRef.current?.focus();}}>
                    <span style={s.exArrow}>→</span>{ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {status==='loading' && (
          <div style={s.centered}>
            <div style={s.qBubble}>
              <span style={s.qLabel}>Question</span>
              <p style={s.qText}>"{currentPrompt}"</p>
              <div style={s.qTags}>
                <span style={s.qTag}>{selAud?.icon} {selAud?.label}</span>
                <span style={s.qTag}>{selQual?.icon} {selQual?.label}</span>
              </div>
            </div>
            <LoadingAnimation currentStage={stage} message={stageMsg}/>
          </div>
        )}

        {/* ── DONE ── */}
        {status==='done' && videoUrl && (
          <div style={s.doneContent}>
            <VideoPlayer videoUrl={videoUrl} prompt={currentPrompt}/>
            <NotesPanel notes={notes}/>
            <button style={s.newBtn} onClick={reset}>+ Ask Another Question</button>
          </div>
        )}

        {/* ── ERROR ── */}
        {status==='error' && (
          <div style={s.centered}>
            <div style={s.errCard}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>⚠️</div>
              <div style={s.errTitle}>Something went wrong</div>
              <div style={s.errMsg}>{error}</div>
              <div style={s.errHints}>
                <div>• Server running? <code>cd server && npm run dev</code></div>
                <div>• Manim installed? <code>python -m manim --version</code></div>
              </div>
              <button style={s.retryBtn} onClick={reset}>Try Again</button>
            </div>
          </div>
        )}
      </div>

      {/* ── INPUT ── */}
      <div style={s.inputArea}>
        <div style={s.inputWrap}>
          {/* Settings bar */}
          <div style={s.settingsBar} className="settings-bar">
            <span style={s.settLabel}>Audience</span>
            {AUDIENCES.map(a=>(
              <button key={a.value}
                style={{...s.pill, ...(audience===a.value?s.pillOn:{})}}
                onClick={()=>setAudience(a.value)}
                disabled={status==='loading'}>
                <span>{a.icon}</span><span style={s.pillTxt}>{a.label}</span>
              </button>
            ))}
            <div style={s.divider}/>
            <span style={s.settLabel}>Quality</span>
            {QUALITIES.map(q=>(
              <button key={q.value}
                style={{...s.pill, ...(quality===q.value?s.pillOn:{})}}
                onClick={()=>setQuality(q.value)}
                disabled={status==='loading'}>
                <span>{q.icon}</span>
                <span style={s.pillTxt}>{q.label}</span>
                <span style={s.pillSub}>{q.sub}</span>
              </button>
            ))}
          </div>

          {/* Text box */}
          <div style={s.inputBox}>
            <textarea ref={textareaRef} value={prompt}
              onChange={e=>{setPrompt(e.target.value);autoResize(e);}}
              onKeyDown={handleKeyDown}
              placeholder="Ask any math question..."
              style={s.textarea} rows={1}
              disabled={status==='loading'}
            />
            <button
              style={{...s.sendBtn, opacity:(!prompt.trim()||status==='loading')?0.35:1, background:status==='loading'?'var(--border2)':'var(--blue)'}}
              onClick={handleSubmit} disabled={!prompt.trim()||status==='loading'}>
              {status==='loading'
                ? <div style={s.spinner}/>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="var(--bg)"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>}
            </button>
          </div>
          <div style={s.hint}>
            <kbd style={s.kbd}>Enter</kbd> generate &nbsp;·&nbsp; <kbd style={s.kbd}>Shift+Enter</kbd> newline
          </div>
        </div>
      </div>

      <style>{`
        .ex-chip { transition: all 0.18s; }
        .ex-chip:hover { background: var(--bg3) !important; border-color: var(--blue) !important; color: var(--blue) !important; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: var(--t3); }
        .settings-bar::-webkit-scrollbar { height: 2px; }
        .settings-bar::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}

const s = {
  container: { flex:1, display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' },
  main: { flex:1, overflowY:'auto', display:'flex', flexDirection:'column' },

  // Idle
  idleContent: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', gap:'40px' },
  hero: { textAlign:'center', maxWidth:'620px', position:'relative' },
  heroGlow: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'400px', height:'200px', background:'radial-gradient(ellipse, rgba(88,196,221,0.07) 0%, transparent 70%)', pointerEvents:'none' },
  heroTitle: { fontFamily:'var(--f-display)', fontSize:'clamp(28px,5vw,52px)', lineHeight:1.12, color:'var(--t1)', marginBottom:'16px', letterSpacing:'-1.5px', position:'relative' },
  heroAccent: { background:'linear-gradient(135deg,#58C4DD,#a78bfa)', backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  heroSub: { fontSize:'15px', color:'var(--t2)', lineHeight:1.75 },
  examplesWrap: { width:'100%', maxWidth:'700px' },
  exLabel: { fontSize:'10px', color:'var(--t3)', fontFamily:'var(--f-mono)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'12px', textAlign:'center' },
  exGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' },
  exChip: { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--t2)', fontSize:'13px', padding:'12px 14px', textAlign:'left', cursor:'none', lineHeight:1.4, fontFamily:'var(--f-ui)', display:'flex', alignItems:'flex-start', gap:'8px' },
  exArrow: { color:'var(--blue)', flexShrink:0, fontFamily:'var(--f-mono)' },

  // Centered states
  centered: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', gap:'24px' },
  qBubble: { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 20px', maxWidth:'560px', width:'100%' },
  qLabel: { fontSize:'10px', color:'var(--blue)', fontFamily:'var(--f-mono)', textTransform:'uppercase', letterSpacing:'0.12em', display:'block', marginBottom:'6px' },
  qText: { fontSize:'15px', color:'var(--t1)', lineHeight:1.55, fontStyle:'italic', margin:'0 0 12px', fontFamily:'var(--f-display)' },
  qTags: { display:'flex', gap:'6px' },
  qTag: { fontSize:'10px', color:'var(--t2)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'20px', padding:'2px 10px', fontFamily:'var(--f-mono)' },

  // Done
  doneContent: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'16px', gap:'14px', animation:'fadeUp 0.4s ease', maxWidth:'900px', width:'100%', margin:'0 auto', boxSizing:'border-box' },
  newBtn: { background:'none', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--blue)', fontSize:'14px', padding:'10px 28px', cursor:'none', fontFamily:'var(--f-ui)', transition:'border-color 0.2s' },

  // Error
  errCard: { background:'var(--bg2)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--r-xl)', padding:'32px', maxWidth:'480px', width:'100%', textAlign:'center' },
  errTitle: { fontFamily:'var(--f-display)', fontSize:'22px', color:'var(--red)', marginBottom:'8px' },
  errMsg: { fontSize:'12px', color:'var(--t2)', marginBottom:'16px', fontFamily:'var(--f-mono)', wordBreak:'break-word', lineHeight:1.7 },
  errHints: { background:'var(--bg)', borderRadius:'var(--r-md)', padding:'12px 16px', textAlign:'left', marginBottom:'20px', fontSize:'12px', color:'var(--t2)', fontFamily:'var(--f-mono)', lineHeight:2.2 },
  retryBtn: { background:'var(--red)', border:'none', borderRadius:'var(--r-md)', color:'var(--bg)', fontSize:'14px', fontWeight:'700', padding:'10px 28px', cursor:'none' },

  // Input area
  inputArea: { flexShrink:0, padding:'8px 16px 12px', borderTop:'1px solid var(--border)', background:'rgba(4,8,15,0.96)', backdropFilter:'blur(20px)' },
  inputWrap: { maxWidth:'860px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'7px' },

  settingsBar: { display:'flex', alignItems:'center', gap:'4px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'5px 10px', overflowX:'auto', scrollbarWidth:'thin', scrollbarColor:'var(--border2) transparent', flexWrap:'nowrap' },
  settLabel: { fontSize:'10px', color:'var(--t3)', fontFamily:'var(--f-mono)', textTransform:'uppercase', letterSpacing:'0.08em', flexShrink:0, marginRight:'2px', whiteSpace:'nowrap' },
  pill: { display:'flex', alignItems:'center', gap:'3px', padding:'3px 9px', borderRadius:'6px', border:'1px solid transparent', background:'none', color:'var(--t2)', fontSize:'12px', cursor:'none', fontFamily:'var(--f-ui)', transition:'all 0.15s', whiteSpace:'nowrap', flexShrink:0 },
  pillOn: { background:'var(--blue-dim)', borderColor:'rgba(88,196,221,0.3)', color:'var(--blue)' },
  pillTxt: { fontWeight:'600', fontSize:'12px' },
  pillSub: { fontSize:'10px', color:'var(--t3)', fontFamily:'var(--f-mono)' },
  divider: { width:'1px', minWidth:'1px', height:'20px', background:'var(--border2)', flexShrink:0, margin:'0 6px' },

  inputBox: { display:'flex', alignItems:'flex-end', gap:'8px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'10px 10px 10px 16px', transition:'border-color 0.2s' },
  textarea: { flex:1, background:'none', border:'none', color:'var(--t1)', fontSize:'15px', lineHeight:1.6, resize:'none', minHeight:'26px', maxHeight:'140px', overflowY:'auto' },
  sendBtn: { width:'36px', height:'36px', borderRadius:'var(--r-md)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', cursor:'none', boxShadow:'0 0 14px var(--blue-glow)' },
  spinner: { width:'15px', height:'15px', border:'2px solid var(--border2)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  hint: { fontSize:'10px', color:'var(--t3)', fontFamily:'var(--f-mono)', textAlign:'center' },
  kbd: { background:'var(--bg3)', borderRadius:'4px', padding:'1px 5px', fontSize:'10px', color:'var(--t2)', border:'1px solid var(--border2)', fontFamily:'var(--f-mono)' },
};