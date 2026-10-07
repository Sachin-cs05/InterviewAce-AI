import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#16A34A" />;
      case 'error':
        return <AlertCircle size={18} color="#DC2626" />;
      case 'warning':
        return <AlertTriangle size={18} color="#D97706" />;
      case 'info':
      default:
        return <Info size={18} color="#4F46E5" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'var(--success-border)';
      case 'error':
        return 'var(--danger-border)';
      case 'warning':
        return 'var(--warning-border)';
      case 'info':
      default:
        return 'var(--accent-border)';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, toast }}>
      {children}
      {/* Toast Render Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100% - 40px)',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-card"
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${getBorderColor(t.type)}`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)',
              animation: 'toast-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{ flexShrink: 0 }}>{getIcon(t.type)}</div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                {t.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
