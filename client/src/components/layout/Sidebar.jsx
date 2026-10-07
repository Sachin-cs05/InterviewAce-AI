import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  History,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Sidebar = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'New Interview', to: '/interview/new', icon: Sparkles },
    { name: 'Interview History', to: '/history', icon: History },
    { name: 'Profile', to: '/profile', icon: User },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'IA';

  const renderNavContent = (isMobileView = false) => (
    <>
      {/* Brand Header */}
      <div
        className="sidebar-brand"
        style={{
          padding: isMobileView ? '20px' : collapsed ? '20px 0' : '22px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobileView ? 'space-between' : collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              flexShrink: 0,
            }}
          >
            ✦
          </div>
          {(!collapsed || isMobileView) && (
            <div className="sidebar-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                InterviewAce
              </span>
              <span className="badge badge-primary sidebar-badge" style={{ padding: '1px 6px', fontSize: '0.6875rem' }}>
                AI
              </span>
            </div>
          )}
        </div>

        {/* Close button for mobile drawer */}
        {isMobileView && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        )}

        {/* Collapse toggle button on desktop */}
        {!isMobileView && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="btn btn-ghost"
            style={{ padding: '5px', color: 'var(--text-muted)', borderRadius: '6px' }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {(!collapsed || isMobileView) && (
          <div
            className="sidebar-section-title"
            style={{
              padding: '0 24px 8px 24px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Navigation
          </div>
        )}

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={isMobileView ? onCloseMobile : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed && !isMobileView ? item.name : undefined}
            >
              <Icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              {(!collapsed || isMobileView) && <span className="sidebar-text">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Expand button when collapsed on desktop */}
      {!isMobileView && collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="btn btn-ghost"
            style={{ padding: '8px', color: 'var(--text-muted)' }}
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Pro Tip Card (only when expanded) */}
      {(!collapsed || isMobileView) && (
        <div
          className="sidebar-pro-tip"
          style={{
            margin: '12px 14px',
            padding: '14px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Pro Tip</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Speak naturally and highlight architectural trade-offs to score higher.
          </p>
        </div>
      )}

      {/* User Footer Profile */}
      <div
        className="sidebar-user-footer"
        style={{
          padding: isMobileView ? '16px' : collapsed ? '16px 0' : '16px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobileView ? 'space-between' : collapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              border: '1px solid var(--accent-border)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          {(!collapsed || isMobileView) && (
            <div className="sidebar-user-info" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Candidate'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.targetRole || 'Full Stack'}
              </div>
            </div>
          )}
        </div>

        {(!collapsed || isMobileView) && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="btn btn-ghost"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Overlay & Panel */}
      {mobileOpen && (
        <>
          <div className="mobile-drawer-overlay" onClick={onCloseMobile} />
          <div className="mobile-drawer">
            {renderNavContent(true)}
          </div>
        </>
      )}
    </>
  );
};
