import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // You could fetch system status or other dashboard information here
    setLoading(false);
  }, []);
  
  return (
    <div>
      <h1>Welcome to IAM System Dashboard</h1>
      
      {loading ? (
        <p>Loading dashboard information...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div>
          <div className="card mb-3">
            <h3 className="card-title">User Profile</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
            <p><strong>Roles:</strong> {user.roles ? user.roles.map(role => role.name).join(', ') : 'None assigned'}</p>
          </div>
          
          {user.is_admin && (
            <div className="card">
              <h3 className="card-title">Admin Quick Links</h3>
              <div className="flex gap-2">
                <Link to="/users" className="btn btn-primary">
                  Manage Users
                </Link>
                <Link to="/roles" className="btn btn-primary">
                  Manage Roles
                </Link>
                <Link to="/invite" className="btn btn-primary">
                  Invite Users
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;