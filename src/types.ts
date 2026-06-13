/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrivacyMode = 'public' | 'semi-private' | 'confidential';

export type OpportunityCategory = 'jobs' | 'startup' | 'advisory' | 'board';

export interface ReputationMetrics {
  fundingRaised: number; // in USD equivalent (e.g. 5000000)
  revenueAnnual: number; // in USD equivalent Annual Recurring Revenue (ARR)
  teamSizeMax: number; // maximum managed team size
  startupsFoundedCount: number;
  productsLaunchedCount: number;
  openSourceContributionsCount: number;
}

export interface CareerMilestone {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  verified: boolean;
  type: 'founder' | 'operator' | 'executive' | 'builder';
}

export interface VerifiedProduct {
  name: string;
  url?: string;
  description: string;
  impact: string; // e.g., "1.2M monthly active users", "$400k ARR generated"
}

export interface OpenSourceProject {
  name: string;
  stars?: number;
  description: string;
  role: 'author' | 'maintainer' | 'core-contributor';
}

export interface BuilderPassport {
  id: string;
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  email: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  isVerified: boolean;
  privacyMode: PrivacyMode;
  reputationScore: number;
  reputationMetrics: ReputationMetrics;
  careerTimeline: CareerMilestone[];
  productsLaunched: VerifiedProduct[];
  openSourceAchievements: OpenSourceProject[];
  notableAchievements: string[];
  interestedRecruiterIds: string[]; // List of recruiter IDs interested in this builder
  matchedRecruiterIds: string[]; // Tracks recruiter IDs that this builder marked interest for
  appliedAt: string;
  introductoryVideoUrl?: string;
}

export interface Opportunity {
  id: string;
  company: string;
  logoUrl?: string;
  title: string;
  category: OpportunityCategory;
  location: string;
  compensation: string; // e.g., "$250k - $320k base"
  equity?: string; // e.g., "1.5% - 2.5%"
  description: string;
  requirements: string[];
  reputationThreshold: number; // Minimum builder reputation score required to apply
  postedByRecruiterId: string;
  applicantIds: string[]; // Builder IDs who expressed interest
  matchedBuilderIds: string[]; // Builder IDs where mutual matching has been fully confirmed
}

export interface RecruiterProfile {
  id: string;
  name: string;
  company: string;
  role: string;
  logoUrl?: string;
}

export interface GeminiVerification {
  decision: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  confidenceScore: number;
  aiAuditNotes: string;
  legitimacyFeedback: string;
  suggestedReputationScore?: number;
  builderProfileArchetype?: string;
  verifiedAt: string;
}

export interface VerificationApplication {
  id: string;
  name: string;
  email: string;
  title: string;
  tagline: string;
  bio: string;
  evidenceText: string;
  fundingRaisedInput: string;
  revenueAnnualInput: string;
  teamSizeMaxInput: string;
  startupsFoundedInput: string;
  productsLaunchedInput: string;
  openSourceContributionsCountInput: string;
  status: 'pending' | 'verified' | 'rejected';
  appliedAt: string;
  geminiVerification?: GeminiVerification;
}

export interface Message {
  id: string;
  matchId: string; // "builderId_recruiterId" key
  senderId: string; // Can be a builder ID or recruiter ID
  senderName: string;
  text: string;
  timestamp: string;
}

export interface AppState {
  currentRole: 'builder' | 'recruiter' | 'guest';
  currentBuilderId: string | null; // Null means they are a guest applying, or recruiter
  currentRecruiterId: string; // Standard default recruiter ID
  builders: BuilderPassport[];
  opportunities: Opportunity[];
  applications: VerificationApplication[];
  messages: Message[];
}
