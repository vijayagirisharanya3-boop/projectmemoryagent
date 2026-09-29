import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  FileText, 
  AlertTriangle, 
  Zap, 
  History, 
  HelpCircle, 
  CheckSquare 
} from 'lucide-react';
import { addInformation, processInformation } from '../api';

const SAMPLE_NOTE = `We decided to switch from MongoDB to PostgreSQL because MongoDB lacked ACID transactions for billing. MongoDB caused data inconsistency in the payment module. We previously tried using two-phase commits with MongoDB, but it failed due to complexity. Alice will lead the migration by Friday. Bob will review the schema. We still don't know how to handle historical analytics data.`;

export default function AddInformation({ projectId, onMemoryAdded }) {
  const [title, setTitle] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [infoType, setInfoType] = useState('decision');
  const [content, setContent] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [processedResult, setProcessedResult] = useState(null);

  const handleAddInfo = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Content is required');
      return;
    }
    setLoadingAdd(true);
    setErrorMsg('');
    setSuccessMsg('');
    setProcessedResult(null);

    try {
      const res = await addInformation(projectId, {
        title: title.trim() || 'Project Architecture Note',
        document_id: documentId.trim() || undefined,
        info_type: infoType,
        content: content.trim(),
      });
      setSuccessMsg(`Information recorded in MySQL metadata (Doc: ${res.document_id}) and retained in Hindsight bank project_${projectId}!`);
      if (onMemoryAdded) onMemoryAdded();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add project information');
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleProcessWithAI = async () => {
    if (!content.trim()) {
      setErrorMsg('Please enter project content or meeting notes to process');
      return;
    }
    setLoadingProcess(true);
    setErrorMsg('');
    setSuccessMsg('');
    setProcessedResult(null);

    try {
      const res = await processInformation(projectId, content.trim(), {
        title: title.trim() || undefined,
        document_id: documentId.trim() || undefined,
        info_type: infoType,
      });
      setProcessedResult(res.extracted_memories);
      setSuccessMsg(`Successfully extracted structured evolution facts with Gemini and retained memory in Hindsight bank project_${projectId}!`);
      if (onMemoryAdded) onMemoryAdded();
    } catch (err) {
      setErrorMsg(err.message || 'AI memory extraction failed');
    } finally {
      setLoadingProcess(false);
    }
  };

  const handleFillMeeting1 = () => {
    setTitle('Database Discussion - Meeting 1');
    setDocumentId('meeting_001');
    setInfoType('meeting_note');
    setContent('The team discussed MongoDB for flexible schema and rapid prototyping. Alice noted MongoDB would allow quick iteration.');
  };

  const handleFillMeeting2 = () => {
    setTitle('Database Decision - Meeting 2');
    setDocumentId('meeting_002');
    setInfoType('decision');
    setContent('The team switched to PostgreSQL because MongoDB lacked ACID transactions for billing. Bob will lead migration by Friday.');
  };

  const handleFillSample = () => {
    setTitle('Database Architecture Decision & Migration');
    setDocumentId('');
    setInfoType('decision');
    setContent(SAMPLE_NOTE);
  };

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Add Project Evolution Notes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Add architectural decisions, meeting transcripts, problem post-mortems, or technical changes with preserved meeting identity.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleFillMeeting1}>
              <FileText size={13} /> Meeting 1 (MongoDB)
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleFillMeeting2}>
              <FileText size={13} /> Meeting 2 (PostgreSQL)
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleFillSample}>
              <FileText size={13} /> Full Note
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleAddInfo}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Note / Meeting Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Database Discussion - Meeting 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document / Meeting ID (Optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. meeting_001, doc_002"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Information Type</label>
              <select className="select" value={infoType} onChange={(e) => setInfoType(e.target.value)}>
                <option value="decision">Decision</option>
                <option value="meeting_note">Meeting Note</option>
                <option value="problem">Problem / Incident</option>
                <option value="change">Architecture Change</option>
                <option value="unresolved_issue">Unresolved Issue</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Content / Discussion Text *</label>
            <textarea
              className="textarea"
              style={{ minHeight: '130px' }}
              placeholder="Paste meeting notes, decisions made, obstacles encountered, previous approaches, or unresolved questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="form-action-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '16px', alignItems: 'center' }}>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loadingAdd || loadingProcess || !content.trim()}
            >
              {loadingAdd ? <span className="spinner small"></span> : <PlusCircle size={16} />} Save Information
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProcessWithAI}
              disabled={loadingAdd || loadingProcess || !content.trim()}
            >
              {loadingProcess ? (
                <>
                  <span className="spinner"></span> Extracting Evolution with Gemini...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Process with AI & Retain Memory
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* AI Extraction Results Display */}
      {processedResult && (
        <div className="extraction-breakdown-panel">
          <div className="extraction-header-row">
            <div className="extraction-header-orb">
              <Cpu size={22} />
            </div>
            <div>
              <h3 className="extraction-heading">AI-Extracted Structured Memory Breakdown</h3>
              <p className="extraction-subheading">
                Gemini synthesized {Object.values(processedResult).flat().length} evolution memory facts and preserved them in Hindsight bank project_{projectId}
              </p>
            </div>
          </div>

          <div className="extraction-breakdown-grid">
            {processedResult.decisions?.length > 0 && (
              <div className="extraction-card extraction-card-decision">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <CheckCircle2 size={12} /> Decisions
                  </span>
                  <span className="extraction-card-count">{processedResult.decisions.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.decisions.map((d, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">✦</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.reasons?.length > 0 && (
              <div className="extraction-card extraction-card-reasons">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <Sparkles size={12} /> Architectural Reasons
                  </span>
                  <span className="extraction-card-count">{processedResult.reasons.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.reasons.map((r, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">◉</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.problems?.length > 0 && (
              <div className="extraction-card extraction-card-problems">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <AlertTriangle size={12} /> Problems Encountered
                  </span>
                  <span className="extraction-card-count">{processedResult.problems.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.problems.map((p, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">▲</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.changes?.length > 0 && (
              <div className="extraction-card extraction-card-changes">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <Zap size={12} /> Changes & Migrations
                  </span>
                  <span className="extraction-card-count">{processedResult.changes.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.changes.map((c, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">➔</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.previous_approaches?.length > 0 && (
              <div className="extraction-card extraction-card-previous">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <History size={12} /> Previous Approaches
                  </span>
                  <span className="extraction-card-count">{processedResult.previous_approaches.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.previous_approaches.map((pa, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">↺</span>
                      <span>{pa}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.failed_approaches?.length > 0 && (
              <div className="extraction-card extraction-card-failed">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <AlertCircle size={12} /> Failed Approaches
                  </span>
                  <span className="extraction-card-count">{processedResult.failed_approaches.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.failed_approaches.map((fa, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">✕</span>
                      <span>{fa}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.action_items?.length > 0 && (
              <div className="extraction-card extraction-card-action">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <CheckSquare size={12} /> Action Items
                  </span>
                  <span className="extraction-card-count">{processedResult.action_items.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.action_items.map((ai, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">✓</span>
                      <span>{ai}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {processedResult.unresolved_questions?.length > 0 && (
              <div className="extraction-card extraction-card-unresolved">
                <div className="extraction-card-top">
                  <span className="extraction-card-tag">
                    <HelpCircle size={12} /> Unresolved Questions
                  </span>
                  <span className="extraction-card-count">{processedResult.unresolved_questions.length} recorded</span>
                </div>
                <ul className="extraction-list">
                  {processedResult.unresolved_questions.map((uq, i) => (
                    <li key={i} className="extraction-list-item">
                      <span className="extraction-list-bullet">?</span>
                      <span>{uq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
