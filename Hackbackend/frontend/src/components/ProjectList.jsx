import React, { useState } from 'react';
import { 
  Plus, 
  FolderGit2, 
  ArrowRight, 
  Clock, 
  Hash, 
  AlertCircle, 
  Database, 
  Search, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { createProject } from '../api';

function ProjectVisualCore({ variant = 0 }) {
  const v = variant % 3;
  if (v === 0) {
    return (
      <div className="project-visual-core core-orbital">
        <svg viewBox="0 0 64 64" className="core-svg">
          <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" className="core-ring-spin" />
          <circle cx="32" cy="32" r="15" stroke="currentColor" strokeWidth="1.5" className="core-ring-inner" />
          <circle cx="32" cy="32" r="5" fill="currentColor" className="core-center-dot" />
          <circle cx="12" cy="24" r="3" fill="#ec4899" className="core-satellite-1" />
          <circle cx="50" cy="40" r="3" fill="#06b6d4" className="core-satellite-2" />
        </svg>
      </div>
    );
  }
  if (v === 1) {
    return (
      <div className="project-visual-core core-constellation">
        <svg viewBox="0 0 64 64" className="core-svg">
          <line x1="16" y1="18" x2="48" y2="22" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="48" y1="22" x2="36" y2="48" stroke="currentColor" strokeWidth="1.2" />
          <line x1="36" y1="48" x2="16" y2="18" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="16" cy="18" r="4" fill="#06b6d4" />
          <circle cx="48" cy="22" r="5" fill="#8b5cf6" />
          <circle cx="36" cy="48" r="4" fill="#10b981" />
          <circle cx="32" cy="29" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }
  return (
    <div className="project-visual-core core-geometric">
      <svg viewBox="0 0 64 64" className="core-svg">
        <rect x="16" y="16" width="32" height="32" rx="7" stroke="currentColor" strokeWidth="1.4" className="core-ring-spin" />
        <rect x="22" y="22" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="32" cy="32" r="4" fill="#f59e0b" />
        <circle cx="16" cy="32" r="2.5" fill="#ec4899" />
        <circle cx="48" cy="32" r="2.5" fill="#06b6d4" />
      </svg>
    </div>
  );
}

export default function ProjectList({ projects, loading, error, onSelectProject, onProjectCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const newProj = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      setShowModal(false);
      onProjectCreated(newProj);
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="project-list-view">
      {/* Header Banner */}
      <div className="project-list-header">
        <div>
          <div className="inline-badge">
            <Layers size={13} />
            <span>Workspace Memory Directory</span>
          </div>
          <h1 className="page-heading">Your Projects</h1>
          <p className="page-subheading">
            Select a project to explore its architectural evolution, long-term memory banks, and grounded reasoning.
          </p>
        </div>

        <button className="btn btn-hero-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search projects by name, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="results-count">
          Showing {filtered.length} of {projects.length} project{projects.length === 1 ? '' : 's'}
        </span>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="spinner large"></div>
          <p>Loading project records from backend...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderGit2 className="empty-icon" size={44} />
          <h3>No projects created yet</h3>
          <p>
            Get started by creating your first project to track decisions, problems, and evolution.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create First Project
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search className="empty-icon" size={36} />
          <h3>No matching projects found</h3>
          <p>Try searching for a different keyword or project ID.</p>
        </div>
      ) : (
        <div className="project-cards-grid">
          {/* Visually Strong Create Project Card */}
          <div className="create-project-card" onClick={() => setShowModal(true)}>
            <div className="create-project-glow"></div>
            <div className="create-icon-ring">
              <Plus size={32} className="create-plus-icon" />
            </div>
            <h3 className="create-card-title">Create New Project</h3>
            <p className="create-card-sub">Start an isolated memory timeline with dedicated Hindsight storage</p>
            <span className="create-card-action">
              Initialize Bank <ArrowRight size={14} className="action-arrow" />
            </span>
          </div>

          {filtered.map((p, idx) => {
            const themes = ['theme-violet-pink', 'theme-cyan-teal', 'theme-orange-coral', 'theme-mint-emerald'];
            const themeClass = themes[idx % themes.length];

            return (
              <div
                key={p.id}
                className={`project-identity-card ${themeClass}`}
                onClick={() => onSelectProject(p)}
              >
                {/* Visual Header Strip */}
                <div className="card-top-eyebrow">
                  <span className="eyebrow-tag">
                    <Sparkles size={11} /> PROJECT MEMORY
                  </span>
                  <span className="project-id-chip">
                    ID: {p.id}
                  </span>
                </div>

                {/* Identity Area with Abstract Visual Core & Title */}
                <div className="project-identity-row">
                  <ProjectVisualCore variant={idx} />
                  <div className="project-identity-text">
                    <h3 className="project-title">{p.name}</h3>
                    <span className="project-bank-indicator">
                      <Database size={11} /> project_{p.id}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <div className="project-card-divider"></div>

                {/* Description */}
                <p className="project-desc">
                  {p.description || 'No description provided for this project.'}
                </p>

                {/* Memory Dimension Indicators */}
                <div className="project-dimensions">
                  <span className="dimension-pill">◉ Isolated Memory</span>
                  <span className="dimension-pill">◉ Evolution Tracked</span>
                </div>

                {/* Footer Action Area */}
                <div className="project-card-footer">
                  <span className="footer-date">
                    <Clock size={12} /> {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}
                  </span>
                  <button className="card-open-btn">
                    <span>Open Project Memory</span>
                    <ArrowRight size={14} className="btn-arrow" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Create New Project</h2>
            <p className="modal-subtitle">
              Creates an isolated project namespace in MySQL with a dedicated Hindsight memory bank.
            </p>

            {formError && (
              <div className="alert alert-error">
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Autonomous Navigation Platform"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="textarea"
                  style={{ minHeight: '90px' }}
                  placeholder="Brief summary of the project purpose and architectural scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner small"></span> Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
