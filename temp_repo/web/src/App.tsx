import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Sessions } from './pages/Sessions';
import { Logs } from './pages/Logs';
import { BotSessions } from './pages/BotSessions';
import { Integrations } from './pages/Integrations';
import { Campaigns } from './pages/Campaigns';
import { SSOIntegrations } from './pages/SSOIntegrations';
import Connect from './pages/Connect';
import { UsersPage } from './pages/Users';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, verifyAuth, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = React.useState(true);

  useEffect(() => {
    const verify = async () => {
      // Check if there is a SSO token in URL
      const urlParams = new URLSearchParams(location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        // We login with the URL token, which saves it to localStorage and state
        const success = await login(urlToken);
        if (success) {
          // Remove token from URL for security
          navigate(location.pathname, { replace: true });
        } else {
          setIsVerifying(false);
          navigate('/login', { state: { from: location.pathname } });
          return;
        }
      }

      const valid = await verifyAuth();
      setIsVerifying(false);
      if (!valid) {
        navigate('/login', { state: { from: location.pathname } });
      }
    };

    verify();
  }, [location.pathname, location.search]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  return !isAuthenticated ? <>{children}</> : <Navigate to={from} replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Public Connection Page - No auth required, no redirect */}
      <Route path="/connect/:token" element={<Connect />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <Logs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bot-sessions"
        element={
          <ProtectedRoute>
            <BotSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sso"
        element={
          <ProtectedRoute>
            <SSOIntegrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
