import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Volume2,
  Target,
  Brain,
  TrendingUp,
  Sliders,
  ChevronDown,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  ScrollReveal,
  ScrollParallax,
  StaggerContainer,
  RevealItem,
} from '../components/common/ScrollReveal';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [heroScrollY, setHeroScrollY] = useState(0);
  const [deviceTier, setDeviceTier] = useState('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);

  // Scroll listener for sticky navbar glass effect & strengthened hero scroll reveal
  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Track responsive tiers: desktop (>=1024), tablet (768-1023), mobile (<768)
    const updateDeviceTier = () => {
      const w = window.innerWidth;
      if (w < 768) setDeviceTier('mobile');
      else if (w < 1024) setDeviceTier('tablet');
      else setDeviceTier('desktop');
    };
    updateDeviceTier();
    window.addEventListener('resize', updateDeviceTier);

    let ticking = false;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Track scroll progress within hero and preview range (0 to 650px)
          setHeroScrollY(Math.min(650, scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDeviceTier);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? -1 : index));
  };

  const faqList = [
    {
      q: 'What is InterviewAce AI?',
      a: 'InterviewAce AI is an interactive mock interview platform that simulates realistic technical and HR hiring loops. Powered by AI, it asks role-specific follow-ups, evaluates your verbal and written answers in real-time, and provides actionable rubric-based feedback.',
    },
    {
      q: 'Can I upload my resume?',
      a: 'Yes. You can upload your PDF resume when creating an interview. The AI extracts your key projects, technology stack, and career background to generate hyper-personalized questions tailored to your exact profile.',
    },
    {
      q: 'Can I answer interview questions using voice?',
      a: 'Absolutely. The platform features integrated real-time speech recognition so you can practice speaking your thoughts naturally just like a real interview. You can also toggle to text mode whenever you prefer typing.',
    },
    {
      q: 'What types of interviews can I practice?',
      a: 'You can practice Frontend, Backend, Full Stack, SDE / Software Engineering, Java, Python, Behavioral / HR, and System Design rounds, with adjustable difficulty levels from Junior to Senior Staff engineer.',
    },
    {
      q: 'How does AI evaluate my answers?',
      a: 'Your answers are assessed against professional engineering hiring rubrics across Technical Correctness, Communication Clarity, Depth & Edge Cases, and Problem Solving Relevance, providing both numerical scores and concrete missing concepts.',
    },
    {
      q: 'Can I review my previous interviews?',
      a: 'Yes. All completed sessions are stored in your dashboard history with full question-by-question transcripts, audio replays, rubric breakdowns, and performance analytics so you can track your growth over time.',
    },
  ];

  const progressData = [
    { label: 'Round 1', score: 68, date: 'Jun 12' },
    { label: 'Round 2', score: 72, date: 'Jun 16' },
    { label: 'Round 3', score: 75, date: 'Jun 20' },
    { label: 'Round 4', score: 74, date: 'Jun 24' },
    { label: 'Round 5', score: 82, date: 'Jun 28' },
  ];

  // =========================================================================
  // STRENGTHENED SCROLL-DRIVEN REVEAL ANIMATION CALCULATIONS
  // Highly noticeable, fully reversible, hardware-accelerated with parallax & blur
  // =========================================================================
  const s = heroScrollY;
  const distFactor = deviceTier === 'mobile' ? 0.55 : deviceTier === 'tablet' ? 0.75 : 1.0;
  const blurFactor = deviceTier === 'mobile' ? 0.4 : deviceTier === 'tablet' ? 0.75 : 1.0;

  // 1. AI BADGE (0px -> 140px)
  // Initial: opacity ~0.35, translateY: 50px, scale: 0.92, blur: 4px
  const pBadge = Math.min(1, s / 140);
  const badgeY = (1 - pBadge) * (50 * distFactor) - pBadge * (s * 0.08);
  const badgeScale = 0.92 + pBadge * 0.08;
  const badgeBlur = (1 - pBadge) * (4 * blurFactor);
  const badgeOpacity = 0.35 + pBadge * 0.65;
  const badgeStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${badgeY.toFixed(1)}px, 0) scale(${badgeScale.toFixed(3)})`,
        opacity: badgeOpacity.toFixed(2),
        filter: badgeBlur > 0.05 ? `blur(${badgeBlur.toFixed(1)}px)` : 'none',
      };

  // 2. MAIN HEADING (0px -> 200px)
  // Initial: opacity ~0.35, translateY: 100px, scale: 0.92, blur: 5px
  const pHeading = Math.min(1, s / 200);
  const headingY = (1 - pHeading) * (100 * distFactor) - pHeading * (s * 0.1);
  const headingScale = 0.92 + pHeading * 0.08;
  const headingBlur = (1 - pHeading) * (5 * blurFactor);
  const headingOpacity = 0.35 + pHeading * 0.65;
  const headingStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${headingY.toFixed(1)}px, 0) scale(${headingScale.toFixed(3)})`,
        opacity: headingOpacity.toFixed(2),
        filter: headingBlur > 0.05 ? `blur(${headingBlur.toFixed(1)}px)` : 'none',
      };

  // 3. DESCRIPTION (staggered: 30px -> 280px)
  // Initial: opacity ~0.30, translateY: 80px, blur: 3px
  const pDesc = Math.min(1, Math.max(0, (s - 30) / 250));
  const descY = (1 - pDesc) * (80 * distFactor) - pDesc * (s * 0.12);
  const descBlur = (1 - pDesc) * (3 * blurFactor);
  const descOpacity = 0.30 + pDesc * 0.70;
  const descStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${descY.toFixed(1)}px, 0)`,
        opacity: descOpacity.toFixed(2),
        filter: descBlur > 0.05 ? `blur(${descBlur.toFixed(1)}px)` : 'none',
      };

  // 4. CTA BUTTONS (staggered: 60px -> 340px)
  // Initial: opacity ~0.25, translateY: 70px, scale: 0.94, blur: 2.5px
  const pCTA = Math.min(1, Math.max(0, (s - 60) / 280));
  const ctaY = (1 - pCTA) * (70 * distFactor) - pCTA * (s * 0.14);
  const ctaScale = 0.94 + pCTA * 0.06;
  const ctaBlur = (1 - pCTA) * (2.5 * blurFactor);
  const ctaOpacity = 0.25 + pCTA * 0.75;
  const ctaStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${ctaY.toFixed(1)}px, 0) scale(${ctaScale.toFixed(3)})`,
        opacity: ctaOpacity.toFixed(2),
        filter: ctaBlur > 0.05 ? `blur(${ctaBlur.toFixed(1)}px)` : 'none',
      };

  // 5. TRUST POINTS (staggered: 100px -> 400px)
  // Initial: opacity ~0.20, translateY: 60px
  const pTrust = Math.min(1, Math.max(0, (s - 100) / 300));
  const trustY = (1 - pTrust) * (60 * distFactor) - pTrust * (s * 0.15);
  const trustOpacity = 0.20 + pTrust * 0.80;
  const trustStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${trustY.toFixed(1)}px, 0)`,
        opacity: trustOpacity.toFixed(2),
      };

  // 6. INTERVIEW PRODUCT PREVIEW (STRONGEST EFFECT: 40px -> 520px)
  // Initial: opacity ~0.15, translateY: 180px, scale: 0.88, blur: 8px
  const rawPreviewP = Math.min(1, Math.max(0, (s - 40) / 480));
  const easedPreview = 1 - Math.pow(1 - rawPreviewP, 2.5);
  const previewInitialScale = 0.88 + (1 - distFactor) * 0.05;
  const previewY = (1 - easedPreview) * (180 * distFactor) - easedPreview * (s * 0.08);
  const previewScale = previewInitialScale + easedPreview * (1 - previewInitialScale);
  const previewBlur = (1 - easedPreview) * (8 * blurFactor);
  const previewOpacity = 0.15 + easedPreview * 0.85;
  const previewStyle = reducedMotion
    ? {}
    : {
        transform: `translate3d(0, ${previewY.toFixed(1)}px, 0) scale(${previewScale.toFixed(3)})`,
        opacity: previewOpacity.toFixed(2),
        filter: previewBlur > 0.05 ? `blur(${previewBlur.toFixed(1)}px)` : 'none',
      };

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* =========================================================================
          1. NAVBAR — SCROLL GLASS EFFECT & MOBILE RESPONSIVE
          ========================================================================= */}
      <header className={`landing-nav ${isScrolled ? 'landing-nav-scrolled' : 'landing-nav-top'}`}>
        <div
          className="app-container"
          style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                backgroundColor: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              }}
            >
              ✦
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              InterviewAce AI
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
            className="desktop-nav-links"
          >
            <a href="#how-it-works" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
              How It Works
            </a>
            <a href="#features" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
              Features
            </a>
            <a href="#report-preview" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
              AI Report
            </a>
            <a href="#progress-preview" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
              Progress
            </a>
            <a href="#faq" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', transition: 'color 0.15s ease' }}>
              FAQ
            </a>
          </nav>

          {/* CTA & Auth Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-hover-arrow">
                <span>Go to Dashboard</span>
                <ArrowRight size={16} className="btn-arrow-icon" />
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="desktop-auth-actions">
                <Link to="/login" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-hover-arrow">
                  <span>Get Started Free</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="btn btn-ghost mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              style={{ padding: '8px', display: 'none' }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '16px 24px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              Features
            </a>
            <a
              href="#report-preview"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              AI Report
            </a>
            <a
              href="#progress-preview"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              Progress
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' }}
            >
              FAQ
            </a>
            <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section style={{ padding: '72px 0 44px 0', textAlign: 'center' }}>
        <div className="app-container" style={{ maxWidth: '880px' }}>
          {/* AI-Powered Badge (Order 1) */}
          <div className="hero-scroll-item" style={{ display: 'inline-flex', marginBottom: '20px', ...badgeStyle }}>
            <span
              className="badge badge-primary"
              style={{
                padding: '7px 15px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                letterSpacing: '0.01em',
              }}
            >
              <Sparkles size={14} /> AI-Powered Mock Interview Platform
            </span>
          </div>

          {/* Headline (Order 2) */}
          <h1
            className="hero-scroll-item"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              marginBottom: '20px',
              ...headingStyle,
            }}
          >
            Master the Interview.<br />
            <span style={{ color: 'var(--accent-primary)' }}>Prove Your Knowledge.</span> Get Hired.
          </h1>

          {/* Description (Order 3) */}
          <p
            className="hero-scroll-item"
            style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 34px auto',
              ...descStyle,
            }}
          >
            Realistic turn-by-turn technical and HR mock interviews tailored to your target job role. Speak your answers naturally, receive instant rubric-based evaluations, and pinpoint exact missing concepts.
          </p>

          {/* Primary & Secondary CTAs (Order 4) */}
          <div
            className="hero-scroll-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              ...ctaStyle,
            }}
          >
            <Link
              to={isAuthenticated ? '/interview/new' : '/register'}
              className="btn btn-primary btn-lg btn-hover-arrow"
              style={{ padding: '13px 26px', fontSize: '1rem', fontWeight: 600 }}
            >
              <span>Start Free Mock Interview</span>
              <ArrowRight size={18} className="btn-arrow-icon" />
            </Link>
            <a
              href="#preview-window"
              className="btn btn-secondary btn-lg"
              style={{ padding: '13px 24px', fontSize: '1rem', fontWeight: 500 }}
            >
              <span>View Sample Demo</span>
            </a>
          </div>

          {/* Trust Points (Order 5) */}
          <div
            className="hero-trust-points hero-scroll-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '28px',
              marginTop: '36px',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              flexWrap: 'wrap',
              ...trustStyle,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <CheckCircle2 size={16} color="#16A34A" /> AI-generated interview questions
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <CheckCircle2 size={16} color="#16A34A" /> Voice + Text response modes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <CheckCircle2 size={16} color="#16A34A" /> Resume-based personalization
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. INTERVIEW PRODUCT PREVIEW (Order 6 - Most Noticeable Reveal)
          ========================================================================= */}
      <section id="preview-window" style={{ padding: '16px 0 84px 0' }}>
        <div className="app-container" style={{ maxWidth: '980px' }}>
          <div
            className="saas-card card-interactive hero-preview-reveal"
            style={{
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
              borderColor: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              background: '#FFFFFF',
              ...previewStyle,
            }}
          >
            {/* macOS Chrome Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '16px',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    marginLeft: '8px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Interview Room: Full Stack Developer • Technical Round
                </span>
              </div>
              <span className="badge badge-primary" style={{ fontWeight: 600, padding: '4px 10px' }}>
                Question 2 of 5
              </span>
            </div>

            {/* AI Interviewer Bubble */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 22px',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                {/* Minimal indigo circular avatar with sparkle */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    fontSize: '1rem',
                  }}
                >
                  ✦
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    AI INTERVIEWER
                  </div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                    }}
                  >
                    "Can you explain the difference between MongoDB and MySQL, and when to use each in production?"
                  </div>
                </div>
              </div>

              {/* Action bar for audio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '50px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  <Volume2 size={14} color="var(--accent-primary)" />
                  <span>Listen</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '3px', height: '10px', backgroundColor: 'var(--accent-border)', borderRadius: '2px' }} />
                  <span style={{ width: '3px', height: '16px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }} />
                  <span style={{ width: '3px', height: '12px', backgroundColor: 'var(--accent-border)', borderRadius: '2px' }} />
                  <span style={{ width: '3px', height: '18px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }} />
                  <span style={{ width: '3px', height: '8px', backgroundColor: 'var(--accent-border)', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Candidate Response Bubble */}
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px 22px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  CANDIDATE RESPONSE
                </span>
                <span
                  className="badge badge-success"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '4px 10px',
                    fontWeight: 600,
                  }}
                >
                  <span className="rec-pulse-dot" /> Voice Dictation Active
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  fontStyle: 'normal',
                }}
              >
                "MySQL is a relational database adhering strictly to ACID transactions and structured schemas with foreign keys, making it ideal for financial records and transactions. In contrast, MongoDB is a document-based NoSQL database using flexible BSON models, optimal when horizontal scalability or schema flexibility is critical."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS (3-STEP REFINED JOURNEY)
          ========================================================================= */}
      <section
        id="how-it-works"
        style={{
          padding: '88px 0',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="app-container">
          <ScrollReveal distance={55} duration={600} blur={3}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Designed For High-Performance Interview Prep
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                A disciplined, three-step feedback loop that mirrors top-tier engineering hiring bars.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Step 1 */}
            <RevealItem distance={80} scale={0.94} delay={0} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '30px 26px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Sliders size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--accent-subtle)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    STEP 01
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Choose Your Interview
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                  Configure your target practice session with precision. Select role track, seniority level, interview type, question count, and optionally attach your resume for hyper-tailored prompts.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <span className="badge badge-default">Job role</span>
                  <span className="badge badge-default">Experience</span>
                  <span className="badge badge-default">Interview type</span>
                  <span className="badge badge-default">Question count</span>
                  <span className="badge badge-default">Resume PDF</span>
                </div>
              </div>
            </RevealItem>

            {/* Step 2 */}
            <RevealItem distance={80} scale={0.94} delay={100} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '30px 26px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mic size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--accent-subtle)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    STEP 02
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Speak or Type Answers
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                  Articulate your architectural and coding decisions naturally. Practice speaking into your microphone with real-time browser transcription or switch smoothly to text mode.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <span className="badge badge-default">Voice mode</span>
                  <span className="badge badge-default">Text input</span>
                  <span className="badge badge-default">Turn-by-turn flow</span>
                  <span className="badge badge-default">Audio playback</span>
                </div>
              </div>
            </RevealItem>

            {/* Step 3 */}
            <RevealItem distance={80} scale={0.94} delay={200} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '30px 26px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '11px',
                      backgroundColor: 'var(--accent-subtle)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BarChart3 size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--accent-primary)',
                      backgroundColor: 'var(--accent-subtle)',
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    STEP 03
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Get AI Feedback
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '16px', flex: 1 }}>
                  Receive instant granular scoring across multiple dimensions, detailed itemized strengths, critical missing trade-offs, and targeted action items for immediate improvement.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <span className="badge badge-default">Overall score</span>
                  <span className="badge badge-default">Strengths</span>
                  <span className="badge badge-default">Weaknesses</span>
                  <span className="badge badge-default">Missing concepts</span>
                </div>
              </div>
            </RevealItem>
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================================
          5. WHY INTERVIEWACE AI SECTION (4 FEATURE CARDS)
          ========================================================================= */}
      <section id="features" style={{ padding: '92px 0' }}>
        <div className="app-container">
          <ScrollReveal distance={55} duration={600} blur={3}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Everything You Need to Interview Better
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Focused tools designed to help you practice, understand your weaknesses, and improve.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Card 1 */}
            <RevealItem distance={70} scale={0.95} delay={0} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '28px 24px', height: '100%' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <Target size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Personalized Questions
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '12px' }}>
                  Questions tailored specifically to your target job role, declared experience tier, and project history from your resume.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Target job role & track
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Seniority & experience level
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Resume project validation
                  </li>
                </ul>
              </div>
            </RevealItem>

            {/* Card 2 */}
            <RevealItem distance={85} scale={0.95} delay={100} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '28px 24px', height: '100%' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <Mic size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Voice + Text Practice
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '12px' }}>
                  Practice answering naturally with real-time voice speech recognition or seamlessly switch to keyboard input whenever preferred.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Browser speech-to-text dictation
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Instant audio playback of questions
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Zero-friction keyboard toggle
                  </li>
                </ul>
              </div>
            </RevealItem>

            {/* Card 3 */}
            <RevealItem distance={70} scale={0.95} delay={160} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '28px 24px', height: '100%' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <Brain size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  AI Evaluation
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '12px' }}>
                  Get instant, multi-dimensional hiring evaluations based on industry rubrics rather than generic surface-level summaries.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Correctness & technical depth
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Answer relevance to question
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Communication & structure
                  </li>
                </ul>
              </div>
            </RevealItem>

            {/* Card 4 */}
            <RevealItem distance={85} scale={0.95} delay={260} duration={650}>
              <div className="saas-card card-interactive" style={{ padding: '28px 24px', height: '100%' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <TrendingUp size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Track Your Progress
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, marginBottom: '12px' }}>
                  Review all past completed interviews, inspect historic transcripts, and watch your scores steadily climb across practice rounds.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Session archive & transcripts
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Aggregate score analytics
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span> Continuous skill readiness index
                  </li>
                </ul>
              </div>
            </RevealItem>
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================================
          6. AI EVALUATION REPORT PREVIEW
          ========================================================================= */}
      <section
        id="report-preview"
        style={{
          padding: '88px 0',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="app-container" style={{ maxWidth: '960px' }}>
          <ScrollReveal distance={55} duration={600} blur={3}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Know Exactly How You Performed
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Get actionable AI feedback instead of just a score.
              </p>
            </div>
          </ScrollReveal>

          {/* SaaS Dashboard Report Card with ScrollParallax */}
          <ScrollParallax
            initialY={150}
            initialScale={0.90}
            initialBlur={6}
            initialOpacity={0}
            parallaxSpeed={-0.07}
          >
            <div
              className="saas-card card-interactive"
              style={{
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Report Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '20px',
                  marginBottom: '28px',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    INTERVIEW PERFORMANCE
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    Senior Full Stack Engineer Diagnostic
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-success" style={{ fontWeight: 600, padding: '5px 12px' }}>
                    Strong Hire Benchmark
                  </span>
                  <span className="badge badge-default" style={{ padding: '5px 10px' }}>
                    5 Questions Evaluated
                  </span>
                </div>
              </div>

              {/* Score & Rubric Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '28px',
                  marginBottom: '32px',
                }}
              >
                {/* Overall Score Card */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Overall Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      82
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      / 100
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '10px' }}>
                    Top 15% across Full Stack candidates
                  </div>
                </div>

                {/* Progress Breakdown Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Technical Knowledge</span>
                      <span style={{ color: 'var(--accent-primary)' }}>88%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '88%', height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Answer Relevance</span>
                      <span style={{ color: 'var(--accent-primary)' }}>84%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '84%', height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Problem Solving</span>
                      <span style={{ color: 'var(--accent-primary)' }}>81%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '81%', height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Communication</span>
                      <span style={{ color: 'var(--accent-primary)' }}>76%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '76%', height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Areas to Improve Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                {/* Strengths */}
                <div
                  style={{
                    border: '1px solid var(--success-border)',
                    backgroundColor: 'var(--success-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <CheckCircle2 size={18} color="#15803D" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--success-text)' }}>
                      Strengths
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84375rem', color: '#166534', lineHeight: 1.5 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>✓</span> Strong understanding of REST APIs and HTTP semantics
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>✓</span> Good database fundamentals and ACID vs NoSQL trade-offs
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>✓</span> Clear technical explanations with concise terminology
                    </li>
                  </ul>
                </div>

                {/* Areas to Improve */}
                <div
                  style={{
                    border: '1px solid var(--warning-border)',
                    backgroundColor: 'var(--warning-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1rem', color: '#B45309', fontWeight: 800 }}>•</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning-text)' }}>
                      Areas to Improve
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84375rem', color: '#92400E', lineHeight: 1.5 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>•</span> Explain technical trade-offs more clearly during architecture questions
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span>•</span> Include more concrete real-world production incident examples
                    </li>
                  </ul>
                </div>
              </div>

              {/* AI Recommendation Callout */}
              <div
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--accent-hover)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>AI Recommendation: </strong>
                  Focus on system design fundamentals, database replication lag, and distributed caching strategies before your next interview.
                </div>
              </div>
            </div>
          </ScrollParallax>
        </div>
      </section>

      {/* =========================================================================
          7. PROGRESS TRACKING PREVIEW
          ========================================================================= */}
      <section id="progress-preview" style={{ padding: '92px 0' }}>
        <div className="app-container" style={{ maxWidth: '880px' }}>
          <ScrollReveal distance={55} duration={600} blur={3}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                See Your Progress Over Time
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Review past interviews, identify persistent trends, and watch your readiness steadily improve.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal
            distance={100}
            duration={700}
            scale={0.95}
            blur={4}
            parallaxSpeed={-0.05}
            onRevealChange={setChartVisible}
          >
            <div
              className="saas-card card-interactive"
              style={{
                padding: '30px 28px',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Stat Row */}
              <ScrollReveal distance={30} delay={100} duration={550}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '20px',
                    marginBottom: '28px',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      AVERAGE SCORE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                        78%
                      </span>
                      <span className="badge badge-success" style={{ fontWeight: 600 }}>
                        +14% this month
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>COMPLETED INTERVIEWS</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>5 Sessions</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Minimal SVG Chart Graphic */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Recent Interview Performance
                </div>

                <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                  <svg
                    viewBox="0 0 600 200"
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline Grids */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Area fill */}
                    <polygon
                      points="50,135 160,118 280,105 400,109 520,75 520,180 50,180"
                      fill="url(#chartGradient)"
                      style={{
                        opacity: chartVisible || reducedMotion ? 1 : 0,
                        transition: reducedMotion ? 'none' : 'opacity 0.8s ease 0.35s',
                      }}
                    />

                    {/* Line with progressive stroke draw-in */}
                    <polyline
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="50,135 160,118 280,105 400,109 520,75"
                      style={{
                        strokeDasharray: 600,
                        strokeDashoffset: chartVisible || reducedMotion ? 0 : 600,
                        transition: reducedMotion ? 'none' : 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
                      }}
                    />

                    {/* Data Points with progressive scale-in */}
                    {[
                      { cx: 50, cy: 135, val: 68 },
                      { cx: 160, cy: 118, val: 72 },
                      { cx: 280, cy: 105, val: 75 },
                      { cx: 400, cy: 109, val: 74 },
                      { cx: 520, cy: 75, val: 82 },
                    ].map((pt, i) => (
                      <g
                        key={i}
                        style={{
                          transform: chartVisible || reducedMotion ? 'scale(1)' : 'scale(0)',
                          transformOrigin: `${pt.cx}px ${pt.cy}px`,
                          transition: reducedMotion ? 'none' : `transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${0.35 + i * 0.08}s`,
                        }}
                      >
                        <circle cx={pt.cx} cy={pt.cy} r="6" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" />
                        <text
                          x={pt.cx}
                          y={pt.cy - 12}
                          textAnchor="middle"
                          fill="#0F172A"
                          fontSize="12"
                          fontWeight="700"
                          fontFamily="inherit"
                        >
                          {pt.val}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Chart X-Axis Labels */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 20px 0 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    opacity: chartVisible || reducedMotion ? 1 : 0,
                    transition: reducedMotion ? 'none' : 'opacity 0.6s ease 0.5s',
                  }}
                >
                  {progressData.map((item, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.6875rem' }}>{item.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          8. FAQ SECTION
          ========================================================================= */}
      <section
        id="faq"
        style={{
          padding: '88px 0',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="app-container" style={{ maxWidth: '780px' }}>
          <ScrollReveal distance={45} duration={600} blur={2}>
            <div style={{ textAlign: 'center', marginBottom: '44px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.025em' }}>
                Frequently Asked Questions
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Quick answers to common questions about preparing with InterviewAce AI.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqList.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <RevealItem key={index} distance={50} scale={0.98} delay={index * 65} duration={550}>
                  <div className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="faq-accordion-header"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <ChevronDown size={18} className="faq-accordion-chevron" />
                    </button>
                    {isOpen && (
                      <div className="faq-accordion-content">
                        {item.a}
                      </div>
                    )}
                  </div>
                </RevealItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CTA SECTION
          ========================================================================= */}
      <section style={{ padding: '88px 0 92px 0' }}>
        <div className="app-container" style={{ maxWidth: '880px' }}>
          <ScrollReveal distance={80} scale={0.94} duration={700} blur={3}>
            <div className="final-cta-card card-interactive">
              <StaggerContainer>
                <RevealItem distance={35} delay={0} scale={0.98} duration={600}>
                  <h2
                    style={{
                      fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginBottom: '14px',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Ready to Ace Your Next Interview?
                  </h2>
                </RevealItem>

                <RevealItem distance={25} delay={120} duration={600}>
                  <p
                    style={{
                      fontSize: '1.0625rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '32px',
                      maxWidth: '520px',
                      margin: '0 auto 32px auto',
                      lineHeight: 1.5,
                    }}
                  >
                    Practice smarter. Get better. Get hired.
                  </p>
                </RevealItem>

                <RevealItem distance={20} delay={240} scale={0.92} duration={600}>
                  <Link
                    to={isAuthenticated ? '/interview/new' : '/register'}
                    className="btn btn-primary btn-lg btn-hover-arrow"
                    style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600 }}
                  >
                    <span>Start Free Interview</span>
                    <ArrowRight size={18} className="btn-arrow-icon" />
                  </Link>
                </RevealItem>
              </StaggerContainer>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================================================================
          10. FOOTER
          ========================================================================= */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '40px 0',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <ScrollReveal distance={30} duration={600} scale={1} blur={0}>
          <div
            className="app-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            {/* Left Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                InterviewAce AI
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                • Engineering Portfolio Project
              </span>
            </div>

            {/* Center Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <Link to="/" style={{ transition: 'color 0.15s ease' }}>Home</Link>
              <a href="#features" style={{ transition: 'color 0.15s ease' }}>Features</a>
              <a href="#how-it-works" style={{ transition: 'color 0.15s ease' }}>How It Works</a>
              <a href="#faq" style={{ transition: 'color 0.15s ease' }}>FAQ</a>
              {isAuthenticated ? (
                <Link to="/dashboard" style={{ transition: 'color 0.15s ease' }}>Dashboard</Link>
              ) : (
                <Link to="/login" style={{ transition: 'color 0.15s ease' }}>Sign In</Link>
              )}
            </div>

            {/* Right Slogan */}
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Prepare. Practice. Improve. Get Hired.
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
};
