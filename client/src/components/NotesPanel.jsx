import React, { useState } from 'react';

const DIFFICULTY_COLORS = {
  Beginner:     { bg: 'rgba(131,193,103,0.12)', border: '#83C167', text: '#83C167' },
  Intermediate: { bg: 'rgba(240,192,64,0.12)',  border: '#f0c040', text: '#f0c040' },
  Advanced:     { bg: 'rgba(252,98,85,0.12)',   border: '#FC6255', text: '#FC6255' },
};

export default function NotesPanel({ notes }) {
  const [expanded, setExpanded] = useState(true);

  if (!notes) return null;

  const diff = DIFFICULTY_COLORS[notes.difficulty] || DIFFICULTY_COLORS.Intermediate;

  return (
    <div style={styles.wrapper}>
      {/* Header — click to collapse */}
      <button style={styles.header} onClick={() => setExpanded(e => !e)}>
        <span style={styles.headerIcon}>📝</span>
        <span style={styles.headerTitle}>Explanatory Notes</span>
        <div style={styles.headerMeta}>
          {notes.topic && <span style={styles.topicTag}>{notes.topic}</span>}
          {notes.difficulty && (
            <span style={{ ...styles.diffTag, background: diff.bg, borderColor: diff.border, color: diff.text }}>
              {notes.difficulty}
            </span>
          )}
        </div>
        <span style={{ ...styles.chevron, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      {/* Collapsible body */}
      {expanded && (
        <div style={styles.body}>
          {/* Summary */}
          {notes.summary && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Summary</div>
              <p style={styles.summaryText}>{notes.summary}</p>
            </div>
          )}

          {/* Key intuition */}
          {notes.intuition && (
            <div style={styles.intuitionBox}>
              <span style={styles.intuitionIcon}>💡</span>
              <p style={styles.intuitionText}>{notes.intuition}</p>
            </div>
          )}

          {/* Main formula */}
          {notes.formula && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Key Formula</div>
              <div style={styles.formulaBox}>
                {/* Render LaTeX-like formula in a readable way */}
                <code style={styles.formulaText}>
                  {notes.formula
                    .replace(/\\forall/g, '∀')
                    .replace(/\\exists/g, '∃')
                    .replace(/\\epsilon/g, 'ε')
                    .replace(/\\delta/g, 'δ')
                    .replace(/\\alpha/g, 'α')
                    .replace(/\\beta/g, 'β')
                    .replace(/\\gamma/g, 'γ')
                    .replace(/\\theta/g, 'θ')
                    .replace(/\\lambda/g, 'λ')
                    .replace(/\\mu/g, 'μ')
                    .replace(/\\sigma/g, 'σ')
                    .replace(/\\omega/g, 'ω')
                    .replace(/\\Omega/g, 'Ω')
                    .replace(/\\pi/g, 'π')
                    .replace(/\\infty/g, '∞')
                    .replace(/\\sum/g, '∑')
                    .replace(/\\prod/g, '∏')
                    .replace(/\\int/g, '∫')
                    .replace(/\\partial/g, '∂')
                    .replace(/\\nabla/g, '∇')
                    .replace(/\\cdot/g, '·')
                    .replace(/\\times/g, '×')
                    .replace(/\\div/g, '÷')
                    .replace(/\\pm/g, '±')
                    .replace(/\\leq/g, '≤')
                    .replace(/\\geq/g, '≥')
                    .replace(/\\neq/g, '≠')
                    .replace(/\\approx/g, '≈')
                    .replace(/\\equiv/g, '≡')
                    .replace(/\\in/g, '∈')
                    .replace(/\\notin/g, '∉')
                    .replace(/\\subset/g, '⊂')
                    .replace(/\\cup/g, '∪')
                    .replace(/\\cap/g, '∩')
                    .replace(/\\implies/g, '⟹')
                    .replace(/\\iff/g, '⟺')
                    .replace(/\\to/g, '→')
                    .replace(/\\rightarrow/g, '→')
                    .replace(/\\leftarrow/g, '←')
                    .replace(/\\lim/g, 'lim')
                    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
                    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
                    .replace(/\^{([^}]+)}/g, '^$1')
                    .replace(/_{([^}]+)}/g, '_$1')
                    .replace(/\\text\{([^}]+)\}/g, '$1')
                    .replace(/\\mathbb\{([^}]+)\}/g, '$1')
                    .replace(/\\left/g, '').replace(/\\right/g, '')
                    .replace(/[{}]/g, '')
                    .trim()
                  }
                </code>
              </div>
            </div>
          )}

          {/* Key points */}
          {notes.keyPoints && notes.keyPoints.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Key Points</div>
              <ul style={styles.pointsList}>
                {notes.keyPoints.map((pt, i) => (
                  <li key={i} style={styles.pointItem}>
                    <span style={styles.pointBullet}>→</span>
                    <span style={styles.pointText}>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: '900px',
    background: '#0d1420',
    border: '1px solid #1e2d42',
    borderRadius: '12px',
    overflow: 'hidden',
    animation: 'fadeUp 0.4s 0.2s ease both',
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderBottom: '1px solid #1e2d42',
    textAlign: 'left',
  },
  headerIcon: { fontSize: '15px', flexShrink: 0 },
  headerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#c8d4e0',
    fontFamily: 'Instrument Sans, sans-serif',
    flexShrink: 0,
  },
  headerMeta: {
    flex: 1,
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  topicTag: {
    fontSize: '11px',
    color: '#58C4DD',
    background: 'rgba(88,196,221,0.1)',
    border: '1px solid rgba(88,196,221,0.25)',
    borderRadius: '20px',
    padding: '2px 9px',
    fontFamily: 'JetBrains Mono, monospace',
  },
  diffTag: {
    fontSize: '11px',
    borderRadius: '20px',
    padding: '2px 9px',
    border: '1px solid',
    fontFamily: 'JetBrains Mono, monospace',
  },
  chevron: {
    color: '#445566',
    fontSize: '16px',
    transition: 'transform 0.2s ease',
    flexShrink: 0,
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  section: {},
  sectionLabel: {
    fontSize: '10px',
    color: '#58C4DD',
    fontFamily: 'JetBrains Mono, monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '8px',
  },
  summaryText: {
    fontSize: '14px',
    color: '#c8d4e0',
    lineHeight: 1.7,
    margin: 0,
    fontFamily: 'Instrument Sans, sans-serif',
  },
  intuitionBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: 'rgba(240,192,64,0.06)',
    border: '1px solid rgba(240,192,64,0.2)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  intuitionIcon: { fontSize: '16px', flexShrink: 0, marginTop: '1px' },
  intuitionText: {
    fontSize: '14px',
    color: '#f0c040',
    lineHeight: 1.6,
    margin: 0,
    fontStyle: 'italic',
    fontFamily: 'Instrument Sans, sans-serif',
  },
  formulaBox: {
    background: '#080c14',
    border: '1px solid #1e2d42',
    borderRadius: '8px',
    padding: '12px 16px',
    overflowX: 'auto',
  },
  formulaText: {
    fontSize: '15px',
    color: '#83C167',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.03em',
  },
  pointsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  pointItem: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  },
  pointBullet: {
    color: '#58C4DD',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '13px',
    flexShrink: 0,
    marginTop: '2px',
  },
  pointText: {
    fontSize: '14px',
    color: '#8899aa',
    lineHeight: 1.6,
    fontFamily: 'Instrument Sans, sans-serif',
  },
};