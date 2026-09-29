import React, { useState } from 'react';
import { Sparkles, Database, PlusCircle, LayoutDashboard, Hash, ArrowLeft, ShieldCheck, Server, Cpu, ArrowRight } from 'lucide-react';
import AskAI from './AskAI';
import MemoriesView from './MemoriesView';
import AddInformation from './AddInformation';

export default function ProjectDashboard({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('ask'); // 'ask', 'memories', 'add', 'overview'
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMemoryAdded = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
      {/* Project Header Card */}
      <div className="card project-header-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-low">
                <Hash size={12} /> Project ID: {project.id}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontFamily: 'monospace' }}>
                Isolated Memory Bank: project_{project.id}
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{project.name}</h1>
            <p style={{ color: 'var(--ws-text-muted)', fontSize: '0.95rem', maxWidth: '750px' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onBackToProjects}>
            <ArrowLeft size={15} /> All Projects
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveTab('ask')}
        >
          <Sparkles size={16} /> Ask AI (Grounded Reasoning)
        </button>
        <button
          className={`tab-btn ${activeTab === 'memories' ? 'active' : ''}`}
          onClick={() => setActiveTab('memories')}
        >
          <Database size={16} /> Memories & Evolution Timeline
        </button>
        <button
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusCircle size={16} /> Add & Process Information
        </button>
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'ask' && <AskAI projectId={project.id} />}

      {activeTab === 'memories' && <MemoriesView key={refreshKey} projectId={project.id} />}

      {activeTab === 'add' && <AddInformation projectId={project.id} onMemoryAdded={handleMemoryAdded} />}

      {activeTab === 'overview' && (
        <div className="dashboard-overview-container">
          {/* Top Row: Visual Capability Cards */}
          <div className="overview-stats-grid">
            <div className="overview-metric-card metric-card-bank">
              <div className="metric-card-top">
                <div className="metric-icon-orb orb-cyan">
                  <Database size={20} />
                </div>
                <span className="metric-badge">ISOLATED BANK</span>
              </div>
              <div className="metric-body">
                <span className="metric-highlight">project_{project.id}</span>
                <span className="metric-title">Hindsight Memory Bank</span>
                <p className="metric-desc">Dedicated vector-free storage partition. Strict project-level boundary enforced.</p>
              </div>
            </div>

            <div className="overview-metric-card metric-card-meta">
              <div className="metric-card-top">
                <div className="metric-icon-orb orb-violet">
                  <Server size={20} />
                </div>
                <span className="metric-badge">RELATIONAL DATA</span>
              </div>
              <div className="metric-body">
                <span className="metric-highlight">MySQL 8.0</span>
                <span className="metric-title">Metadata & Document Tracking</span>
                <p className="metric-desc">Preserves document IDs, user namespaces, timestamps, and meeting notes metadata.</p>
              </div>
            </div>

            <div className="overview-metric-card metric-card-engine">
              <div className="metric-card-top">
                <div className="metric-icon-orb orb-pink">
                  <Cpu size={20} />
                </div>
                <span className="metric-badge">REASONING ENGINE</span>
              </div>
              <div className="metric-body">
                <span className="metric-highlight">Gemini 2.5</span>
                <span className="metric-title">Grounded AI Synthesis</span>
                <p className="metric-desc">Synthesizes historical reasoning strictly over recalled facts with zero hallucination.</p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Architecture Deep Dive + Direct Action Launcher */}
          <div className="overview-detail-grid">
            <div className="overview-card architecture-card">
              <div className="card-header-styled">
                <div className="styled-icon-wrap">
                  <ShieldCheck size={20} className="styled-icon" />
                </div>
                <div>
                  <h3 className="styled-title">Project Architecture & Privacy Guarantees</h3>
                  <p className="styled-sub">Enterprise memory isolation with multi-layered grounding</p>
                </div>
              </div>

              <div className="arch-flow-diagram">
                <div className="arch-stage">
                  <span className="stage-num">01</span>
                  <strong>MySQL Store</strong>
                  <p>Projects & Metadata</p>
                </div>
                <div className="arch-arrow">➔</div>
                <div className="arch-stage stage-highlight">
                  <span className="stage-num">02</span>
                  <strong>Hindsight Bank</strong>
                  <p>project_{project.id}</p>
                </div>
                <div className="arch-arrow">➔</div>
                <div className="arch-stage">
                  <span className="stage-num">03</span>
                  <strong>Gemini Reasoning</strong>
                  <p>Temporal Grounding</p>
                </div>
              </div>

              <p className="arch-explanation">
                Every memory, decision, and meeting note for <strong>{project.name}</strong> is sealed within its isolated memory bank. Queries can never cross boundaries or leak facts from other projects.
              </p>
            </div>

            <div className="overview-card actions-card">
              <h3 className="actions-card-title">Jump to Workspace Tools</h3>
              <div className="actions-button-stack">
                <button className="action-launch-tile tile-ask" onClick={() => setActiveTab('ask')}>
                  <div className="tile-icon-box"><Sparkles size={18} /></div>
                  <div className="tile-text">
                    <strong>Ask AI Intelligence</strong>
                    <span>Reason over project decisions</span>
                  </div>
                  <ArrowRight size={16} className="tile-arrow" />
                </button>

                <button className="action-launch-tile tile-memories" onClick={() => setActiveTab('memories')}>
                  <div className="tile-icon-box"><Database size={18} /></div>
                  <div className="tile-text">
                    <strong>Browse Memory Timeline</strong>
                    <span>Explore milestones & evolution</span>
                  </div>
                  <ArrowRight size={16} className="tile-arrow" />
                </button>

                <button className="action-launch-tile tile-add" onClick={() => setActiveTab('add')}>
                  <div className="tile-icon-box"><PlusCircle size={18} /></div>
                  <div className="tile-text">
                    <strong>Record Evolution Notes</strong>
                    <span>Add decisions & process with AI</span>
                  </div>
                  <ArrowRight size={16} className="tile-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
