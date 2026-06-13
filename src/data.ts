/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BuilderPassport, Opportunity, VerificationApplication, Message } from './types';

// Algorithm to calculate dynamic reputation score from proof-based metrics
export function calculateReputationScore(metrics: {
  fundingRaised: number;
  revenueAnnual: number;
  teamSizeMax: number;
  startupsFoundedCount: number;
  productsLaunchedCount: number;
  openSourceContributionsCount: number;
}): number {
  let score = 10; // Baseline entry score

  // 1. Startups Founded: +12 points per startup (cap at 36)
  score += Math.min(36, metrics.startupsFoundedCount * 12);

  // 2. Funding Raised (capped at 40 points total):
  if (metrics.fundingRaised > 0) {
    if (metrics.fundingRaised >= 15000000) score += 40;
    else if (metrics.fundingRaised >= 5000000) score += 30;
    else if (metrics.fundingRaised >= 1000000) score += 20;
    else score += 10;
  }

  // 3. SEC Revenue / ARR Generated (capped at 40 points total):
  if (metrics.revenueAnnual > 0) {
    if (metrics.revenueAnnual >= 10000000) score += 40;
    else if (metrics.revenueAnnual >= 2000000) score += 30;
    else if (metrics.revenueAnnual >= 500000) score += 20;
    else score += 10;
  }

  // 4. Team size managed (capped at 15 points total):
  score += Math.min(15, Math.ceil(metrics.teamSizeMax * 0.5));

  // 5. Products launched into market (capped at 20 points total):
  score += Math.min(20, metrics.productsLaunchedCount * 5);

  // 6. Open source impact indicator (capped at 15 points total):
  score += Math.min(15, Math.ceil(metrics.openSourceContributionsCount * 1.5));

  // Hard Cap at 100 maximum reputation points
  return Math.min(100, Math.round(score));
}

export const INITIAL_BUILDERS: BuilderPassport[] = [
  {
    id: 'builder_sarah_jenkins',
    name: 'Sarah Jenkins',
    title: 'Architect of Core Payments @ Stripe US',
    tagline: 'Creator of ts-core-wasm (5.8k Stars). Ex-Stripe lead for high-frequency routing. Heavy systems solver.',
    bio: 'Deep systems engineer who loves performance tuning. Optimized Stripe local auth layers directly processing 45M transactions weekly. Known in the community for rust-to-typescript memory optimization layers.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&fit=crop',
    email: 'sarah.jenkins@temp-engineers.org',
    websiteUrl: 'https://sjenkins.engineering',
    githubUrl: 'https://github.com/sjenkins-dev',
    linkedinUrl: 'https://linkedin.com/in/sarah-jenkins-payments',
    isVerified: true,
    privacyMode: 'semi-private',
    reputationScore: 84,
    reputationMetrics: {
      fundingRaised: 0,
      revenueAnnual: 0,
      teamSizeMax: 12,
      startupsFoundedCount: 0,
      productsLaunchedCount: 4,
      openSourceContributionsCount: 18
    },
    careerTimeline: [
      {
        id: 's1',
        role: 'Staff Engineer - Payments Engine',
        company: 'Stripe',
        duration: '2021 - 2025',
        description: 'Designed local caching models to minimize network hops on pre-authorization checking. Cut standard transaction latency by 45ms global average.',
        verified: true,
        type: 'executive'
      },
      {
        id: 's2',
        role: 'Lead Infrastructure Eng',
        company: 'Vercel',
        duration: '2019 - 2021',
        description: 'Maintained early serverless edge runtime routes. Solved dynamic routing path collision vulnerabilities.',
        verified: true,
        type: 'builder'
      }
    ],
    productsLaunched: [
      {
        name: 'Varnish Edge Router',
        description: 'Optimized rule-based asset rewrite pipeline deployed across global CDNs.',
        impact: 'Handles trillions of yearly static web resource allocations with near-zero latency.'
      }
    ],
    openSourceAchievements: [
      {
        name: 'ts-core-wasm',
        stars: 5800,
        description: 'Compiles low-overhead TypeScript classes straight into optimized WebAssembly bytecode modules.',
        role: 'author'
      },
      {
        name: 'postgresql-tokio-client',
        stars: 920,
        description: 'Super-efficient async postgres connector implementation built in pure Rust compiler primitives.',
        role: 'maintainer'
      }
    ],
    notableAchievements: [
      'Authored the definitive open-source WASM wrapper used directly by heavy cloud providers today.',
      'Managed direct infrastructure scale during Stripe\'s highest-traffic Black Friday transaction spikes.',
      'Consulted top YC portfolio scale-ups on proper latency analysis and server footprint downsizing.'
    ],
    interestedRecruiterIds: ['rec_stripe_premium'],
    matchedRecruiterIds: [],
    appliedAt: '2026-03-01T10:15:00Z'
  },
  {
    id: 'builder_karan_grover',
    name: 'Karan Grover',
    title: 'CTO & Co-Founder @ UnifiedLedger India',
    tagline: 'Ex-Lead Engineer @ BharatPe. Designed core consensus engine processing $12B annually.',
    bio: 'Deep fintech architect based in Bengaluru. Scaled Indian digital payment ledgers to 30 million active vendors. Founded UnifiedLedger in 2021, raised $15M from primary Tier-1 VCs, and expanded operations across Mumbai and Delhi. Passionate about transactional consistency at scale.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
    email: 'karan@unifiedledger.in',
    websiteUrl: 'https://unifiedledger.in',
    githubUrl: 'https://github.com/karangrover-fin',
    linkedinUrl: 'https://linkedin.com/in/karan-grover-ledger',
    isVerified: true,
    privacyMode: 'confidential',
    reputationScore: 94,
    reputationMetrics: {
      fundingRaised: 15000000,
      revenueAnnual: 6500000,
      teamSizeMax: 45,
      startupsFoundedCount: 1,
      productsLaunchedCount: 3,
      openSourceContributionsCount: 8
    },
    careerTimeline: [
      {
        id: 'k1',
        role: 'CTO & Co-Founder',
        company: 'UnifiedLedger',
        duration: '2021 - 2026',
        description: 'Led a premium team of 28 core engineers in Bengaluru. Created the first verified double-blind instant merchant consensus routing hub.',
        verified: true,
        type: 'founder'
      },
      {
        id: 'k2',
        role: 'Principal Backend Lead',
        company: 'BharatPe',
        duration: '2018 - 2021',
        description: 'Pioneered zero-latency UPI settlement micro-engines. Handled peak throughputs of 120k queries per minute during festival seasons.',
        verified: true,
        type: 'builder'
      }
    ],
    productsLaunched: [
      {
        name: 'Bharat FastPay API',
        description: 'Dynamic UPI QR routing gateway that automated bank-to-bank settlement.',
        impact: 'Integrated by 8M+ sub-merchant outlets nationwide processing $800M equivalent monthly.'
      }
    ],
    openSourceAchievements: [
      {
        name: 'rust-upi-codec',
        stars: 1850,
        description: 'Extremely optimized transactional parsing codecs for UPI standards written in pure Rust.',
        role: 'author'
      }
    ],
    notableAchievements: [
      'Engineered core transaction routing architecture that handles 5% of India\'s daily UPI volume.',
      'Secured $15M Series-A treasury backing from Accel & Sequoia India.',
      'Regular contributor and technical advisor on digital ledger design to major public banking boards.'
    ],
    interestedRecruiterIds: [],
    matchedRecruiterIds: [],
    appliedAt: '2026-04-12T11:00:00Z'
  },
  {
    id: 'builder_priya_nair',
    name: 'Priya Nair',
    title: 'VP Product @ CRED Flow | ex-VP metricsFlow',
    tagline: 'Bootstrapped metricsFlow to $1.2M ARR. Scaled interactive user retention pipelines across India.',
    bio: 'Product generalist and digital creator from Mumbai. Developed metricsFlow from bedroom to exit while self-funding. Later joined CRED in Bengaluru to oversee premium high-frequency reward distributions and localized engagement structures.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&fit=crop',
    email: 'priya@metricsflow.io',
    websiteUrl: 'https://priyanair.me',
    githubUrl: 'https://github.com/priyanair-pm',
    linkedinUrl: 'https://linkedin.com/in/priya-nair-product',
    isVerified: true,
    privacyMode: 'public',
    reputationScore: 85,
    reputationMetrics: {
      fundingRaised: 0,
      revenueAnnual: 1200000,
      teamSizeMax: 15,
      startupsFoundedCount: 1,
      productsLaunchedCount: 4,
      openSourceContributionsCount: 2
    },
    careerTimeline: [
      {
        id: 'p1',
        role: 'VP Ecosystem Flow',
        company: 'CRED',
        duration: '2024 - 2026',
        description: 'Revamped the interactive gamified system on CRED app. Designed latency-resilient loyalty microservices.',
        verified: true,
        type: 'executive'
      },
      {
        id: 'p2',
        role: 'Sole Founder',
        company: 'metricsFlow',
        duration: '2020 - 2024',
        description: 'Bootstrapped a privacy-safe cookie-free analytics suite. Scaled to over 800 premium SaaS enterprise accounts and achieved eventual exit to Private Equity.',
        verified: true,
        type: 'founder'
      }
    ],
    productsLaunched: [
      {
        name: 'metricsFlow Cloud Suite',
        description: 'Ultra-light compliance-first client tracker used globally.',
        impact: 'Exited for substantial multiple in 2024, handling 1.5B analytics transactions daily.'
      }
    ],
    openSourceAchievements: [],
    notableAchievements: [
      'Bootstrapped B2B startup metricsFlow to $1.2M ARR in less than 36 months, with zero dilutive funding.',
      'Recipient of the \'India Under 30 Tech Excellence Award\' in 2024.',
      'Advised five prominent Indian unicorns on optimizing consumer retention cycles and premium card loops.'
    ],
    interestedRecruiterIds: [],
    matchedRecruiterIds: [],
    appliedAt: '2026-05-18T14:35:00Z'
  },
  {
    id: 'builder_alex_rivera',
    name: 'Alex Rivera',
    title: 'Ex-Founder @ VeloCloud Systems US',
    tagline: 'Built and scaled VeloCloud (acquired for $48M). Specializing in decentralized infrastructures.',
    bio: 'High-performance engineering leader from Austin, Texas. Founded VeloCloud in 2019, scaled team to 35, achieved $4.2M ARR, and successfully navigated our eventual acquisition in 2024. Now building open-source database engines.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
    email: 'alex.rivera@temp-builders.io',
    websiteUrl: 'https://velocloud.io-archive',
    githubUrl: 'https://github.com/alexrivera-db',
    linkedinUrl: 'https://linkedin.com/in/alex-rivera-cloud',
    isVerified: true,
    privacyMode: 'public',
    reputationScore: 88,
    reputationMetrics: {
      fundingRaised: 12000000,
      revenueAnnual: 4200000,
      teamSizeMax: 35,
      startupsFoundedCount: 1,
      productsLaunchedCount: 3,
      openSourceContributionsCount: 2
    },
    careerTimeline: [
      {
        id: 'c1',
        role: 'Co-Founder & CTO',
        company: 'VeloCloud Systems',
        duration: '2019 - 2024',
        description: 'Led a team of 18 engineers. Designed a peer-to-peer visual asset pipeline handling 40,000 requests per second. Successfully sold to VMware-Scale partner in late 2024.',
        verified: true,
        type: 'founder'
      },
      {
        id: 'c2',
        role: 'Principal Systems Architect',
        company: 'Cloudflare',
        duration: '2016 - 2019',
        description: 'Engineered Edge Cache optimizations yielding 14% global response speed improvements. Managed core protocol transitions.',
        verified: true,
        type: 'builder'
      }
    ],
    productsLaunched: [
      {
        name: 'VeloDB Streamer',
        url: 'https://github.com/alexrivera-db/velodb',
        description: 'Real-time WAL streaming replication engine for distributed PostgreSQL node clustering.',
        impact: 'Powering over 1,400 active clusters, processing $80M daily transactions safely.'
      }
    ],
    openSourceAchievements: [
      {
        name: 'rust-sqlite-sync',
        stars: 1240,
        description: 'Blazing fast zero-dependency WebAssembly replication layer for extreme fast embedded browser data caching.',
        role: 'author'
      }
    ],
    notableAchievements: [
      'Successfully founded and exited startup within 5 years.',
      'Raised $12M total venture backing from Tier 1 Silicon Valley seed investors.',
      'Core contributor to Chromium V8 protocol serialization optimization layers.'
    ],
    interestedRecruiterIds: [],
    matchedRecruiterIds: [],
    appliedAt: '2026-02-14T08:30:00Z'
  },
  {
    id: 'builder_anish_wadhwa',
    name: 'Anish Wadhwa',
    title: 'Lead AI Engineer @ Sarvam Foundation',
    tagline: 'Creator of rust-inference-加速器 (3.4k Stars). Ex-Founding NLP Architect @ Krutrim India.',
    bio: 'Deep learning compiler optimization wizard in New Delhi. Pioneered high-speed context compaction frameworks that reduced LLM token costs by 40% for localized Indian Indic dialects (Hindi, Tamil, Marathi). Expert in high-scale machine learning systems.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&fit=crop',
    email: 'anish@sarvam.ai',
    websiteUrl: 'https://anishwadhwa.ai',
    githubUrl: 'https://github.com/anish-ai',
    linkedinUrl: 'https://linkedin.com/in/anish-wadhwa-ai',
    isVerified: true,
    privacyMode: 'public',
    reputationScore: 82,
    reputationMetrics: {
      fundingRaised: 0,
      revenueAnnual: 0,
      teamSizeMax: 8,
      startupsFoundedCount: 0,
      productsLaunchedCount: 3,
      openSourceContributionsCount: 22
    },
    careerTimeline: [
      {
        id: 'a1',
        role: 'Lead ML Systems Architect',
        company: 'Sarvam AI',
        duration: '2024 - 2026',
        description: 'Engineered extreme-scale multi-dialect pre-training optimizations. Programmed efficient tokenizers for Indian localized model hubs.',
        verified: true,
        type: 'builder'
      },
      {
        id: 'a2',
        role: 'NLP Research Engineer',
        company: 'Krutrim AI',
        duration: '2022 - 2024',
        description: 'Designed local transformer weights caching and model distillation pipelines. Enhanced high-throughput inference serving structures.',
        verified: true,
        type: 'builder'
      }
    ],
    productsLaunched: [
      {
        name: 'IndicTokenizer Core',
        description: 'Sparsified tokenizer that processes Indic languages with 3x higher byte efficiency.',
        impact: 'Saves major corporations millions in API token expenses across localized support channels.'
      }
    ],
    openSourceAchievements: [
      {
        name: 'rust-inference-accelerator',
        stars: 3400,
        description: 'High-speed GPU kernels written in pure Rust for real-time model layer manipulation.',
        role: 'author'
      }
    ],
    notableAchievements: [
      'Pioneered Indic NLP benchmarks adopted widely by public research institutes across India.',
      'Slashed enterprise inference server hardware rental requirements by 42%.',
      'Honored as speaker at NeurIPS 2025 on low-latency local execution topologies.'
    ],
    interestedRecruiterIds: [],
    matchedRecruiterIds: [],
    appliedAt: '2026-05-10T15:20:00Z'
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_eng_vp',
    company: 'NeuralFlow AI',
    logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=128&h=128&fit=crop',
    title: 'Vice President of Engineering',
    category: 'jobs',
    location: 'San Francisco, CA / Hybrid',
    compensation: '$280k - $350k base + performance incentive',
    equity: '1.2% - 2.0% fully-vetted equity',
    description: 'Looking for a seasoned engineering executive to take over architectural ownership and scale an elite team of 24 machine learning researchers and interface builders. NeuralFlow is series-B funded ($30M treasury) with strong customer retention in production code generation.',
    requirements: [
      'Demonstrated experience managing high-talent teams of at least 15 engineers.',
      'Ex-founder background or founding-engineer-level trajectory strongly preferred.',
      'Deep architectural familiarity with distributed GPU training queues and low-latency cache streaming.'
    ],
    reputationThreshold: 75,
    postedByRecruiterId: 'rec_neuralflow_exec',
    applicantIds: [],
    matchedBuilderIds: []
  },
  {
    id: 'opp_india_razorpay',
    company: 'Razorpay Elite Tech',
    logoUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?q=80&w=128&h=128&fit=crop',
    title: 'Principal Payments Architect',
    category: 'jobs',
    location: 'Bengaluru, India / Hybrid',
    compensation: '₹85L - ₹1.2Cr Base',
    equity: '0.5% - 1.0% ESOP scale',
    description: 'Architecting next-generation localized processing nodes that handle over 100M API requests per minute. Work closely with the core treasury team to optimize routing and failover across multiple public partner bank networks in India.',
    requirements: [
      'Extensive experience with high-throughput settlement systems, ISO 8583 banking packets, and UPI protocols.',
      'Previous core engineering contributions at high-scale transactional networks (Razorpay, Stripe, CRED).',
      'Minimum Reputation Score requirement of 80 to unlock secure double-blind express channel.'
    ],
    reputationThreshold: 80,
    postedByRecruiterId: 'rec_stripe_premium',
    applicantIds: ['builder_karan_grover'], // Karan Grover applied initially!
    matchedBuilderIds: []
  },
  {
    id: 'opp_cred_architect',
    company: 'CRED Core',
    logoUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=128&h=128&fit=crop',
    title: 'Founding Member: Interactive Systems',
    category: 'startup',
    location: 'Bengaluru, India',
    compensation: '₹60L base retainer',
    equity: '1.5% equivalent equity stake',
    description: 'Designing transactional ledger integrations and highly interactive visual consumer platforms. Join our elite member lounge engineering line and play a major structural role in building friction-free high-frequency reward engines.',
    requirements: [
      'Advanced skills writing high-efficiency reactive frameworks and low-overhead client sync libraries.',
      'Deep appreciation for extreme design fidelity, micro-interactions, and keyboard navigability.',
      'Reputation Score > 70 is requested.'
    ],
    reputationThreshold: 70,
    postedByRecruiterId: 'rec_cred_recruiter',
    applicantIds: [],
    matchedBuilderIds: []
  },
  {
    id: 'opp_infra_founding',
    company: 'Trace.app',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=128&h=128&fit=crop',
    title: 'Founding Infrastructure Engineer',
    category: 'startup',
    location: 'Remote (UTC-8 to UTC+2)',
    compensation: '$160k - $210k base',
    equity: '2.0% - 3.5% equity (Founding member layout)',
    description: 'Help us rebuild cloud observability starting at the Linux kernel level. Trace is structured by three former ex-founders building a high-speed telemetry proxy that runs client-side dynamically. Series A backed ($8.5M). Needs developer who breathes eBPF, Rust, and systems optimization.',
    requirements: [
      'Open-source systems contributions or proven Rust database architectures.',
      'An aversion to bloated cloud layers and unnecessary wrapper nodes.',
      'Strong solo building power with zero micro-management constraints.'
    ],
    reputationThreshold: 60,
    postedByRecruiterId: 'rec_trace_founder',
    applicantIds: ['builder_sarah_jenkins'],
    matchedBuilderIds: []
  },
  {
    id: 'opp_board_crypto',
    company: 'Solstice Foundation',
    logoUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=128&h=128&fit=crop',
    title: 'Independent Technical Director',
    category: 'board',
    location: 'Zurich, Switzerland / Remote',
    compensation: '$120k ARR Retainer (paid quarterly)',
    equity: 'Token Governance Share Allocation (0.5% equivalent)',
    description: 'Providing crucial cryptographic consensus framework oversight for the Solstice network. The independent board director oversees structural grants, protocol hard-fork validations, and compliance evaluations representing retail builder developer networks.',
    requirements: [
      'Proven leadership background at successful decentralized projects or large storage infrastructures.',
      'Active contributions to protocol layers, standards committee representation, or academic research.',
      'Reputation Score > 80 is strictly enforced on this board seat.'
    ],
    reputationThreshold: 80,
    postedByRecruiterId: 'rec_solstice_board',
    applicantIds: [],
    matchedBuilderIds: []
  },
  {
    id: 'opp_advisory_payments',
    company: 'VeloCapital Group',
    logoUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=128&h=128&fit=crop',
    title: 'Executive Advisory: Latency Architecture',
    category: 'advisory',
    location: 'Remote',
    compensation: '$5,000 monthly advisory retainer',
    equity: '0.25% Advisory Options',
    description: 'We are consulting four high-scale payment networks and need an expert to audit high-frequency card authorization networks. Expect active participation in high-level architectural boards twice a month (total of 5-8 hours monthly involvement).',
    requirements: [
      'Subject matter expert in microsecond payment pathways, distributed ledgers, or global cache databases.',
      'Previous Staff+ or Principal engineer tenure at Stripe, Adyen, Block, or major trading desks.'
    ],
    reputationThreshold: 70,
    postedByRecruiterId: 'rec_stripe_premium',
    applicantIds: [],
    matchedBuilderIds: []
  }
];

export const INITIAL_APPLICATIONS: VerificationApplication[] = [
  {
    id: 'app_1',
    name: 'Julian Vance',
    email: 'j.vance@vancestudios.com',
    title: 'Ex-Founder @ VanceLabs / Core Eng',
    tagline: 'Bootstrapped VanceLabs to $2.1M ARR. Formulating low-overhead telemetry pipelines.',
    bio: 'Software generalist. Built a dynamic screenshot rendering platform as a single builder. Acquired in 2025. Now looking to consult or join high-impact series A software teams as engineering lead.',
    evidenceText: 'I founded VanceLabs in 2021. I have attached references to the public acquisition filing at TechCrunch (techcrunch.com/mock-vancelabs-sale). I was sole developer, scaling our rendering cluster on bare-metal to process 12,000,000 graphics weekly with standard overheads of $800/mo.',
    fundingRaisedInput: '0',
    revenueAnnualInput: '2100000',
    teamSizeMaxInput: '4',
    startupsFoundedInput: '1',
    productsLaunchedInput: '2',
    openSourceContributionsCountInput: '12',
    status: 'pending',
    appliedAt: '2026-06-12T15:40:00Z'
  },
  {
    id: 'app_2',
    name: 'Rohan Deshmukh',
    email: 'rohan@deshmukh-agritech.in',
    title: 'Co-Founder @ KrishiScale (Bengaluru)',
    tagline: 'Designed supply chain ledger handling ₹40Cr transaction volume for Indian farming cooperatives.',
    bio: 'Deep systems operator based in Pune and Bengaluru. Built crop-yield analysis and instant fintech payment microloans for rural India.',
    evidenceText: 'Creator of open-source indic-crop-analytics. Managed 6,000 daily logistics nodes. Raising ₹5Cr pre-series A from marquee Indian seed funds. Verified data and tax receipts uploaded.',
    fundingRaisedInput: '600000',
    revenueAnnualInput: '1100000',
    teamSizeMaxInput: '15',
    startupsFoundedInput: '1',
    productsLaunchedInput: '2',
    openSourceContributionsCountInput: '8',
    status: 'pending',
    appliedAt: '2026-06-13T01:30:00Z'
  },
  {
    id: 'app_3',
    name: 'Amiya Patel',
    email: 'amiya@patel.tech',
    title: 'Lead Product Architect @ CRED-like tracker',
    tagline: 'Specialist in low-latency multiplayer syncing architectures. Created crdt-sync (1.2k stars).',
    bio: 'Ex-Figma engineer. Designed real-time multiplayer vector drawing matrices. Contributor to various client-side database protocols.',
    evidenceText: 'Github creator of crdt-sync-typescript (github.com/crdt-sync-type). Designed multiplayer layers currently in use at multiple startup scheduling products. Active speaker at JSConf Tokyo.',
    fundingRaisedInput: '0',
    revenueAnnualInput: '0',
    teamSizeMaxInput: '8',
    startupsFoundedInput: '0',
    productsLaunchedInput: '3',
    openSourceContributionsCountInput: '22',
    status: 'pending',
    appliedAt: '2026-06-13T02:11:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm_seed_1',
    matchId: 'builder_sarah_jenkins_rec_stripe_premium',
    senderId: 'rec_stripe_premium',
    senderName: 'VeloCapital Group (Gavin Reed)',
    text: 'Hello Sarah! I reviewed your verified passport and was incredibly impressed by the ts-core-wasm library. Your latency benchmark is exceptional. We would love to contract you for our latency architecture advisory panel.',
    timestamp: '2026-06-12T19:02:00Z'
  },
  {
    id: 'm_seed_2',
    matchId: 'builder_sarah_jenkins_rec_stripe_premium',
    senderId: 'builder_sarah_jenkins',
    senderName: 'Sarah Jenkins (Semi-Private)',
    text: 'Hi Gavin, thanks for reaching out. ts-core-wasm is a passion project. The payments advisory gig aligns perfectly with my workload. Yes, let’s sync up early next week.',
    timestamp: '2026-06-12T19:40:00Z'
  }
];
