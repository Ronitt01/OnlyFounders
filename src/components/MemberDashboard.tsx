/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BuilderPassport, Opportunity, Message, PrivacyMode, OpportunityCategory, CareerMilestone } from '../types';
import { calculateReputationScore } from '../data';
import {
  User,
  ShieldCheck,
  ToggleLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Briefcase,
  Star,
  Users,
  Compass,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  PlusCircle,
  Hash,
  Trash2,
  TrendingUp,
  Cpu,
  Sparkles,
  ArrowRight,
  XCircle,
  Check,
  ArrowLeft,
  Film,
  Video,
  Play,
  Save
} from 'lucide-react';

interface MemberDashboardProps {
  builder: BuilderPassport;
  opportunities: Opportunity[];
  messages: Message[];
  onUpdateBuilder: (updated: BuilderPassport) => void;
  onExpressInterest: (opportunityId: string) => void;
  onSendMessage: (matchId: string, text: string) => void;
}

export default function MemberDashboard({
  builder,
  opportunities,
  messages,
  onUpdateBuilder,
  onExpressInterest,
  onSendMessage,
}: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<'passport' | 'opportunities' | 'swiper' | 'connections'>('passport');
  const [oppCategory, setOppCategory] = useState<OpportunityCategory>('jobs');
  const [showMatchOnly, setShowMatchOnly] = useState(false); // filter opportunities by reputation score math
  const [activeChatMatchId, setActiveChatMatchId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  
  // Local track of skipped swipes
  const [skippedOpps, setSkippedOpps] = useState<string[]>([]);

  // Editing state for new milestones
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    role: '',
    company: '',
    duration: '',
    description: '',
    type: 'builder' as 'founder' | 'operator' | 'executive' | 'builder',
  });

  // Editing state for introductory video
  const [showVideoEdit, setShowVideoEdit] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState(builder.introductoryVideoUrl || '');
  const [selectedVideoPresetIdx, setSelectedVideoPresetIdx] = useState<number | null>(null);

  const VIDEO_PRESETS = [
    {
      name: "Systems Architect Pitch (Demo)",
      url: "https://assets.mixkit.co/videos/preview/mixkit-young-man-giving-a-presentation-in-front-of-a-screen-41220-large.mp4",
      description: "A professional 60-second video displaying architecture plans and graphs."
    },
    {
      name: "Database Engineer Overview (Demo)",
      url: "https://assets.mixkit.co/videos/preview/mixkit-working-with-multiple-screens-and-analyzing-data-41221-large.mp4",
      description: "A high-fidelity project pitch showcasing dashboard server analytics."
    },
    {
      name: "Elite Executive Introduction (Demo)",
      url: "https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-at-his-desk-in-the-office-34440-large.mp4",
      description: "A clean, warm visual showing the candidate pitching engineering wins."
    }
  ];

  // Handle Privacy Change
  const handlePrivacyChange = (mode: PrivacyMode) => {
    const updated = { ...builder, privacyMode: mode };
    onUpdateBuilder(updated);
  };

  // Handle addition of custom milestone to Career Timeline, re-computing reputation
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.role.trim() || !newMilestone.company.trim()) return;

    const milestone: CareerMilestone = {
      id: `custom_mile_${Date.now()}`,
      role: newMilestone.role,
      company: newMilestone.company,
      duration: newMilestone.duration || '2026 - Present',
      description: newMilestone.description,
      verified: true, // Auto-verified in local prototype
      type: newMilestone.type,
    };

    // Calculate update metrics
    const updatedMetrics = { ...builder.reputationMetrics };
    if (newMilestone.type === 'founder') {
      updatedMetrics.startupsFoundedCount += 1;
    }
    updatedMetrics.productsLaunchedCount += 1;

    const newScore = calculateReputationScore(updatedMetrics);

    const updated = {
      ...builder,
      careerTimeline: [milestone, ...builder.careerTimeline],
      reputationMetrics: updatedMetrics,
      reputationScore: newScore,
    };

    onUpdateBuilder(updated);
    setShowAddMilestone(false);
    setNewMilestone({
      role: '',
      company: '',
      duration: '',
      description: '',
      type: 'builder',
    });
  };

  const handleDeleteTimelineItem = (id: string) => {
    const item = builder.careerTimeline.find(c => c.id === id);
    const updatedMetrics = { ...builder.reputationMetrics };
    if (item && item.type === 'founder') {
      updatedMetrics.startupsFoundedCount = Math.max(0, updatedMetrics.startupsFoundedCount - 1);
    }
    updatedMetrics.productsLaunchedCount = Math.max(0, updatedMetrics.productsLaunchedCount - 1);
    
    const newScore = calculateReputationScore(updatedMetrics);
    const updated = {
      ...builder,
      careerTimeline: builder.careerTimeline.filter(c => c.id !== id),
      reputationMetrics: updatedMetrics,
      reputationScore: newScore,
    };
    onUpdateBuilder(updated);
  };

  // Find all companies where mutual matching unlocked
  const matchedOpportunities = opportunities.filter(
    opp =>
      opp.applicantIds.includes(builder.id) &&
      (opp.matchedBuilderIds.includes(builder.id) || builder.interestedRecruiterIds.includes(opp.postedByRecruiterId))
  );

  // Retrieve current active messages
  const activeChatMessages = messages.filter(m => m.matchId === activeChatMatchId);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatMatchId) return;
    onSendMessage(activeChatMatchId, chatInput.trim());
    setChatInput('');
  };

  // Standard calculation filters on opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    if (opp.category !== oppCategory) return false;
    if (showMatchOnly && builder.reputationScore < opp.reputationThreshold) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] pt-24 px-4 md:px-8 pb-28 lg:pb-16 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none artistic-grid" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Left column: Quick Menu / Status */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="glass rounded-xl border border-white/10 p-5 glass-card-glow text-left">
            <div className="flex items-center gap-4">
              <img
                src={builder.avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-full border border-white/15 object-cover bg-black"
                referrerPolicy="no-referrer"
              />
              <div className="truncate">
                <div id="builder-name-title" className="font-bold text-white tracking-wide truncate">{builder.name}</div>
                <div className="text-xs text-white/60 font-mono flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Builder
                </div>
              </div>
            </div>

            {/* Privacy Mode Controller */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 flex items-center justify-between">
                PASSPORT PRIVACY
                <Lock className="w-3.5 h-3.5 text-white/50" />
              </h4>

              <div className="space-y-2">
                <button
                  id="privacy-public-btn"
                  onClick={() => handlePrivacyChange('public')}
                  className={`w-full text-left p-2.5 rounded border text-xs flex items-center justify-between transition cursor-pointer hover:scale-[1.01] active:scale-95 ${
                    builder.privacyMode === 'public'
                      ? 'bg-white/10 border-white/30 text-white font-medium'
                      : 'bg-transparent border-white/5 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">Public Status</span>
                  <Eye className="w-3.5 h-3.5 text-white/50" />
                </button>

                <button
                  id="privacy-semi-btn"
                  onClick={() => handlePrivacyChange('semi-private')}
                  className={`w-full text-left p-2.5 rounded border text-xs flex items-center justify-between transition cursor-pointer hover:scale-[1.01] active:scale-95 ${
                    builder.privacyMode === 'semi-private'
                      ? 'bg-white/10 border-white/30 text-white font-medium'
                      : 'bg-transparent border-white/5 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">Semi-Private</span>
                  <span className="text-[10px] text-white/70 font-mono">Locks Contact</span>
                </button>

                <button
                  id="privacy-confidential-btn"
                  onClick={() => handlePrivacyChange('confidential')}
                  className={`w-full text-left p-2.5 rounded border text-xs flex items-center justify-between transition cursor-pointer hover:scale-[1.01] active:scale-95 ${
                    builder.privacyMode === 'confidential'
                      ? 'bg-white/10 border-white/30 text-white font-medium'
                      : 'bg-transparent border-white/5 text-white/40 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="font-medium">Confidential/Stealth</span>
                  <EyeOff className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>

              <p className="text-[10px] text-white/40 mt-3.5 leading-normal">
                {builder.privacyMode === 'public' && 'Your profile, name, website, and photos are displayed fully to vetted recruiters.'}
                {builder.privacyMode === 'semi-private' && 'We obscure your photo and hide contact links. Full details unlock only post mutual matching.'}
                {builder.privacyMode === 'confidential' && 'Recruiters see an anonymized alias title (e.g. Systems architect #7F) and your verified proof index.'}
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="glass rounded-xl border border-white/10 p-3.5 space-y-1">
            <button
              onClick={() => setActiveTab('passport')}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'passport'
                  ? 'bg-white/10 text-white border-l-2 border-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              Founder Passport
            </button>

            <button
              onClick={() => setActiveTab('opportunities')}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'opportunities'
                  ? 'bg-white/10 text-white border-l-2 border-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Vetted Opportunities
            </button>

            <button
              onClick={() => setActiveTab('swiper')}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'swiper'
                  ? 'bg-white/10 text-white border-l-2 border-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Double-Blind Swiper
              </span>
              <span className="bg-amber-400 hover:bg-amber-500 text-black text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold transition">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('connections')}
              className={`w-full text-left px-3.5 py-2.5 rounded text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === 'connections'
                  ? 'bg-white/10 text-white border-l-2 border-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                Mutual Connections
              </span>
              {matchedOpportunities.length > 0 && (
                <span className="bg-white/10 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                  {matchedOpportunities.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Columns: Main Action Workspace */}
        <div className="lg:col-span-3 space-y-6 text-left">
          
          {/* Mobile compact header */}
          <div className="lg:hidden flex items-center justify-between gap-4 bg-black/40 border border-white/10 p-4 rounded-xl">
            <div className="flex items-center gap-3 truncate">
              <img
                src={builder.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-white/15 object-cover bg-black flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="truncate">
                <div className="font-bold text-white text-xs tracking-wide truncate">{builder.name}</div>
                <div className="text-[10px] text-white/60 font-mono flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Reputation: {builder.reputationScore}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  const modes: PrivacyMode[] = ['public', 'semi-private', 'confidential'];
                  const nextIndex = (modes.indexOf(builder.privacyMode) + 1) % modes.length;
                  handlePrivacyChange(modes[nextIndex]);
                }}
                className="text-[9px] font-mono bg-white/10 hover:bg-white/20 border border-white/10 px-2 py-1.5 rounded text-white flex items-center gap-1 cursor-pointer"
              >
                <span>{builder.privacyMode === 'public' ? 'Public ✨' : builder.privacyMode === 'semi-private' ? 'Semi-Private 🔐' : 'Stealth 👁️'}</span>
              </button>
            </div>
          </div>
          
          {/* TAB 1: FOUNDER PASSPORT */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              
              {/* Header Hero Stats */}
              <div className="glass rounded-xl border border-white/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card-glow relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>
                
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{builder.name}</h3>
                  <p className="text-white/60 font-semibold font-mono text-xs mt-1">{builder.title}</p>
                  <p className="text-white/40 text-sm mt-3 font-light leading-relaxed max-w-xl">&ldquo;{builder.tagline}&rdquo;</p>
                </div>

                <div className="flex md:flex-col items-center justify-between md:justify-center p-4 bg-black/40 rounded border border-white/5 min-w-[130px] shadow-inner text-center">
                  <span className="text-[10px] font-mono text-white/35 uppercase tracking-widest md:mb-1">Reputation Score</span>
                  <div className="text-4xl font-mono font-black text-white flex items-center gap-1 border-b border-white/5 pb-1 w-full justify-center">
                    {builder.reputationScore}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED LEVEL
                  </span>
                </div>
              </div>

              {/* Dynamic Signals Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl relative group">
                  <div className="text-[10px] font-mono text-white/40 mb-1">FUNDING SECURED</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.fundingRaised > 0 ? `$${(builder.reputationMetrics.fundingRaised / 1000000).toFixed(1)}M` : '$0.0'}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Investor backing</div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono text-white/40 mb-1">DURABLE ANNUAL ARR</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.revenueAnnual > 0 ? `$${(builder.reputationMetrics.revenueAnnual / 1000000).toFixed(1)}M` : '$0.0'}
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Direct operational flow</div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono text-white/40 mb-1">TEAM DEPTH MAX</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.teamSizeMax} people
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Direct engineering report</div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono text-white/40 mb-1">COMPANIES BUILT</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.startupsFoundedCount} Startups
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Direct founder tenure</div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono text-white/40 mb-1">PRODUCTS COMPLETED</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.productsLaunchedCount} Vetted
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Ship impact standard</div>
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-[10px] font-mono text-white/40 mb-1">OS REPOSITORIES</div>
                  <div className="text-lg font-bold font-mono text-white">
                    {builder.reputationMetrics.openSourceContributionsCount} Layers
                  </div>
                  <div className="text-[10px] text-white/30 mt-1 uppercase font-light">Github dependencies</div>
                </div>
              </div>

              {/* Bio block */}
              <div className="glass rounded-xl border border-white/10 p-6 space-y-2">
                <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest">Builder Statement & Journey</h4>
                <p className="text-sm text-white/80 leading-relaxed font-light mt-2">{builder.bio || 'Provide a brief summary profile describing your systems specializations.'}</p>
              </div>

              {/* INTRODUCTORY VIDEO PITCH WORKSPACE */}
              <div className="glass rounded-xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#d97706]" />
                    Introductory Video Pitch
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoEdit(!showVideoEdit);
                      setVideoUrlInput(builder.introductoryVideoUrl || '');
                      setSelectedVideoPresetIdx(null);
                    }}
                    className="text-xs text-amber-500 hover:text-amber-400 font-mono font-medium flex items-center gap-1 cursor-pointer transition bg-transparent border-0"
                  >
                    {builder.introductoryVideoUrl ? '✏ Edit Pitch URL' : '＋ Add Video Pitch'}
                  </button>
                </div>

                {showVideoEdit ? (
                  <div className="p-4 bg-zinc-950 rounded-lg border border-white/5 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Option A: Link Custom MP4 / Video Web URL</label>
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => {
                          setVideoUrlInput(e.target.value);
                          setSelectedVideoPresetIdx(null);
                        }}
                        className="w-full px-3 py-2 text-xs bg-black rounded border border-white/10 focus:border-amber-500 focus:outline-none font-mono text-white"
                        placeholder="Paste direct .mp4, Youtube, Loom, or other video link..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono text-zinc-400 uppercase">Option B: Or Pre-select Sample Founder Pitch Video</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {VIDEO_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedVideoPresetIdx(idx);
                              setVideoUrlInput(preset.url);
                            }}
                            className={`p-2.5 rounded border text-left cursor-pointer transition ${
                              selectedVideoPresetIdx === idx || videoUrlInput === preset.url
                                ? 'bg-amber-500/10 border-amber-500 text-white'
                                : 'bg-black/40 border-white/5 hover:border-white/20 text-zinc-400'
                            }`}
                          >
                            <div className="text-[11px] font-bold text-white mb-0.5 truncate flex items-center gap-1">
                              <Video className="w-3 h-3 text-amber-500" />
                              {preset.name}
                            </div>
                            <p className="text-[9px] leading-normal text-zinc-500 font-light line-clamp-2">{preset.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowVideoEdit(false)}
                        className="px-3 py-1.5 bg-transparent border border-white/10 text-white/60 hover:text-white rounded text-xs font-mono transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateBuilder({
                            ...builder,
                            introductoryVideoUrl: videoUrlInput
                          });
                          setShowVideoEdit(false);
                        }}
                        className="px-4 py-1.5 bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {builder.introductoryVideoUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden bg-black/80 border border-white/10 aspect-video max-h-[300px] flex items-center justify-center">
                          <video
                            src={builder.introductoryVideoUrl}
                            controls
                            className="w-full h-full object-cover"
                            poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
                          <span className="truncate max-w-[70%] text-zinc-400">Active Pitch: <span className="text-zinc-300">{builder.introductoryVideoUrl}</span></span>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateBuilder({
                                ...builder,
                                introductoryVideoUrl: undefined
                              });
                            }}
                            className="text-rose-500 hover:text-rose-400 underline cursor-pointer bg-transparent border-0"
                          >
                            Remove Video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-white/10 border-dashed rounded-xl p-8 text-center bg-black/20 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                          <Video className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-white">No Introductory Video Pitch Linked</h5>
                          <p className="text-[11px] text-zinc-500 font-light max-w-xs leading-normal">
                            Link a personal Loom, YouTube, or direct video pitch to stand out to verified recruiters.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowVideoEdit(true);
                            setSelectedVideoPresetIdx(0);
                            setVideoUrlInput(VIDEO_PRESETS[0].url);
                          }}
                          className="px-3.5 py-1.5 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 transition cursor-pointer"
                        >
                          Quick Pre-load Demo Pitch Video
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Career Timeline Section (With Dynamic Milestone Adder) */}
              <div className="glass rounded-xl border border-white/10 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <h4 className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-white/80" />
                    VETTED CAREER TIMELINE
                  </h4>
                  <button
                    id="add-milestone-toggle"
                    onClick={() => setShowAddMilestone(!showAddMilestone)}
                    className="text-xs text-white hover:text-white/80 font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Milestone
                  </button>
                </div>

                {/* Add Milestone Inline Dialog Form */}
                {showAddMilestone && (
                  <form onSubmit={handleAddMilestone} className="p-4 bg-black border border-white/10 rounded mb-6 space-y-4 text-xs">
                    <h5 className="font-bold text-white text-sm">Create Verified Milestone Signal</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/50 font-mono mb-1">Company</label>
                        <input
                          type="text"
                          required
                          value={newMilestone.company}
                          onChange={e => setNewMilestone(p => ({ ...p, company: e.target.value }))}
                          placeholder="e.g. Stripe"
                          className="w-full bg-[#050505] border border-white/10 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 font-mono mb-1">Role / Position</label>
                        <input
                          type="text"
                          required
                          value={newMilestone.role}
                          onChange={e => setNewMilestone(p => ({ ...p, role: e.target.value }))}
                          placeholder="e.g. Staff Network Architect"
                          className="w-full bg-[#050505] border border-white/10 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 font-mono mb-1">Duration Statement</label>
                        <input
                          type="text"
                          value={newMilestone.duration}
                          onChange={e => setNewMilestone(p => ({ ...p, duration: e.target.value }))}
                          placeholder="e.g. 2022 - 2025"
                          className="w-full bg-[#050505] border border-white/10 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 font-mono mb-1">Tenure Type (Impact Metric mapping)</label>
                        <select
                          value={newMilestone.type}
                          onChange={e => setNewMilestone(p => ({ ...p, type: e.target.value as any }))}
                          className="w-full bg-[#050505] border border-white/10 rounded px-2 py-1.5 text-zinc-300 outline-none focus:border-white/30"
                        >
                          <option value="builder">Systems Builder / dev</option>
                          <option value="founder">Startup Founder / Co-Founder</option>
                          <option value="executive">Hiring Officer / Executive</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/50 font-mono mb-1">Key Impact Statement</label>
                      <textarea
                        value={newMilestone.description}
                        onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))}
                        rows={2}
                        placeholder="Built dynamic load balancers. Managed and hired 8 senior engineering reports..."
                        className="w-full bg-[#050505] border border-white/10 rounded px-2.5 py-1.5 text-zinc-100 outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddMilestone(false)}
                        className="px-3 py-1.5 bg-transparent border border-white/10 text-white/60 hover:text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-white text-black font-bold rounded hover:scale-105 transition"
                      >
                        Commit & Re-calculate Score
                      </button>
                    </div>
                  </form>
                )}

                {/* Timeline display */}
                <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8">
                  {builder.careerTimeline.map(mile => (
                    <div key={mile.id} className="relative group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border border-[#050505] bg-white ring-4 ring-[#050505]"></span>
                      
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h5 id={`milestone-role-${mile.id}`} className="font-bold text-sm text-zinc-200">{mile.role}</h5>
                          <p className="text-xs text-white/50 font-mono mt-0.5">{mile.company} &middot; <span className="text-white/40">{mile.duration}</span></p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-white/60 px-1.5 py-0.5 rounded">
                            {mile.type.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleDeleteTimelineItem(mile.id)}
                            className="text-white/30 hover:text-rose-500 p-1 transition opacity-0 group-hover:opacity-100"
                            title="Remove timeline item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 font-light mt-2 leading-relaxed max-w-xl">{mile.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notable portfolio modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Products */}
                <div className="glass rounded-xl border border-white/10 p-5">
                  <h5 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">Vetted Digital Products</h5>
                  <div className="space-y-4">
                    {builder.productsLaunched.length > 0 ? (
                      builder.productsLaunched.map((p, i) => (
                        <div key={i} className="p-3.5 bg-black/40 rounded border border-white/5 text-xs">
                          <div className="font-semibold text-zinc-200">{p.name}</div>
                          <p className="text-white/50 mt-1">{p.description}</p>
                          <div className="text-[10px] text-white/80 font-mono mt-2 bg-white/5 px-2 py-1 border border-white/10 rounded inline-block">
                            Impact: {p.impact}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/30 italic">No custom digital launches recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Open Source */}
                <div className="glass rounded-xl border border-white/10 p-5">
                  <h5 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">Open Source Repositories</h5>
                  <div className="space-y-4">
                    {builder.openSourceAchievements.length > 0 ? (
                      builder.openSourceAchievements.map((oss, i) => (
                        <div key={i} className="p-3.5 bg-black/40 rounded border border-white/5 text-xs flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-zinc-200">{oss.name}</div>
                            <p className="text-white/50 mt-1">{oss.description}</p>
                            <span className="text-[10px] text-white/40 font-mono uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                              Role: {oss.role}
                            </span>
                          </div>
                          {oss.stars && (
                            <div className="flex items-center gap-1 bg-white/5 text-white font-mono text-[11px] px-2 py-0.5 rounded border border-white/10">
                              <Star className="w-3 h-3 fill-white/80 text-white" />
                              {oss.stars >= 1000 ? `${(oss.stars / 1000).toFixed(1)}k` : oss.stars}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/30 italic">No open source libraries recorded in metrics.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VETTED OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              
              {/* Opportunities Header Search Category Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 border border-white/10 p-4 rounded-xl">
                {/* Horizontal Switcher List */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded border border-white/10">
                  {(['jobs', 'startup', 'advisory', 'board'] as OpportunityCategory[]).map(cat => (
                    <button
                      key={cat}
                      id={`opt-tab-${cat}`}
                      onClick={() => setOppCategory(cat)}
                      className={`px-3.5 py-1.5 rounded text-xs font-bold transition capitalize cursor-pointer ${
                        oppCategory === cat
                          ? 'bg-white text-black shadow-sm'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {cat === 'jobs' ? 'Jobs' : cat === 'startup' ? 'Startup Roles' : cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Match reputation threshold only:</span>
                  <button
                    onClick={() => setShowMatchOnly(!showMatchOnly)}
                    className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${
                      showMatchOnly ? 'bg-white' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-[#050505] transition-transform ${
                        showMatchOnly ? 'translate-x-[14px]' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>

              {/* Opportunity Cards List */}
              <div className="space-y-4">
                {filteredOpportunities.length > 0 ? (
                  filteredOpportunities.map(opp => {
                    const meetsThreshold = builder.reputationScore >= opp.reputationThreshold;
                    const alreadyApplied = opp.applicantIds.includes(builder.id);
                    const recruiterMatched = builder.interestedRecruiterIds.includes(opp.postedByRecruiterId);

                    return (
                      <div
                        key={opp.id}
                        id={`opp-card-${opp.id}`}
                        className={`glass rounded-xl border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition ${
                          alreadyApplied
                            ? 'border-white/5 bg-white/[0.02]'
                            : meetsThreshold
                            ? 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'
                            : 'border-white/5 bg-black/40 opacity-50'
                        }`}
                      >
                        {/* Company Details Column */}
                        <div className="flex items-start gap-4">
                          <img
                             src={opp.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                             alt="Logo"
                             className="w-12 h-12 rounded bg-black border border-white/10 object-cover"
                             referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs text-white/40 font-light">{opp.company}</span>
                              <span className="text-[10px] font-mono bg-white/5 text-white/60 border border-white/10 px-1.5 py-0.2 rounded">
                                {opp.location}
                              </span>
                            </div>
                            <h4 className="text-md font-bold text-white mt-1">{opp.title}</h4>
                            <p className="text-xs text-white/60 max-w-xl font-light mt-2 leading-relaxed">
                              {opp.description}
                            </p>

                            {/* Requirements chips */}
                            <div className="flex flex-wrap gap-2.5 mt-3.5">
                              {opp.requirements.map((req, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-black text-white/40 border border-white/5 px-2 py-0.5 rounded font-light"
                                >
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action details panel */}
                        <div className="md:text-right flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                          <div>
                            <div className="text-xs font-bold text-white font-mono">{opp.compensation}</div>
                            {opp.equity && (
                              <div className="text-[10px] text-white/60 font-mono mt-0.5">Equity: {opp.equity}</div>
                            )}
                            <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-white/45 justify-end">
                              Threshold Score:
                              <span
                                className={`font-bold ${
                                  meetsThreshold ? 'text-emerald-400' : 'text-white'
                                }`}
                              >
                                {opp.reputationThreshold}
                              </span>
                            </div>
                          </div>

                          {/* CTA Trigger */}
                          <div>
                            {alreadyApplied ? (
                              recruiterMatched ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs px-4 py-2 font-semibold rounded">
                                  Mutual Match!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-white/40 bg-white/5 border border-white/10 text-xs px-4 py-2 font-medium rounded">
                                  Interest Expressed
                                </span>
                              )
                            ) : meetsThreshold ? (
                              <button
                                id={`express-interest-${opp.id}`}
                                onClick={() => onExpressInterest(opp.id)}
                                className="px-4 py-2 bg-white text-black hover:scale-105 active:scale-95 text-xs font-semibold rounded shadow transition cursor-pointer"
                              >
                                Express Interest
                              </button>
                            ) : (
                              <div className="text-xs font-mono text-white/50 border border-white/10 bg-white/5 px-3 py-2 rounded flex items-center gap-1.5 max-w-[150px] leading-tight text-center">
                                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                Index Locked (Needs {opp.reputationThreshold})
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-white/10 rounded-xl bg-white/[0.01] text-white/30 text-xs">
                    No opportunities matching selection parameters. Try disabling filters.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: SWIPER */}
          {activeTab === 'swiper' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-5 rounded-xl text-left">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="font-mono text-xs text-amber-300 font-bold uppercase tracking-wider">Double-Blind Matching Algorithmic Swiper</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1 tracking-tight">EVALUATE AND MATCH OPPORTUNITIES</h3>
                <p className="text-xs text-white/50 font-light mt-1 max-w-2xl leading-relaxed">
                  Swipe right or press <strong className="text-white">Interest</strong> to express mutual commitment. The opportunity is notified instantly, and contact info will unlock only when they also match you back. Private, fast, and strict.
                </p>
              </div>

              {/* CARD CONTAINER STACK */}
              <div className="flex flex-col items-center justify-center py-6 min-h-[500px]">
                {(() => {
                  const swipableList = opportunities.filter(o => !o.applicantIds.includes(builder.id) && !skippedOpps.includes(o.id));
                  
                  if (swipableList.length === 0) {
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 px-6 border border-white/10 rounded-xl bg-white/[0.02] max-w-md w-full space-y-4"
                      >
                        <Compass className="w-12 h-12 text-white/20 mx-auto" />
                        <h4 className="text-md font-bold text-white tracking-tight">You've evaluated all active items!</h4>
                        <p className="text-xs text-white/40 leading-relaxed font-light">
                          There are no more swipable opportunities left in the current queue. You can clear your skip history to evaluate omitted roles again.
                        </p>
                        {skippedOpps.length > 0 && (
                          <button
                            onClick={() => setSkippedOpps([])}
                            className="px-4 py-2 bg-white text-black font-semibold rounded text-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                          >
                            Reset Skipped Deck ({skippedOpps.length})
                          </button>
                        )}
                      </motion.div>
                    );
                  }

                  const activeOpp = swipableList[0];
                  const meetsThreshold = builder.reputationScore >= activeOpp.reputationThreshold;

                  return (
                    <div className="relative w-full max-w-sm h-full flex flex-col justify-between">
                      {/* Swipe overlay tags */}
                      <AnimatePresence>
                        <div className="absolute top-4 left-4 z-20 pointer-events-none rotate-[-12deg]">
                          <div className="border-2 border-emerald-500 text-emerald-400 bg-black/90 px-3 py-1 font-mono text-xs uppercase font-extrabold tracking-widest rounded-md opacity-20 hover:opacity-100 transition duration-150">
                            LIKE / INTEREST
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 z-20 pointer-events-none rotate-[12deg]">
                          <div className="border-2 border-rose-500 text-rose-400 bg-black/90 px-3 py-1 font-mono text-xs uppercase font-extrabold tracking-widest rounded-md opacity-20 hover:opacity-100 transition duration-150">
                            PASS / SKIP
                          </div>
                        </div>
                      </AnimatePresence>

                      <motion.div
                        key={activeOpp.id}
                        drag="x"
                        dragConstraints={{ left: -100, right: 100 }}
                        onDragEnd={(e, info) => {
                          if (info.offset.x > 80) {
                            if (meetsThreshold) {
                              onExpressInterest(activeOpp.id);
                            } else {
                              // can not express interest if locked
                              setSkippedOpps(prev => [...prev, activeOpp.id]);
                            }
                          } else if (info.offset.x < -80) {
                            setSkippedOpps(prev => [...prev, activeOpp.id]);
                          }
                        }}
                        className={`glass rounded-2xl border p-6 flex flex-col justify-between gap-6 cursor-grab active:cursor-grabbing shadow-2xl relative overflow-hidden bg-black/90 ${
                          meetsThreshold ? 'border-white/10' : 'border-rose-900/40 bg-zinc-950/90'
                        }`}
                        style={{ touchAction: 'none' }}
                        whileDrag={{ scale: 1.02, rotate: 1.5 }}
                      >
                        {/* Background flare gradient */}
                        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>

                        {/* Top corner category & location */}
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                            <span className="text-[9px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              {activeOpp.category}
                            </span>
                            <span className="text-[10px] text-white/50 font-mono">
                              📍 {activeOpp.location}
                            </span>
                          </div>

                          {/* Company info */}
                          <div className="flex items-center gap-3.5 mt-4">
                            <img
                              src={activeOpp.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128'}
                              alt={activeOpp.company}
                              className="w-10 h-10 rounded border border-white/10 bg-black object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-[11px] font-mono text-white/40 tracking-wider uppercase font-semibold leading-none">{activeOpp.company}</div>
                              <h4 className="text-md font-extrabold text-white mt-1 leading-tight">{activeOpp.title}</h4>
                            </div>
                          </div>

                          {/* Core Parameters */}
                          <div className="grid grid-cols-2 gap-3 mt-4 bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs leading-none">
                            <div>
                              <span className="text-[9px] text-white/30 uppercase font-mono block">Compensation</span>
                              <span className="text-white font-bold font-mono block mt-1">{activeOpp.compensation}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-white/30 uppercase font-mono block">Equity Incentive</span>
                              <span className="text-white font-bold font-mono block mt-1">{activeOpp.equity || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Description snippet */}
                          <p className="text-xs text-white/60 font-light mt-4 leading-relaxed line-clamp-3">
                            {activeOpp.description}
                          </p>

                          {/* Requirements */}
                          <div className="mt-4">
                            <span className="text-[9px] text-white/30 uppercase font-mono block mb-2 font-bold select-none">Expected Profile Characteristics:</span>
                            <div className="flex flex-col gap-1.5">
                              {activeOpp.requirements.map((req, i) => (
                                <div key={i} className="flex items-start gap-1.5 text-xs text-white/50 font-light">
                                  <span className="text-amber-400 mt-1 flex-shrink-0">&middot;</span>
                                  <span>{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Threshold score status */}
                        <div className="mt-2 border-t border-white/5 pt-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] text-zinc-400 font-mono">Requires Score of:</span>
                            <span className="font-bold font-mono text-amber-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                              {activeOpp.reputationThreshold}
                            </span>
                          </div>
                          
                          <div className="mt-2 text-[11px] text-center">
                            {meetsThreshold ? (
                              <div className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 py-1.5 rounded-md flex items-center justify-center gap-1">
                                <Check className="w-3.5 h-3.5 animate-pulse" />
                                Credentials Unlocked ({builder.reputationScore})
                              </div>
                            ) : (
                              <div className="text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/25 py-1.5 rounded-md flex items-center justify-center gap-1">
                                <Lock className="w-3.5 h-3.5" />
                                Locked (Your Score {builder.reputationScore} is below {activeOpp.reputationThreshold})
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Manual Action Buttons (Mobile & Desktop fallbacks) */}
                      <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                          onClick={() => setSkippedOpps(prev => [...prev, activeOpp.id])}
                          className="w-12 h-12 bg-zinc-900 border border-white/10 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                          title="Skip option (Swipe Left)"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>

                        <button
                          disabled={!meetsThreshold}
                          onClick={() => onExpressInterest(activeOpp.id)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition select-none ${
                            meetsThreshold
                              ? 'bg-white hover:bg-zinc-200 text-black hover:scale-110 active:scale-95 cursor-pointer'
                              : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed'
                          }`}
                          title={meetsThreshold ? "Match Interest! (Swipe Right)" : "Credentials locked"}
                        >
                          <Sparkles className={`w-6 h-6 ${meetsThreshold ? 'text-amber-500 animate-pulse' : ''}`} />
                        </button>
                      </div>

                      <div className="text-center text-[10px] text-white/30 font-mono mt-3.5 select-none">
                        Tip: Drag card to swipe or tap actions.
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 3: MUTUAL CONNECTIONS & INTEGRATED MESSAGE DRAWER */}
          {activeTab === 'connections' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Connection Swapper list */}
                <div className={`md:col-span-1 space-y-3 ${activeChatMatchId ? 'hidden md:block' : 'block'}`}>
                  <h4 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-2">Vetted Matches</h4>
                  {matchedOpportunities.length > 0 ? (
                    matchedOpportunities.map(opp => {
                      const matchId = `${builder.id}_${opp.postedByRecruiterId}`;
                      const lastMsg = messages.filter(m => m.matchId === matchId).slice(-1)[0];

                      return (
                        <button
                          key={opp.id}
                          id={`chat-room-${opp.postedByRecruiterId}`}
                          onClick={() => setActiveChatMatchId(matchId)}
                          className={`w-full text-left p-3.5 rounded border transition-all cursor-pointer ${
                            activeChatMatchId === matchId
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-black/40 border-white/5 hover:bg-white/5 text-white/40 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs truncate uppercase tracking-wider text-white">{opp.company}</div>
                          <div className="text-xs font-medium truncate mt-0.5 text-white/60">{opp.title}</div>
                          <p className="text-[10px] text-white/40 truncate mt-2">
                            {lastMsg ? `Last msg: ${lastMsg.text}` : 'Mutual interest locked. Say hello!'}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 border border-white/10 rounded text-white/30 text-xs italic">
                      No active matches yet. Browse opportunities and Express Interest to request communication.
                    </div>
                  )}
                </div>

                {/* Primary Integrated Messenger Window */}
                <div className={`md:col-span-2 glass rounded-xl border border-white/10 flex flex-col justify-between min-h-[420px] relative overflow-hidden ${!activeChatMatchId ? 'hidden md:flex' : 'flex'}`}>
                  {activeChatMatchId ? (
                    <>
                      {/* Active Connection Title */}
                      <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          {/* Back to list button for mobile */}
                          <button
                            onClick={() => setActiveChatMatchId(null)}
                            className="md:hidden p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded mr-1 hover:text-white transition"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <div className="truncate">
                            <span className="text-[10px] uppercase font-mono text-white/50 block">Secure Direct Access Channel</span>
                            <h4 className="font-bold text-sm text-white truncate">
                              {opportunities.find(o => `${builder.id}_${o.postedByRecruiterId}` === activeChatMatchId)?.company || 'Corporate Officer'}
                            </h4>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase flex-shrink-0">
                          MATCH ACTIVE
                        </span>
                      </div>

                      {/* Messages Container */}
                      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[300px]">
                        {activeChatMessages.length > 0 ? (
                          activeChatMessages.map(msg => {
                            const isMe = msg.senderId === builder.id;
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
                            Communication channel initialized. Send a secure greeting to initiate schedules.
                          </div>
                        )}
                      </div>

                      {/* Chat Input Bar */}
                      <form onSubmit={handleSendText} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
                        <input
                          id="chat-input-field"
                          type="text"
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder="Compose secure encrypted message..."
                          className="flex-1 bg-[#050505] border border-white/10 focus:border-white/30 text-xs text-zinc-100 px-3.5 py-2.5 rounded outline-none transition"
                        />
                        <button
                          id="chat-send-btn"
                          type="submit"
                          className="px-4 py-2.5 bg-white text-black text-xs font-semibold rounded flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95 shadow"
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
                        To build new connections, express mutual matching intentions in opportunities tabs, or wait for recruiters reviews.
                      </p>
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          )}

        </div>

      </div>

      {/* Bottom tab bar for mobile viewports */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 py-2.5 px-4 flex justify-around items-center shadow-2xl safe-bottom">
        <button
          onClick={() => setActiveTab('passport')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
            activeTab === 'passport' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Passport</span>
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
            activeTab === 'opportunities' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('swiper')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
            activeTab === 'swiper' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Swiper</span>
        </button>

        <button
          onClick={() => setActiveTab('connections')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none relative ${
            activeTab === 'connections' ? 'text-amber-400 font-bold' : 'text-white/40 hover:text-white'
          }`}
        >
          <span className="relative">
            <MessageSquare className="w-4 h-4" />
            {matchedOpportunities.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black text-[8px] font-bold font-mono px-1 leading-normal rounded-full min-w-[12px] text-center">
                {matchedOpportunities.length}
              </span>
            )}
          </span>
          <span>Matches</span>
        </button>
      </div>
    </div>
  );
}
