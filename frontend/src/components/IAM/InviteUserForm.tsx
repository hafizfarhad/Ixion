'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Role } from '@/types';

interface InviteUserFormProps {
  roles: Role[];
  onInviteSent: () => void;
  onCancel: () => void;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ roles, onInviteSent, onCancel }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Get the authorization token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Make API call to invite user
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/invite`,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          role_id: roleId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage(`Invitation sent successfully to ${email}`);
      
      // Reset form after short delay to show success message
      setTimeout(() => {
        setEmail('');
        setFirstName('');
        setLastName('');
        setRoleId('');
        setSuccessMessage('');
        onInviteSent();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 bg-green-900/30 border border-green-800 text-green-300 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg w-full p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="user@example.com"
        />
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg w-full p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="John"
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg w-full p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
          className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg w-full p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select a role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            'Send Invitation'
          )}
        </button>
      </div>
    </form>
  );
};

export default InviteUserForm;