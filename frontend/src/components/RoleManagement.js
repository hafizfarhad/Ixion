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
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleData, setEditRoleData] = useState({
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

  const startEditingRole = (role) => {
    setEditingRole(role);
    setEditRoleData({
      name: role.name,
      description: role.description,
      permission_ids: role.permissions.map((p) => p.id)
    });
  };

  const cancelEditingRole = () => {
    setEditingRole(null);
    setEditRoleData({
      name: '',
      description: '',
      permission_ids: []
    });
  };

  const handleEditRoleChange = (e) => {
    const { name, value } = e.target;
    setEditRoleData({
      ...editRoleData,
      [name]: value
    });
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateRole(editingRole.id, editRoleData);
      fetchRoles(); // Refresh the list
      cancelEditingRole();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await apiService.deleteRole(roleId);
      fetchRoles(); // Refresh the list
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
      {editingRole ? (
        <form onSubmit={handleUpdateRole}>
          <h2>Edit Role</h2>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={editRoleData.name}
              onChange={handleEditRoleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={editRoleData.description}
              onChange={handleEditRoleChange}
            />
          </div>
          <button type="submit">Update Role</button>
          <button type="button" onClick={cancelEditingRole}>
            Cancel
          </button>
        </form>
      ) : (
        <form onSubmit={handleAddRole}>
          <h2>Create New Role</h2>
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
      )}
      <h2>Existing Roles</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>
                <button onClick={() => startEditingRole(role)}>Edit</button>
                <button onClick={() => handleDeleteRole(role.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoleManagement;
