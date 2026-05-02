import { useNavigate } from 'react-router-dom';
import MathBackground from '../components/MathBackground';
import theme from '../styles/theme';

const { colors, fonts, fontSizes } = theme;

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Prompt Engineering',
    desc: 'Gemini AI deeply analyzes your question, adds mathematical intuition, and builds a rich visual explanation brief before writing a single line of code.',
  },
  {
    icon: '🎬',
    title: '3Blue1Brown-style Animations',
    desc: 'Manim Community Edition renders every frame with smooth, beautiful animations — the same engine used by the world\'s most loved math YouTube channel.',
  },
  {
    icon: '🎵',
    title: 'Ambient Soundtrack',
    desc: 'Every video is paired with a soft ambient background score, creating a calm, focused atmosphere perfect for deep mathematical thinking.',
  },
  {
    icon: '🔁',
    title: 'Auto-Retry & Self-Fix',
    desc: 'If the generated Manim code has errors, Gemini automatically reads the error and corrects the code — retrying up to 3 times without you doing anything.',
  },
  {
    icon: '📚',
    title: 'Full History',
    desc: 'Every visualization you generate is saved to MongoDB and accessible from the sidebar — rewatch any past explanation any time.',
  },
  {
    icon: '⬇️',
    title: 'Download Anytime',
    desc: 'Every generated MP4 is yours to keep. Download it with one click and share it with classmates, students, or the world.',
  },
];

const TOPICS = [
  'Fourier Transform', 'Eigenvalues', 'Gradient Descent',
  'Euler\'s Identity', 'Limits & Continuity', 'Stokes\' Theorem',
  'Bayes\' Theorem', 'Complex Numbers', 'Taylor Series',
  'Gaussian Curvature', 'Laplace Transform', 'Matrix Multiplication',
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <MathBackground />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke={colors.blue} strokeWidth="1.5" />
            <path d="M8 14 Q14 6 20 14 Q14 22 8 14Z" fill="none" stroke={colors.yellow} strokeWidth="1.5" />
            <circle cx="14" cy="14" r="2" fill={colors.blue} />
          </svg>
          <span style={styles.navBrand}>Dots</span>
        </div>
        <button style={styles.navBtn} onClick={() => navigate('/app')}>
          Open App →
        </button>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          <span style={{ color: colors.green }}>●</span>
          &nbsp; Powered by Gemini AI + Manim Community Edition
        </div>

        <h1 style={styles.heroTitle}>
          See mathematics,<br />
          <span style={{ color: colors.blue }}>don't just read it.</span>
        </h1>

        <p style={styles.heroSub}>
          Type any math question. Get a beautiful, animated video explanation
          in the style of 3Blue1Brown — generated entirely by AI.
        </p>

        <div style={styles.heroBtns}>
          <button style={styles.primaryBtn} onClick={() => navigate('/app')}>
            Start Visualizing
          </button>
          <button style={styles.ghostBtn} onClick={() => {
            document.getElementById('how').scrollIntoView({ behavior: 'smooth' });
          }}>
            How it works ↓
          </button>
        </div>

        {/* Floating topic pills */}
        <div style={styles.topicCloud}>
          {TOPICS.map((t, i) => (
            <span key={i} style={{
              ...styles.topicPill,
              animationDelay: `${i * 0.08}s`,
              borderColor: i % 3 === 0 ? colors.borderBright : colors.border,
            }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.section}>
        <div style={styles.sectionLabel}>How it works</div>
        <h2 style={styles.sectionTitle}>From question to video in minutes</h2>

        <div style={styles.pipeline}>
          {[
            { step: '01', icon: '💬', title: 'Ask a question', desc: 'Type any math concept — from basic calculus to multivariate analysis.' },
            { step: '02', icon: '🧠', title: 'AI understands', desc: 'Gemini re-engineers your prompt with deep mathematical intuition and visual storytelling.' },
            { step: '03', icon: '✍️', title: 'Code is written', desc: 'Gemini writes complete, beautiful Manim Python animation code from scratch.' },
            { step: '04', icon: '🎬', title: 'Video renders', desc: 'Manim renders every frame. FFmpeg adds ambient music. Your video is ready.' },
          ].map((s, i) => (
            <div key={i} style={styles.pipelineStep}>
              <div style={styles.stepNum}>{s.step}</div>
              <div style={styles.stepIcon}>{s.icon}</div>
              <div style={styles.stepTitle}>{s.title}</div>
              <div style={styles.stepDesc}>{s.desc}</div>
              {i < 3 && <div style={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <div style={styles.sectionLabel}>Features</div>
        <h2 style={styles.sectionTitle}>Everything you need to understand math visually</h2>
        <div style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} style={styles.featureCard} className="feature-card">
              <div style={styles.featureIcon}>{f.icon}</div>
              <div style={styles.featureTitle}>{f.title}</div>
              <div style={styles.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Ready to see math differently?</h2>
        <p style={styles.ctaSub}>No setup needed. Just type and watch.</p>
        <button style={styles.primaryBtn} onClick={() => navigate('/app')}>
          Open Dots →
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={{ fontFamily: fonts.mono, fontSize: fontSizes.xs, color: colors.textMuted }}>
          Built with React · Node.js · MongoDB · Gemini AI · Manim
        </span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .feature-card { transition: all 0.2s ease; }
        .feature-card:hover {
          background: ${colors.bgCardHover} !important;
          border-color: ${colors.borderBright} !important;
          transform: translateY(-3px);
        }
        #how { scroll-margin-top: 80px; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
  },

  // Nav
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 48px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    background: 'rgba(8,12,20,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${colors.border}`,
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navBrand: {
    fontFamily: fonts.display,
    fontSize: '20px',
    color: colors.textPrimary,
  },
  navBtn: {
    background: colors.blue,
    border: 'none',
    borderRadius: '8px',
    color: colors.bgPrimary,
    fontSize: fontSizes.base,
    fontWeight: '600',
    padding: '8px 20px',
    cursor: 'pointer',
    fontFamily: fonts.body,
    transition: 'opacity 0.2s',
  },

  // Hero
  hero: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '100px 24px 80px',
    gap: '24px',
  },
  heroBadge: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '5px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 'clamp(40px, 7vw, 72px)',
    lineHeight: 1.1,
    color: colors.textPrimary,
    letterSpacing: '-1.5px',
    maxWidth: '780px',
    animation: 'fadeUp 0.7s ease forwards',
  },
  heroSub: {
    fontSize: '18px',
    color: colors.textSecondary,
    maxWidth: '520px',
    lineHeight: 1.7,
    animation: 'fadeUp 0.7s 0.1s ease both',
  },
  heroBtns: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'fadeUp 0.7s 0.2s ease both',
  },
  primaryBtn: {
    background: colors.blue,
    border: 'none',
    borderRadius: '10px',
    color: colors.bgPrimary,
    fontSize: '16px',
    fontWeight: '600',
    padding: '14px 32px',
    cursor: 'pointer',
    fontFamily: fonts.body,
    transition: 'opacity 0.2s, transform 0.15s',
    boxShadow: `0 0 30px ${colors.blueGlow}`,
  },
  ghostBtn: {
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    color: colors.textSecondary,
    fontSize: '16px',
    padding: '14px 32px',
    cursor: 'pointer',
    fontFamily: fonts.body,
    transition: 'border-color 0.2s, color 0.2s',
  },
  topicCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
    maxWidth: '700px',
    marginTop: '16px',
    animation: 'fadeUp 0.7s 0.3s ease both',
  },
  topicPill: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    fontFamily: fonts.mono,
    background: colors.bgCard,
    border: `1px solid`,
    borderRadius: '20px',
    padding: '4px 12px',
  },

  // Sections
  section: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 48px',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  },
  sectionLabel: {
    fontSize: fontSizes.xs,
    color: colors.blue,
    fontFamily: fonts.mono,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 'clamp(28px, 4vw, 42px)',
    color: colors.textPrimary,
    letterSpacing: '-0.5px',
    marginBottom: '48px',
    maxWidth: '560px',
  },

  // Pipeline
  pipeline: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    flexWrap: 'wrap',
    position: 'relative',
  },
  pipelineStep: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '24px',
    position: 'relative',
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    margin: '4px',
  },
  stepNum: {
    fontSize: fontSizes.xs,
    color: colors.blue,
    fontFamily: fonts.mono,
    marginBottom: '8px',
    letterSpacing: '0.1em',
  },
  stepIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: '18px',
    color: colors.textPrimary,
    marginBottom: '8px',
  },
  stepDesc: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 1.6,
  },
  stepArrow: {
    position: 'absolute',
    right: '-18px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.borderBright,
    fontSize: '20px',
    zIndex: 2,
  },

  // Features
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  featureCard: {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '28px',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  featureTitle: {
    fontFamily: fonts.display,
    fontSize: '18px',
    color: colors.textPrimary,
    marginBottom: '8px',
  },
  featureDesc: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 1.7,
  },

  // CTA
  cta: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '80px 24px',
    gap: '16px',
    borderTop: `1px solid ${colors.border}`,
  },
  ctaTitle: {
    fontFamily: fonts.display,
    fontSize: 'clamp(28px, 4vw, 48px)',
    color: colors.textPrimary,
    letterSpacing: '-0.5px',
  },
  ctaSub: {
    fontSize: '16px',
    color: colors.textSecondary,
    marginBottom: '8px',
  },

  // Footer
  footer: {
    borderTop: `1px solid ${colors.border}`,
    padding: '24px 48px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
};