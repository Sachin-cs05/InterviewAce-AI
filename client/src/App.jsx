import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateInterviewPage } from './pages/CreateInterviewPage';
import { InterviewRoomPage } from './pages/InterviewRoomPage';
import { InterviewResultPage } from './pages/InterviewResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { InterviewDetailPage } from './pages/InterviewDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div className="ai-orb-container">
          <div className="ai-orb thinking">✦</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Guest Only Route Component
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Marketing */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* Dedicated Proctored Interview Room (Clean, Fullscreen & Focused) */}
            <Route
              path="/interview/:id"
              element={
                <ProtectedRoute>
                  <InterviewRoomPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Application Routes inside DashboardLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/interview/new" element={<CreateInterviewPage />} />
              <Route path="/interview/:id/result" element={<InterviewResultPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/history/:id" element={<InterviewDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
