import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ── Custom cursor ──────────────────────────────────────────────────────────────
const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
const ring = document.createElement('div'); ring.id = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let rx = 0, ry = 0;
document.addEventListener('mousemove', (e) => {
  dot.style.left  = e.clientX + 'px';
  dot.style.top   = e.clientY + 'px';
  const animate = () => {
    rx += (e.clientX - rx) * 0.15;
    ry += (e.clientY - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
  };
  requestAnimationFrame(animate);
});

// ── Error boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          background:'#04080f', color:'#f87171',
          fontFamily:'monospace', padding:'40px',
          minHeight:'100vh', fontSize:'13px',
          whiteSpace:'pre-wrap', wordBreak:'break-word'
        }}>
          <div style={{ color:'#58C4DD', fontSize:'18px', marginBottom:'16px' }}>
            ⚠️  dots — React Error
          </div>
          <div style={{ color:'#f0c040', marginBottom:'12px', fontSize:'15px' }}>
            {this.state.error.message}
          </div>
          <div style={{ color:'#3a5470', fontSize:'11px' }}>
            {this.state.error.stack}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop:'24px', background:'#58C4DD', border:'none', borderRadius:'8px', color:'#04080f', padding:'10px 20px', cursor:'pointer', fontFamily:'monospace', fontSize:'13px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);