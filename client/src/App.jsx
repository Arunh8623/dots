import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css';

// Lazy load pages so one crash doesn't kill everything
const Home       = lazy(() => import('./pages/Home'));
const Auth       = lazy(() => import('./pages/Auth'));
const Visualizer = lazy(() => import('./pages/Visualizer'));

const Spinner = () => (
  <div style={{ background:'#04080f', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width:'32px', height:'32px', border:'2px solid #1a2a40', borderTopColor:'#58C4DD', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/"     element={<Home />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/app"  element={<ProtectedRoute><Visualizer /></ProtectedRoute>} />
            <Route path="*"     element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}