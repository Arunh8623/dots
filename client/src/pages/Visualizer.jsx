import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MathBackground from '../components/MathBackground';
import ChatInterface from '../components/ChatInterface';
import HistorySidebar from '../components/HistorySidebar';

export default function Visualizer() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={styles.layout}>
      <MathBackground />

      {/* Top navbar */}
      <div style={styles.navbar}>
        {/* Left: hamburger + home */}
        <div style={styles.navLeft}>
          <button style={styles.navBtn} onClick={() => setSidebarOpen(o => !o)} title="Toggle History">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/')} title="Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </button>
        </div>

        {/* Center: logo */}
        <div style={styles.navCenter}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#58C4DD" strokeWidth="1.5"/>
            <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="none" stroke="#f0c040" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="2" fill="#58C4DD"/>
          </svg>
          <span style={styles.navLogo}>Dots</span>
        </div>

        {/* Right: badge */}
        <div style={styles.navRight}>
          <span style={styles.badge}>
            <span style={{ color: '#83C167' }}>●</span> Gemini + Manim
          </span>
        </div>
      </div>

      {/* Sidebar (slides in/out) */}
      <HistorySidebar
        onSelect={setSelectedItem}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      {/* Main chat area */}
      <div style={styles.main}>
        <ChatInterface initialItem={selectedItem} />
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: '#080c14',
    position: 'relative',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    height: '52px',
    flexShrink: 0,
    borderBottom: '1px solid #1e2d42',
    background: 'rgba(8,12,20,0.95)',
    backdropFilter: 'blur(12px)',
    position: 'relative',
    zIndex: 5,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '4px' },
  navCenter: { display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  navLogo: { fontFamily: 'DM Serif Display, serif', fontSize: '18px', color: '#e8edf5' },
  navRight: {},
  navBtn: {
    background: 'none', border: 'none',
    color: '#8899aa', cursor: 'pointer',
    padding: '8px', borderRadius: '8px',
    display: 'flex', alignItems: 'center',
    transition: 'color 0.15s, background 0.15s',
  },
  badge: {
    fontSize: '11px', color: '#8899aa',
    fontFamily: 'JetBrains Mono, monospace',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
};