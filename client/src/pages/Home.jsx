import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

// ── 3D Hero Canvas ──────────────────────────────────────────────────────────
function HeroCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const W = el.clientWidth, H = el.clientHeight;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
    camera.position.z = 22;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Central torusknot — the hero object
    const heroGeo = new THREE.TorusKnotGeometry(4, 0.9, 200, 20, 3, 5);
    const heroMat = new THREE.MeshBasicMaterial({ color: 0x58C4DD, wireframe: true, opacity: 0.35, transparent: true });
    const hero    = new THREE.Mesh(heroGeo, heroMat);
    scene.add(hero);

    // Outer orbit ring
    const ringGeo = new THREE.TorusGeometry(8, 0.04, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf0c040, opacity: 0.25, transparent: true });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Orbiting dots
    const orbitDots = [];
    for (let i = 0; i < 8; i++) {
      const g = new THREE.SphereGeometry(0.12, 8, 8);
      const m = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x58C4DD : 0xf0c040 });
      const d = new THREE.Mesh(g, m);
      d.userData.angle = (i / 8) * Math.PI * 2;
      d.userData.speed = 0.008 + i * 0.001;
      scene.add(d);
      orbitDots.push(d);
    }

    // Icosahedron halo
    const icoGeo = new THREE.IcosahedronGeometry(10, 1);
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, opacity: 0.04, transparent: true });
    scene.add(new THREE.Mesh(icoGeo, icoMat));

    let mx = 0, my = 0;
    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 0.4;
      my = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMove);

    let raf;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      hero.rotation.x += 0.004;
      hero.rotation.y += 0.006;
      ring.rotation.z += 0.003;

      orbitDots.forEach(d => {
        d.userData.angle += d.userData.speed;
        d.position.x = Math.cos(d.userData.angle) * 8;
        d.position.z = Math.sin(d.userData.angle) * 8 * Math.cos(Math.PI / 3);
        d.position.y = Math.sin(d.userData.angle) * 8 * Math.sin(Math.PI / 3);
      });

      camera.position.x += (mx * 4 - camera.position.x) * 0.04;
      camera.position.y += (-my * 3 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} style={{ width:'100%', height:'100%', position:'absolute', inset:0 }} />;
}

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = () => {
          start += to / 60;
          if (start < to) { setVal(Math.floor(start)); requestAnimationFrame(step); }
          else setVal(to);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const FEATURES = [
  { icon: '🧠', title: 'Gemini AI', body: 'Re-engineers your question with the intuition of 3Blue1Brown — building visual stories, not just solving problems.' },
  { icon: '🎬', title: 'Manim Renderer', body: 'Every frame rendered by Manim Community Edition — the same engine that powers the most beautiful math animations on YouTube.' },
  { icon: '🎓', title: '5 Audience Levels', body: 'From age-12 analogies to graduate rigor. One concept, five perspectives — all visually stunning.' },
  { icon: '💎', title: '3 Quality Modes', body: 'Fast 480p previews or cinematic 1080p HD — your render, your choice.' },
  { icon: '📝', title: 'Study Notes', body: 'Auto-generated explanatory notes with key formulas, intuitions and takeaways after every video.' },
  { icon: '🎵', title: 'Ambient Score', body: 'Every visualization ships with a soft mathematical ambient soundtrack — focus mode built-in.' },
];

const TOPICS = ['Fourier Transform','Eigenvalues','Gradient Descent',"Euler's Identity",'Stokes Theorem','Taylor Series','Bayes Theorem','Complex Numbers','Laplace Transform','Gaussian Curvature'];

export default function Home() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={s.page}>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <div style={s.navLogoMark}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#58C4DD" strokeWidth="1.5"/>
              <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="none" stroke="#f0c040" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="2" fill="#58C4DD"/>
            </svg>
          </div>
          <span style={s.navBrand}>MathViz</span>
        </div>
        <button style={s.navCta} onClick={() => navigate('/app')}>
          Open App <span style={{ opacity: 0.6 }}>→</span>
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={s.hero}>
        {/* 3D canvas behind text */}
        <div style={s.heroCanvas}><HeroCanvas /></div>

        {/* Glowing orb behind */}
        <div style={s.heroOrb} />

        <div style={s.heroContent}>
          <div style={s.heroBadge}>
            <span style={{ color:'#4ade80' }}>●</span>
            &nbsp;Powered by Gemini AI + Manim Community Edition
          </div>

          <h1 style={s.heroTitle}>
            See mathematics.<br />
            <span style={s.heroTitleAccent}>Don't just read it.</span>
          </h1>

          <p style={s.heroSub}>
            Type any math question. Get a beautiful, animated video explanation
            crafted in the style of 3Blue1Brown — generated entirely by AI.
          </p>

          <div style={s.heroBtns}>
            <button style={s.heroPrimary} onClick={() => navigate('/app')}>
              Start Visualizing
            </button>
            <button style={s.heroSecondary} onClick={() => document.getElementById('features').scrollIntoView({ behavior:'smooth' })}>
              See How It Works
            </button>
          </div>

          {/* Topic pills */}
          <div style={s.topicRow}>
            {TOPICS.map((t, i) => (
              <span key={i} style={{ ...s.topicPill, animationDelay: `${i * 0.07}s` }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={s.stats}>
        {[
          { n: 5,   suf: '',  label: 'Audience levels' },
          { n: 3,   suf: '',  label: 'Video qualities' },
          { n: 100, suf: '+', label: 'Math topics ready' },
          { n: 60,  suf: 's', label: 'Fastest render' },
        ].map((st, i) => (
          <div key={i} style={s.statItem}>
            <div style={s.statNum}><Counter to={st.n} suffix={st.suf} /></div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={s.section}>
        <div style={s.sectionEyebrow}>What makes it special</div>
        <h2 style={s.sectionTitle}>Built for real understanding</h2>
        <div style={s.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ ...s.featureCard, ...(hovered === i ? s.featureCardHover : {}) }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureBody}>{f.body}</div>
              <div style={{ ...s.featureGlow, opacity: hovered === i ? 1 : 0 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...s.section, maxWidth:'700px' }}>
        <div style={s.sectionEyebrow}>The pipeline</div>
        <h2 style={s.sectionTitle}>From question to video</h2>
        <div style={s.steps}>
          {[
            { n:'01', title:'Ask a question', body:'Type any math concept in plain language. No special syntax needed.' },
            { n:'02', title:'AI understands', body:'Gemini re-engineers your prompt with visual storytelling and deep intuition.' },
            { n:'03', title:'Code is written', body:'A complete Manim Python animation is generated and syntax-validated.' },
            { n:'04', title:'Video renders', body:'Manim renders every frame. Background music is mixed in. Done.' },
          ].map((st, i) => (
            <div key={i} style={s.step}>
              <div style={s.stepNum}>{st.n}</div>
              <div style={s.stepContent}>
                <div style={s.stepTitle}>{st.title}</div>
                <div style={s.stepBody}>{st.body}</div>
              </div>
              {i < 3 && <div style={s.stepLine} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.cta}>
        <div style={s.ctaGlow} />
        <h2 style={s.ctaTitle}>Ready to see math differently?</h2>
        <p style={s.ctaSub}>No setup. No formulas to memorize. Just ask.</p>
        <button style={s.heroPrimary} onClick={() => navigate('/app')}>
          Open MathViz →
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <span style={{ fontFamily:'var(--f-mono)', fontSize:'11px', color:'var(--t3)' }}>
          Built with React · Node.js · MongoDB · Gemini AI · Manim
        </span>
      </footer>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'var(--bg)', overflowX:'hidden', position:'relative' },

  // Nav
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 48px', position:'sticky', top:0, zIndex:10, background:'rgba(4,8,15,0.8)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' },
  navLogo: { display:'flex', alignItems:'center', gap:'10px' },
  navLogoMark: { display:'flex' },
  navBrand: { fontFamily:'var(--f-display)', fontSize:'20px', color:'var(--t1)', letterSpacing:'-0.3px' },
  navCta: { background:'var(--blue)', border:'none', borderRadius:'var(--r-md)', color:'var(--bg)', fontSize:'14px', fontWeight:'700', padding:'9px 22px', cursor:'none', fontFamily:'var(--f-ui)', letterSpacing:'0.02em', transition:'opacity 0.2s', boxShadow:'0 0 20px var(--blue-glow)' },

  // Hero
  hero: { position:'relative', minHeight:'92vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  heroCanvas: { position:'absolute', inset:0, zIndex:0 },
  heroOrb: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(88,196,221,0.06) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:1 },
  heroContent: { position:'relative', zIndex:2, textAlign:'center', padding:'80px 24px', maxWidth:'780px', animation:'fadeUp 0.8s ease forwards' },
  heroBadge: { display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'12px', color:'var(--t2)', fontFamily:'var(--f-mono)', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:'20px', padding:'5px 14px', marginBottom:'28px' },
  heroTitle: { fontFamily:'var(--f-display)', fontSize:'clamp(42px,6vw,80px)', lineHeight:1.08, color:'var(--t1)', letterSpacing:'-2px', marginBottom:'24px' },
  heroTitleAccent: { background:'linear-gradient(135deg, #58C4DD 0%, #a78bfa 50%, #f0c040 100%)', backgroundClip:'text', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200%', animation:'shimmer 4s linear infinite' },
  heroSub: { fontSize:'18px', color:'var(--t2)', lineHeight:1.75, maxWidth:'520px', margin:'0 auto 36px', fontFamily:'var(--f-ui)' },
  heroBtns: { display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap', marginBottom:'36px' },
  heroPrimary: { background:'var(--blue)', border:'none', borderRadius:'var(--r-md)', color:'var(--bg)', fontSize:'16px', fontWeight:'700', padding:'14px 36px', cursor:'none', fontFamily:'var(--f-ui)', boxShadow:'0 0 30px var(--blue-glow)', transition:'transform 0.15s', letterSpacing:'0.02em' },
  heroSecondary: { background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--r-md)', color:'var(--t2)', fontSize:'16px', padding:'14px 28px', cursor:'none', fontFamily:'var(--f-ui)', transition:'all 0.2s' },
  topicRow: { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'8px', maxWidth:'640px', margin:'0 auto' },
  topicPill: { fontSize:'11px', color:'var(--t3)', fontFamily:'var(--f-mono)', background:'rgba(255,255,255,0.02)', border:'1px solid var(--border)', borderRadius:'20px', padding:'4px 12px', animation:'fadeUp 0.5s ease both' },

  // Stats
  stats: { display:'flex', justifyContent:'center', gap:'0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--bg2)', position:'relative', zIndex:1 },
  statItem: { flex:1, maxWidth:'200px', padding:'32px 24px', textAlign:'center', borderRight:'1px solid var(--border)' },
  statNum: { fontFamily:'var(--f-display)', fontSize:'42px', color:'var(--blue)', letterSpacing:'-1px', lineHeight:1 },
  statLabel: { fontSize:'12px', color:'var(--t3)', fontFamily:'var(--f-mono)', marginTop:'6px', textTransform:'uppercase', letterSpacing:'0.08em' },

  // Sections
  section: { maxWidth:'1100px', margin:'0 auto', padding:'100px 48px' },
  sectionEyebrow: { fontSize:'11px', color:'var(--blue)', fontFamily:'var(--f-mono)', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:'12px' },
  sectionTitle: { fontFamily:'var(--f-display)', fontSize:'clamp(28px,3.5vw,46px)', color:'var(--t1)', letterSpacing:'-1px', marginBottom:'56px', maxWidth:'500px' },

  // Feature grid
  featureGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' },
  featureCard: { background:'var(--bg2)', padding:'32px', position:'relative', overflow:'hidden', transition:'background 0.2s' },
  featureCardHover: { background:'var(--bg3)' },
  featureIcon: { fontSize:'28px', marginBottom:'16px' },
  featureTitle: { fontFamily:'var(--f-display)', fontSize:'18px', color:'var(--t1)', marginBottom:'10px', letterSpacing:'-0.3px' },
  featureBody: { fontSize:'14px', color:'var(--t2)', lineHeight:1.7 },
  featureGlow: { position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg, var(--blue), var(--purple))', transition:'opacity 0.2s' },

  // Steps
  steps: { display:'flex', flexDirection:'column', gap:'0' },
  step: { display:'flex', gap:'24px', alignItems:'flex-start', position:'relative', paddingBottom:'40px' },
  stepNum: { fontFamily:'var(--f-mono)', fontSize:'11px', color:'var(--blue)', letterSpacing:'0.1em', background:'var(--blue-dim)', border:'1px solid rgba(88,196,221,0.2)', borderRadius:'6px', padding:'4px 8px', flexShrink:0, marginTop:'3px' },
  stepContent: {},
  stepTitle: { fontFamily:'var(--f-display)', fontSize:'20px', color:'var(--t1)', marginBottom:'6px', letterSpacing:'-0.3px' },
  stepBody: { fontSize:'14px', color:'var(--t2)', lineHeight:1.7 },
  stepLine: { position:'absolute', left:'27px', top:'44px', bottom:0, width:'1px', background:'linear-gradient(var(--border2), transparent)' },

  // CTA
  cta: { position:'relative', padding:'120px 48px', textAlign:'center', overflow:'hidden', borderTop:'1px solid var(--border)' },
  ctaGlow: { position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'500px', height:'300px', background:'radial-gradient(ellipse, rgba(88,196,221,0.08) 0%, transparent 70%)', pointerEvents:'none' },
  ctaTitle: { fontFamily:'var(--f-display)', fontSize:'clamp(32px,4vw,56px)', color:'var(--t1)', letterSpacing:'-1.5px', marginBottom:'16px', position:'relative', zIndex:1 },
  ctaSub: { fontSize:'17px', color:'var(--t2)', marginBottom:'36px', position:'relative', zIndex:1 },

  // Footer
  footer: { borderTop:'1px solid var(--border)', padding:'24px 48px', textAlign:'center' },
};