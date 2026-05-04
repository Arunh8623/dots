import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

// Mini 3D background for auth page
function AuthCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const W = el.clientWidth, H = el.clientHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, W/H, 0.1, 200);
    camera.position.z = 18;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setClearColor(0,0);
    el.appendChild(renderer.domElement);

    const geo  = new THREE.TorusKnotGeometry(4, 0.8, 160, 16, 2, 3);
    const mat  = new THREE.MeshBasicMaterial({ color:0x58C4DD, wireframe:true, opacity:0.12, transparent:true });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(300*3);
    for (let i=0;i<300*3;i++) pos[i]=(Math.random()-0.5)*60;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color:0x58C4DD, size:0.1, transparent:true, opacity:0.4 })));

    let raf;
    const animate = () => { raf=requestAnimationFrame(animate); mesh.rotation.x+=0.003; mesh.rotation.y+=0.005; renderer.render(scene,camera); };
    animate();
    const onResize=()=>{ camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
    window.addEventListener('resize',onResize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); renderer.dispose(); if(el.contains(renderer.domElement))el.removeChild(renderer.domElement); };
  },[]);
  return <div ref={ref} style={{position:'absolute',inset:0,zIndex:0}}/>;
}

export default function Auth() {
  const [mode,    setMode]    = useState('login'); // 'login' | 'signup'
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let data;
      if (mode === 'login') {
        data = await login(email, password);
      } else {
        data = await signup(name, email, password);
      }
      loginUser(data.token, data.user);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <AuthCanvas />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <dotsLogo size={48} />
          <div style={s.logoText}>dots</div>
        </div>

        <h1 style={s.title}>{mode==='login' ? 'Welcome back' : 'Create account'}</h1>
        <p style={s.sub}>{mode==='login' ? 'Sign in to your visualizations' : 'Start seeing mathematics'}</p>

        <form onSubmit={handleSubmit} style={s.form}>
          {mode==='signup' && (
            <div style={s.field}>
              <label style={s.label}>Name</label>
              <input style={s.input} type="text" placeholder="Your name"
                value={name} onChange={e=>setName(e.target.value)} required autoFocus/>
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" placeholder="you@example.com"
              value={email} onChange={e=>setEmail(e.target.value)} required autoFocus={mode==='login'}/>
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder={mode==='signup'?'At least 6 characters':'Your password'}
              value={password} onChange={e=>setPassword(e.target.value)} required/>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading
              ? <span style={s.spinner}/>
              : mode==='login' ? 'Sign In →' : 'Create Account →'
            }
          </button>
        </form>

        <div style={s.switchRow}>
          {mode==='login' ? "Don't have an account?" : "Already have an account?"}
          <button style={s.switchBtn} onClick={()=>{ setMode(m=>m==='login'?'signup':'login'); setError(''); }}>
            {mode==='login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>

      <style>{`
        input:focus { outline: none; border-color: var(--blue) !important; box-shadow: 0 0 0 3px var(--blue-dim); }
        input::placeholder { color: var(--t3); }
      `}</style>
    </div>
  );
}

// ── Inline logo for auth page ──────────────────────────────────────────────────
function dotsLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="28" stroke="#58C4DD" strokeWidth="2"/>
      <path d="M30 8 L30 52" stroke="#1a2a40" strokeWidth="1"/>
      <path d="M8 30 L52 30" stroke="#1a2a40" strokeWidth="1"/>
      <path d="M14 14 Q30 2 46 14 Q58 30 46 46 Q30 58 14 46 Q2 30 14 14Z"
        fill="none" stroke="#f0c040" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="30" cy="14" r="2.5" fill="#58C4DD"/>
      <circle cx="46" cy="30" r="2.5" fill="#f0c040"/>
      <circle cx="30" cy="46" r="2.5" fill="#58C4DD"/>
      <circle cx="14" cy="30" r="2.5" fill="#f0c040"/>
      <circle cx="30" cy="30" r="4" fill="#58C4DD" opacity="0.9"/>
      <path d="M20 30 Q25 22 30 30 Q35 38 40 30" fill="none" stroke="#58C4DD" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const s = {
  page: { minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'24px' },
  card: { position:'relative', zIndex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', padding:'40px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.5)' },
  logoWrap: { display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', marginBottom:'24px' },
  logoText: { fontFamily:'var(--f-display)', fontSize:'24px', color:'var(--t1)', letterSpacing:'-0.5px' },
  title: { fontFamily:'var(--f-display)', fontSize:'26px', color:'var(--t1)', textAlign:'center', marginBottom:'6px', letterSpacing:'-0.5px' },
  sub: { fontSize:'14px', color:'var(--t2)', textAlign:'center', marginBottom:'28px' },
  form: { display:'flex', flexDirection:'column', gap:'16px' },
  field: { display:'flex', flexDirection:'column', gap:'6px' },
  label: { fontSize:'12px', color:'var(--t2)', fontFamily:'var(--f-mono)', letterSpacing:'0.05em' },
  input: { background:'var(--bg)', border:'1px solid var(--border2)', borderRadius:'var(--r-md)', color:'var(--t1)', fontSize:'15px', padding:'11px 14px', fontFamily:'var(--f-ui)', transition:'border-color 0.2s, box-shadow 0.2s', width:'100%' },
  error: { background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--r-md)', color:'var(--red)', fontSize:'13px', padding:'10px 14px', fontFamily:'var(--f-ui)' },
  submitBtn: { background:'var(--blue)', border:'none', borderRadius:'var(--r-md)', color:'var(--bg)', fontSize:'15px', fontWeight:'700', padding:'13px', cursor:'none', fontFamily:'var(--f-ui)', marginTop:'4px', boxShadow:'0 0 20px var(--blue-glow)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', letterSpacing:'0.02em' },
  spinner: { width:'16px', height:'16px', border:'2px solid rgba(0,0,0,0.2)', borderTopColor:'var(--bg)', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' },
  switchRow: { textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--t2)', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' },
  switchBtn: { background:'none', border:'none', color:'var(--blue)', fontSize:'13px', cursor:'none', fontFamily:'var(--f-ui)', fontWeight:'600', textDecoration:'underline', textUnderlineOffset:'3px' },
};