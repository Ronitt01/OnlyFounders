/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BuilderPassport } from '../types';
import Logo from './Logo';
import { ShieldCheck, Cpu, Code, BarChart3, Users, Globe, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  builders: BuilderPassport[];
  onApplyClick: () => void;
  onRecruiterClick: () => void;
}

export default function LandingPage({ builders, onApplyClick, onRecruiterClick }: LandingPageProps) {
  // Take active verified builders for showcasing the standard ledger
  const preloadedVetted = builders.slice(0, 3);
  const [activeLedgerIndex, setActiveLedgerIndex] = useState(0);

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#050505] text-[#F5F5F7] flex flex-col items-center justify-between">
      {/* Background Graphic: Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none artistic-grid" />
      
      {/* Ambient delicate glow behind text */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-white/[0.02] blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-28 pb-16 flex-1 flex flex-col justify-center relative z-10">
        {/* Upper Logo / Title */}
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/60">Invite Only • 412 Verified This Week</span>
          </div>

          {/* Majestic Hero Emblem Logo */}
          <div className="flex justify-center py-4">
            <Logo size={108} className="hover:scale-110 duration-500" />
          </div>
          
          <h1 className="text-[44px] sm:text-[72px] lg:text-[88px] leading-[0.95] sm:leading-[0.9] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 max-w-4xl text-center">
            Where Founders<br />Find The<br />Top 1%
          </h1>

          <p className="max-w-2xl text-white/40 text-base sm:text-lg leading-relaxed font-light mt-6">
            An exclusive, high-trust network of proven founders, systems architects, and elite operators. Browse credentials in confidence and secure matches through verified proof of impact.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full justify-center">
            <button
              id="apply-for-membership-btn"
              onClick={onApplyClick}
              className="px-10 py-4 w-full sm:w-auto bg-white text-black font-semibold rounded-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hire-exceptional-talent-btn"
              onClick={onRecruiterClick}
              className="px-10 py-4 w-full sm:w-auto bg-transparent border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Hire Exceptional Talent
            </button>
          </div>
          
          {/* Quick Metrics from Artistic Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12 text-center w-full max-w-4xl border-t border-white/10 mt-16">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Verified Network</span>
              <span className="text-3xl font-light tracking-tighter">420 Only</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Ledger Capital</span>
              <span className="text-3xl font-semibold tracking-tighter text-white/90">$1.6B+</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Reputation Engine</span>
              <span className="text-3xl font-light tracking-tighter text-emerald-400">Top 2%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Exclusivity Rank</span>
              <span className="text-3xl font-serif italic text-white/70">Tier 01</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Ledger Canvas */}
        <div className="glass rounded-xl border border-white/10 p-6 md:p-8 mt-4 max-w-4xl mx-auto w-full glass-card-glow relative">
          <div className="absolute top-3 right-4 flex items-center gap-2 text-[10px] font-mono text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE PROOF LEDGER
          </div>

          <h3 className="text-xs font-mono text-white/80 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/60" />
            Vetted Member Showcase (Anonymized View)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Swapping Sidebar tabs */}
            <div className="space-y-2 md:col-span-1">
              {preloadedVetted.map((b, i) => {
                const anonymizedTitle = b.privacyMode === 'confidential' ? 'Stealth Systems architect' : b.title;
                const visibleName = b.privacyMode === 'confidential' ? `Member #${b.id.slice(-4).toUpperCase()}` : b.name;
                return (
                  <button
                    key={b.id}
                    onClick={() => setActiveLedgerIndex(i)}
                    className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                      activeLedgerIndex === i
                        ? 'bg-white/10 border-white/30 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] text-white/40 hover:text-white/80'
                    }`}
                  >
                    <div className="font-semibold text-xs truncate">{visibleName}</div>
                    <div className="text-[11px] font-light text-white/40 truncate mt-0.5">{anonymizedTitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Displaying Live Profile Details */}
            <div className="md:col-span-2 bg-black/40 rounded border border-white/5 p-5 flex flex-col justify-between">
              {preloadedVetted[activeLedgerIndex] ? (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {preloadedVetted[activeLedgerIndex].privacyMode === 'confidential'
                          ? `Stealth Builder #${preloadedVetted[activeLedgerIndex].id.slice(-4).toUpperCase()}`
                          : preloadedVetted[activeLedgerIndex].name}
                      </h4>
                      <p className="text-[11px] text-white/50 font-mono mt-0.5 uppercase tracking-wide">
                        {preloadedVetted[activeLedgerIndex].title}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Rep Score</span>
                      <span className="text-xl font-mono font-bold text-white">
                        {preloadedVetted[activeLedgerIndex].reputationScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-white/60 font-light mt-4 leading-relaxed italic border-l border-white/10 pl-3">
                    &ldquo;{preloadedVetted[activeLedgerIndex].tagline}&rdquo;
                  </p>

                  {/* Signals checklist */}
                  <div className="grid grid-cols-2 gap-3 mt-6 border-t border-white/5 pt-4">
                    {preloadedVetted[activeLedgerIndex].reputationMetrics.fundingRaised > 0 && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-white/80 font-mono">
                          Funding: ${(preloadedVetted[activeLedgerIndex].reputationMetrics.fundingRaised / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}
                    {preloadedVetted[activeLedgerIndex].reputationMetrics.revenueAnnual > 0 && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-white/80 font-mono">
                          ARR: ${(preloadedVetted[activeLedgerIndex].reputationMetrics.revenueAnnual / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    )}
                    {preloadedVetted[activeLedgerIndex].reputationMetrics.startupsFoundedCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                        <span className="text-xs text-white/80 font-mono">
                          Founded: {preloadedVetted[activeLedgerIndex].reputationMetrics.startupsFoundedCount} Startup(s)
                        </span>
                      </div>
                    )}
                    {preloadedVetted[activeLedgerIndex].reputationMetrics.openSourceContributionsCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
                        <span className="text-xs text-white/80 font-mono">
                          OSS Stars: {preloadedVetted[activeLedgerIndex].openSourceAchievements[0]?.stars || '500+'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/30 font-mono mt-6 pt-4 border-t border-white/5">
                    <span>VERIFICATION SIGNED VIA ONLYFOUNDERS LEDGER</span>
                    <span className="text-white/50">HASH: FND_{preloadedVetted[activeLedgerIndex].id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-white/40 font-mono text-xs">
                  No active operators currently on node.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left">
            <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center border border-white/10 text-white mb-4">
              <ShieldCheck className="w-5 h-5 text-white/80" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">100% Vetted Exclusivity</h4>
            <p className="text-xs text-white/40 font-light leading-relaxed">
              We verify strict evidence of impact: direct registration hashes, Cap Table files, live product domains, and corporate email accounts. No resumes under disguise.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left">
            <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center border border-white/10 text-white mb-4">
              <Cpu className="w-5 h-5 text-white/80" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Real Career Telemetry</h4>
            <p className="text-xs text-white/40 font-light leading-relaxed">
              We map dynamic telemetry indicators such as seed ARR levels, GitHub stars, and system loads to assign reputation ranks for rapid evaluation.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left">
            <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center border border-white/10 text-white mb-4">
              <Users className="w-5 h-5 text-white/80" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Double-Blind Matching</h4>
            <p className="text-xs text-white/40 font-light leading-relaxed">
              Maintain full confidentiality. Secure communication and identity disclosures unlock ONLY when BOTH builder and recruiter indicate a lock on specific opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative vertical running text band */}
      <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 rotate-90 text-[10px] tracking-[1em] text-white/5 uppercase whitespace-nowrap font-bold pointer-events-none select-none hidden lg:block">
        PROOF BEATS RESUMES • PROOF BEATS RESUMES • PROOF BEATS RESUMES
      </div>

      {/* Footer copyright */}
      <footer className="w-full mt-auto py-8 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 px-8 relative z-10">
        <div>&copy; 2026 OnlyFounders Network. All rights reserved. Made for proven builders.</div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono">
          <span>Verifiably Signed: SEC-HASH-V1</span>
          <span>&middot;</span>
          <span>Invite-Only Node: #7928</span>
        </div>
      </footer>
    </div>
  );
}
