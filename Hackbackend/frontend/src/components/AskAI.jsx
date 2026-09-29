import React, { useState } from 'react';
import { HelpCircle, Sparkles, Send, ShieldCheck, FileText, Calendar, Tag, AlertCircle, Info, Search, CheckCircle2 } from 'lucide-react';
import { askQuestion } from '../api';

const SAMPLE_QUESTIONS = [
  'What happened in Meeting 1?',
  'What was decided in Meeting 2?',
  'What did Meeting 1 say about PostgreSQL?',
  'Why did we switch from MongoDB to PostgreSQL?',
  'Who approved the AWS migration?',
  'What problem caused us to reconsider MongoDB?',
  'What issues are still unresolved regarding the database?',
];

export default function AskAI({ projectId }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAsk = async (qToAsk) => {
    const q = (qToAsk || question).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await askQuestion(projectId, q);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate answer from project memory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAsk(question);
  };

  const handleSelectSample = (sample) => {
    setQuestion(sample);
    handleAsk(sample);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
      {/* AI Intelligence Centerpiece Panel */}
      <div className="ask-ai-centerpiece">
        <div className="centerpiece-halo"></div>

        {/* Centerpiece Header with Glowing Dual-Ring AI Core */}
        <div className="centerpiece-header">
          <div className="centerpiece-ai-orb">
            <div className="ai-orb-ring-outer"></div>
            <div className="ai-orb-ring-inner"></div>
            <div className="ai-orb-core">
              <Sparkles size={26} className="ai-orb-sparkle" />
            </div>
          </div>

          <div className="centerpiece-title-block">
            <span className="centerpiece-eyebrow">✦ PROJECT MEMORY INTELLIGENCE</span>
            <h2 className="centerpiece-title">Ask About Project Evolution</h2>
            <p className="centerpiece-sub">
              Gemini reasons exclusively over memories recalled from Hindsight bank <code className="bank-code">project_{projectId}</code> with strict temporal grounding.
            </p>
          </div>
        </div>

        {/* Visual Query Box */}
        <form onSubmit={handleSubmit} className="centerpiece-query-form">
          <div className="query-input-wrapper">
            <Search size={18} className="query-icon" />
            <input
              type="text"
              className="centerpiece-input"
              placeholder="Ask a historical question (e.g. Why did we switch databases? What problem occurred?)..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary centerpiece-submit-btn"
            disabled={loading || !question.trim()}
          >
            {loading ? <span className="spinner small"></span> : <><Send size={16} /> Ask AI</>}
          </button>
        </form>

        {/* Memory Shard Chips */}
        <div className="memory-chips-section">
          <span className="memory-chips-label">RECALL MEMORY SHARDS:</span>
          <div className="memory-chips-wrapper">
            {SAMPLE_QUESTIONS.map((sq, i) => (
              <button
                key={i}
                type="button"
                className="memory-shard-chip"
                onClick={() => handleSelectSample(sq)}
                disabled={loading}
              >
                <span className="chip-dot">◉</span>
                <span className="chip-text">{sq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Loading Skeleton with Memory Core Loader */}
      {loading && (
        <div className="card loading-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="memory-core-loader">
            <div className="loader-orbit"></div>
            <div className="loader-core">
              <Sparkles size={20} className="pulse-icon" />
            </div>
          </div>
          <h3 style={{ marginBottom: '6px' }}>Recalling Memories & Reasoning...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Querying Hindsight long-term memory and synthesizing grounded evidence with Gemini AI.
          </p>
        </div>
      )}

      {/* Answer & Evidence Section */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Answer Card */}
          <div className="grounded-answer-card">
            <div className="answer-card-header">
              <div className="answer-brand">
                <ShieldCheck size={20} className="shield-icon" />
                <span className="answer-heading">Grounded Technical Answer</span>
              </div>
              <span className={`confidence-meter confidence-${result.confidence}`}>
                <span className="confidence-dot">●</span> Confidence: {result.confidence?.toUpperCase()}
              </span>
            </div>

            <p className="answer-body-text">
              {result.answer}
            </p>

            <div className="answer-footer-query">
              <span className="query-label">Question:</span> &ldquo;{result.question}&rdquo;
            </div>
          </div>

          {/* Evidence Section */}
          <div className="evidence-container">
            <div className="evidence-header-row">
              <h3 className="evidence-heading">
                <FileText size={18} className="evidence-icon" /> Verified Hindsight Citations
              </h3>
              <span className="evidence-count-pill">
                {result.evidence.length} citation{result.evidence.length === 1 ? '' : 's'} verified
              </span>
            </div>

            {result.evidence.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px' }}>
                <Info className="empty-icon" style={{ width: '32px', height: '32px' }} />
                <p>No direct evidence found in Hindsight for this query. The model refused to hallucinate.</p>
              </div>
            ) : (
              <div className="evidence-cards-grid">
                {result.evidence.map((ev, idx) => (
                  <div key={idx} className="grounded-evidence-card">
                    {/* Citation Header Slip */}
                    <div className="evidence-slip-top">
                      <span className="evidence-serial">
                        EVIDENCE #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="evidence-tags-row">
                        {ev.source && (
                          <span className="evidence-tag source-tag">
                            <Tag size={10} /> {ev.source}
                          </span>
                        )}
                        {ev.document_id && (
                          <span className="evidence-tag doc-tag">
                            Doc: {ev.document_id}
                          </span>
                        )}
                        {ev.memory_type && (
                          <span className="evidence-tag type-tag">
                            {ev.memory_type}
                          </span>
                        )}
                        {ev.date && (
                          <span className="evidence-tag date-tag">
                            <Calendar size={10} /> {ev.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Verifiable Memory Excerpt */}
                    <div className="evidence-quote-box">
                      <pre className="evidence-quote-text">
                        &ldquo;{ev.memory}&rdquo;
                      </pre>
                    </div>

                    {/* Relevance & Grounding Stamp */}
                    <div className="evidence-slip-footer">
                      {ev.relevance ? (
                        <span className="relevance-text">
                          <strong>Relevance:</strong> {ev.relevance}
                        </span>
                      ) : (
                        <span className="grounded-stamp">● Grounded in Bank project_{projectId}</span>
                      )}
                      <span className="verified-check">
                        <CheckCircle2 size={13} /> Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
