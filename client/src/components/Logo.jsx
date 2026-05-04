import React from 'react';

/**
 * dots Logo — a 3D isometric cube with math wave inside.
 * Blue-themed, dimensional, unique.
 */
export default function dotsLogo({ size = 36 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#7ee8f8"/>
          <stop offset="100%" stopColor="#38b6d0"/>
        </linearGradient>
        <linearGradient id="leftFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#1a7a92"/>
          <stop offset="100%" stopColor="#0d5066"/>
        </linearGradient>
        <linearGradient id="rightFace" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2aa4c0"/>
          <stop offset="100%" stopColor="#1a7a92"/>
        </linearGradient>
        <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f0c040" stopOpacity="0"/>
          <stop offset="50%"  stopColor="#f0c040"/>
          <stop offset="100%" stopColor="#f0c040" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ── 3D Isometric Cube ── */}
      {/* Top face */}
      <polygon
        points="30,4 54,17 30,30 6,17"
        fill="url(#topFace)"
        stroke="#7ee8f8"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />
      {/* Left face */}
      <polygon
        points="6,17 30,30 30,56 6,43"
        fill="url(#leftFace)"
        stroke="#2aa4c0"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      {/* Right face */}
      <polygon
        points="30,30 54,17 54,43 30,56"
        fill="url(#rightFace)"
        stroke="#2aa4c0"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />

      {/* ── Edge highlights (3D depth) ── */}
      <line x1="30" y1="4"  x2="30" y2="30" stroke="#9ef0ff" strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="6"  y1="17" x2="30" y2="30" stroke="#9ef0ff" strokeWidth="0.5" strokeOpacity="0.3"/>
      <line x1="54" y1="17" x2="30" y2="30" stroke="#9ef0ff" strokeWidth="0.5" strokeOpacity="0.3"/>

      {/* ── Sine wave on top face (the "math" element) ── */}
      {/* Projected onto isometric top face */}
      <path
        d="M14 17 Q18 12 22 17 Q26 22 30 17 Q34 12 38 17 Q42 22 46 17"
        fill="none"
        stroke="url(#glowLine)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* ── Glowing dot at peak ── */}
      <circle cx="30" cy="17" r="2.2" fill="#f0c040" opacity="0.95"/>
      <circle cx="30" cy="17" r="4"   fill="#f0c040" opacity="0.15"/>

      {/* ── Corner dots for dimension ── */}
      <circle cx="30" cy="4"  r="1.2" fill="#9ef0ff" opacity="0.8"/>
      <circle cx="6"  cy="17" r="1.2" fill="#58C4DD" opacity="0.6"/>
      <circle cx="54" cy="17" r="1.2" fill="#58C4DD" opacity="0.6"/>
      <circle cx="30" cy="30" r="1.5" fill="#58C4DD" opacity="0.8"/>
      <circle cx="6"  cy="43" r="1"   fill="#1a7a92" opacity="0.5"/>
      <circle cx="54" cy="43" r="1"   fill="#1a7a92" opacity="0.5"/>
      <circle cx="30" cy="56" r="1.2" fill="#1a7a92" opacity="0.6"/>
    </svg>
  );
}