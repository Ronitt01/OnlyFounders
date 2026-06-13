/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`relative select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
    >
      <defs>
        {/* Elite gold/amber linear gradient */}
        <linearGradient id="logo-gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        {/* Soft glowing white/zinc gradient for internal F */}
        <linearGradient id="logo-gradient-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#A1A1AA" />
        </linearGradient>
        {/* Premium ambient shadow for brand aura */}
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#D97706" floodOpacity="0.30" />
        </filter>
      </defs>

      {/* Decorative Outer Aura Glow */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#logo-gradient-gold)"
        strokeWidth="1.5"
        strokeOpacity="0.15"
        className="animate-pulse"
      />

      {/* Main Circumferenced Geometric Circle 'O' with custom styled breaks */}
      <path
        d="M 50 12 A 38 38 0 1 1 13.9 63.8"
        stroke="url(#logo-gradient-gold)"
        strokeWidth="7"
        strokeLinecap="round"
        filter="url(#logo-glow)"
      />

      {/* Interlocking Monogram Letter 'F' */}
      <path
        d="M44 32H64M44 47H56M44 32V68"
        stroke="url(#logo-gradient-silver)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small Glowing Catalyst Node (representing network connectivity) */}
      <circle cx="76.5" cy="65.5" r="5" fill="#FBBF24" className="animate-pulse" />
    </svg>
  );
}
