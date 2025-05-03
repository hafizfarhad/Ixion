import React, { useState } from 'react';
import apiService from '../api/apiService';

function InviteUser({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role_ids: []
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.inviteAndCreateUser(formData);
      if (response && response.user && response.token) {
        const { user, token } = response;
        setSuccessMessage('User invited and created successfully!');
        setError('');
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          password: '',
          role_ids: []
        });
        onLogin(user, token); // Log in the newly created user
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      setSuccessMessage('');
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Invite User</h1>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Role IDs (comma-separated):</label>
          <input
            type="text"
            name="role_ids"
            className="form-control"
            value={formData.role_ids}
            onChange={(e) =>
              setFormData({
                ...formData,
                role_ids: e.target.value.split(',').map((id) => id.trim())
              })
            }
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Invite User</button>
      </form>
    </div>
  );
}

export default InviteUser;
