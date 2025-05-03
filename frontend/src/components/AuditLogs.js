import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLogs(); // Corrected method name
      setLogs(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h1>Audit Logs</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user_email}</td>
              <td>{log.action}</td>
              <td>{log.resource_type}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditLogs;
