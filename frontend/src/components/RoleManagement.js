import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';

function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permission_ids: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRoles();
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRole({
      ...newRole,
      [name]: value
    });
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      await apiService.createRole(newRole);
      fetchRoles(); // Refresh the list
      setNewRole({ name: '', description: '', permission_ids: [] });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading roles...</div>;

  return (
    <div>
      <h1>Role Management</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleAddRole}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={newRole.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={newRole.description}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Add Role</button>
      </form>
      <h2>Existing Roles</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoleManagement;
