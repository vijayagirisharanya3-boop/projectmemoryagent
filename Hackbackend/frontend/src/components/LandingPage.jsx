import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Clock, 
  Layers, 
  CheckCircle2, 
  FileText, 
  Compass, 
  HelpCircle, 
  Cpu, 
  History, 
  ChevronRight,
  Zap,
  Users
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onSignIn, onSelectFeature }) {
  const [orbHovered, setOrbHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('decision');

  return (
    <div className="landing-page">
      {/* Decorative Background Elements (Zero block displacement) */}
      <div className="landing-bg-decor" aria-hidden="true">
        <div className="landing-glow landing-glow-lavender"></div>
        <div className="landing-glow landing-glow-peach"></div>
        <div className="landing-glow landing-glow-mint"></div>
        <div className="landing-glow landing-glow-cyan"></div>
        <div className="landing-grid-overlay"></div>
      </div>

      {/* Hero Section — 2-Column Balanced Composition */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Narrative, Value Proposition & Actions */}
          <div className="hero-content-col">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-sparkle" />
              <span>The Project Evolution & Reasoning Engine</span>
            </div>

            <h1 className="hero-title">
              Your Projects Remember.<br />
              <span className="hero-gradient-text">Now They Can Explain Why.</span>
            </h1>

            <p className="hero-subtitle">
              Project Memory Agent preserves the evolution of your projects — decisions, reasons, 
              changes, failed approaches, and evidence — so your team can understand not only what happened, but why.
            </p>

            <div className="hero-actions">
              <button className="btn btn-hero-primary" onClick={onGetStarted}>
                <Sparkles size={18} /> Explore Project Memory
              </button>
              <button className="btn btn-hero-secondary" onClick={onSignIn}>
                Sign In <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Trust / Proof Badges */}
            <div className="hero-proof-row">
              <span className="proof-pill">
                <CheckCircle2 size={13} className="proof-check" /> Isolated Hindsight Banks
              </span>
              <span className="proof-pill">
                <CheckCircle2 size={13} className="proof-check" /> Temporal Grounding
              </span>
              <span className="proof-pill">
                <CheckCircle2 size={13} className="proof-check" /> Evidence-Backed Answers
              </span>
            </div>
          </div>

          {/* Right Column: Abstract Interactive / Glowing Memory Core */}
          <div className="hero-visual-col">
            <div 
              className={`memory-core-stage ${orbHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setOrbHovered(true)}
              onMouseLeave={() => setOrbHovered(false)}
            >
              {/* Connected SVG Network Lines linking Core to Memory Nodes */}
              <svg className="memory-network-svg" viewBox="0 0 480 440" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="lineGradViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="lineGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="lineGradMint" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Connection lines from center (240, 210) to nodes */}
                <path d="M 240 210 Q 180 130 110 80" stroke="url(#lineGradViolet)" strokeWidth="1.5" strokeDasharray="5 4" className="pulse-path" />
                <path d="M 240 210 Q 310 130 370 75" stroke="url(#lineGradCyan)" strokeWidth="1.5" strokeDasharray="5 4" className="pulse-path" />
                <path d="M 240 210 Q 340 210 375 220" stroke="url(#lineGradMint)" strokeWidth="1.5" strokeDasharray="5 4" className="pulse-path" />
                <path d="M 240 210 Q 320 300 350 350" stroke="url(#lineGradViolet)" strokeWidth="1.5" strokeDasharray="5 4" className="pulse-path" />
                <path d="M 240 210 Q 170 300 120 345" stroke="url(#lineGradCyan)" strokeWidth="1.5" strokeDasharray="5 4" className="pulse-path" />

                {/* Node connection anchors */}
                <circle cx="110" cy="80" r="4" fill="#8b5cf6" className="pulse-node" />
                <circle cx="370" cy="75" r="4" fill="#06b6d4" className="pulse-node" />
                <circle cx="375" cy="220" r="4" fill="#10b981" className="pulse-node" />
                <circle cx="350" cy="350" r="4" fill="#ec4899" className="pulse-node" />
                <circle cx="120" cy="345" r="4" fill="#f59e0b" className="pulse-node" />
              </svg>

              {/* Orbital Rings */}
              <div className="orbit-ring orbit-ring-outer"></div>
              <div className="orbit-ring orbit-ring-inner"></div>

              {/* Central Glowing Memory Core */}
              <div className="memory-core-orb">
                <div className="orb-inner-glow"></div>
                <div className="orb-center-pulse">
                  <Brain size={40} className="orb-brain-icon" />
                  <span className="orb-label">MEMORY CORE</span>
                </div>
                {/* Particle Sparks */}
                <span className="particle p1"></span>
                <span className="particle p2"></span>
                <span className="particle p3"></span>
                <span className="particle p4"></span>
              </div>

              {/* Connected Memory Nodes / Floating Cards */}
              <div className="float-card float-node-decision">
                <div className="float-card-header">
                  <span className="dot dot-purple"></span>
                  <span className="float-tag">Decision</span>
                </div>
                <div className="float-card-body">
                  <strong>Switch to PostgreSQL</strong>
                  <p>Billing module data safety</p>
                </div>
              </div>

              <div className="float-card float-node-meeting">
                <div className="float-card-header">
                  <span className="dot dot-coral"></span>
                  <span className="float-tag">Meeting 01 vs 02</span>
                </div>
                <div className="float-card-body">
                  <strong>Strict Isolation</strong>
                  <p>No facts leaked across meetings</p>
                </div>
              </div>

              <div className="float-card float-node-evidence">
                <div className="float-card-header">
                  <span className="dot dot-mint"></span>
                  <span className="float-tag">Verified Evidence</span>
                </div>
                <div className="float-card-body">
                  <strong>Doc #002 Cited</strong>
                  <p>Confidence: High • Grounded</p>
                </div>
              </div>

              <div className="float-card float-node-reason">
                <div className="float-card-header">
                  <span className="dot dot-pink"></span>
                  <span className="float-tag">Reason</span>
                </div>
                <div className="float-card-body">
                  <strong>ACID Transactions</strong>
                  <p>Eliminate billing inconsistencies</p>
                </div>
              </div>

              <div className="float-card float-node-change">
                <div className="float-card-header">
                  <span className="dot dot-amber"></span>
                  <span className="float-tag">Change</span>
                </div>
                <div className="float-card-body">
                  <strong>Discard 2-Phase Commits</strong>
                  <p>Excessive distributed complexity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Comparison Section: Not Just Status */}
      <section className="section comparison-section" id="why-memory">
        <div className="section-header">
          <span className="section-eyebrow">A NEW PARADIGM</span>
          <h2 className="section-title">Project Memory, Not Just Project Status</h2>
          <p className="section-description">
            Traditional tools track tasks and deadlines. Project Memory Agent preserves the collective intelligence and rationale behind every shift in direction.
          </p>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card traditional-card">
            <div className="card-badge-muted">Traditional Project Tools</div>
            <h3 className="card-heading">"What is happening right now?"</h3>
            <ul className="comparison-list">
              <li>Ephemeral Slack & Discord decisions get buried</li>
              <li>New teammates don't know why MongoDB was replaced</li>
              <li>Meeting minutes sit in forgotten Google Docs</li>
              <li>Failed approaches are repeated 6 months later</li>
              <li>Status boards show state, not history or reason</li>
            </ul>
          </div>

          <div className="comparison-card memory-agent-card">
            <div className="card-badge-highlight">✦ Project Memory Agent</div>
            <h3 className="card-heading">"Why did we decide that?"</h3>
            <ul className="comparison-list check-list">
              <li><CheckCircle2 size={16} className="check-icon" /> <strong>Long-term recall</strong> indexed by isolated Hindsight memory banks</li>
              <li><CheckCircle2 size={16} className="check-icon" /> <strong>Temporal grounding</strong> keeps Meeting 1 separate from Meeting 2</li>
              <li><CheckCircle2 size={16} className="check-icon" /> <strong>Grounded reasoning</strong> with verifiable document evidence</li>
              <li><CheckCircle2 size={16} className="check-icon" /> <strong>Honest refusals</strong> — refuses to hallucinate unrecorded facts</li>
              <li><CheckCircle2 size={16} className="check-icon" /> <strong>Chronological evolution</strong> reveals full path from prototype to prod</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6 Core Feature Cards Section */}
      <section className="section features-section" id="features">
        <div className="section-header">
          <span className="section-eyebrow">CAPABILITIES</span>
          <h2 className="section-title">Intelligent Project Memory Architecture</h2>
          <p className="section-description">
            Engineered with FastAPI, MySQL metadata separation, Hindsight vector-free memory banks, and Google Gemini reasoning.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card feature-lavender">
            <div className="feature-icon-wrapper">
              <Database size={24} />
            </div>
            <h3 className="feature-title">Long-Term Memory</h3>
            <p className="feature-text">
              Preserve project knowledge beyond individual meetings. Every project maintains its own isolated Hindsight memory bank.
            </p>
          </div>

          <div className="feature-card feature-coral">
            <div className="feature-icon-wrapper">
              <Compass size={24} />
            </div>
            <h3 className="feature-title">Decision History</h3>
            <p className="feature-text">
              Remember critical architectural decisions and the exact reasoning behind them. Never lose the "why" when code changes.
            </p>
          </div>

          <div className="feature-card feature-mint">
            <div className="feature-icon-wrapper">
              <History size={24} />
            </div>
            <h3 className="feature-title">Evolution Timeline</h3>
            <p className="feature-text">
              See how the project evolved over time, tracking previous approaches, failed experiments, and what was eventually selected.
            </p>
          </div>

          <div className="feature-card feature-peach">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Grounded AI Reasoning</h3>
            <p className="feature-text">
              Answers are synthesized strictly from recalled memories. The system refuses to hallucinate facts or author names.
            </p>
          </div>

          <div className="feature-card feature-yellow">
            <div className="feature-icon-wrapper">
              <Clock size={24} />
            </div>
            <h3 className="feature-title">Meeting-Aware Isolation</h3>
            <p className="feature-text">
              Questions targeting Meeting 1 strictly return Meeting 1 facts, preventing fact leakage from subsequent meetings.
            </p>
          </div>

          <div className="feature-card feature-pink">
            <div className="feature-icon-wrapper">
              <FileText size={24} />
            </div>
            <h3 className="feature-title">Verifiable Evidence</h3>
            <p className="feature-text">
              Every answer is backed by verifiable evidence citations linking directly to document IDs, source titles, and timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Flow */}
      <section className="section how-it-works-section" id="how-it-works">
        <div className="section-header">
          <span className="section-eyebrow">SIMPLE & POWERFUL</span>
          <h2 className="section-title">How Project Memory Agent Works</h2>
          <p className="section-description">
            From raw meeting notes to grounded technical answers in four seamless steps.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-box"><FileText size={22} /></div>
            <h3 className="step-title">Capture</h3>
            <p className="step-text">
              Meeting notes, architecture decisions, and incident post-mortems enter the system with preserved document identity.
            </p>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-box"><Database size={22} /></div>
            <h3 className="step-title">Remember</h3>
            <p className="step-text">
              Gemini extracts decisions, reasons, and obstacles, retaining rich structured facts in isolated Hindsight memory banks.
            </p>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-box"><Cpu size={22} /></div>
            <h3 className="step-title">Reason</h3>
            <p className="step-text">
              When a team member asks a question, Hindsight recalls targeted memories and Gemini reasons over grounded project history.
            </p>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon-box"><ShieldCheck size={22} /></div>
            <h3 className="step-title">Explain</h3>
            <p className="step-text">
              The agent delivers a clear, grounded answer with confidence ratings and verifiable evidence citations.
            </p>
          </div>
        </div>
      </section>

      {/* Live Interactive Query Preview */}
      <section className="section preview-section">
        <div className="preview-card">
          <div className="preview-header">
            <div className="preview-indicator">
              <span className="pulse-dot"></span> Live Reasoning Preview
            </div>
            <span className="badge badge-high">Confidence: High</span>
          </div>

          <div className="preview-query">
            <HelpCircle size={18} className="query-icon" />
            <span>"Why did we switch from MongoDB to PostgreSQL?"</span>
          </div>

          <div className="preview-answer">
            <p>
              "The team initially considered and used <strong>MongoDB</strong> for flexible schema and rapid prototyping (Meeting 1). 
              However, the team subsequently decided to switch to <strong>PostgreSQL</strong> because MongoDB lacked ACID transactions 
              for billing and caused data inconsistency in the payment module (Meeting 2). A previous attempt to use two-phase commits 
              with MongoDB failed due to complexity."
            </p>
          </div>

          <div className="preview-evidence">
            <div className="evidence-pill">
              <FileText size={13} />
              <span>Evidence: Database Decision - Meeting 2 (Doc: meeting_002)</span>
            </div>
            <div className="evidence-pill">
              <FileText size={13} />
              <span>Evidence: Database Discussion - Meeting 1 (Doc: meeting_001)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2 className="cta-title">Give Your Projects an Unbreakable Memory</h2>
          <p className="cta-text">
            Start tracking decisions, understanding technical trade-offs, and reasoning over project evolution today.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-hero-primary" onClick={onGetStarted}>
              <Sparkles size={18} /> Get Started Free
            </button>
            <button className="btn btn-hero-secondary" onClick={onSignIn}>
              Sign In to Your Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-icon small"><Brain size={18} /></div>
            <span className="brand-title">Project Memory Agent</span>
          </div>
          <p className="footer-copy">
            Built with FastAPI, MySQL, Hindsight Long-Term Memory, and Google Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
