import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AuthenticatedHome from './components/AuthenticatedHome';
import ProjectList from './components/ProjectList';
import ProjectDashboard from './components/ProjectDashboard';
import { getProjects, getStoredUser, getCurrentUser, logout } from './api';

export default function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [currentView, setCurrentView] = useState(() => {
    // If user already logged in, start at authenticated home; otherwise start at landing page
    return getStoredUser() ? 'home' : 'landing';
  });
  const [authMode, setAuthMode] = useState('signin');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeProject, setActiveProject] = useState(null);

  // Verify and sync current user on load
  useEffect(() => {
    async function verifyUser() {
      const verified = await getCurrentUser();
      if (verified) {
        setUser(verified);
      } else {
        setUser(null);
        if (currentView !== 'landing' && currentView !== 'auth') {
          setCurrentView('landing');
        }
      }
    }
    verifyUser();
  }, []);

  // Fetch projects when user is authenticated
  const fetchAllProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || 'Could not connect to FastAPI backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllProjects();
    }
  }, [user]);

  const handleSignInClick = () => {
    setAuthMode('signin');
    setCurrentView('auth');
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setCurrentView('auth');
  };

  const handleAuthSuccess = (authUser) => {
    const active = authUser || getStoredUser();
    setUser(active);
    setCurrentView('home');
    fetchAllProjects();
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setActiveProject(null);
    setCurrentView('landing');
  };

  const handleSelectProject = (project) => {
    setActiveProject(project);
    setCurrentView('dashboard');
  };

  const handleBackToProjects = () => {
    setActiveProject(null);
    setCurrentView('projects');
    fetchAllProjects();
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject);
    setCurrentView('dashboard');
  };

  const isWorkspace = ['home', 'projects', 'dashboard'].includes(currentView);
  const themeClass = isWorkspace ? 'workspace-theme' : (currentView === 'auth' ? 'auth-theme' : 'public-theme');

  return (
    <div className={`app-wrapper ${themeClass}`}>
      {/* Decorative Atmospheric Layers for Authenticated Workspace */}
      {isWorkspace && (
        <div className="workspace-bg-decor" aria-hidden="true">
          <div className="ws-orb ws-orb-violet"></div>
          <div className="ws-orb ws-orb-pink"></div>
          <div className="ws-orb ws-orb-cyan"></div>
          <div className="ws-cyber-grid"></div>
          <svg className="ws-constellation-svg" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
            <path d="M 120 220 L 280 160 L 420 290 L 640 210 L 890 320 L 1150 190 L 1320 280" stroke="rgba(139, 92, 246, 0.16)" strokeWidth="1" strokeDasharray="6 6" />
            <path d="M 280 160 L 350 480 L 620 540 L 890 320" stroke="rgba(236, 72, 153, 0.14)" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M 420 290 L 620 540 L 980 620 L 1150 190" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="120" cy="220" r="3" fill="#8b5cf6" opacity="0.6" />
            <circle cx="280" cy="160" r="4" fill="#a855f7" opacity="0.7" />
            <circle cx="420" cy="290" r="3.5" fill="#ec4899" opacity="0.6" />
            <circle cx="640" cy="210" r="4" fill="#06b6d4" opacity="0.75" />
            <circle cx="890" cy="320" r="4" fill="#8b5cf6" opacity="0.8" />
            <circle cx="1150" cy="190" r="3.5" fill="#ec4899" opacity="0.6" />
            <circle cx="1320" cy="280" r="3" fill="#06b6d4" opacity="0.5" />
            <circle cx="350" cy="480" r="3" fill="#6366f1" opacity="0.5" />
            <circle cx="620" cy="540" r="4" fill="#10b981" opacity="0.6" />
            <circle cx="980" cy="620" r="3.5" fill="#f59e0b" opacity="0.5" />
          </svg>
        </div>
      )}
      <Navbar
        user={user}
        activeProject={activeProject}
        currentView={currentView}
        themeClass={themeClass}
        onNavigate={(view) => {
          if (view === 'home' || view === 'projects') {
            setActiveProject(null);
          }
          setCurrentView(view);
        }}
        onBackToProjects={handleBackToProjects}
        onSignIn={handleSignInClick}
        onSignUp={handleSignUpClick}
        onSignOut={handleSignOut}
      />

      <main className="app-container">
        {/* 1. Public Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setCurrentView('home');
              } else {
                handleSignUpClick();
              }
            }}
            onSignIn={handleSignInClick}
          />
        )}

        {/* 2. Authentication View (Sign In / Sign Up) */}
        {currentView === 'auth' && (
          <AuthPage
            initialMode={authMode}
            onAuthSuccess={handleAuthSuccess}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}

        {/* 3. Authenticated Home View */}
        {currentView === 'home' && (
          user ? (
            <AuthenticatedHome
              user={user}
              projects={projects}
              loading={loading}
              error={error}
              onSelectProject={handleSelectProject}
              onProjectCreated={handleProjectCreated}
              onViewAllProjects={() => setCurrentView('projects')}
            />
          ) : (
            <div className="empty-state" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner large"></div>
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading authenticated workspace...</p>
            </div>
          )
        )}

        {/* 4. Projects Directory View */}
        {currentView === 'projects' && (
          user ? (
            <ProjectList
              projects={projects}
              loading={loading}
              error={error}
              onSelectProject={handleSelectProject}
              onProjectCreated={handleProjectCreated}
            />
          ) : (
            <div className="empty-state" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner large"></div>
              <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading projects...</p>
            </div>
          )
        )}

        {/* 5. Project Dashboard View (Real existing functionality preserved) */}
        {currentView === 'dashboard' && user && activeProject && (
          <ProjectDashboard
            project={activeProject}
            onBackToProjects={handleBackToProjects}
          />
        )}
      </main>
    </div>
  );
}
