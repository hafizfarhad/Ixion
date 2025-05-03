import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService'; // Adjust the import path as necessary

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    is_active: true,
    is_admin: false,
    password: ''
  });
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    is_active: true,
    is_admin: false,
    password: '',
    role_ids: []
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const startEditing = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      is_active: user.is_active,
      is_admin: user.is_admin,
      password: '' // Don't populate password for security
    });
  };
  
  const cancelEditing = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      is_active: true,
      is_admin: false,
      password: ''
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateUser(editingUser.id, formData);
      fetchUsers(); // Refresh the list
      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.createUser(newUser);
      fetchUsers(); // Refresh the list
      setNewUser({
        email: '',
        first_name: '',
        last_name: '',
        is_active: true,
        is_admin: false,
        password: '',
        role_ids: []
      });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiService.deleteUser(userId);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (loading) return <div>Loading users...</div>;
  
  return (
    <div>
      <h1>User Management</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleCreateUser} className="form-container">
        <h2 className="form-title">Create New User</h2>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={newUser.email}
            onChange={handleNewUserChange}
            required
          />
        </div>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={newUser.first_name}
            onChange={handleNewUserChange}
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={newUser.last_name}
            onChange={handleNewUserChange}
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={newUser.is_active}
              onChange={handleNewUserChange}
            />
            Active
          </label>
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="is_admin"
              checked={newUser.is_admin}
              onChange={handleNewUserChange}
            />
            Admin
          </label>
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={newUser.password}
            onChange={handleNewUserChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Create User</button>
      </form>

      {editingUser ? (
        <form onSubmit={handleSubmit}>
          <h2>Edit User</h2>
          <div>
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
              />
              Admin
            </label>
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Save</button>
          <button type="button" onClick={cancelEditing}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <h2>Users</h2>
          <table className="table-container">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Active</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.is_active ? 'Yes' : 'No'}</td>
                  <td>{user.is_admin ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => startEditing(user)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;