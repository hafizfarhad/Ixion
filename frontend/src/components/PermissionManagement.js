import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

function PermissionManagement() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    resource: '',
    action: ''
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPermissions();
      setPermissions(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPermission({
      ...newPermission,
      [name]: value
    });
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    try {
      await apiService.createPermission(newPermission);
      fetchPermissions(); // Refresh the list
      setNewPermission({ name: '', description: '', resource: '', action: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading permissions...</div>;

  return (
    <div>
      <h1>Permission Management</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleAddPermission} className="form-container">
        <h2 className="form-title">Add Permission</h2>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={newPermission.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            name="description"
            className="form-control"
            value={newPermission.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Resource:</label>
          <input
            type="text"
            name="resource"
            className="form-control"
            value={newPermission.resource}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Action:</label>
          <input
            type="text"
            name="action"
            className="form-control"
            value={newPermission.action}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Add Permission</button>
      </form>
      <h2>Existing Permissions</h2>
      <table className="table-container">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Resource</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.name}</td>
              <td>{permission.description}</td>
              <td>{permission.resource}</td>
              <td>{permission.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PermissionManagement;
