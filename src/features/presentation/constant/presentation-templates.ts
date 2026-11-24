import type { SlideLayout, SlideStyle, SlideTone } from './presentation-options'

export type TemplateCategory =
  | 'Business'
  | 'Tech & AI'
  | 'Marketing'
  | 'Education'

export type PresentationTemplate = {
  id: string
  label: string
  category: TemplateCategory
  summary: string
  content: string
  slides: number
  style: SlideStyle
  tone: SlideTone
  layout: SlideLayout
  isCustom?: boolean
}

export const TEMPLATE_CATEGORIES: Array<'All' | TemplateCategory> = [
  'All',
  'Tech & AI',
  'Business',
  'Marketing',
  'Education',
]

export const PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'ai-product-launch',
    label: 'AI Product Launch',
    category: 'Tech & AI',
    summary: 'Launch an AI workflow copilot with product vision, demo flow, and metrics.',
    content: `Introducing NovaFlow — AI Engineering Copilot

Vision:
- Eliminate repetitive code reviews, test scaffolding, and deployment triage
- Give every developer an autonomous pair programmer inside their IDE

Core Capabilities:
- Context-aware pull request reviews with security & performance checks
- Instant end-to-end test generation linked to production traces
- Natural-language incident debugging across logs and metrics
- Enterprise privacy with zero data retention and SOC 2 compliance

Early Beta Impact:
- 42% faster pull request merge times across 120 beta engineering teams
- 3.1x increase in automated test coverage within the first 30 days
- 94% weekly developer retention

Rollout Plan:
- General availability launch with Free, Pro, and Enterprise tiers
- Native plugins for VS Code, JetBrains, and GitHub Actions`,
    slides: 8,
    style: 'creative',
    tone: 'persuasive',
    layout: 'visual',
  },
  {
    id: 'climatetech-pitch',
    label: 'Startup Investor Pitch',
    category: 'Business',
    summary: 'Seed-stage pitch covering market gap, traction, unit economics, and ask.',
    content: `HelioGrid — Smart Microgrid Energy Platform

The Problem:
- Commercial buildings lose up to 30% of energy spend to peak demand charges
- Integrating solar panels, EV chargers, and battery storage is fragmented

Our Solution:
- AI-driven energy orchestration software for commercial facilities
- Predicts grid pricing and weather 48 hours ahead to optimize battery dispatch
- Plug-and-play hardware gateway installs in under 2 hours

Traction & Proof:
- 68 commercial buildings live across California and Texas
- $1.4M ARR with 138% net dollar retention
- Average customer payback period of 7 months

Business Model & Ask:
- SaaS platform fee plus 15% shared savings on peak energy reductions
- Raising $3.5M Seed round to expand grid partnerships and hardware deployments`,
    slides: 9,
    style: 'bold',
    tone: 'persuasive',
    layout: 'visual',
  },
  {
    id: 'cloud-architecture',
    label: 'System Architecture Review',
    category: 'Tech & AI',
    summary: 'Technical deep dive on cloud microservices, observability, and scaling.',
    content: `Global Payments Platform — Cloud Architecture Deep Dive

Context & Scale Targets:
- Processing 12,000 transactions per second at 99.99% availability
- Sub-150ms p99 API latency across North America, Europe, and APAC

Core Architecture:
- Edge API Gateway with rate limiting, WAF, and JWT verification
- Event-driven microservices backed by Kafka for ledger and settlement
- Multi-region PostgreSQL with read replicas and idempotent write keys
- Redis cluster for fraud scoring feature lookups in under 5ms

Reliability & Security:
- Automated canary deployments with instant rollback on error budget burn
- OpenTelemetry distributed tracing, structured logs, and SLO dashboards
- End-to-end encryption, hardware security modules, and PCI-DSS isolation

Next Quarter Roadmap:
- Active-active multi-region failover drill
- Cut compute spend by 22% via ARM64 migration and autoscaling tuning`,
    slides: 8,
    style: 'professional',
    tone: 'informative',
    layout: 'balanced',
  },
  {
    id: 'gtm-strategy',
    label: 'Go-To-Market Strategy',
    category: 'Marketing',
    summary: '90-day product launch plan with ICP, channels, messaging, and KPIs.',
    content: `Q4 Go-To-Market Launch Strategy

Ideal Customer Profile:
- Mid-market SaaS companies (100–1,000 employees) with distributed teams
- Primary buyers: VP of Operations, Head of IT, and Finance Directors

Positioning & Messaging:
- Replace 5 disconnected spreadsheet workflows with one automated workspace
- Lead with concrete time savings and 14-day zero-friction onboarding

Acquisition Channels:
- Product-led growth: interactive sandbox and free team starter tier
- Content & SEO: ROI calculators, benchmark reports, and customer teardowns
- Partner ecosystem: co-marketing webinars with cloud consulting firms

90-Day Targets:
- 2,500 qualified signups and 180 paid team conversions
- Customer acquisition payback under 9 months
- Weekly funnel review across Marketing, Sales, and Product`,
    slides: 7,
    style: 'bold',
    tone: 'persuasive',
    layout: 'balanced',
  },
  {
    id: 'quarterly-business-review',
    label: 'Quarterly Business Review',
    category: 'Business',
    summary: 'Executive QBR covering revenue highlights, customer health, and priorities.',
    content: `Q3 Executive Business Review

Quarter Highlights:
- Revenue grew 24% quarter-over-quarter, exceeding target by $380K
- Enterprise logo count reached 85 active organizations
- Customer NPS rose from 54 to 63 following onboarding improvements

Department Updates:
- Product: Shipped self-serve analytics dashboard and SSO enterprise pack
- Customer Success: Reduced average ticket resolution time to 2.4 hours
- Operations: Improved gross margin from 74% to 78% through cloud optimization

Key Challenges & Risks:
- Longer enterprise security review cycles averaging 4 weeks
- Hiring velocity for senior backend engineers behind plan

Q4 Strategic Priorities:
- Launch automated compliance trust center to accelerate enterprise deals
- Expand EMEA regional support coverage
- Deliver mobile companion app beta to top 20 accounts`,
    slides: 7,
    style: 'professional',
    tone: 'formal',
    layout: 'bullet-points',
  },
  {
    id: 'generative-ai-lecture',
    label: 'Generative AI Lecture',
    category: 'Education',
    summary: 'Clear academic overview of LLMs, transformers, RAG, and AI ethics.',
    content: `Introduction to Generative AI & Large Language Models

Learning Objectives:
- Understand how modern language models represent and predict language
- Differentiate pre-training, fine-tuning, and Retrieval-Augmented Generation
- Evaluate real-world capabilities, limitations, and responsible AI practices

Core Foundations:
- Tokenization: converting text into numerical subword units
- Transformer Architecture: self-attention mechanisms capturing long-range context
- Scaling Laws: how data quality, parameters, and compute improve reasoning

Applied Patterns:
- Prompt engineering: structured instructions, few-shot examples, and schemas
- RAG pipelines: grounding model answers in external verified documents
- Tool use & agents: connecting models to APIs, databases, and code sandboxes

Limitations & Responsible Use:
- Hallucinations, bias, and verification workflows
- Privacy, copyright, and transparent human-in-the-loop review`,
    slides: 9,
    style: 'minimal',
    tone: 'informative',
    layout: 'balanced',
  },
  {
    id: 'cybersecurity-briefing',
    label: 'Cybersecurity Briefing',
    category: 'Tech & AI',
    summary: 'Company-wide security awareness on phishing, zero-trust, and response.',
    content: `Enterprise Cybersecurity & Zero-Trust Briefing

Why Security Matters Today:
- AI-crafted phishing and credential stuffing attacks are rising rapidly
- Every employee and engineering workflow is part of the security perimeter

Zero-Trust Core Principles:
- Verify explicitly: phishing-resistant MFA and hardware passkeys everywhere
- Least privilege access: just-in-time permissions for production systems
- Assume breach: network segmentation and encrypted telemetry

Everyday Best Practices:
- Spot social engineering red flags across email, chat, and voice calls
- Use approved password managers and never share API secrets in code
- Keep laptops, browsers, and mobile devices patched within 48 hours

Incident Response Playbook:
- Report suspicious links or lost devices to #security-help within 15 minutes
- Fast containment steps and blameless post-incident learning`,
    slides: 7,
    style: 'professional',
    tone: 'informative',
    layout: 'bullet-points',
  },
  {
    id: 'ux-redesign-case-study',
    label: 'UX Redesign Case Study',
    category: 'Marketing',
    summary: 'Product design story from user interviews to measurable conversion lift.',
    content: `Checkout & Onboarding Redesign — UX Case Study

The Challenge:
- 46% of new users dropped off before completing initial workspace setup
- User interviews revealed confusing navigation and unclear next steps

Research Insights:
- Conducted 28 moderated usability sessions and analyzed 50,000 session funnels
- Top friction points: 7-step mandatory form, hidden templates, slow mobile load

Design Solution:
- Progressive 3-step guided onboarding with instant live preview
- Pre-built starter templates tailored to user role
- Accessible high-contrast typography and responsive mobile layout

Measured Outcomes:
- Activation rate jumped from 54% to 79% within 6 weeks
- Time-to-first-value cut from 9 minutes to 90 seconds
- Support tickets during onboarding dropped by 61%`,
    slides: 7,
    style: 'creative',
    tone: 'casual',
    layout: 'visual',
  },
  {
    id: 'enterprise-sales-proposal',
    label: 'Enterprise Sales Proposal',
    category: 'Business',
    summary: 'Tailored B2B proposal with ROI model, security, rollout timeline, and pricing.',
    content: `Enterprise Analytics Modernization Proposal

Executive Summary:
- Unify finance, operations, and customer telemetry into one real-time data platform
- Projected $640K annual operational savings through automated reporting

Current Bottlenecks:
- Analysts spend 14 hours per week reconciling manual CSV exports
- Leadership lacks real-time visibility into regional inventory and churn

Proposed Solution & Security:
- Native connectors to Salesforce, Snowflake, Stripe, and ERP systems
- Role-based access control, SAML SSO, audit logs, and EU/US data residency

Implementation Timeline:
- Weeks 1–2: Data connector setup and security sign-off
- Weeks 3–4: Executive dashboard migration and team training
- Week 5+: Full rollout with dedicated solutions architect

Investment & ROI:
- Annual enterprise subscription with unlimited viewers and 99.9% SLA
- Full ROI achieved within 4 months of deployment`,
    slides: 8,
    style: 'professional',
    tone: 'persuasive',
    layout: 'balanced',
  },
]
