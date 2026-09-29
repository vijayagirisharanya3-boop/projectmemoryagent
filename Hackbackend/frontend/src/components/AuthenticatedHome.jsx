import React, { useState } from 'react';
import { 
  Sparkles, 
  FolderGit2, 
  Plus, 
  ArrowRight, 
  Database, 
  ShieldCheck, 
  Clock, 
  Hash, 
  Layers, 
  Activity,
  Cpu,
  Search,
  AlertCircle
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

export default function AuthenticatedHome({ 
  user, 
  projects, 
  loading, 
  error, 
  onSelectProject, 
  onProjectCreated,
  onViewAllProjects 
}) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

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
      if (onProjectCreated) onProjectCreated(newProj);
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="authenticated-home">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">
            <Sparkles size={14} />
            <span>Workspace Active</span>
          </div>
          <h1 className="welcome-title">
            Welcome back, <span className="welcome-name">{user?.name || 'Architect'}</span>
          </h1>
          <p className="welcome-subtitle">
            Your project long-term memory banks are active. Every decision, rationale, and evolution step is preserved and ready for grounded AI reasoning.
          </p>

          <div className="welcome-actions">
            <button className="btn btn-hero-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create New Project
            </button>
            <button className="btn btn-hero-secondary" onClick={onViewAllProjects}>
              <Layers size={16} /> View All Projects ({projects.length})
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card metric-lavender">
          <div className="metric-icon-box">
            <FolderGit2 size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{projects.length}</span>
            <span className="metric-label">Active Projects</span>
          </div>
        </div>

        <div className="metric-card metric-coral">
          <div className="metric-icon-box">
            <Database size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">{projects.length}</span>
            <span className="metric-label">Isolated Memory Banks</span>
          </div>
        </div>

        <div className="metric-card metric-mint">
          <div className="metric-icon-box">
            <Cpu size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">Gemini 2.5</span>
            <span className="metric-label">Grounded AI Engine</span>
          </div>
        </div>

        <div className="metric-card metric-peach">
          <div className="metric-icon-box">
            <ShieldCheck size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">Strict</span>
            <span className="metric-label">Memory Privacy & Isolation</span>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="home-projects-section">
        <div className="section-title-row">
          <div>
            <h2 className="home-section-heading">Your Project Memory Banks</h2>
            <p className="home-section-sub">
              Select a project to explore its architectural decisions, memory timeline, and ask grounded questions.
            </p>
          </div>

          <div className="search-and-action">
            <div className="search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="spinner large"></div>
            <p>Loading projects from MySQL...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FolderGit2 className="empty-icon" size={42} />
            <h3>No projects found</h3>
            <p>
              {filterQuery
                ? `No projects matched "${filterQuery}".`
                : 'Create your first project to start tracking decisions and rationale.'}
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create First Project
            </button>
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

            {filteredProjects.map((p, idx) => {
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
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Create New Project</h2>
            <p className="modal-subtitle">
              Initializes an isolated project record in MySQL and a dedicated Hindsight memory bank.
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
                  placeholder="Summary of project purpose, architectural scope, and technical context..."
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
