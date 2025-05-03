import React, { useState } from 'react';
import apiService from '../api/apiService';

function InviteUser() {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_id: ''
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
      await apiService.inviteUser(formData);
      setSuccessMessage('Invitation sent successfully!');
      setError('');
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role_id: ''
      });
    } catch (err) {
      setError(err.message);
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h1>Invite User</h1>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
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
          <label>Role ID:</label>
          <input
            type="text"
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Send Invitation</button>
      </form>
    </div>
  );
}

export default InviteUser;
