import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import EmployeeProfile from './components/EmployeeProfile';
import Layout from './components/Layout';
import AddEntry from './components/AddEntry';
import Approvals from './components/Approvals';
import ApprovedEntries from './components/ApprovedEntries';
import AllEmployeesRecap from './components/AllEmployeesRecap';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lastPath, setLastPath] = useState(() => {
    return localStorage.getItem('lastPath') || '/dashboard';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error checking profile:', error);
      setProfile(null);
    }
  };

  const AuthenticatedRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    if (!profile) return <Navigate to="/profile" replace />;
    return <Layout>{children}</Layout>;
  };

  // Update lastPath when route changes
  const handleRouteChange = (path: string) => {
    if (path !== '/login' && path !== '/register') {
      localStorage.setItem('lastPath', path);
      setLastPath(path);
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to={lastPath} replace />
            ) : (
              <Auth view="sign-in" />
            )
          }
        />
        <Route
          path="/register"
          element={
            session ? (
              <Navigate to={lastPath} replace />
            ) : (
              <Auth view="sign-up" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            !session ? (
              <Navigate to="/login" replace />
            ) : (
              <Layout>
                <EmployeeProfile onRouteChange={handleRouteChange} />
              </Layout>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <Dashboard onRouteChange={() => handleRouteChange('/dashboard')} />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/add-entry"
          element={
            <AuthenticatedRoute>
              <AddEntry onRouteChange={() => handleRouteChange('/add-entry')} />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <AuthenticatedRoute>
              <Approvals />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/approved-entries"
          element={
            <AuthenticatedRoute>
              <ApprovedEntries />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/all-employees-recap"
          element={
            <AuthenticatedRoute>
              <AllEmployeesRecap />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/"
          element={
            !session ? (
              <Navigate to="/login" replace />
            ) : !profile ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to={lastPath} replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;