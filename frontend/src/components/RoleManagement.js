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
      console.log(data); // Debug: Log the fetched roles
      setRoles(data); // Role data now includes IDs
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
        <form onSubmit={handleUpdateRole} className="form-container">
          <h2 className="form-title">Edit Role</h2>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={editRoleData.name}
              onChange={handleEditRoleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              name="description"
              className="form-control"
              value={editRoleData.description}
              onChange={handleEditRoleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Update Role</button>
          <button type="button" className="btn btn-secondary btn-block" onClick={cancelEditingRole}>
            Cancel
          </button>
        </form>
      ) : (
        <form onSubmit={handleAddRole} className="form-container">
          <h2 className="form-title">Create New Role</h2>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={newRole.name}
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
              value={newRole.description}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Add Role</button>
        </form>
      )}
      <h2>Existing Roles</h2>
      <table className="table-container">
        <thead>
          <tr>
            <th>ID</th> {/* Add a column for Role ID */}
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.id}</td> {/* Display Role ID */}
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>
                <button className="btn btn-secondary" onClick={() => startEditingRole(role)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDeleteRole(role.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoleManagement;
