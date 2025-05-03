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
      <form onSubmit={handleAddPermission}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newPermission.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={newPermission.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Resource:</label>
          <input
            type="text"
            name="resource"
            value={newPermission.resource}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Action:</label>
          <input
            type="text"
            name="action"
            value={newPermission.action}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Add Permission</button>
      </form>
      <h2>Existing Permissions</h2>
      <table>
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
