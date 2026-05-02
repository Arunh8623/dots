import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getVideoUrl } from '../services/api';

export default function VideoPlayer({ videoUrl, prompt }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fullUrl = getVideoUrl(videoUrl);

  // Reload when URL changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setPlaying(false); setProgress(0); setCurrentTime(0); setDuration(0);
    }
  }, [videoUrl]);

  // Sync volume
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);

  // Fullscreen change listener
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play().then(() => setPlaying(true)).catch(() => {}); }
  }, [playing]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setProgress(pct * 100);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const controlsVisible = showControls || !playing;

  return (
    <div style={styles.wrapper}>
      {/* Title bar */}
      <div style={styles.titleBar}>
        <div style={styles.titleDot} />
        <div style={styles.titleText}>{prompt}</div>
        <a href={fullUrl} download="math-visualization.mp4" style={styles.downloadBtn}>
          ↓ Download
        </a>
      </div>

      {/* Video container — ref used for fullscreen */}
      <div
        ref={containerRef}
        style={styles.videoContainer}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (playing) setShowControls(false); }}
      >
        <video
          ref={videoRef}
          src={fullUrl}
          style={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => { setPlaying(false); setShowControls(true); }}
          onClick={togglePlay}
        />

        {/* Big play button overlay */}
        {!playing && (
          <div style={styles.playOverlay} onClick={togglePlay}>
            <div style={styles.playBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#080c14">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div style={{ ...styles.controls, opacity: controlsVisible ? 1 : 0 }}>
          {/* Progress bar */}
          <div style={styles.progressTrack} onClick={handleSeek}>
            <div style={styles.progressBg}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>

          {/* Buttons row */}
          <div style={styles.btnsRow}>
            {/* Play/Pause */}
            <button style={styles.ctrlBtn} onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
              {playing
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
              }
            </button>

            {/* Volume */}
            <button style={styles.ctrlBtn} onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
              {muted
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54,8.46a5,5,0,0,1,0,7.07" stroke="white" strokeWidth="2" fill="none"/><path d="M19.07,4.93a10,10,0,0,1,0,14.14" stroke="white" strokeWidth="2" fill="none"/></svg>
              }
            </button>

            <input
              type="range" min="0" max="1" step="0.02"
              value={muted ? 0 : volume}
              onChange={e => { setVolume(+e.target.value); setMuted(false); if(videoRef.current) videoRef.current.volume = +e.target.value; }}
              style={styles.volSlider}
            />

            {/* Time */}
            <span style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Fullscreen */}
            <button style={styles.ctrlBtn} onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="8,3 3,3 3,8"/><polyline points="21,8 21,3 16,3"/>
                    <polyline points="3,16 3,21 8,21"/><polyline points="16,21 21,21 21,16"/>
                  </svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="15,3 21,3 21,9"/><polyline points="9,21 3,21 3,15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
              }
            </button>
          </div>
        </div>

        {/* Fullscreen styles injected so controls show on top inside fullscreen */}
        <style>{`
          div:-webkit-full-screen { width: 100%; height: 100%; background: #000; }
          div:-moz-full-screen    { width: 100%; height: 100%; background: #000; }
          div:fullscreen          { width: 100%; height: 100%; background: #000; }
          div:fullscreen video    { width: 100%; height: 100%; object-fit: contain; }
        `}</style>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={{ color: '#83C167' }}>●</span>&nbsp;Manim + Gemini AI
        &nbsp;·&nbsp;
        <span style={{ color: '#58C4DD' }}>♪ Background music</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    maxWidth: '900px',
    animation: 'fadeUp 0.5s ease forwards',
  },
  titleBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', background: '#111827',
    borderRadius: '12px 12px 0 0', borderBottom: '1px solid #1e2d42',
  },
  titleDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#58C4DD', flexShrink: 0,
    boxShadow: '0 0 8px rgba(88,196,221,0.5)',
  },
  titleText: {
    flex: 1, fontSize: '12px', color: '#8899aa',
    fontFamily: 'JetBrains Mono, monospace',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  downloadBtn: {
    fontSize: '12px', color: '#58C4DD', textDecoration: 'none',
    padding: '4px 10px', border: '1px solid #2a4060', borderRadius: '6px',
    fontFamily: 'Instrument Sans, sans-serif', flexShrink: 0,
  },
  videoContainer: {
    position: 'relative',
    background: '#000',
    width: '100%',
    aspectRatio: '16/9',
    maxHeight: 'calc(100vh - 300px)',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  video: {
    width: '100%', height: '100%',
    display: 'block', objectFit: 'contain',
  },
  playOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.2)',
  },
  playBtn: {
    width: '64px', height: '64px', background: '#58C4DD',
    borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 30px rgba(88,196,221,0.5)',
    paddingLeft: '4px',
  },
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
    padding: '32px 12px 10px',
    transition: 'opacity 0.3s ease',
    zIndex: 2,
  },
  progressTrack: {
    cursor: 'pointer', padding: '5px 0', marginBottom: '8px',
  },
  progressBg: {
    height: '4px', background: 'rgba(255,255,255,0.25)',
    borderRadius: '2px', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: '#58C4DD',
    borderRadius: '2px', transition: 'width 0.1s linear',
  },
  btnsRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  ctrlBtn: {
    background: 'none', border: 'none', color: 'white',
    cursor: 'pointer', padding: '5px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: 0.9, borderRadius: '4px',
    transition: 'opacity 0.15s',
  },
  volSlider: {
    width: '70px', accentColor: '#58C4DD', cursor: 'pointer',
  },
  timeText: {
    fontSize: '12px', color: 'rgba(255,255,255,0.8)',
    fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  footer: {
    padding: '8px 14px', background: '#111827',
    borderRadius: '0 0 12px 12px', borderTop: '1px solid #1e2d42',
    fontSize: '11px', color: '#445566',
    fontFamily: 'JetBrains Mono, monospace',
  },
};