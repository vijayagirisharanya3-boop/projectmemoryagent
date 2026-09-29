import React, { useEffect, useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  ArrowLeft, 
  LogOut, 
  User, 
  Layers, 
  Home, 
  FolderGit2 
} from 'lucide-react';
import { checkHealth } from '../api';

export default function Navbar({ 
  user, 
  activeProject, 
  currentView, 
  onNavigate, 
  onBackToProjects, 
  onSignIn, 
  onSignUp, 
  onSignOut 
}) {
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;
    async function fetchHealth() {
      try {
        const data = await checkHealth();
        if (mounted) {
          setBackendStatus(data.status === 'healthy' ? 'online' : 'degraded');
        }
      } catch (err) {
        if (mounted) setBackendStatus('offline');
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleBrandClick = () => {
    if (user) {
      if (onNavigate) onNavigate('home');
    } else {
      if (onNavigate) onNavigate('landing');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-content">
        {/* Brand / Logo */}
        <div className="brand" onClick={handleBrandClick}>
          <div className="brand-icon">
            <Brain size={22} className="brand-brain" />
            <span className="brand-dot-orbit"></span>
          </div>
          <div className="brand-text-container">
            <span className="brand-title">Project Memory Agent</span>
            <span className="brand-tagline">Grounded Evolution & Long-Term Memory</span>
          </div>
        </div>

        {/* Public vs Authenticated Navigation Links */}
        {!user ? (
          /* Public Navbar Links */
          <div className="nav-links-public">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#why-memory" className="nav-link">Why Memory</a>

            <div className="nav-auth-buttons">
              <button className="btn btn-outline" onClick={onSignIn}>
                Sign In
              </button>
              <button className="btn btn-primary" onClick={onSignUp}>
                <Sparkles size={14} /> Get Started
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated Navbar Links */
          <div className="nav-authenticated">
            <div className="nav-links-auth">
              <button 
                className={`nav-auth-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => onNavigate('home')}
              >
                <Home size={15} /> Home
              </button>
              <button 
                className={`nav-auth-link ${currentView === 'projects' ? 'active' : ''}`}
                onClick={() => onNavigate('projects')}
              >
                <FolderGit2 size={15} /> Projects
              </button>
            </div>

            {activeProject && (
              <button className="btn btn-secondary btn-sm back-to-all-btn" onClick={onBackToProjects}>
                <ArrowLeft size={14} /> All Projects
              </button>
            )}

            {/* Health Status Pill */}
            <div className="status-pill" title="FastAPI Backend Health Status">
              <span className={`status-dot ${backendStatus === 'online' ? 'online' : 'offline'}`}></span>
              <span className="status-text">
                {backendStatus === 'online' && 'FastAPI Online'}
                {backendStatus === 'checking' && 'Connecting...'}
                {backendStatus === 'offline' && 'Backend Offline'}
              </span>
            </div>

            {/* User Profile Pill & Sign Out */}
            <div className="user-profile-menu">
              <div className="user-avatar-badge" title={user.email}>
                <User size={14} />
                <span className="user-name-label">{user.name?.split(' ')[0] || 'User'}</span>
              </div>

              <button className="btn btn-ghost btn-sm btn-icon btn-signout" onClick={onSignOut} title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
