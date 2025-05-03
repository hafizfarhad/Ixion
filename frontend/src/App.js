import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import PermissionManagement from './components/PermissionManagement';
import InviteUser from './components/InviteUser';
import AuditLogs from './components/AuditLogs';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
        <div className="content">
          <Routes>
            <Route path="/login" element={
              !isAuthenticated 
                ? <Login onLogin={handleLogin} /> 
                : <Navigate to="/dashboard" />
            } />
            
            <Route path="/register" element={
              !isAuthenticated 
                ? <Register onLogin={handleLogin} /> 
                : <Navigate to="/dashboard" />
            } />
            
            <Route path="/dashboard" element={
              isAuthenticated 
                ? <Dashboard user={user} /> 
                : <Navigate to="/login" />
            } />
            
            <Route path="/users" element={
              isAuthenticated && user.is_admin 
                ? <UserManagement /> 
                : !isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />
            } />
            
            <Route path="/roles" element={
              isAuthenticated && user.is_admin 
                ? <RoleManagement /> 
                : !isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />
            } />
            
            <Route path="/permissions" element={
              isAuthenticated && user.is_admin 
                ? <PermissionManagement /> 
                : !isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />
            } />
            
            <Route path="/invite" element={
              isAuthenticated && user.is_admin 
                ? <InviteUser /> 
                : !isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />
            } />
            
            <Route path="/audit-logs" element={
              isAuthenticated && user.is_admin 
                ? <AuditLogs /> 
                : !isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/dashboard" />
            } />
            
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;