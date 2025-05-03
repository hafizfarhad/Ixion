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
          <table>
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
                    <button onClick={() => startEditing(user)}>Edit</button>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
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