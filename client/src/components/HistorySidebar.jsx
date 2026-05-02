import React, { useState, useEffect } from 'react';
import { getHistory, deleteVisualization } from '../services/api';

export default function HistorySidebar({ onSelect, isOpen, onToggle }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error('History load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteVisualization(id);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    const diff = Date.now() - date;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          style={styles.overlay}
          onClick={onToggle}
        />
      )}

      <aside style={{ ...styles.sidebar, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        {/* Sidebar header */}
        <div style={styles.header}>
          <span style={styles.headerIcon}>📚</span>
          <span style={styles.headerTitle}>History</span>
          <button onClick={load} style={styles.iconBtn} title="Refresh">↻</button>
          <button onClick={onToggle} style={styles.iconBtn} title="Close">✕</button>
        </div>

        <div style={styles.list}>
          {loading && <div style={styles.empty}>Loading...</div>}
          {!loading && history.length === 0 && (
            <div style={styles.empty}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>∅</div>
              No visualizations yet.<br />Ask your first question!
            </div>
          )}
          {history.map(item => (
            <div key={item._id} style={styles.item} className="history-item" onClick={() => { onSelect(item); onToggle(); }}>
              <div style={styles.itemIcon}>∫</div>
              <div style={styles.itemContent}>
                <div style={styles.itemPrompt}>{item.originalPrompt}</div>
                <div style={styles.itemMeta}>{formatDate(item.createdAt)}</div>
              </div>
              <button
                style={styles.deleteBtn}
                onClick={(e) => handleDelete(e, item._id)}
                title="Delete"
                className="delete-btn"
              >✕</button>
            </div>
          ))}
        </div>
      </aside>

      <style>{`
        .history-item { transition: background 0.15s, border-color 0.15s; }
        .history-item:hover { background: #1a2332 !important; border-color: #2a4060 !important; }
        .history-item:hover .delete-btn { opacity: 1 !important; }
        .delete-btn { opacity: 0; transition: opacity 0.15s; }
      `}</style>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  sidebar: {
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    width: '260px',
    background: '#0d1420',
    borderRight: '1px solid #1e2d42',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
    transition: 'transform 0.25s ease',
    boxShadow: '4px 0 20px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16px',
    borderBottom: '1px solid #1e2d42',
    flexShrink: 0,
  },
  headerIcon: { fontSize: '16px' },
  headerTitle: {
    flex: 1,
    fontSize: '13px',
    fontWeight: '600',
    color: '#8899aa',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: 'Instrument Sans, sans-serif',
  },
  iconBtn: {
    background: 'none', border: 'none',
    color: '#445566', fontSize: '14px',
    cursor: 'pointer', padding: '2px 6px',
    borderRadius: '4px',
  },
  list: {
    flex: 1, overflowY: 'auto', padding: '8px',
  },
  empty: {
    textAlign: 'center', color: '#445566',
    fontSize: '13px', padding: '40px 16px', lineHeight: 1.6,
  },
  item: {
    display: 'flex', alignItems: 'flex-start',
    gap: '10px', padding: '10px 12px',
    borderRadius: '8px', cursor: 'pointer',
    border: '1px solid transparent',
    marginBottom: '4px', position: 'relative',
  },
  itemIcon: {
    fontSize: '18px', color: '#58C4DD',
    opacity: 0.6, flexShrink: 0, marginTop: '2px',
  },
  itemContent: { flex: 1, overflow: 'hidden', minWidth: 0 },
  itemPrompt: {
    fontSize: '13px', color: '#c8d4e0',
    overflow: 'hidden', textOverflow: 'ellipsis',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', lineHeight: 1.4, marginBottom: '4px',
  },
  itemMeta: {
    fontSize: '11px', color: '#445566',
    fontFamily: 'JetBrains Mono, monospace',
  },
  deleteBtn: {
    background: 'rgba(252,98,85,0.15)',
    border: '1px solid rgba(252,98,85,0.3)',
    borderRadius: '4px', color: '#FC6255',
    fontSize: '10px', cursor: 'pointer',
    padding: '2px 6px', flexShrink: 0,
    alignSelf: 'center',
  },
};