/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BuilderPassport, VerificationApplication, Message, Opportunity } from '../types';
import { calculateReputationScore } from '../data';
import {
  Search,
  SlidersHorizontal,
  ThumbsUp,
  UserCheck,
  Building,
  Check,
  X,
  MessageSquare,
  Lock,
  LockOpen,
  Send,
  Sparkles,
  Award,
  Globe,
  Github,
  Linkedin,
  Clock,
  ShieldAlert,
  Files,
  ArrowUpRight,
  Compass,
  XCircle,
  Eye,
  EyeOff,
  Briefcase,
  Star,
  ArrowLeft
} from 'lucide-react';

interface RecruiterDashboardProps {
  builders: BuilderPassport[];
  applications: VerificationApplication[];
  messages: Message[];
  opportunities: Opportunity[];
  recruiterId: string;
  onApproveApplication: (app: VerificationApplication) => void;
  onRejectApplication: (appId: string) => void;
  onToggleMatchIntent: (builderId: string) => void;
  onSendMessage: (matchId: string, text: string) => void;
}

export default function RecruiterDashboard({
  builders,
  applications,
  messages,
  opportunities,
  recruiterId,
  onApproveApplication,
  onRejectApplication,
  onToggleMatchIntent,
  onSendMessage,
}: RecruiterDashboardProps) {
  const [recTab, setRecTab] = useState<'discover' | 'swiper' | 'verify' | 'messages'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRepScore, setMinRepScore] = useState(30);
  const [selectedBuilderId, setSelectedBuilderId] = useState<string | null>(null);
  
  // Active chat connection
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Local track of skipped swipes
  const [skippedBuilders, setSkippedBuilders] = useState<string[]>([]);
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Selected builder detail object
  const activeDetailBuilder = builders.find(b => b.id === selectedBuilderId);

  // Filters candidates in directory
  const filteredBuilders = builders.filter(b => {
    if (b.reputationScore < minRepScore) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesTitle = b.title.toLowerCase().includes(q);
      const matchesName = b.name.toLowerCase().includes(q);
      const matchesTagline = b.tagline.toLowerCase().includes(q);
      if (!matchesTitle && !matchesName && !matchesTagline) return false;
    }
    return true;
  });

  // Approved connected builders (Recruiter matched and builder matched)
  const connectedBuilders = builders.filter(
    b => b.interestedRecruiterIds.includes(recruiterId) && b.matchedRecruiterIds.includes(recruiterId)
  );

  // Message dispatcher logic for recruiter
  const activeChatMessages = messages.filter(m => m.matchId === activeChatMatchId);
  
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatMatchId) return;
    onSendMessage(activeChatMatchId, chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-20 px-4 md:px-8 pb-28 md:pb-12 text-left relative overflow-hidden">
      {/* Decorative background grid and flares */}
      <div className="absolute inset-0 artistic-grid opacity-[0.4] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Recruiter Header Panels */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Operational Console</span>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Recruiting Command Center</h2>
            <p className="text-[10px] text-white/50 font-mono mt-0.5 uppercase tracking-wider">
              Double-Blind Mutual Talent Verification Node
            </p>
          </div>

          {/* Tab Selection Row */}
          <div className="hidden md:flex flex-wrap items-center gap-1.5 bg-black/60 border border-white/10 p-1.5 rounded">
            <button
              id="rec-tab-discover"
              onClick={() => setRecTab('discover')}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded transition-all cursor-pointer ${
                recTab === 'discover'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Verify & Discover Talent
            </button>
            <button
              id="rec-tab-swipe"
              onClick={() => setRecTab('swiper')}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded transition-all flex items-center gap-1 cursor-pointer ${
                recTab === 'swiper'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              Swipe Vetting
            </button>
            <button
              id="rec-tab-verify"
              onClick={() => setRecTab('verify')}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                recTab === 'verify'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Review Applications
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              )}
            </button>
            <button
              id="rec-tab-messages"
              onClick={() => setRecTab('messages')}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                recTab === 'messages'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Secure Messenger
              {connectedBuilders.length > 0 && (
                <span className="bg-white/10 text-white font-mono text-[10px] px-2 py-0.5 rounded border border-white/20">
                  {connectedBuilders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: TALENT DISCOVERY MATRIX */}
        {recTab === 'discover' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Search Filters & List block */}
            <div className={`lg:col-span-2 space-y-4 ${selectedBuilderId ? 'hidden lg:block' : 'block'}`}>
              
              {/* Filter controls block */}
              <div className="bg-black/40 border border-white/10 p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by title, skillset, or keyword..."
                    className="w-full bg-[#050505] border border-white/15 focus:border-white/40 text-xs text-zinc-100 pl-10 pr-4 py-2.5 rounded outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-[11px] font-mono text-white/60">Min Rep: <strong className="text-white">{minRepScore}</strong></span>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={minRepScore}
                    onChange={e => setMinRepScore(Number(e.target.value))}
                    className="accent-white cursor-ew-resize w-24 sm:w-32"
                  />
                </div>
              </div>

              {/* Grid of verified builders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBuilders.length > 0 ? (
                  filteredBuilders.map(b => {
                    const isConfidential = b.privacyMode === 'confidential';
                    const hasBuilderInterest = b.interestedRecruiterIds.includes(recruiterId);
                    const hasRecruiterInterest = b.matchedRecruiterIds.includes(recruiterId);
                    const fullyUnlocked = hasBuilderInterest && hasRecruiterInterest;

                    // Compute dynamic display identities according to Privacy parameters
                    const displayedName = (isConfidential && !fullyUnlocked)
                      ? `Candidate SF_${b.id.slice(-4).toUpperCase()}`
                      : b.name;

                    const displayedTitle = (isConfidential && !fullyUnlocked)
                      ? 'Anonymised Multi-Core Systems Architect'
                      : b.title;

                    return (
                      <div
                        key={b.id}
                        id={`builder-card-${b.id}`}
                        onClick={() => setSelectedBuilderId(b.id)}
                        className={`p-5 rounded border transition-all cursor-pointer relative flex flex-col justify-between h-[230px] group ${
                          selectedBuilderId === b.id
                            ? 'bg-white/10 border-white/40 text-white shadow-lg scale-[1.01]'
                            : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5 text-white/50'
                        }`}
                      >
                        <div>
                          {/* Upper Card Metadata */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {isConfidential && !fullyUnlocked ? (
                                <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/40">
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <img
                                  src={b.avatarUrl}
                                  alt=""
                                  className="w-10 h-10 rounded-full border border-white/10 object-cover"
                                />
                              )}
                              <div className="truncate">
                                <h5 className="font-bold text-sm text-white truncate text-left">{displayedName}</h5>
                                <div className="text-[10px] font-mono text-white/60 tracking-wide mt-0.5 truncate">{displayedTitle}</div>
                              </div>
                            </div>

                            {/* Score indicator */}
                            <div className="bg-black/60 px-2 py-1.5 rounded border border-white/10 text-center min-w-[34px]">
                              <div className="text-[9px] text-white/40 font-mono scale-90">REP</div>
                              <div className="text-xs font-mono font-bold text-white leading-none mt-0.5">{b.reputationScore}</div>
                            </div>
                          </div>

                          <p className="text-xs text-white/70 font-light mt-4 line-clamp-3 leading-relaxed italic text-left">
                            &ldquo;{b.tagline}&rdquo;
                          </p>
                        </div>

                        {/* Bottom Actions status strip */}
                        <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] font-mono mt-4">
                          {isConfidential && !fullyUnlocked ? (
                            <span className="text-white/60 flex items-center gap-1 uppercase">
                              <Lock className="w-3 h-3 text-white" />
                              CONFIDENTIAL
                            </span>
                          ) : (
                            <span className="text-white/40 uppercase">PROMOTED PASSPORT</span>
                          )}

                          {fullyUnlocked ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <LockOpen className="w-2.5 h-2.5" /> MUTUAL MATCH
                            </span>
                          ) : hasRecruiterInterest ? (
                            <span className="text-white/40">Match Pending...</span>
                          ) : hasBuilderInterest ? (
                            <span className="text-white bg-white/10 px-1.5 py-0.5 rounded border border-white/20 animate-pulse">
                              Expressed Interest!
                            </span>
                          ) : (
                            <span className="text-white/40 hover:text-white group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                              Evaluate profile <ArrowUpRight className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-20 border border-white/10 rounded bg-white/5 text-white/40 text-xs">
                    No verified builders found. Adjust reputation or search filters.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Full Candidate Inspector Drawer */}
            <div className={`lg:col-span-1 ${!selectedBuilderId ? 'hidden lg:block' : 'block'}`}>
              {activeDetailBuilder ? (
                (() => {
                  const hasBuilderInterest = activeDetailBuilder.interestedRecruiterIds.includes(recruiterId);
                  const hasRecruiterInterest = activeDetailBuilder.matchedRecruiterIds.includes(recruiterId);
                  const isConfidential = activeDetailBuilder.privacyMode === 'confidential';
                  const fullyUnlocked = hasBuilderInterest && hasRecruiterInterest;

                  return (
                    <div className="glass rounded border border-white/10 p-5 md:p-6 glass-card-glow text-left space-y-6">
                      
                      {/* Mobile back navigation option */}
                      <div className="lg:hidden flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-2">
                        <button
                          onClick={() => setSelectedBuilderId(null)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded text-[11px] font-mono flex items-center gap-1.5 hover:bg-white/10 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>← Back to Talent Directory</span>
                        </button>
                      </div>
                      
                      {/* Identity Details */}
                      <div>
                        <div className="flex items-start justify-between">
                          {isConfidential && !fullyUnlocked ? (
                            <div className="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/40 mb-3">
                              <Lock className="w-5 h-5 text-white/60" />
                            </div>
                          ) : (
                            <img
                              src={activeDetailBuilder.avatarUrl}
                              alt=""
                              className="w-14 h-14 rounded-full border border-white/10 object-cover mb-3 bg-black"
                            />
                          )}

                          <div className="bg-[#050505] border border-white/10 px-3 py-1.5 rounded text-center">
                            <span className="text-[10px] text-white/50 font-mono block">LEDGER SCORE</span>
                            <span className="text-lg font-mono font-bold text-white">{activeDetailBuilder.reputationScore}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-white mt-1 uppercase tracking-tight">
                          {isConfidential && !fullyUnlocked
                            ? `Stealth Candidate SF_${activeDetailBuilder.id.slice(-4).toUpperCase()}`
                            : activeDetailBuilder.name}
                        </h3>
                        <p className="text-xs text-white/60 font-mono mt-0.5 font-medium uppercase">{activeDetailBuilder.title}</p>
                        <p className="text-xs text-zinc-400 mt-3 font-light leading-relaxed italic">
                          &ldquo;{activeDetailBuilder.tagline}&rdquo;
                        </p>
                      </div>

                      {/* Micro telemetries */}
                      <div className="border-t border-b border-white/10 py-4 grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase">VC Capital</span>
                          <span className="text-zinc-200 block font-bold mt-0.5">
                            {activeDetailBuilder.reputationMetrics.fundingRaised > 0
                              ? `$${(activeDetailBuilder.reputationMetrics.fundingRaised / 1000000).toFixed(1)}M`
                              : '$0M'}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase">ARR Handled</span>
                          <span className="text-zinc-200 block font-bold mt-0.5">
                            {activeDetailBuilder.reputationMetrics.revenueAnnual > 0
                              ? `$${(activeDetailBuilder.reputationMetrics.revenueAnnual / 1000000).toFixed(1)}M`
                              : '$0M'}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase">Team Scale</span>
                          <span className="text-zinc-200 block font-bold mt-0.5">
                            {activeDetailBuilder.reputationMetrics.teamSizeMax} people
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase">Startups Built</span>
                          <span className="text-zinc-200 block font-bold mt-0.5">
                            {activeDetailBuilder.reputationMetrics.startupsFoundedCount}
                          </span>
                        </div>
                      </div>

                      {/* Career timeline excerpt (Anonymized companies if stealth) */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Core Milestones</span>
                        <div className="relative border-l border-white/10 pl-4 space-y-4 text-xs">
                          {activeDetailBuilder.careerTimeline.map(mile => {
                            const obfuscatedCompany = (isConfidential && !fullyUnlocked) ? 'Stealth Scaling Startup' : mile.company;
                            return (
                              <div key={mile.id} className="relative">
                                <span className="absolute -left-[21px] top-1.5 w-1.5 h-1.5 rounded-full bg-white"></span>
                                <div className="font-bold text-zinc-300">{mile.role}</div>
                                <div className="text-[10px] text-white/50 font-mono mt-0.5">{obfuscatedCompany} &middot; {mile.duration}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* INTRODUCTORY VIDEO PITCH FOR RECRUITERS */}
                      {activeDetailBuilder.introductoryVideoUrl && (
                        <div className="space-y-2.5 pt-4 border-t border-white/5">
                          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Introductory Video pitch
                          </span>
                          <div className="relative rounded-xl overflow-hidden bg-black/95 border border-white/10 aspect-video flex items-center justify-center shadow-lg">
                            <video
                              src={activeDetailBuilder.introductoryVideoUrl}
                              controls
                              className="w-full h-full object-cover"
                              poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640"
                            />
                          </div>
                        </div>
                      )}

                      {/* Contact Social locks details */}
                      <div>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-2.5">Proof credentials links</span>
                        {isConfidential && !fullyUnlocked ? (
                          <div className="p-3 bg-black/60 rounded border border-white/10 border-dashed text-xs text-white/40 flex items-center gap-2.5 leading-normal">
                            <Lock className="w-6 h-6 text-white/60 flex-shrink-0" />
                            <span>Authentic handles & social credentials are encrypted until mutual connections are sparked.</span>
                          </div>
                        ) : (
                          <div className="space-y-2 text-xs text-zinc-300 font-mono bg-black/60 border border-white/10 p-3 rounded">
                            {activeDetailBuilder.email && <div className="truncate text-white/80">Email: {activeDetailBuilder.email}</div>}
                            <div className="flex gap-4 pt-1.5 border-t border-white/10 text-white/60">
                              {activeDetailBuilder.githubUrl && (
                                <a href={activeDetailBuilder.githubUrl} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                                  GitHub <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}
                              {activeDetailBuilder.linkedinUrl && (
                                <a href={activeDetailBuilder.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                                  LinkedIn <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* MUTUAL MATCH ACTION ENGINE */}
                      <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                        {fullyUnlocked ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold rounded flex items-center justify-between">
                            <span>Double-Blind Match Activated!</span>
                            <button
                              onClick={() => {
                                setRecTab('messages');
                                setActiveChatMatchId(`${activeDetailBuilder.id}_${recruiterId}`);
                              }}
                              className="text-[10px] uppercase font-bold tracking-wider underline cursor-pointer"
                            >
                              Message
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`recruiter-match-btn-${activeDetailBuilder.id}`}
                            onClick={() => onToggleMatchIntent(activeDetailBuilder.id)}
                            className={`w-full py-3 text-xs font-mono uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              hasRecruiterInterest
                                ? 'bg-[#050505] border border-white/10 text-white/40 hover:text-white'
                                : 'bg-white text-black font-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                          >
                            {hasRecruiterInterest ? (
                              <span>Cancel Match Intent</span>
                            ) : (
                              <>
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>Express Match Intent</span>
                              </>
                            )}
                          </button>
                        )}

                        {hasBuilderInterest && !fullyUnlocked && (
                          <div className="p-2 bg-white/5 rounded border border-white/10 text-[10px] text-white/80 font-mono leading-tight flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-bounce flex-shrink-0" />
                            <span>Candidate interested in posting! Click "Express Match Intent" to unlock instantly.</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()
              ) : (
                <div className="glass rounded border border-white/10 py-20 px-4 text-center text-white/30 text-xs flex flex-col items-center justify-center">
                  <Award className="w-12 h-12 text-white/10 mb-2.5" />
                  <p className="font-semibold uppercase tracking-wider text-white">No Candidate Inspected</p>
                  <p className="text-[10px] text-white/40 mt-1 max-w-[180px]">Select any card in the discovery queue to review full telemetry details.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: SWIPER VETTING STACK */}
        {recTab === 'swiper' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-5 rounded-xl text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider">Double-Blind Recruiter Swiper</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1 tracking-tight">RAPID TALENT EVALUATION MATRIX</h3>
              <p className="text-xs text-white/50 font-light mt-1 max-w-2xl leading-relaxed">
                Swipe right to <strong className="text-white">Express Match Intent</strong>. If the candidate has already applied to your postings or expressed interest, you will form an instant double-blind match, unlocking contact vitals and direct messaging lines.
              </p>
            </div>

            {/* DECK CONTAINER */}
            <div className="flex flex-col items-center justify-center py-6 min-h-[500px]">
              {(() => {
                const swipableList = builders.filter(b => {
                  const alreadyMatched = b.matchedRecruiterIds.includes(recruiterId);
                  return !alreadyMatched && !skippedBuilders.includes(b.id);
                });

                if (swipableList.length === 0) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 px-6 border border-white/10 rounded-xl bg-white/[0.02] max-w-md w-full space-y-4"
                    >
                      <Compass className="w-12 h-12 text-white/20 mx-auto animate-pulse" />
                      <h4 className="text-md font-bold text-white tracking-tight">Vetting Queue Concluded!</h4>
                      <p className="text-xs text-white/40 leading-relaxed font-light">
                        All verified active founder passports have been passed or matched. Check back later or reset skipped records!
                      </p>
                      {skippedBuilders.length > 0 && (
                        <button
                          onClick={() => setSkippedBuilders([])}
                          className="px-4 py-2 bg-white text-black font-semibold rounded text-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                        >
                          Reset Skipped List ({skippedBuilders.length})
                        </button>
                      )}
                    </motion.div>
                  );
                }

                const activeBuilder = swipableList[0];
                const isConfidential = activeBuilder.privacyMode === 'confidential';
                const builderInterested = activeBuilder.interestedRecruiterIds.includes(recruiterId);

                // Privacy computations
                const displayName = isConfidential
                  ? `Stealth Founder SF_${activeBuilder.id.slice(-4).toUpperCase()}`
                  : activeBuilder.name;
                
                const displayTitle = isConfidential
                  ? 'Founder / Systems Architect'
                  : activeBuilder.title;

                return (
                  <div className="relative w-full max-w-sm h-full flex flex-col justify-between">
                    {/* Tags overlays render dynamically only when dragging card */}
                    <AnimatePresence>
                      {dragOffset > 15 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: Math.min(1, (dragOffset - 15) / 50), scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-12 right-0 left-0 z-30 pointer-events-none text-center"
                        >
                          <span className="inline-block border border-emerald-500/30 text-emerald-300 bg-zinc-950/95 px-4 py-1.5 font-mono text-xs uppercase font-extrabold tracking-widest rounded-lg shadow-xl animate-pulse">
                            👉 SWIPE RIGHT TO MATCH
                          </span>
                        </motion.div>
                      )}
                      {dragOffset < -15 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: Math.min(1, (-dragOffset - 15) / 50), scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-12 right-0 left-0 z-30 pointer-events-none text-center"
                        >
                          <span className="inline-block border border-rose-500/30 text-rose-400 bg-zinc-950/95 px-4 py-1.5 font-mono text-xs uppercase font-extrabold tracking-widest rounded-lg shadow-xl animate-pulse">
                            ◀ SWIPE LEFT TO SKIP
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      key={activeBuilder.id}
                      drag="x"
                      dragConstraints={{ left: -120, right: 120 }}
                      onDrag={(e, info) => {
                        setDragOffset(info.offset.x);
                      }}
                      onDragEnd={(e, info) => {
                        setDragOffset(0);
                        if (info.offset.x > 80) {
                          onToggleMatchIntent(activeBuilder.id);
                        } else if (info.offset.x < -80) {
                          setSkippedBuilders(prev => [...prev, activeBuilder.id]);
                        }
                      }}
                      className="glass rounded-2xl border border-white/10 p-6 flex flex-col justify-between gap-6 cursor-grab active:cursor-grabbing shadow-2xl relative overflow-hidden bg-black/90 text-left"
                      style={{ touchAction: 'none' }}
                      whileDrag={{ scale: 1.02, rotate: dragOffset * 0.05 }}
                    >
                      {/* Interactive inside-card overlays that follow tilt */}
                      <AnimatePresence>
                        {dragOffset > 10 && (
                          <motion.div
                            initial={{ opacity: 0, rotate: -5 }}
                            animate={{ opacity: Math.min(0.95, (dragOffset - 10) / 65) }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl pointer-events-none flex items-center justify-center z-20"
                          >
                            <span className="border-4 border-emerald-500 text-emerald-400 bg-zinc-950/95 px-5 py-2.5 font-mono text-sm uppercase font-black tracking-widest rounded-xl rotate-[-12deg] shadow-2xl">
                              MATCH INTENT
                            </span>
                          </motion.div>
                        )}
                        {dragOffset < -10 && (
                          <motion.div
                            initial={{ opacity: 0, rotate: 5 }}
                            animate={{ opacity: Math.min(0.95, (-dragOffset - 10) / 65) }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-rose-500/[0.04] border border-rose-500/20 rounded-2xl pointer-events-none flex items-center justify-center z-20"
                          >
                            <span className="border-4 border-rose-500 text-rose-400 bg-zinc-950/95 px-5 py-2.5 font-mono text-sm uppercase font-black tracking-widest rounded-xl rotate-[12deg] shadow-2xl">
                              SKIP / PASS
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl pointer-events-none"></div>

                      <div>
                        {/* Top corner status */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Verified Passport
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">
                            Reputation: {activeBuilder.reputationScore}
                          </span>
                        </div>

                        {/* Profiles details */}
                        <div className="flex items-center gap-3.5 mt-4">
                          {isConfidential ? (
                            <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/40">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <img
                              src={activeBuilder.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-full border border-white/10 object-cover"
                            />
                          )}
                          <div>
                            <div className="text-[10px] font-mono text-white/40 tracking-wider uppercase font-semibold leading-none flex items-center gap-1">
                              {isConfidential && <EyeOff className="w-3 h-3 text-white/50" />}
                              {isConfidential ? 'CONFIDENTIAL PRIVACY NODE' : 'PUBLIC PASSPORT'}
                            </div>
                            <h4 className="text-md font-extrabold text-white mt-1 leading-tight">{displayName}</h4>
                            <p className="text-xs text-white/50 font-mono mt-0.5">{displayTitle}</p>
                          </div>
                        </div>

                        {/* Interactive Expressed Interest Highlight! */}
                        {builderInterested && (
                          <div className="mt-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-l-2 border-amber-400 p-2 rounded text-[10px] text-amber-200 font-mono leading-tight flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Candidate interested in posting! Click "Match" to unlock instantly.</span>
                          </div>
                        )}

                        {/* Metrics specs */}
                        <div className="grid grid-cols-3 gap-2 mt-4 bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs leading-none text-center">
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Capital Raised</span>
                            <span className="text-white font-bold block mt-1">
                              {activeBuilder.reputationMetrics.fundingRaised > 0 
                                ? `$${(activeBuilder.reputationMetrics.fundingRaised / 1000000).toFixed(1)}M` 
                                : 'Bootstrapped'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">Max Team Size</span>
                            <span className="text-white font-bold block mt-1">{activeBuilder.reputationMetrics.teamSizeMax || 'Solo'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 uppercase font-mono block">OS Contributions</span>
                            <span className="text-white font-bold block mt-1">
                              {activeBuilder.reputationMetrics.openSourceContributionsCount || 0} repos
                            </span>
                          </div>
                        </div>

                        {/* Bio block */}
                        <p className="text-xs text-white/70 font-light mt-4 leading-relaxed line-clamp-3">
                          {activeBuilder.bio}
                        </p>

                        {/* Timeline snippets */}
                        <div className="mt-4 border-t border-white/5 pt-3">
                          <span className="text-[9px] text-white/30 uppercase font-mono block mb-2 font-bold">Recent Ventures & Tenures:</span>
                          <div className="space-y-1.5">
                            {activeBuilder.careerTimeline.slice(0, 2).map((mile, i) => {
                              const obfuscatedCompany = isConfidential ? 'Stealth Scaling Tech' : mile.company;
                              return (
                                <div key={i} className="text-xs flex justify-between text-white/50">
                                  <span className="font-medium text-white truncate max-w-[170px]">{mile.role} @ {obfuscatedCompany}</span>
                                  <span className="font-mono text-[10px] text-white/30 shrink-0">{mile.duration}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Decryption status */}
                      <div className="mt-2 border-t border-white/5 pt-3 text-[10px] text-zinc-500 font-mono text-center flex items-center justify-center gap-1">
                        {isConfidential ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Vitals locked until bilateral match</span>
                          </>
                        ) : (
                          <>
                            <LockOpen className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Vitals fully public for vetted recruiters</span>
                          </>
                        )}
                      </div>
                    </motion.div>

                    {/* Controls fallbacks */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <button
                        onClick={() => setSkippedBuilders(prev => [...prev, activeBuilder.id])}
                        className="w-12 h-12 bg-zinc-900 border border-white/10 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                        title="Skip profile (Swipe Left)"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>

                      <button
                        onClick={() => onToggleMatchIntent(activeBuilder.id)}
                        className="w-14 h-14 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition cursor-pointer"
                        title="Decide Match Intent! (Swipe Right)"
                      >
                        <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                      </button>
                    </div>

                    <div className="text-center text-[10px] text-white/30 font-mono mt-3.5 select-none font-light">
                      Tip: Drag card left/right or tap action triggers.
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 2: INCOMING MEMBERSHIP REVIEW STATION */}
        {recTab === 'verify' && (
          <div className="space-y-6 flex flex-col">
            
            <div className="p-4 bg-black/40 border border-white/10 rounded relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 mb-1.5">
                <Check className="w-4 h-4 text-white" />
                Vetting desk: proof audit queue
              </h3>
              <p className="text-xs text-white/60 font-light max-w-2xl leading-normal">
                Review operational claims manually below. Verify TechCrunch indexes, GitHub lines, and SEC filings. Approved applications automatically run dynamic calculations and inject verified <strong className="text-white">Founder Passports</strong> straight into active directories.
              </p>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications.filter(app => app.status === 'pending').length > 0 ? (
                applications.filter(app => app.status === 'pending').map(app => {
                  const estMetrics = {
                    fundingRaised: Number(app.fundingRaisedInput) || 0,
                    revenueAnnual: Number(app.revenueAnnualInput) || 0,
                    teamSizeMax: Number(app.teamSizeMaxInput) || 0,
                    startupsFoundedCount: Number(app.startupsFoundedInput) || 0,
                    productsLaunchedCount: Number(app.productsLaunchedInput) || 0,
                    openSourceContributionsCount: Number(app.openSourceContributionsCountInput) || 0,
                  };
                  const calculatedRep = calculateReputationScore(estMetrics);

                  return (
                    <div
                      key={app.id}
                      id={`app-review-${app.id}`}
                      className="glass rounded border border-white/10 p-5 md:p-6 text-left grid grid-cols-1 md:grid-cols-4 gap-6"
                    >
                      {/* Left: Applicant details */}
                      <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
                        <div className="font-bold text-sm text-zinc-100 uppercase">{app.name}</div>
                        <div className="text-[10px] font-mono text-white/40 mt-1 truncate">{app.email}</div>
                        <div className="text-xs text-white/80 font-mono font-bold mt-3 leading-tight uppercase">{app.title}</div>
                        
                        {/* Dynamic estimated score calculation indicators */}
                        <div className="mt-5 p-3.5 bg-black/60 rounded border border-white/10 flex items-center justify-between text-center">
                          <span className="text-[9px] text-white/50 font-mono">EST. SCORE</span>
                          <div className="text-lg font-mono font-black text-white">{calculatedRep}</div>
                        </div>
                      </div>

                      {/* Middle: Numerical Claims Matrix & Narrative evidence block */}
                      <div className="md:col-span-2 space-y-4 text-xs">
                        <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Self-Declared Claims Registry</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">Funding VC</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">
                              {estMetrics.fundingRaised > 0 ? `$${(estMetrics.fundingRaised / 1000000).toFixed(1)}M` : '$0.0'}
                            </span>
                          </div>
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">Direct ARR</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">
                              {estMetrics.revenueAnnual > 0 ? `$${(estMetrics.revenueAnnual / 1000000).toFixed(1)}M` : '$0.0'}
                            </span>
                          </div>
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">Team Capacity</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">{estMetrics.teamSizeMax} people</span>
                          </div>
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">Startups</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">{estMetrics.startupsFoundedCount} founded</span>
                          </div>
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">Products</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">{estMetrics.productsLaunchedCount} shipped</span>
                          </div>
                          <div className="bg-black/60 p-2 rounded border border-white/10">
                            <span className="text-white/40 block text-[9px] uppercase">OS Stars</span>
                            <span className="text-zinc-200 block font-bold mt-0.5">{estMetrics.openSourceContributionsCount} reps</span>
                          </div>
                        </div>

                        {/* Evidence description */}
                        <div className="pt-2">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Verifiable narrative backing</span>
                          <div className="p-3 bg-[#050505] rounded text-stone-300 font-mono text-[11px] leading-relaxed max-h-[85px] overflow-y-auto border border-white/10">
                            {app.evidenceText}
                          </div>
                        </div>
                      </div>

                      {/* Right: Decision board controls */}
                      <div className="md:col-span-1 flex flex-col justify-end gap-2 text-xs md:pl-6 md:border-l border-white/10">
                        <button
                          id={`approve-btn-${app.id}`}
                          onClick={() => onApproveApplication(app)}
                          className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-wider text-[11px] rounded flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-zinc-200 active:scale-95"
                        >
                          <UserCheck className="w-4 h-4" />
                          Verify & Appoint
                        </button>
                        <button
                          id={`decline-btn-${app.id}`}
                          onClick={() => onRejectApplication(app.id)}
                          className="w-full py-2.5 bg-black hover:bg-white/5 text-white/60 font-medium rounded flex items-center justify-center gap-1.5 transition border border-white/10 cursor-pointer active:scale-95"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline / Veto File
                        </button>
                        <div className="text-[10px] text-white/40 font-mono text-center mt-2.5">
                          Submitted: {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Gemini AI Vetting Ledger Results - Spanning Full Width */}
                      {app.geminiVerification && (
                        <div className="md:col-span-4 mt-6 pt-5 border-t border-white/5 bg-zinc-950/40 p-5 rounded-lg border border-amber-500/10 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 px-2.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-[10px] uppercase font-mono tracking-widest font-black flex items-center gap-1.5 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Gemini Ledger Audit Verified</span>
                              </div>
                              <span className="text-zinc-500 text-[10px] font-mono">
                                Vetted: {new Date(app.geminiVerification.verifiedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs font-mono">
                              <div>
                                <span className="text-white/30 text-[9px] uppercase">ARCHETYPE</span>
                                <span className="text-stone-200 font-bold ml-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded">
                                  {app.geminiVerification.builderProfileArchetype}
                                </span>
                              </div>
                              <div>
                                <span className="text-white/30 text-[9px] uppercase font-bold">SUGGESTED REPUTATION</span>
                                <span className="text-amber-400 font-bold ml-1.5 font-mono text-sm leading-none">
                                  {app.geminiVerification.suggestedReputationScore}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Analytics column */}
                            <div className="lg:col-span-1 space-y-3">
                              <div className="space-y-1.5 bg-black/40 p-3 rounded border border-white/5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-white/40">INTEGRITY CONFIDENCE</span>
                                  <span className="text-emerald-400 font-bold">{app.geminiVerification.confidenceScore}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 font-mono">
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" 
                                    style={{ width: `${app.geminiVerification.confidenceScore}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="bg-black/40 p-3 rounded border border-white/5 space-y-1 font-mono">
                                <span className="text-[9px] font-mono text-white/40 uppercase block">DETERMINED ADVISORY:</span>
                                <div className={`text-xs font-bold font-mono tracking-widest ${
                                  app.geminiVerification.decision === 'APPROVED' ? 'text-emerald-400' :
                                  app.geminiVerification.decision === 'FLAGGED' ? 'text-amber-400 animate-pulse' : 'text-rose-400'
                                }`}>
                                  ● {app.geminiVerification.decision}
                                </div>
                              </div>
                            </div>
                            
                            {/* Detailed Notes column */}
                            <div className="lg:col-span-2 bg-black/40 p-3.5 rounded border border-white/5 text-[11px] font-mono leading-relaxed space-y-2">
                              <div>
                                <span className="text-amber-500 font-bold block mb-1 text-[9px] uppercase tracking-wider">AI Ledger Analysis</span>
                                <p className="text-stone-300">{app.geminiVerification.aiAuditNotes}</p>
                              </div>
                              <div className="pt-2 border-t border-white/5">
                                <span className="text-emerald-400 font-bold block mb-1 text-[9px] uppercase tracking-wider">Dynamic Recommendations</span>
                                <p className="text-stone-400">{app.geminiVerification.legitimacyFeedback}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 border border-white/10 rounded bg-[#010101] text-white/30 text-xs font-mono uppercase tracking-wider">
                  All files cleared. Outstanding candidate queue empty.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: SECURE REC MESSENGER */}
        {recTab === 'messages' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Active Connections List Sidebar */}
              <div className={`md:col-span-1 space-y-3 ${activeChatMatchId ? 'hidden md:block' : 'block'}`}>
                <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Connected Builders</h4>
                {connectedBuilders.length > 0 ? (
                  connectedBuilders.map(b => {
                    const matchId = `${b.id}_${recruiterId}`;
                    const targetOpp = opportunities.find(o => o.postedByRecruiterId === recruiterId);
                    const lastMsg = messages.filter(m => m.matchId === matchId).slice(-1)[0];

                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveChatMatchId(matchId)}
                        className={`w-full text-left p-3.5 rounded border transition-all cursor-pointer ${
                          activeChatMatchId === matchId
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-black/40 border-white/5 hover:bg-[#0f0f11] text-white/40 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs truncate text-white uppercase tracking-wider">{b.name}</div>
                        <div className="text-xs font-medium truncate mt-0.5 text-white/60">
                          {b.title}
                        </div>
                        <p className="text-[10px] text-white/40 truncate mt-2">
                          {lastMsg ? `Last: ${lastMsg.text}` : 'Match locked. Say hello, set up call.'}
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 border border-white/10 rounded text-white/30 text-xs italic">
                    No connected builders. Mutual match intent must occur.
                  </div>
                )}
              </div>

              {/* Chat Window */}
              <div className={`md:col-span-2 glass rounded border border-white/10 flex flex-col justify-between min-h-[420px] relative overflow-hidden ${!activeChatMatchId ? 'hidden md:flex' : 'flex'}`}>
                {activeChatMatchId ? (
                  <>
                    <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {/* Mobile back btn */}
                        <button
                          onClick={() => setActiveChatMatchId(null)}
                          className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded mr-1 hover:text-white transition"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <div className="truncate">
                          <span className="text-[10px] uppercase font-mono text-white/40 font-semibold block">Secure Direct Access Channel</span>
                          <h4 className="font-bold text-sm text-white truncate">
                            {builders.find(b => `${b.id}_${recruiterId}` === activeChatMatchId)?.name || 'Candidate Operator'}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold flex-shrink-0">
                        SESSION ACTIVE
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[300px]">
                      {activeChatMessages.length > 0 ? (
                        activeChatMessages.map(msg => {
                          const isMe = msg.senderId === recruiterId;
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[80%] ${
                                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                              }`}
                            >
                              <span className="text-[9px] font-mono text-white/40 mb-1">
                                {msg.senderName} &middot; {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div
                                className={`p-3 rounded text-xs leading-relaxed ${
                                  isMe
                                    ? 'bg-white text-black font-semibold rounded-tr-none'
                                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                                  }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-white/30 text-xs py-12">
                          No messages yet on this private session. Write an introduction to unlock coordinates.
                        </div>
                      )}
                    </div>

                    {/* Input message form */}
                    <form onSubmit={handleSendText} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Compose message & schedule coordinates..."
                        className="flex-1 bg-[#050505] border border-white/10 focus:border-white/35 text-xs text-zinc-100 px-3.5 py-2.5 rounded outline-none transition"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-black text-xs font-semibold rounded flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30">
                    <MessageSquare className="w-12 h-12 text-white/10 mb-2.5 animate-pulse" />
                    <p className="text-xs font-medium">Select an active connection match room to communicate.</p>
                    <p className="text-[10px] text-white/40 max-w-sm mt-1 leading-normal">
                      Vetted talent identities are protected. Reach out to prospective candidates using "Express Match Intent" in Discovery Matrix first.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Bottom tab bar for mobile viewports */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 py-2.5 px-4 flex justify-around items-center shadow-2xl safe-bottom">
        <button
          onClick={() => setRecTab('discover')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
            recTab === 'discover' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <button
          onClick={() => setRecTab('swiper')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
            recTab === 'swiper' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Swiper</span>
        </button>

        <button
          onClick={() => setRecTab('verify')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none relative ${
            recTab === 'verify' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <span className="relative">
            <Files className="w-4 h-4" />
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[8px] font-bold font-mono px-1 rounded-full leading-none min-w-[12px] text-center">
                {applications.filter(a => a.status === 'pending').length}
              </span>
            )}
          </span>
          <span>Verify</span>
        </button>

        <button
          onClick={() => setRecTab('messages')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none relative ${
            recTab === 'messages' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <span className="relative">
            <MessageSquare className="w-4 h-4" />
            {connectedBuilders.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black text-[8px] font-bold font-mono px-1 leading-normal rounded-full min-w-[12px] text-center">
                {connectedBuilders.length}
              </span>
            )}
          </span>
          <span>Messages</span>
        </button>
      </div>
    </div>
  );
}
