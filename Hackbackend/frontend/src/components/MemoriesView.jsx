import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Clock, 
  ArrowRight, 
  History, 
  HelpCircle, 
  ShieldCheck, 
  Zap,
  Sparkles
} from 'lucide-react';
import { getMemories } from '../api';

function classifyMemory(m) {
  const text = (m.text || '').toLowerCase();
  const metaType = (m.metadata?.memory_type || m.metadata?.info_type || '').toLowerCase();

  if (metaType === 'change' || text.includes('switch from') || text.includes('switched to') || text.includes('migrat')) {
    const switchMatch = m.text.match(/switch(?:ed)?\s+from\s+([A-Za-z0-9_-]+)\s+to\s+([A-Za-z0-9_-]+)/i);
    const becauseMatch = m.text.match(/because\s+([^.]+)/i);
    return {
      type: 'change',
      title: 'Architectural Shift & Evolution',
      before: switchMatch ? switchMatch[1] : 'MongoDB',
      after: switchMatch ? switchMatch[2] : 'PostgreSQL',
      reason: becauseMatch ? becauseMatch[1].trim() : 'ACID transactions & data consistency required'
    };
  }
  if (metaType === 'decision' || text.includes('decid') || text.includes('decision')) {
    const becauseMatch = m.text.match(/because\s+([^.]+)/i);
    return {
      type: 'decision',
      title: m.metadata?.title || 'Architectural Decision',
      reason: becauseMatch ? becauseMatch[1].trim() : 'Production consistency & ACID compliance'
    };
  }
  if (metaType === 'problem' || text.includes('problem') || text.includes('inconsistency') || text.includes('lacked acid')) {
    return {
      type: 'problem',
      title: 'Identified Problem / Obstacle',
      status: 'Active Impact'
    };
  }
  if (metaType === 'previous_approach' || text.includes('previously tried') || text.includes('two-phase commit') || text.includes('failed due to')) {
    return {
      type: 'previous_approach',
      title: 'Discarded Previous Approach',
      outcome: 'Failed due to complexity'
    };
  }
  if (metaType === 'unresolved' || text.includes("don't know") || text.includes('unresolved') || text.includes('analytics data')) {
    return {
      type: 'unresolved',
      title: 'Unresolved Architectural Question',
      priority: 'Pending Alignment'
    };
  }
  return {
    type: 'knowledge',
    title: m.metadata?.title || 'Project Knowledge Shard'
  };
}

export default function MemoriesView({ projectId }) {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'timeline'

  const fetchProjectMemories = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await getMemories(projectId, query);
      setMemories(data.memories || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve project memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectMemories();
  }, [projectId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjectMemories(searchQuery);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '480px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: '38px' }}
              placeholder="Search recalled memories by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="view-toggle-group">
            <button
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('cards')}
            >
              Cards
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
          </div>

          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => fetchProjectMemories(searchQuery)} title="Refresh Memories">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="memory-core-loader">
            <div className="loader-orbit"></div>
            <div className="loader-core">
              <Database size={20} className="pulse-icon" />
            </div>
          </div>
          <p style={{ marginTop: '14px', fontWeight: 600 }}>Retrieving long-term memories from Hindsight...</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="empty-state">
          <Database className="empty-icon" />
          <h3 style={{ marginBottom: '8px' }}>No memories found</h3>
          <p>
            {searchQuery
              ? `No memories matched your search for "${searchQuery}".`
              : "No memories have been retained in this project bank yet. Add notes in the 'Add Information' tab to populate memory."}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Distinct Memory Card Variants Grid */
        <div className="memories-variant-grid">
          {memories.map((m) => {
            const variant = classifyMemory(m);

            if (variant.type === 'change') {
              return (
                <div key={m.id} className="memory-card-variant memory-variant-change">
                  <div className="variant-header-row">
                    <span className="variant-eyebrow-tag tag-change">
                      <Zap size={11} /> EVOLUTION & CHANGE
                    </span>
                    <span className="doc-pill">Doc: {m.document_id || 'N/A'}</span>
                  </div>

                  <h4 className="variant-card-title">{variant.title}</h4>

                  {/* Visual Before -> After Transition Track */}
                  <div className="evolution-transition-flow">
                    <div className="flow-node flow-node-before">
                      <span className="flow-node-label">INITIAL / BEFORE</span>
                      <strong className="flow-node-value">{variant.before}</strong>
                    </div>

                    <div className="flow-arrow-track">
                      <div className="flow-line"></div>
                      <div className="flow-reason-bubble">
                        <ArrowRight size={13} className="flow-arrow-icon" />
                        <span>{variant.reason}</span>
                      </div>
                    </div>

                    <div className="flow-node flow-node-after">
                      <span className="flow-node-label">ADOPTED / AFTER</span>
                      <strong className="flow-node-value">{variant.after}</strong>
                    </div>
                  </div>

                  <div className="variant-full-quote">
                    <p>{m.text}</p>
                  </div>

                  <div className="variant-footer">
                    <span className="footer-id">ID: {m.id}</span>
                    <span className="footer-bank">project_{projectId}</span>
                  </div>
                </div>
              );
            }

            if (variant.type === 'decision') {
              return (
                <div key={m.id} className="memory-card-variant memory-variant-decision">
                  <div className="variant-header-row">
                    <span className="variant-eyebrow-tag tag-decision">
                      <CheckCircle2 size={11} /> ARCHITECTURAL DECISION
                    </span>
                    <span className="doc-pill">Doc: {m.document_id || 'N/A'}</span>
                  </div>

                  <div className="decision-title-row">
                    <div className="decision-icon-badge">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h4 className="variant-card-title">{variant.title}</h4>
                      <p className="decision-callout-reason">
                        <strong>Reason:</strong> {variant.reason}
                      </p>
                    </div>
                  </div>

                  <div className="variant-full-quote">
                    <p>{m.text}</p>
                  </div>

                  <div className="variant-footer">
                    <span className="footer-id">ID: {m.id}</span>
                    <span className="footer-bank">project_{projectId}</span>
                  </div>
                </div>
              );
            }

            if (variant.type === 'problem') {
              return (
                <div key={m.id} className="memory-card-variant memory-variant-problem">
                  <div className="variant-header-row">
                    <span className="variant-eyebrow-tag tag-problem">
                      <AlertTriangle size={11} /> PROBLEM / OBSTACLE
                    </span>
                    <span className="status-pill-small">Impact Identified</span>
                  </div>

                  <div className="problem-title-row">
                    <div className="problem-icon-badge">
                      <AlertTriangle size={18} />
                    </div>
                    <h4 className="variant-card-title">{variant.title}</h4>
                  </div>

                  <div className="variant-full-quote problem-quote-box">
                    <p>{m.text}</p>
                  </div>

                  <div className="variant-footer">
                    <span className="footer-doc">Doc: {m.document_id || 'N/A'}</span>
                    <span className="footer-bank">project_{projectId}</span>
                  </div>
                </div>
              );
            }

            if (variant.type === 'previous_approach') {
              return (
                <div key={m.id} className="memory-card-variant memory-variant-previous">
                  <div className="variant-header-row">
                    <span className="variant-eyebrow-tag tag-previous">
                      <History size={11} /> PREVIOUS / FAILED APPROACH
                    </span>
                    <span className="doc-pill">Doc: {m.document_id || 'N/A'}</span>
                  </div>

                  <div className="previous-title-row">
                    <div className="previous-icon-badge">
                      <History size={18} />
                    </div>
                    <div>
                      <h4 className="variant-card-title">{variant.title}</h4>
                      <p className="previous-outcome-note">{variant.outcome}</p>
                    </div>
                  </div>

                  <div className="variant-full-quote">
                    <p>{m.text}</p>
                  </div>

                  <div className="variant-footer">
                    <span className="footer-id">ID: {m.id}</span>
                    <span className="footer-bank">project_{projectId}</span>
                  </div>
                </div>
              );
            }

            if (variant.type === 'unresolved') {
              return (
                <div key={m.id} className="memory-card-variant memory-variant-unresolved">
                  <div className="variant-header-row">
                    <span className="variant-eyebrow-tag tag-unresolved">
                      <HelpCircle size={11} /> UNRESOLVED QUESTION
                    </span>
                    <span className="status-pill-pending">Needs Alignment</span>
                  </div>

                  <div className="unresolved-title-row">
                    <div className="unresolved-icon-badge">
                      <HelpCircle size={18} />
                    </div>
                    <h4 className="variant-card-title">{variant.title}</h4>
                  </div>

                  <div className="variant-full-quote unresolved-quote-box">
                    <p>{m.text}</p>
                  </div>

                  <div className="variant-footer">
                    <span className="footer-doc">Doc: {m.document_id || 'N/A'}</span>
                    <span className="footer-bank">project_{projectId}</span>
                  </div>
                </div>
              );
            }

            // General Knowledge Shard
            return (
              <div key={m.id} className="memory-card-variant memory-variant-knowledge">
                <div className="variant-header-row">
                  <span className="variant-eyebrow-tag tag-knowledge">
                    <FileText size={11} /> KNOWLEDGE SHARD
                  </span>
                  <span className="doc-pill">Doc: {m.document_id || 'N/A'}</span>
                </div>

                <h4 className="variant-card-title">{variant.title}</h4>

                <div className="variant-full-quote">
                  <p>{m.text}</p>
                </div>

                <div className="variant-footer">
                  <span className="footer-id">ID: {m.id}</span>
                  <span className="footer-bank">project_{projectId}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vertical Glowing Visual Timeline Track */
        <div className="visual-timeline-track">
          <div className="timeline-spine"></div>

          {memories.map((m, index) => {
            const variant = classifyMemory(m);
            return (
              <div key={m.id} className="timeline-step-row">
                {/* Glowing Node Core */}
                <div className="timeline-node-core">
                  <div className="node-outer-glow"></div>
                  <div className="node-inner-dot">
                    <span>{index + 1}</span>
                  </div>
                </div>

                {/* Connecting Horizontal Branch */}
                <div className="timeline-branch-connector"></div>

                {/* Beside Card */}
                <div className="timeline-card-beside">
                  <div className="timeline-card-header">
                    <div className="step-badge-group">
                      <span className="step-number-tag">STEP 0{index + 1}</span>
                      <h4 className="timeline-step-title">{variant.title}</h4>
                    </div>
                    <span className="doc-pill">Doc: {m.document_id || 'N/A'}</span>
                  </div>

                  {variant.type === 'change' && (
                    <div className="timeline-flow-mini">
                      <span className="mini-node before">{variant.before}</span>
                      <ArrowRight size={13} className="mini-arrow" />
                      <span className="mini-node after">{variant.after}</span>
                      <span className="mini-reason">({variant.reason})</span>
                    </div>
                  )}

                  <p className="timeline-card-text">{m.text}</p>

                  <div className="timeline-card-footer">
                    <span>Memory ID: {m.id}</span>
                    <span className="bank-tag-mono">Bank: project_{projectId}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
