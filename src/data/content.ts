// Full article content with markdown
export interface ArticleData {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  views: number;
  isPremium: boolean;
  isHot?: boolean;
  content: string;
  relatedContent: Array<{ id: string; title: string; type: string }>;
}

export interface ListItem {
  rank: number;
  name: string;
  sector: string;
  raised: string;
  highlight: string;
}

export interface ListData {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  subscribers: number;
  isHot: boolean;
  isPremium: boolean;
  items: ListItem[];
  methodology: string;
}

// Articles data
export const ARTICLES_DATA: Record<string, Record<string, ArticleData>> = {
  'andres-bucchi': {
    'article-1': {
      id: 'article-1',
      title: 'From Data Warehouse to AI Factory',
      description: "How LATAM Airlines transformed its data infrastructure to support real-time ML predictions.",
      date: 'Nov 22, 2024',
      readTime: '14 min read',
      views: 3421,
      isPremium: false,
      content: `## The Journey to AI-First Infrastructure

When I joined LATAM Airlines as CDO, we had a data warehouse. Today, we have an AI factory. This transformation didn't happen overnight, and the lessons learned apply to any organization seeking to operationalize machine learning.

### The Starting Point

Like many enterprises, we had:

- Multiple data silos across business units
- Batch-oriented analytics pipelines
- Limited real-time capabilities
- ML experiments that rarely reached production

### The Architecture Evolution

**Phase 1: Foundation (Months 1-6)**

We focused on:

- Consolidating data sources into a modern lakehouse
- Establishing data governance frameworks
- Building the feature store infrastructure

**Phase 2: Capabilities (Months 6-12)**

We added:

- Real-time streaming pipelines
- ML model serving infrastructure
- Automated retraining workflows

**Phase 3: Scale (Year 2+)**

We're now:

- Running hundreds of models in production
- Processing millions of predictions daily
- Continuously improving through experimentation

### Key Technical Decisions

**1. Lakehouse Architecture**

We chose a lakehouse approach because:

- It unified batch and streaming workloads
- It supported diverse analytics use cases
- It provided the flexibility ML workloads require

**2. Feature Store Investment**

Building a proper feature store paid dividends:

- Reduced feature engineering duplication
- Enabled feature reuse across teams
- Improved model consistency

**3. MLOps from Day One**

We treated MLOps as a first-class citizen:

- Automated model validation
- Canary deployments for new models
- Comprehensive monitoring and alerting

### Lessons Learned

1. **Start with use cases, not technology**
2. **Invest in data quality early**
3. **Build for production from the start**
4. **Create feedback loops between data scientists and engineers**

---

*Happy to discuss data infrastructure strategy with fellow practitioners.*`,
      relatedContent: [
        { id: 'article-3', title: 'LLMs in Production: Lessons Learned', type: 'article' },
        { id: 'list-1', title: 'Enterprise AI Transformation Playbook', type: 'list' },
      ],
    },
    'article-2': {
      id: 'article-2',
      title: 'The CDO Playbook: First 90 Days',
      description: 'What to prioritize when stepping into a Chief Data Officer role at a large enterprise.',
      date: 'Nov 14, 2024',
      readTime: '10 min read',
      views: 2156,
      isPremium: false,
      content: `## Stepping Into the Role

The Chief Data Officer role is still relatively new, and there's no standard playbook. After serving in this capacity and advising others making similar transitions, here's what I've learned about the critical first 90 days.

### Week 1-2: Listen and Learn

**Don't come in with all the answers.** Instead:

- Meet with every key stakeholder
- Understand existing initiatives and pain points
- Map the current data landscape
- Identify quick wins and major blockers

### Week 3-4: Assess the Reality

Now you need an honest assessment of:

**1. Data Infrastructure**
- What's the current architecture?
- Where are the gaps?
- What's working well?

**2. Team Capabilities**
- Who are your key people?
- What skills are missing?
- Where do you need to hire?

**3. Data Culture**
- How data-driven is decision making?
- What's the appetite for change?
- Who are your allies?

### Month 2: Build Your Strategy

**Define your North Star:**

- What does success look like in 12 months?
- What are the 2-3 critical initiatives?
- How will you measure progress?

**Get alignment:**

- Present your findings to leadership
- Align on priorities and resources
- Secure commitment for key initiatives

### Month 3: Execute on Quick Wins

Now it's time to show value:

- Deliver 1-2 visible quick wins
- Build momentum and credibility
- Start laying groundwork for longer-term initiatives

### Common Pitfalls

1. **Moving too fast** — Change takes time in large organizations
2. **Ignoring politics** — Data strategy is organizational strategy
3. **Over-promising** — Better to under-promise and over-deliver
4. **Going alone** — You need allies across the organization

---

*New to a CDO role? Reach out if you'd like to compare notes.*`,
      relatedContent: [
        { id: 'article-4', title: 'Data Governance Without the Bureaucracy', type: 'article' },
        { id: 'list-4', title: 'Building High-Performance Data Teams', type: 'list' },
      ],
    },
    'article-3': {
      id: 'article-3',
      title: 'LLMs in Production: Lessons Learned',
      description: 'Practical insights from deploying large language models in enterprise applications.',
      date: 'Nov 5, 2024',
      readTime: '18 min read',
      views: 4892,
      isPremium: true,
      content: `## Beyond the Demo

Everyone has seen impressive GPT demos. Fewer have successfully deployed LLMs in production at scale. Here's what we've learned from doing exactly that.

### The Gap Between Demo and Production

What works in a notebook often fails in production because:

- **Latency matters** — Users expect fast responses
- **Costs add up** — API calls at scale get expensive
- **Edge cases multiply** — Real users find every failure mode
- **Reliability is non-negotiable** — Occasional errors aren't acceptable

### Our Production Architecture

**1. Smart Routing**

Not every request needs GPT-4:

- We classify requests by complexity
- Simple queries go to smaller, faster models
- Complex reasoning uses larger models
- This reduced costs by 60%+

**2. Caching Strategy**

We implemented multi-level caching:

- Semantic similarity matching for common queries
- Template-based responses where appropriate
- Embedding cache for repeated lookups

**3. Guardrails and Monitoring**

Production LLMs need safety rails:

- Input validation and sanitization
- Output filtering for sensitive content
- Comprehensive logging for debugging
- Automated quality monitoring

### Handling Hallucinations

The biggest challenge is reliability:

**Retrieval Augmented Generation (RAG)**
- Ground responses in verified data
- Include source citations
- Enable fact-checking workflows

**Confidence Scoring**
- Implement uncertainty estimation
- Flag low-confidence responses for review
- Allow graceful degradation

### Cost Optimization

Enterprise LLM costs can spiral quickly:

1. **Model selection** — Use the smallest model that works
2. **Prompt optimization** — Shorter prompts = lower costs
3. **Batching** — Group requests where possible
4. **Caching** — Avoid redundant API calls

### What's Next

We're now exploring:

- Fine-tuning for domain-specific tasks
- On-premise model deployment
- Multi-modal applications

---

*Building with LLMs? Would love to exchange notes on production challenges.*`,
      relatedContent: [
        { id: 'article-1', title: 'From Data Warehouse to AI Factory', type: 'article' },
        { id: 'list-3', title: 'MLOps Tools Comparison 2024', type: 'list' },
      ],
    },
    'article-4': {
      id: 'article-4',
      title: 'Data Governance Without the Bureaucracy',
      description: 'Building governance frameworks that enable rather than restrict data-driven innovation.',
      date: 'Oct 20, 2024',
      readTime: '12 min read',
      views: 1876,
      isPremium: false,
      content: `## Governance That Enables

Traditional data governance has a reputation problem. It's often seen as:

- A bottleneck to innovation
- Endless paperwork and approvals
- Something that slows teams down

But it doesn't have to be this way.

### The New Approach

Modern data governance should be:

**1. Embedded, Not Bolted On**

Governance needs to be part of the workflow, not a separate process:

- Automated data quality checks
- Policy enforcement at the platform level
- Self-service with guardrails

**2. Enabling, Not Restricting**

The goal is to help people use data safely:

- Clear, easy-to-understand policies
- Automated classification and tagging
- Pre-approved patterns for common use cases

**3. Pragmatic, Not Dogmatic**

Focus on what matters:

- Risk-based approach to controls
- Different rules for different data types
- Iterative improvement over perfection

### Practical Implementation

**Step 1: Data Discovery**

You can't govern what you can't see:

- Automated data cataloging
- Lineage tracking
- Sensitive data identification

**Step 2: Policy Definition**

Keep policies simple and actionable:

- Plain-language descriptions
- Clear ownership and accountability
- Automated enforcement where possible

**Step 3: Access Management**

Make it easy to do the right thing:

- Self-service access requests
- Automated approval workflows
- Regular access reviews

### Measuring Success

Track metrics that matter:

- Time to data access
- Policy violation incidents
- User satisfaction scores
- Data quality metrics

### The Bottom Line

Good governance accelerates innovation by creating trust and reducing risk. The goal isn't to control data—it's to unleash its value safely.

---

*Struggling with governance? Let's talk.*`,
      relatedContent: [
        { id: 'article-2', title: 'The CDO Playbook: First 90 Days', type: 'article' },
        { id: 'list-2', title: 'Data-Driven Decision Making at Scale', type: 'list' },
      ],
    },
  },
};

// Lists data
export const LISTS_DATA: Record<string, Record<string, ListData>> = {
  'diego-alcaino': {
    'paypal-mafia': {
      id: 'paypal-mafia',
      title: 'PayPal Mafia',
      description: 'The legendary group of PayPal founders and early employees who went on to create some of the most influential companies in tech.',
      date: 'Mar 26, 2025',
      readTime: '8 min read',
      subscribers: 5,
      isHot: true,
      isPremium: false,
      items: [
        { rank: 1, name: 'Peter Thiel', sector: 'Venture Capital', raised: '$7B+', highlight: 'Co-founder PayPal, Palantir, Founders Fund' },
        { rank: 2, name: 'Elon Musk', sector: 'Technology', raised: '$100B+', highlight: 'Co-founder PayPal, CEO Tesla, SpaceX' },
        { rank: 3, name: 'Reid Hoffman', sector: 'Social Media', raised: '$26B', highlight: 'Co-founder PayPal, Founder LinkedIn' },
        { rank: 4, name: 'Max Levchin', sector: 'Fintech', raised: '$5B+', highlight: 'Co-founder PayPal, Founder Affirm' },
        { rank: 5, name: 'David Sacks', sector: 'SaaS', raised: '$3B+', highlight: 'COO PayPal, Founder Yammer, Craft Ventures' },
        { rank: 6, name: 'Keith Rabois', sector: 'Venture Capital', raised: '$2B+', highlight: 'PayPal exec, Founders Fund, Khosla Ventures' },
        { rank: 7, name: 'Roelof Botha', sector: 'Venture Capital', raised: '$10B+', highlight: 'CFO PayPal, Partner Sequoia Capital' },
        { rank: 8, name: 'Steve Chen', sector: 'Video', raised: '$1.65B', highlight: 'PayPal engineer, Co-founder YouTube' },
        { rank: 9, name: 'Chad Hurley', sector: 'Video', raised: '$1.65B', highlight: 'PayPal designer, Co-founder YouTube' },
        { rank: 10, name: 'Jawed Karim', sector: 'Video', raised: '$1.65B', highlight: 'PayPal engineer, Co-founder YouTube' },
        { rank: 11, name: 'Jeremy Stoppelman', sector: 'Reviews', raised: '$1B+', highlight: 'PayPal VP, Co-founder Yelp' },
        { rank: 12, name: 'Russel Simmons', sector: 'Reviews', raised: '$1B+', highlight: 'PayPal engineer, Co-founder Yelp' },
      ],
      methodology: 'Curated list of PayPal founders and early employees (pre-2002) who later founded or led major tech companies. Ranked by estimated value created post-PayPal.',
    },
    'founders': {
      id: 'founders',
      title: 'Founders with an exit +$m',
      description: 'Founders who have built and exited a company for $1M+. Tracking successful entrepreneurs and their journeys.',
      date: 'Jan 15, 2025',
      readTime: '12 min read',
      subscribers: 4,
      isHot: false,
      isPremium: false,
      items: [
        { rank: 1, name: 'Brian Chesky', sector: 'Travel', raised: '$75B', highlight: 'Airbnb IPO 2020' },
        { rank: 2, name: 'Drew Houston', sector: 'Cloud Storage', raised: '$12B', highlight: 'Dropbox IPO 2018' },
        { rank: 3, name: 'Patrick Collison', sector: 'Fintech', raised: '$95B', highlight: 'Stripe, private valuation' },
        { rank: 4, name: 'Whitney Wolfe Herd', sector: 'Social', raised: '$8B', highlight: 'Bumble IPO 2021' },
        { rank: 5, name: 'Melanie Perkins', sector: 'Design', raised: '$40B', highlight: 'Canva, private valuation' },
      ],
      methodology: 'Founders tracked based on verified exit values from IPO, acquisition, or secondary sales. Minimum threshold $1M.',
    },
    'georgetown': {
      id: 'georgetown',
      title: 'Georgetown Alumni',
      description: 'People who graduated from Georgetown University with undergraduate or graduate degrees. Network of Hoyas in business and tech.',
      date: 'Jan 10, 2025',
      readTime: '10 min read',
      subscribers: 7,
      isHot: false,
      isPremium: false,
      items: [
        { rank: 1, name: 'Sundar Pichai', sector: 'Technology', raised: '$1.5T', highlight: 'CEO Google/Alphabet, MBA Georgetown' },
        { rank: 2, name: 'Maria Bartiromo', sector: 'Media', raised: '-', highlight: 'Fox Business anchor' },
        { rank: 3, name: 'Bradley Cooper', sector: 'Entertainment', raised: '-', highlight: 'Actor, Georgetown BA' },
        { rank: 4, name: 'John Podesta', sector: 'Politics', raised: '-', highlight: 'White House Chief of Staff' },
        { rank: 5, name: 'Robert Gates', sector: 'Government', raised: '-', highlight: 'Former Secretary of Defense' },
      ],
      methodology: 'Alumni verified through Georgetown University records and public sources. Focus on notable figures in business, tech, and public service.',
    },
    'nyc-pending-meetings': {
      id: 'nyc-pending-meetings',
      title: 'NYC Pending Meetings',
      description: 'Curated list of high-value contacts in New York City for upcoming meetings and networking.',
      date: 'Jan 5, 2025',
      readTime: '5 min read',
      subscribers: 0,
      isHot: false,
      isPremium: true,
      items: [
        { rank: 1, name: 'Contact 1', sector: 'Finance', raised: '-', highlight: 'Pending outreach' },
        { rank: 2, name: 'Contact 2', sector: 'Technology', raised: '-', highlight: 'Scheduled Q1 2025' },
        { rank: 3, name: 'Contact 3', sector: 'VC', raised: '-', highlight: 'Intro requested' },
      ],
      methodology: 'Personal networking list for NYC-based meetings. Premium content.',
    },
    'ese-biz-school-alumni': {
      id: 'ese-biz-school-alumni',
      title: 'ESE Business School Alumni',
      description: 'Alumni network from ESE Business School. Connecting graduates across industries and geographies.',
      date: 'Dec 20, 2024',
      readTime: '6 min read',
      subscribers: 0,
      isHot: false,
      isPremium: false,
      items: [
        { rank: 1, name: 'Alumni 1', sector: 'Consulting', raised: '-', highlight: 'MBA 2015' },
        { rank: 2, name: 'Alumni 2', sector: 'Finance', raised: '-', highlight: 'MBA 2018' },
        { rank: 3, name: 'Alumni 3', sector: 'Technology', raised: '-', highlight: 'MBA 2020' },
      ],
      methodology: 'ESE Business School graduates tracked for networking and deal flow purposes.',
    },
  },
  'andres-bucchi': {
    'list-1': {
      id: 'list-1',
      title: 'Enterprise AI Transformation Playbook',
      description: 'Step-by-step framework for implementing AI at scale in large organizations, with detailed milestones and success metrics.',
      date: 'Nov 26, 2024',
      readTime: '20 min read',
      subscribers: 743,
      isHot: true,
      isPremium: true,
      items: [
        { rank: 1, name: 'Phase 1: Assessment', sector: 'Foundation', raised: 'Week 1-4', highlight: 'Current state analysis, opportunity mapping' },
        { rank: 2, name: 'Phase 2: Data Foundation', sector: 'Foundation', raised: 'Month 1-3', highlight: 'Data infrastructure, quality baseline' },
        { rank: 3, name: 'Phase 3: Use Case Selection', sector: 'Strategy', raised: 'Month 2-3', highlight: 'ROI-driven prioritization framework' },
        { rank: 4, name: 'Phase 4: Pilot Development', sector: 'Execution', raised: 'Month 3-5', highlight: '2-3 high-impact pilots' },
        { rank: 5, name: 'Phase 5: Pilot Validation', sector: 'Execution', raised: 'Month 5-6', highlight: 'A/B testing, business metrics' },
        { rank: 6, name: 'Phase 6: MLOps Setup', sector: 'Infrastructure', raised: 'Month 4-7', highlight: 'Production ML infrastructure' },
        { rank: 7, name: 'Phase 7: Model Deployment', sector: 'Execution', raised: 'Month 6-8', highlight: 'Production rollout, monitoring' },
        { rank: 8, name: 'Phase 8: Change Management', sector: 'People', raised: 'Ongoing', highlight: 'Training, adoption programs' },
        { rank: 9, name: 'Phase 9: Scale & Optimize', sector: 'Growth', raised: 'Month 8-12', highlight: 'Expand use cases, improve models' },
        { rank: 10, name: 'Phase 10: Center of Excellence', sector: 'Organization', raised: 'Year 2+', highlight: 'AI CoE establishment' },
        { rank: 11, name: 'Governance Framework', sector: 'Governance', raised: 'Continuous', highlight: 'Model risk, ethics, compliance' },
        { rank: 12, name: 'Talent Strategy', sector: 'People', raised: 'Continuous', highlight: 'Build vs buy vs partner' },
        { rank: 13, name: 'Vendor Management', sector: 'Operations', raised: 'Continuous', highlight: 'Partner ecosystem strategy' },
        { rank: 14, name: 'ROI Measurement', sector: 'Finance', raised: 'Quarterly', highlight: 'Value tracking framework' },
        { rank: 15, name: 'Executive Alignment', sector: 'Leadership', raised: 'Monthly', highlight: 'Stakeholder management' },
      ],
      methodology: 'Framework developed from hands-on experience leading AI transformation at LATAM Airlines (30K+ employees), Sodimac, and advisory work with 15+ Fortune 500 companies. Success metrics validated across $500M+ in documented AI-driven value creation.',
    },
    'list-2': {
      id: 'list-2',
      title: 'Data-Driven Decision Making at Scale',
      description: 'Building analytics infrastructure for companies with 10k+ employees. Complete architecture and organizational blueprint.',
      date: 'Nov 12, 2024',
      readTime: '14 min read',
      subscribers: 521,
      isHot: false,
      isPremium: true,
      items: [
        { rank: 1, name: 'Executive Dashboards', sector: 'Strategic Layer', raised: 'C-Suite', highlight: 'Real-time KPI visibility, 10 metrics max' },
        { rank: 2, name: 'Business Intelligence', sector: 'Tactical Layer', raised: 'Directors', highlight: 'Self-service analytics, drill-down capability' },
        { rank: 3, name: 'Operational Analytics', sector: 'Operational Layer', raised: 'Managers', highlight: 'Embedded in workflows, automated alerts' },
        { rank: 4, name: 'Predictive Analytics', sector: 'Advanced Layer', raised: 'Specialists', highlight: 'ML models, forecasting, optimization' },
        { rank: 5, name: 'Data Products', sector: 'Monetization', raised: 'External', highlight: 'Data-as-a-service offerings' },
        { rank: 6, name: 'Data Lakehouse', sector: 'Infrastructure', raised: 'Foundation', highlight: 'Unified batch + streaming architecture' },
        { rank: 7, name: 'Semantic Layer', sector: 'Infrastructure', raised: 'Foundation', highlight: 'Single source of truth metrics' },
        { rank: 8, name: 'Data Catalog', sector: 'Governance', raised: 'Foundation', highlight: 'Discovery, lineage, documentation' },
        { rank: 9, name: 'Feature Store', sector: 'ML Infrastructure', raised: 'Advanced', highlight: 'Reusable ML features' },
        { rank: 10, name: 'Experiment Platform', sector: 'ML Infrastructure', raised: 'Advanced', highlight: 'A/B testing at scale' },
        { rank: 11, name: 'Data Quality', sector: 'Governance', raised: 'Critical', highlight: 'Automated monitoring, SLAs' },
        { rank: 12, name: 'Access Control', sector: 'Security', raised: 'Critical', highlight: 'Row/column level security' },
        { rank: 13, name: 'Cost Management', sector: 'FinOps', raised: 'Ongoing', highlight: 'Cloud cost optimization' },
        { rank: 14, name: 'Training Program', sector: 'People', raised: 'Continuous', highlight: 'Data literacy at all levels' },
        { rank: 15, name: 'Support Model', sector: 'Operations', raised: 'Ongoing', highlight: 'Tiered support structure' },
      ],
      methodology: 'Best practices compiled from implementations at Fortune 500 companies including LATAM Airlines, Walmart Chile, and Banco de Chile. Architecture patterns validated at 100K+ daily active users scale.',
    },
    'list-3': {
      id: 'list-3',
      title: 'MLOps Tools Comparison 2024',
      description: 'Comprehensive review of ML infrastructure tools and platforms with real-world performance benchmarks.',
      date: 'Oct 30, 2024',
      readTime: '16 min read',
      subscribers: 389,
      isHot: false,
      isPremium: false,
      items: [
        { rank: 1, name: 'Databricks', sector: 'Unified Platform', raised: 'Enterprise', highlight: 'Best all-in-one, $8-15K/month start' },
        { rank: 2, name: 'Snowflake + dbt', sector: 'Data Platform', raised: 'Enterprise', highlight: 'Best for analytics-heavy orgs' },
        { rank: 3, name: 'Weights & Biases', sector: 'Experiment Tracking', raised: 'Best-in-class', highlight: 'Gold standard for ML teams' },
        { rank: 4, name: 'MLflow', sector: 'Open Source', raised: 'Flexible', highlight: 'Best OSS option, Databricks native' },
        { rank: 5, name: 'Kubeflow', sector: 'Kubernetes Native', raised: 'Scalable', highlight: 'Best for K8s shops, steep learning' },
        { rank: 6, name: 'AWS SageMaker', sector: 'Cloud Native', raised: 'AWS Lock-in', highlight: 'Best if all-in on AWS' },
        { rank: 7, name: 'GCP Vertex AI', sector: 'Cloud Native', raised: 'GCP Lock-in', highlight: 'Strong AutoML capabilities' },
        { rank: 8, name: 'Azure ML', sector: 'Cloud Native', raised: 'Azure Lock-in', highlight: 'Best enterprise integration' },
        { rank: 9, name: 'Feast', sector: 'Feature Store', raised: 'Open Source', highlight: 'Best OSS feature store' },
        { rank: 10, name: 'Tecton', sector: 'Feature Store', raised: 'Enterprise', highlight: 'Real-time features at scale' },
        { rank: 11, name: 'Seldon', sector: 'Model Serving', raised: 'Enterprise', highlight: 'Advanced deployment patterns' },
        { rank: 12, name: 'BentoML', sector: 'Model Serving', raised: 'Open Source', highlight: 'Easiest model packaging' },
        { rank: 13, name: 'Great Expectations', sector: 'Data Quality', raised: 'Open Source', highlight: 'Best OSS data validation' },
        { rank: 14, name: 'Evidently AI', sector: 'Model Monitoring', raised: 'Open Source', highlight: 'Best drift detection' },
        { rank: 15, name: 'Label Studio', sector: 'Data Labeling', raised: 'Open Source', highlight: 'Best OSS labeling tool' },
      ],
      methodology: 'Tools evaluated based on: (1) Scalability to 1000+ models, (2) Ease of use for DS teams, (3) Integration capabilities, (4) Community support, (5) Total cost of ownership. Benchmarks from running tools in production at LATAM Airlines.',
    },
    'list-4': {
      id: 'list-4',
      title: 'Building High-Performance Data Teams',
      description: 'Hiring frameworks and org structures that work at scale. Based on building teams at Uber, Sodimac, and LATAM Airlines.',
      date: 'Oct 15, 2024',
      readTime: '11 min read',
      subscribers: 612,
      isHot: true,
      isPremium: true,
      items: [
        { rank: 1, name: 'Data Engineers', sector: 'Core Role', raised: '35-40%', highlight: 'Foundation of data team, pipeline experts' },
        { rank: 2, name: 'Analytics Engineers', sector: 'Core Role', raised: '20-25%', highlight: 'Bridge between DE and DS, dbt experts' },
        { rank: 3, name: 'Data Scientists', sector: 'Core Role', raised: '15-20%', highlight: 'ML modeling, experimentation' },
        { rank: 4, name: 'ML Engineers', sector: 'Specialized', raised: '10-15%', highlight: 'Production ML, MLOps' },
        { rank: 5, name: 'Data Analysts', sector: 'Core Role', raised: '10-15%', highlight: 'Business insight, stakeholder facing' },
        { rank: 6, name: 'Data Platform Engineers', sector: 'Specialized', raised: '5-10%', highlight: 'Infrastructure, tooling' },
        { rank: 7, name: 'Centralized vs Embedded', sector: 'Org Model', raised: 'Hybrid', highlight: 'Platform centralized, analytics embedded' },
        { rank: 8, name: 'Career Ladders', sector: 'Development', raised: 'IC + Manager', highlight: 'Dual track essential' },
        { rank: 9, name: 'Hiring Bar', sector: 'Recruiting', raised: 'High', highlight: 'SQL + Python + domain knowledge' },
        { rank: 10, name: 'Onboarding', sector: 'Process', raised: '90 days', highlight: 'Structured ramp-up program' },
        { rank: 11, name: 'Team Rituals', sector: 'Culture', raised: 'Weekly', highlight: 'Code reviews, demos, learning' },
        { rank: 12, name: 'Documentation', sector: 'Process', raised: 'Essential', highlight: 'Decision records, runbooks' },
        { rank: 13, name: 'On-Call Rotation', sector: 'Operations', raised: 'Required', highlight: 'Shared responsibility model' },
        { rank: 14, name: 'Comp Benchmarking', sector: 'Recruiting', raised: 'P75', highlight: 'Compete with FAANG for talent' },
        { rank: 15, name: 'Remote Policy', sector: 'Culture', raised: 'Hybrid', highlight: '2-3 days in office optimal' },
      ],
      methodology: 'Org structure recommendations based on building and scaling data teams from 5 to 50+ at Uber LatAm, Sodimac (VP of Data), and LATAM Airlines (CDO). Includes hiring 100+ data professionals across these roles.',
    },
  },
};

// Get article by expert and id
export function getArticle(expertId: string, articleId: string): ArticleData | null {
  return ARTICLES_DATA[expertId]?.[articleId] || null;
}

// Get list by expert and id
export function getList(expertId: string, listId: string): ListData | null {
  return LISTS_DATA[expertId]?.[listId] || null;
}

// Get all content paths for static generation
export function getAllContentPaths(): { expertId: string; contentType: string; contentId: string }[] {
  const paths: { expertId: string; contentType: string; contentId: string }[] = [];

  for (const [expertId, articles] of Object.entries(ARTICLES_DATA)) {
    for (const articleId of Object.keys(articles)) {
      paths.push({ expertId, contentType: 'article', contentId: articleId });
    }
  }

  for (const [expertId, lists] of Object.entries(LISTS_DATA)) {
    for (const listId of Object.keys(lists)) {
      paths.push({ expertId, contentType: 'list', contentId: listId });
    }
  }

  return paths;
}
