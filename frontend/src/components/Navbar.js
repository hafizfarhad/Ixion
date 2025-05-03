import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import a CSS file for styling

function Navbar({ user, onLogout }) {
  const isAdmin = user && user.is_admin;
  
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        IAM System
      </Link>
      
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </li>
        
        {isAdmin && (
          <>
            <li className="nav-item">
              <Link to="/users" className="nav-link">Users</Link>
            </li>
            <li className="nav-item">
              <Link to="/roles" className="nav-link">Roles</Link>
            </li>
            <li className="nav-item">
              <Link to="/permissions" className="nav-link">Permissions</Link>
            </li>
            <li className="nav-item">
              <Link to="/invite" className="nav-link">Invite</Link>
            </li>
            <li className="nav-item">
              <Link to="/audit-logs" className="nav-link">Audit Logs</Link>
            </li>
          </>
        )}
        
        <li className="nav-item">
          <button onClick={onLogout} className="nav-link logout-button">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;