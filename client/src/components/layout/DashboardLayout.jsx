import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Dynamic Header Title resolution based on current path
  const getPageTitle = (path) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/interview/new') return 'New Interview';
    if (path.startsWith('/interview/') && path.endsWith('/result')) return 'Interview Report';
    if (path.startsWith('/interview/')) return 'Interview Room';
    if (path === '/history') return 'Interview History';
    if (path.startsWith('/history/')) return 'Interview Diagnostic';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      <div className={`main-content-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          title={currentTitle}
          onOpenMobileNav={() => setMobileDrawerOpen(true)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Fallback bottom navigation for quick mobile tabs */}
      <MobileNav />
    </div>
  );
};
