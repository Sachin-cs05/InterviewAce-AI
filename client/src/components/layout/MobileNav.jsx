import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sparkles, History, User, Settings } from 'lucide-react';

export const MobileNav = () => {
  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/interview/new"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Sparkles size={20} />
        <span>New</span>
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <History size={20} />
        <span>History</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <User size={20} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
