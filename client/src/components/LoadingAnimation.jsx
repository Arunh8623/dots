import { useState, useEffect } from 'react';

const STAGES = [
  { key: 'engineering', icon: '🧠', label: 'Analyzing Question', desc: 'Building mathematical intuition...' },
  { key: 'coding',      icon: '✍️',  label: 'Writing Manim Code', desc: 'Crafting 3Blue1Brown-style animations...' },
  { key: 'rendering',   icon: '🎬', label: 'Rendering Video',    desc: 'Running Manim renderer...' },
  { key: 'fixing',      icon: '🔧', label: 'Fixing & Retrying',  desc: 'Auto-correcting animation code...' },
  { key: 'music',       icon: '🎵', label: 'Adding Music',       desc: 'Mixing background atmosphere...' },
  { key: 'completed',   icon: '✅', label: 'Complete!',          desc: 'Your visualization is ready.' },
];

export default function LoadingAnimation({ currentStage, message }) {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500);
    const e = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { clearInterval(d); clearInterval(e); };
  }, []);

  const currentIdx = STAGES.findIndex(s => s.key === currentStage);
  const stage = STAGES[currentIdx] || STAGES[0];

  const formatTime = (s) => s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;

  return (
    <div style={styles.wrapper}>
      {/* Main spinner */}
      <div style={styles.spinnerWrapper}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1e2d42" strokeWidth="4" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="#58C4DD" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="314"
            strokeDashoffset="80"
            style={{ animation: 'spin 1.5s linear infinite', transformOrigin: 'center' }}
          />
          <circle cx="60" cy="60" r="38" fill="none" stroke="#1e2d42" strokeWidth="2" />
          <circle cx="60" cy="60" r="38" fill="none" stroke="#f0c040" strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="239"
            strokeDashoffset="60"
            style={{ animation: 'spin 2s linear infinite reverse', transformOrigin: 'center' }}
          />
          <text x="60" y="55" textAnchor="middle" fill="#e8edf5" fontSize="24">{stage.icon}</text>
          <text x="60" y="75" textAnchor="middle" fill="#8899aa" fontSize="9" fontFamily="JetBrains Mono">
            {formatTime(elapsed)}
          </text>
        </svg>
      </div>

      <div style={styles.stageLabel}>{stage.label}{dots}</div>
      <div style={styles.message}>{message || stage.desc}</div>

      {/* Progress steps */}
      <div style={styles.steps}>
        {STAGES.filter(s => s.key !== 'fixing' && s.key !== 'completed').map((s, i) => {
          const stepIdx = STAGES.findIndex(st => st.key === s.key);
          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx;
          return (
            <div key={s.key} style={styles.step}>
              <div style={{
                ...styles.stepDot,
                background: isDone ? '#58C4DD' : isActive ? '#f0c040' : '#1e2d42',
                boxShadow: isActive ? '0 0 12px rgba(240,192,64,0.6)' : isDone ? '0 0 8px rgba(88,196,221,0.4)' : 'none',
              }} />
              {i < 3 && <div style={{ ...styles.stepLine, background: isDone ? '#58C4DD' : '#1e2d42' }} />}
            </div>
          );
        })}
      </div>

      <div style={styles.hint}>
        This usually takes <strong>60–180 seconds</strong>. Manim renders each frame individually.
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '40px 24px',
  },
  spinnerWrapper: {
    position: 'relative',
    marginBottom: '8px',
  },
  stageLabel: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '22px',
    color: '#e8edf5',
    letterSpacing: '-0.3px',
  },
  message: {
    fontSize: '13px',
    color: '#8899aa',
    fontFamily: 'JetBrains Mono, monospace',
    textAlign: 'center',
    maxWidth: '300px',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    marginTop: '8px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
  },
  stepDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
  stepLine: {
    width: '40px',
    height: '2px',
    transition: 'background 0.3s ease',
  },
  hint: {
    fontSize: '12px',
    color: '#445566',
    textAlign: 'center',
    maxWidth: '280px',
    marginTop: '8px',
    lineHeight: 1.5,
  }
};