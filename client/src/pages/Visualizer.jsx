import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MathBackground from '../components/MathBackground';
import ChatInterface  from '../components/ChatInterface';
import HistorySidebar from '../components/HistorySidebar';
import Logo           from '../components/Logo';
import { useAuth }    from '../context/AuthContext';

export default function Visualizer() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleLogout = () => { logoutUser(); navigate('/auth'); };

  return (
    <div style={s.layout}>
      <MathBackground />

      <nav style={s.nav}>
        {/* Left */}
        <div style={s.navLeft}>
          <button style={s.iconBtn} onClick={() => setSidebarOpen(o => !o)} title="History">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button style={s.iconBtn} onClick={() => navigate('/')} title="Home">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </button>
        </div>

        {/* Center logo */}
        <div style={s.navCenter}>
          <Logo size={28} />
          <span style={s.navBrand}>dots</span>
        </div>

        {/* Right — user avatar */}
        <div style={s.navRight}>
          <div style={s.navStatus}>
            <span style={s.statusDot}/>
            <span style={s.statusText}>Gemini + Manim</span>
          </div>
          <div style={{ position:'relative' }}>
            <button style={s.avatar} onClick={() => setShowUserMenu(v => !v)} title={user?.name}>
              {initials}
            </button>
            {showUserMenu && (
              <div style={s.userMenu}>
                <div style={s.userMenuName}>{user?.name}</div>
                <div style={s.userMenuEmail}>{user?.email}</div>
                <div style={s.userMenuDivider}/>
                <button style={s.userMenuBtn} onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <HistorySidebar
        onSelect={setSelectedItem}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      <div style={s.main}>
        <ChatInterface initialItem={selectedItem} />
      </div>

      {showUserMenu && <div style={s.menuOverlay} onClick={() => setShowUserMenu(false)}/>}
    </div>
  );
}

const s = {
  layout: { display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--bg)', position:'relative' },
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px', height:'50px', flexShrink:0, borderBottom:'1px solid var(--border)', background:'rgba(4,8,15,0.92)', backdropFilter:'blur(20px)', position:'relative', zIndex:5 },
  navLeft:   { display:'flex', alignItems:'center', gap:'2px' },
  navCenter: { display:'flex', alignItems:'center', gap:'8px', position:'absolute', left:'50%', transform:'translateX(-50%)' },
  navBrand:  { fontFamily:'var(--f-display)', fontSize:'18px', color:'var(--t1)', letterSpacing:'-0.3px' },
  navRight:  { display:'flex', alignItems:'center', gap:'10px' },
  navStatus: { display:'flex', alignItems:'center', gap:'5px' },
  statusDot: { width:'6px', height:'6px', borderRadius:'50%', background:'#4ade80', display:'block', animation:'pulse 2s infinite' },
  statusText:{ fontSize:'11px', color:'var(--t3)', fontFamily:'var(--f-mono)' },
  iconBtn:   { background:'none', border:'none', color:'var(--t2)', cursor:'none', padding:'8px', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', transition:'color 0.15s' },
  avatar:    { width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, #58C4DD, #a78bfa)', border:'none', color:'var(--bg)', fontSize:'12px', fontWeight:'700', cursor:'none', fontFamily:'var(--f-ui)', display:'flex', alignItems:'center', justifyContent:'center' },
  userMenu:  { position:'absolute', right:0, top:'calc(100% + 8px)', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'12px', minWidth:'180px', zIndex:100, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' },
  userMenuName:    { fontSize:'14px', fontWeight:'600', color:'var(--t1)', fontFamily:'var(--f-ui)', marginBottom:'2px' },
  userMenuEmail:   { fontSize:'11px', color:'var(--t3)', fontFamily:'var(--f-mono)', marginBottom:'10px', overflow:'hidden', textOverflow:'ellipsis' },
  userMenuDivider: { height:'1px', background:'var(--border)', marginBottom:'10px' },
  userMenuBtn:     { background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'var(--r-sm)', color:'var(--red)', fontSize:'13px', cursor:'none', fontFamily:'var(--f-ui)', padding:'7px 14px', width:'100%', textAlign:'left' },
  menuOverlay:     { position:'fixed', inset:0, zIndex:99 },
  main:      { flex:1, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative', zIndex:1 },
};