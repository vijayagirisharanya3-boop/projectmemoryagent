import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  ArrowLeft, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';
import { login, signup } from '../api';

export default function AuthPage({ initialMode = 'signin', onAuthSuccess, onBackToLanding }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');

  // Keep mode in sync if parent initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setGoogleNotice('');
  }, [initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setGoogleNotice('');

    // Capture values from state or direct form elements for password manager/autofill robustness
    const form = e.currentTarget || e.target;
    const submittedEmail = (email || form.elements?.email?.value || '').trim();
    const submittedPassword = password || form.elements?.password?.value || '';

    if (!submittedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!submittedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!submittedPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      const submittedName = (name || form.elements?.name?.value || '').trim();
      if (!submittedName) {
        setErrorMsg('Please enter your full name or username.');
        return;
      }
      if (submittedPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      const submittedConfirm = confirmPassword || form.elements?.confirmPassword?.value || '';
      if (submittedPassword !== submittedConfirm) {
        setErrorMsg('Passwords do not match. Please verify and re-enter.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const submittedName = (name || form.elements?.name?.value || '').trim();
        const res = await signup({
          name: submittedName,
          email: submittedEmail.toLowerCase(),
          password: submittedPassword,
        });
        if (onAuthSuccess) onAuthSuccess(res.user);
      } else {
        const res = await login({
          email: submittedEmail.toLowerCase(),
          password: submittedPassword,
        });
        if (onAuthSuccess) onAuthSuccess(res.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setGoogleNotice(
        'Google sign-in requires OAuth configuration. Please set VITE_GOOGLE_CLIENT_ID in your environment (frontend/.env) to enable Google OAuth.'
      );
      return;
    }

    // Real OAuth redirect flow when client ID is provided
    const redirectUri = window.location.origin;
    const scope = 'openid email profile';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="auth-page-container">
      {/* Colorful Gradient Blobs */}
      <div className="bg-glow bg-glow-lavender" style={{ top: '-15%', left: '5%' }}></div>
      <div className="bg-glow bg-glow-peach" style={{ bottom: '-10%', right: '10%' }}></div>
      <div className="bg-glow bg-glow-mint" style={{ top: '40%', left: '45%' }}></div>

      {/* Back to Home Button */}
      <button className="auth-back-btn" onClick={onBackToLanding}>
        <ArrowLeft size={16} /> Back to Homepage
      </button>

      <div className="auth-card-wrapper">
        {/* Left Side: Brand & Visual */}
        <div className="auth-brand-side">
          <div className="auth-brand-header">
            <div className="brand-icon">
              <Brain size={26} />
            </div>
            <div>
              <span className="brand-title">Project Memory Agent</span>
              <p className="brand-subtitle">Grounded Evolution & Long-Term Memory</p>
            </div>
          </div>

          <div className="auth-illustration">
            <div className="mini-memory-orb">
              <Sparkles size={32} className="pulse-icon" />
            </div>
            <h3 className="auth-hero-heading">
              Your projects have a story. Never lose the reason why.
            </h3>
            <p className="auth-hero-sub">
              Access your project's isolated memory banks, recall architectural rationale, and reason over grounded technical history.
            </p>

            <div className="auth-feature-pills">
              <div className="auth-pill"><ShieldCheck size={14} /> Strict Project Isolation</div>
              <div className="auth-pill"><CheckCircle2 size={14} /> Verifiable Grounded Evidence</div>
              <div className="auth-pill"><Brain size={14} /> Gemini 2.5 Flash Reasoning</div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="auth-form-side">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setErrorMsg(''); setGoogleNotice(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setErrorMsg(''); setGoogleNotice(''); }}
            >
              Create Account
            </button>
          </div>

          <div className="auth-header-text">
            <h2>{mode === 'signin' ? 'Welcome back' : 'Get started free'}</h2>
            <p>
              {mode === 'signin'
                ? 'Sign in to access your projects and long-term memory.'
                : 'Create your account to start preserving project evolution.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="alert alert-error auth-alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Notice */}
          {googleNotice && (
            <div className="alert alert-info auth-alert">
              <Info size={16} />
              <span>{googleNotice}</span>
            </div>
          )}

          {/* Google OAuth Button First */}
          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogleClick}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>OR CONTINUE WITH EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">Full Name or Username *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    className="input auth-input"
                    placeholder="e.g. Alice Architect"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  className="input auth-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password *</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input auth-input"
                  placeholder={mode === 'signin' ? 'Enter your password' : 'At least 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="btn-icon-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">Confirm Password *</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="input auth-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner small"></span> {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-toggle">
            {mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setMode('signup'); setErrorMsg(''); setGoogleNotice(''); }}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => { setMode('signin'); setErrorMsg(''); setGoogleNotice(''); }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
