/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import {
  BuilderPassport,
  Opportunity,
  VerificationApplication,
  Message,
  AppState
} from './types';
import {
  INITIAL_BUILDERS,
  INITIAL_OPPORTUNITIES,
  INITIAL_APPLICATIONS,
  INITIAL_MESSAGES,
  calculateReputationScore
} from './data';
import LandingPage from './components/LandingPage';
import ApplicationForm from './components/ApplicationForm';
import MemberDashboard from './components/MemberDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';
import Logo from './components/Logo';
import { ShieldCheck, Command, Compass, User, Sparkles, Building, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'foundersonly_v1_state';

const uniqById = <T extends { id: string }>(arr: T[]): T[] => {
  const seen = new Set<string>();
  return arr.filter(item => {
    if (!item || !item.id) return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

export default function App() {
  // Master Integrated Database State with resilient lazy initializers to protect mounting renders
  const [builders, setBuilders] = useState<BuilderPassport[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.builders && parsed.builders.length > 0) return uniqById(parsed.builders as BuilderPassport[]);
      }
    } catch (_) {}
    return uniqById(INITIAL_BUILDERS);
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.opportunities && parsed.opportunities.length > 0) return uniqById(parsed.opportunities as Opportunity[]);
      }
    } catch (_) {}
    return uniqById(INITIAL_OPPORTUNITIES);
  });

  const [applications, setApplications] = useState<VerificationApplication[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.applications && parsed.applications.length > 0) return uniqById(parsed.applications as VerificationApplication[]);
      }
    } catch (_) {}
    return uniqById(INITIAL_APPLICATIONS);
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.messages && parsed.messages.length > 0) return uniqById(parsed.messages as Message[]);
      }
    } catch (_) {}
    return uniqById(INITIAL_MESSAGES);
  });

  // Simulation parameters
  const [currentRole, setCurrentRole] = useState<'guest' | 'builder' | 'recruiter'>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.currentRole) return parsed.currentRole;
      }
    } catch (_) {}
    return 'guest';
  });

  const [currentBuilderId, setCurrentBuilderId] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.currentBuilderId) return parsed.currentBuilderId;
      }
    } catch (_) {}
    return 'builder_sarah_jenkins'; // Logged in as pre-vetted Sarah Jenkins by default to test out features
  });

  const [currentRecruiterId] = useState<string>('rec_stripe_premium');
  const [showAppliedSuccess, setShowAppliedSuccess] = useState(false);
  const [lastSubmittedApp, setLastSubmittedApp] = useState<VerificationApplication | null>(null);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Countdown timer for auto-redirection when approved
  useEffect(() => {
    if (showAppliedSuccess && lastSubmittedApp?.geminiVerification?.decision === 'APPROVED') {
      setRedirectCountdown(5);
    } else {
      setRedirectCountdown(null);
    }
  }, [showAppliedSuccess, lastSubmittedApp]);

  useEffect(() => {
    if (redirectCountdown === null) return;
    if (redirectCountdown <= 0) {
      setCurrentRole('builder');
      setShowAppliedSuccess(false);
      setRedirectCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  // Initialize and Sync State from LocalStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed: AppState = JSON.parse(cached);
        if (parsed.builders && parsed.builders.length > 0) setBuilders(uniqById(parsed.builders));
        if (parsed.opportunities && parsed.opportunities.length > 0) setOpportunities(uniqById(parsed.opportunities));
        if (parsed.applications) setApplications(uniqById(parsed.applications));
        if (parsed.messages) setMessages(uniqById(parsed.messages));
        if (parsed.currentRole) setCurrentRole(parsed.currentRole);
        if (parsed.currentBuilderId) setCurrentBuilderId(parsed.currentBuilderId);
      } else {
        // Boostrap Database from Seed Data
        saveState(uniqById(INITIAL_BUILDERS), uniqById(INITIAL_OPPORTUNITIES), uniqById(INITIAL_APPLICATIONS), uniqById(INITIAL_MESSAGES), 'guest');
      }
    } catch (e) {
      console.warn('LocalStorage error, fallback to seed arrays', e);
    }
  }, []);

  // Sync state helper
  const saveState = (
    b: BuilderPassport[],
    opps: Opportunity[],
    apps: VerificationApplication[],
    msgs: Message[],
    role: 'guest' | 'builder' | 'recruiter' = currentRole
  ) => {
    const cleanB = uniqById(b);
    const cleanOpps = uniqById(opps);
    const cleanApps = uniqById(apps);
    const cleanMsgs = uniqById(msgs);

    const updatedState: AppState = {
      currentRole: role,
      currentBuilderId,
      currentRecruiterId,
      builders: cleanB,
      opportunities: cleanOpps,
      applications: cleanApps,
      messages: cleanMsgs
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedState));
  };

  const flashNotification = (text: string) => {
    setGlobalNotification(text);
    setTimeout(() => {
      setGlobalNotification(null);
    }, 5500);
  };

  // Callback 1: Builder updates passport edits
  const handleUpdateBuilder = (updatedBuilder: BuilderPassport) => {
    const nextBuilders = builders.map(b => (b.id === updatedBuilder.id ? updatedBuilder : b));
    setBuilders(nextBuilders);
    saveState(nextBuilders, opportunities, applications, messages);
    flashNotification('Founder Passport successfully synced and recalculated on platform ledger.');
  };

  // Callback 2: Builder expresses interest in an Opportunity
  const handleExpressInterest = (opportunityId: string) => {
    if (!currentBuilderId) return;

    // Add candidate to opportunity
    const nextOpps = opportunities.map(opp => {
      if (opp.id === opportunityId) {
        if (!opp.applicantIds.includes(currentBuilderId)) {
          return {
            ...opp,
            applicantIds: [...opp.applicantIds, currentBuilderId]
          };
        }
      }
      return opp;
    });

    // Check for mutual match!
    const targetOpp = opportunities.find(o => o.id === opportunityId);
    let matchedNotification = false;
    
    if (targetOpp) {
      // Find active builder details
      const activeBuilder = builders.find(b => b.id === currentBuilderId);
      if (activeBuilder) {
        // If recruiter had already indicated match interest
        if (activeBuilder.matchedRecruiterIds.includes(targetOpp.postedByRecruiterId)) {
          matchedNotification = true;
        }
      }
    }

    setOpportunities(nextOpps);
    saveState(builders, nextOpps, applications, messages);

    if (matchedNotification) {
      flashNotification(`⚡ SUCCESSFUL MUTUAL MATCH! Identity connection unlocked with ${targetOpp?.company}! Secure messenger channel is open.`);
    } else {
      flashNotification('Interest safely logged. Double-blind verification keeps your details locked until recruiter expresses mutual interest.');
    }
  };

  // Callback 3: Recruiter toggles match-interest in builder
  const handleToggleRecruiterMatch = (builderId: string) => {
    const activeBuilder = builders.find(b => b.id === builderId);
    if (!activeBuilder) return;

    const isCurrentlyInterested = activeBuilder.matchedRecruiterIds.includes(currentRecruiterId);
    let nextBuilders: BuilderPassport[] = [];
    let isMutualNow = false;

    if (isCurrentlyInterested) {
      // Remove interest
      nextBuilders = builders.map(b => {
        if (b.id === builderId) {
          return {
            ...b,
            matchedRecruiterIds: b.matchedRecruiterIds.filter(id => id !== currentRecruiterId)
          };
        }
        return b;
      });
    } else {
      // Add interest and check if builder already expressed interest in recruiters opportunity!
      nextBuilders = builders.map(b => {
        if (b.id === builderId) {
          return {
            ...b,
            matchedRecruiterIds: [...b.matchedRecruiterIds, currentRecruiterId]
          };
        }
        return b;
      });

      // Find any opportunity posted by this recruiter
      const recruiterPostings = opportunities.filter(o => o.postedByRecruiterId === currentRecruiterId);
      const builderHasInterest = recruiterPostings.some(opp => opp.applicantIds.includes(builderId));
      if (builderHasInterest) {
        isMutualNow = true;
      }
    }

    // Sync interest reciprocal tracker directly to opportunity fields for seamless layout state
    const nextOpps = opportunities.map(opp => {
      if (opp.postedByRecruiterId === currentRecruiterId) {
        if (!isCurrentlyInterested) {
          // If mutual or just tracking recruiter interest, keep synchronization matching
          if (!opp.matchedBuilderIds.includes(builderId)) {
            return {
              ...opp,
              matchedBuilderIds: [...opp.matchedBuilderIds, builderId]
            };
          }
        } else {
          return {
            ...opp,
            matchedBuilderIds: opp.matchedBuilderIds.filter(id => id !== builderId)
          };
        }
      }
      return opp;
    });

    setBuilders(nextBuilders);
    setOpportunities(nextOpps);
    saveState(nextBuilders, nextOpps, applications, messages);

    if (isMutualNow) {
      flashNotification(`⚡ SUCCESSFUL MUTUAL MATCH! Connected with ${activeBuilder.name}. Messenger channel unlocked!`);
    } else {
      flashNotification(!isCurrentlyInterested ? 'Match interest logged safely. Waiting for builder response.' : 'Match interest retracted.');
    }
  };

  // Callback 4: Instant Messenger text dispatcher
  const handleSendMessage = (matchId: string, text: string) => {
    const senderId = currentRole === 'builder' ? (currentBuilderId || 'unknown') : currentRecruiterId;
    const senderName = currentRole === 'builder'
      ? (builders.find(b => b.id === currentBuilderId)?.name || 'Builder')
      : 'Corporate Recruiter';

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      matchId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString()
    };

    const nextMsgs = uniqById([...messages, newMsg]);
    setMessages(nextMsgs);
    saveState(builders, opportunities, applications, nextMsgs);
  };

  // Callback 5: Recruiter Approves Pending Application -> Hydrates passport & logs them in!
  const handleApproveApplication = (app: VerificationApplication) => {
    // 1. Mark application as verified
    const nextApps = applications.map(a => (a.id === app.id ? { ...a, status: 'verified' as const } : a));
    setApplications(nextApps);

    // 2. Compute dynamic metrics and reputation score
    const metrics = {
      fundingRaised: Number(app.fundingRaisedInput) || 0,
      revenueAnnual: Number(app.revenueAnnualInput) || 0,
      teamSizeMax: Number(app.teamSizeMaxInput) || 0,
      startupsFoundedCount: Number(app.startupsFoundedInput) || 0,
      productsLaunchedCount: Number(app.productsLaunchedInput) || 0,
      openSourceContributionsCount: Number(app.openSourceContributionsCountInput) || 0
    };

    const calculatedRScore = calculateReputationScore(metrics);

    // Compute and append achievements
    const notableAchievements = [
      'Cleared high-trust OnlyFounders ledger proof evaluation.',
      `Assigned score of ${calculatedRScore} based on verified metrics.`
    ];
    if (app.geminiVerification) {
      notableAchievements.push(`Gemini AI Archetype: ${app.geminiVerification.builderProfileArchetype}`);
      notableAchievements.push(`AI Vetting Integrity Confidence: ${app.geminiVerification.confidenceScore}%`);
    }

    // 3. Construct premium Builder Passport profiles
    const newPassport: BuilderPassport = {
      id: `builder_${app.id}`,
      name: app.name,
      title: app.title || 'Elite Operator & Systems Architect',
      tagline: app.tagline || 'Proven startup builder with high systems experience.',
      bio: app.bio || 'Admitted via rigorous evidence-first proof evaluation of funding, team metrics, and product launches.',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?q=80&w=256&h=256&fit=crop`,
      email: app.email,
      isVerified: true,
      privacyMode: 'public', // Baseline public status
      reputationScore: app.geminiVerification?.suggestedReputationScore || calculatedRScore,
      reputationMetrics: metrics,
      careerTimeline: [
        {
          id: `mile_app_${app.id}`,
          role: app.title.split('@')[0]?.trim() || 'Founding Engineer',
          company: app.title.split('@')[1]?.trim() || 'Horizon Tech',
          duration: '2023 - 2026',
          description: app.bio || 'Directing core platform frameworks.',
          verified: true,
          type: metrics.startupsFoundedCount > 0 ? 'founder' : 'builder'
        }
      ],
      productsLaunched: [
        {
          name: 'Verified Project Alpha',
          description: 'Secure microservices framework verified during admissions audit.',
          impact: 'Core operational integration.'
        }
      ],
      openSourceAchievements: [],
      notableAchievements,
      interestedRecruiterIds: [],
      matchedRecruiterIds: [],
      appliedAt: new Date().toISOString()
    };

    const nextBuilders = uniqById([...builders, newPassport]);
    setBuilders(nextBuilders);

    // 4. Set current logged-in identity to the newly created builder
    setCurrentBuilderId(newPassport.id);
    
    saveState(nextBuilders, opportunities, nextApps, messages);
    flashNotification(`Approved ${app.name}! Generated verified Founder Passport with score ${calculatedRScore}. Profile is live.`);
  };

  // Callback 6: Recruiter rejects files
  const handleRejectApplication = (appId: string) => {
    const nextApps = applications.map(a => (a.id === appId ? { ...a, status: 'rejected' as const } : a));
    setApplications(nextApps);
    saveState(builders, opportunities, nextApps, messages);
    flashNotification('Application profile vetoed successfully.');
  };

  // Callback 7: Guest applies via wizard
  const handleGuestSubmitApplication = (newApp: Omit<VerificationApplication, 'id' | 'status' | 'appliedAt'>) => {
    const isApproved = newApp.geminiVerification?.decision === 'APPROVED';
    const app: VerificationApplication = {
      ...newApp,
      id: `app_${Date.now()}`,
      status: isApproved ? 'verified' as const : 'pending' as const,
      appliedAt: new Date().toISOString()
    };

    let nextBuilders = [...builders];
    if (isApproved) {
      // Create and inject Passport profile automatically
      const metrics = {
        fundingRaised: Number(app.fundingRaisedInput) || 0,
        revenueAnnual: Number(app.revenueAnnualInput) || 0,
        teamSizeMax: Number(app.teamSizeMaxInput) || 0,
        startupsFoundedCount: Number(app.startupsFoundedInput) || 0,
        productsLaunchedCount: Number(app.productsLaunchedInput) || 0,
        openSourceContributionsCount: Number(app.openSourceContributionsCountInput) || 0
      };

      const calculatedRScore = calculateReputationScore(metrics);
      const notableAchievements = [
        'Cleared high-trust OnlyFounders ledger proof evaluation.',
        `Assigned score of ${app.geminiVerification?.suggestedReputationScore || calculatedRScore} based on verified metrics.`
      ];
      if (app.geminiVerification) {
        notableAchievements.push(`Gemini AI Archetype: ${app.geminiVerification.builderProfileArchetype}`);
        notableAchievements.push(`AI Vetting Integrity Confidence: ${app.geminiVerification.confidenceScore}%`);
      }

      const newPassport: BuilderPassport = {
        id: `builder_${app.id}`,
        name: app.name,
        title: app.title || 'Elite Operator & Systems Architect',
        tagline: app.tagline || 'Proven startup builder with high systems experience.',
        bio: app.bio || 'Admitted via rigorous evidence-first proof evaluation of funding, team metrics, and product launches.',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50000)}?q=80&w=256&h=256&fit=crop`,
        email: app.email,
        isVerified: true,
        privacyMode: 'public',
        reputationScore: app.geminiVerification?.suggestedReputationScore || calculatedRScore,
        reputationMetrics: metrics,
        careerTimeline: [
          {
            id: `mile_app_${app.id}`,
            role: app.title.split('@')[0]?.trim() || 'Founding Engineer',
            company: app.title.split('@')[1]?.trim() || 'Horizon Tech',
            duration: '2023 - 2026',
            description: app.bio || 'Directing core platform frameworks.',
            verified: true,
            type: metrics.startupsFoundedCount > 0 ? 'founder' : 'builder'
          }
        ],
        productsLaunched: [
          {
            name: 'Verified Project Alpha',
            description: 'Secure microservices framework verified during admissions audit.',
            impact: 'Core operational integration.'
          }
        ],
        openSourceAchievements: [],
        notableAchievements,
        interestedRecruiterIds: [],
        matchedRecruiterIds: [],
        appliedAt: new Date().toISOString()
      };

      nextBuilders = uniqById([...builders, newPassport]);
      setBuilders(nextBuilders);
      setCurrentBuilderId(newPassport.id);
    }

    const nextApps = [app, ...applications];
    setApplications(nextApps);
    setLastSubmittedApp(app);
    saveState(nextBuilders, opportunities, nextApps, messages, 'guest');
    setShowAppliedSuccess(true);
    if (isApproved) {
      flashNotification(`⚡ IMMUTABLE LEDGER VERIFICATION PASSED! Admitted as a verified platform peer under ${app.name}!`);
    } else {
      flashNotification('Verification application launched. Reviewers are evaluating files inside the Recruiter review workstation.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      
      {/* GLOBAL HUD NOTIFICATION BAR */}
      {globalNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-zinc-900 border border-amber-500/30 rounded-lg shadow-[0_4px_30px_rgba(245,158,11,0.1)] flex items-start gap-3 animate-slide-in text-left">
          <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">OnlyFounders Ledger Alert</div>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{globalNotification}</p>
          </div>
        </div>
      )}

      {/* FLOATING TOP GRAPHICAL ROUTER CONTROL BAR */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
        <div className="glass rounded-full px-4 py-2 border border-zinc-800/80 shadow-2xl flex items-center justify-between gap-4 text-xs">
          <button
            onClick={() => {
              setCurrentRole('guest');
              setShowAppliedSuccess(false);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition group text-left bg-transparent border-0 p-0"
          >
            <Logo size={20} className="group-hover:rotate-[15deg] transition-transform" />
            <span className="font-extrabold tracking-tight text-white hidden sm:inline group-hover:text-amber-400 transition-colors">OnlyFounders</span>
          </button>

          <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-full border border-zinc-900 shadow-inner">
            <button
              onClick={() => setCurrentRole('builder')}
              className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                currentRole === 'builder'
                  ? 'bg-zinc-900 text-amber-500 border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Talent Lounge
            </button>

            <button
              onClick={() => setCurrentRole('recruiter')}
              className={`px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                currentRole === 'recruiter'
                  ? 'bg-zinc-900 text-amber-500 border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Employer Space
            </button>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 hidden md:inline">
            {currentRole === 'builder' && (
              <span className="text-amber-500/80">Active ID: {builders.find(b => b.id === currentBuilderId)?.name || 'Sarah'}</span>
            )}
            {currentRole === 'recruiter' && <span className="text-zinc-400">Node: Stripe Rep</span>}
            {currentRole === 'guest' && <span className="text-zinc-500">Node: Guest</span>}
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE ROUTED STATES */}
      <div className="flex-1">
        {currentRole === 'guest' && (
          showAppliedSuccess ? (
            (() => {
              const gv = lastSubmittedApp?.geminiVerification;
              const isApproved = gv?.decision === 'APPROVED';
              const isFlagged = gv?.decision === 'FLAGGED';
              const isRejected = gv?.decision === 'REJECTED';
              
              const teamSize = lastSubmittedApp?.teamSizeMaxInput || "0";
              const startups = lastSubmittedApp?.startupsFoundedInput || "0";
              const funding = lastSubmittedApp?.fundingRaisedInput || "0";
              const revenue = lastSubmittedApp?.revenueAnnualInput || "0";

              return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#050505] relative overflow-hidden">
                  {/* Ambient colorful grid/glow background */}
                  <div className="absolute inset-0 artistic-grid opacity-20 pointer-events-none"></div>
                  <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
                  
                  <div className="w-full max-w-2xl bg-black/40 border border-zinc-900 rounded-2xl p-6 md:p-8 space-y-6 relative z-10 shadow-2xl glass-card-glow text-left">
                    
                    {/* Status Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-[#d97706] uppercase font-bold">OnlyFounders Ledger Vetting Status</span>
                        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Onboarding Audit Verdict</h3>
                      </div>
                      
                      {gv ? (
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          {isApproved && (
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              ✔ ALL DETAILS VERIFIED
                            </span>
                          )}
                          {isFlagged && (
                            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              ⚠ DETAILS FLAGGED
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono font-bold rounded uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              ✖ EXCEPTION TRIGGERED
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono rounded uppercase">
                          MANUAL PRESCRIPTION
                        </span>
                      )}
                    </div>

                    {/* Central Badge Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Verdict Summary Card */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-900/80 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">Gemini Executive Summary</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-light">
                            {gv ? gv.aiAuditNotes : "The application files were successfully logged in the ledger and await human operator verification."}
                          </p>
                          
                          {gv?.legitimacyFeedback && (
                            <div className="pt-2 border-t border-white/5 space-y-1">
                              <span className="text-[9px] font-mono text-emerald-400 uppercase block font-bold">LEGITIMACY ADVISORY</span>
                              <p className="text-xs text-zinc-400 leading-relaxed font-light">{gv.legitimacyFeedback}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Key Indicators Bar */}
                      <div className="space-y-3">
                        <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-900/80 space-y-1 text-center flex flex-col justify-center min-h-[90px]">
                          <span className="text-[9px] font-mono text-white/40 uppercase">AI Integrity Index</span>
                          <span className="text-2xl font-black font-mono text-white tracking-tight">
                            {gv ? `${gv.confidenceScore}%` : "90%"}
                          </span>
                          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1 border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full" 
                              style={{ width: `${gv?.confidenceScore || 90}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-900/80 space-y-1 text-center flex flex-col justify-center">
                          <span className="text-[9px] font-mono text-white/40 uppercase">Assigned Reputation</span>
                          <span className="text-xl font-bold font-mono text-amber-500">
                            {gv ? `${gv.suggestedReputationScore}/100` : "75/100"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Inputs Audited Summary */}
                    <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-900 space-y-3">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Metrics Ledger Receipt</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-zinc-500 block text-[9px] font-mono uppercase">Startups</span>
                          <span className="text-zinc-200 font-mono font-bold">{startups} Founded</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-zinc-500 block text-[9px] font-mono uppercase">Capital Raised</span>
                          <span className="text-zinc-200 font-mono font-bold">${Number(funding).toLocaleString()}</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-zinc-500 block text-[9px] font-mono uppercase">Annual Revenue</span>
                          <span className="text-zinc-200 font-mono font-bold">${Number(revenue).toLocaleString()}</span>
                        </div>
                        <div className="bg-black/30 p-2.5 rounded border border-white/5">
                          <span className="text-zinc-500 block text-[9px] font-mono uppercase">Max Team</span>
                          <span className="text-zinc-200 font-mono font-bold">{teamSize} Peers</span>
                        </div>
                      </div>
                      {gv?.builderProfileArchetype && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-mono text-[10px]">VERIFIED ARCHETYPE CATEGORY:</span>
                          <span className="font-mono text-emerald-400 font-extrabold tracking-wide uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {gv.builderProfileArchetype}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="space-y-3 pt-2">
                      {isApproved ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-emerald-500/5 rounded border border-emerald-500/20 text-xs text-center text-emerald-400/90 font-mono">
                            🎉 Peer Access Authorized completely! You have been logged into your Founder Passport dashboard instantly.
                          </div>
                          <button
                            onClick={() => {
                              setCurrentRole('builder');
                              setShowAppliedSuccess(false);
                            }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/15 text-xs font-mono font-bold cursor-pointer transition uppercase tracking-wider text-center"
                          >
                            Enter Live Member Workspace →
                          </button>
                          {redirectCountdown !== null && (
                            <div className="text-center font-mono text-[10px] text-zinc-500 mt-2 flex items-center justify-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Auto-redirecting to view your live profile in <strong className="text-amber-400 font-bold">{redirectCountdown}s</strong>...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => {
                              setCurrentRole('recruiter');
                            }}
                            className="flex-1 py-3 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold cursor-pointer transition text-center"
                          >
                            Inspect Applications Workstation
                          </button>
                          <button
                            onClick={() => setShowAppliedSuccess(false)}
                            className="flex-1 py-3 rounded bg-transparent text-zinc-400 hover:text-white border border-zinc-900 text-xs font-mono font-medium cursor-pointer transition text-center"
                          >
                            Back to Onboarding
                          </button>
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              );
            })()
          ) : (
            <LandingPage
              builders={builders}
              onApplyClick={() => setCurrentRole('guest_apply' as any)}
              onRecruiterClick={() => setCurrentRole('recruiter')}
            />
          )
        )}

        {currentRole === ('guest_apply' as any) && (
          <ApplicationForm
            onSubmit={handleGuestSubmitApplication}
            onCancel={() => setCurrentRole('guest')}
          />
        )}

        {currentRole === 'builder' && (
          (() => {
            const activeProfile = builders.find(b => b.id === currentBuilderId) || builders[0];
            return (
              <MemberDashboard
                builder={activeProfile}
                opportunities={opportunities}
                messages={messages}
                onUpdateBuilder={handleUpdateBuilder}
                onExpressInterest={handleExpressInterest}
                onSendMessage={handleSendMessage}
              />
            );
          })()
        )}

        {currentRole === 'recruiter' && (
          <ScrollToTopWrapper>
            <RecruiterDashboard
              builders={builders}
              applications={applications}
              messages={messages}
              opportunities={opportunities}
              recruiterId={currentRecruiterId}
              onApproveApplication={handleApproveApplication}
              onRejectApplication={handleRejectApplication}
              onToggleMatchIntent={handleToggleRecruiterMatch}
              onSendMessage={handleSendMessage}
            />
          </ScrollToTopWrapper>
        )}
      </div>
    </div>
  );
}

// Simple Helper Component to anchor view on route change
function ScrollToTopWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return <>{children}</>;
}
