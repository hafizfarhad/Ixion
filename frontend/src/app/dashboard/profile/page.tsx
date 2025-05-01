'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { InputChangeEvent, FormSubmitEvent, User } from '@/types';

// Define interfaces for component state
interface UserSession {
  id: string;
  user_agent?: string;
  ip_address?: string;
  created_at?: string;
  expires_at?: string;
  current?: boolean;
}

interface ActivityLog {
  id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  timestamp: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserData(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || ''
        });
        
        setIsLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          router.push('/login');
        } else {
          setError('Failed to fetch user data');
          setIsLoading(false);
        }
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/me/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSessions(response.data || []);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };

    const fetchActivityLogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/audit-logs', {
          params: { user_id: 'me', page: 1, per_page: 10 }, // 'me' will be resolved to current user ID on backend
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setActivityLogs(response.data?.items || []);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      }
    };

    fetchUserData();
    fetchSessions();
    fetchActivityLogs();
  }, [router]);

  const handleInputChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const updateProfile = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      const response = await axios.put('http://localhost:5000/api/iam/me/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserData({ ...userData, ...response.data });
      setSuccessMessage('Profile updated successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update profile');
      }
    }
  };

  const changePassword = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSuccessMessage('');
    
    // Validate password match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Validate password strength
    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      await axios.put('http://localhost:5000/api/iam/me/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setSuccessMessage('Password changed successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setPasswordError(err.response.data.error);
      } else {
        setPasswordError('Failed to change password');
      }
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session?')) {
      return;
    }
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      await axios.post(`http://localhost:5000/api/iam/me/sessions/${sessionId}/revoke`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update sessions list
      const response = await axios.get('http://localhost:5000/api/iam/me/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessions(response.data || []);
      setSuccessMessage('Session ended successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to end session');
      }
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm('Are you sure you want to end all other sessions? This will log you out on all other devices.')) {
      return;
    }
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      await axios.post('http://localhost:5000/api/iam/me/sessions/revoke-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update sessions list
      const response = await axios.get('http://localhost:5000/api/iam/me/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSessions(response.data || []);
      setSuccessMessage('All other sessions ended successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to end sessions');
      }
    }
  };

  // Format date from ISO string
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Sidebar links with all IAM features
  const sidebarLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/dashboard/users' },
    { label: 'Roles', href: '/dashboard/roles' },
    { label: 'Permissions', href: '/dashboard/permissions' },
    { label: 'Groups', href: '/dashboard/groups' },
    { label: 'Applications', href: '/dashboard/applications' },
    { label: 'Policies', href: '/dashboard/policies' },
    { label: 'Activity Logs', href: '/dashboard/activity' },
    { label: 'Security Alerts', href: '/dashboard/alerts' },
    { label: 'Compliance', href: '/dashboard/compliance' },
    { label: 'Settings', href: '/dashboard/settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Header */}
      <Header showLogout userName={userData?.email} />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar navigation */}
        <Sidebar links={sidebarLinks} />
        
        {/* Main content */}
        <main className="flex-1 p-6 ml-64 mt-8 overflow-y-auto h-[calc(100vh-5.5rem)]">
          {error ? (
            <div className="p-4 mb-6 bg-red-900/30 border border-red-800 text-red-300 rounded-lg">
              {error}
            </div>
          ) : successMessage ? (
            <div className="p-4 mb-6 bg-green-900/30 border border-green-800 text-green-300 rounded-lg">
              {successMessage}
            </div>
          ) : null}
          
          <div className="space-y-6 pb-8">
            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
              <p className="text-gray-400">Manage your account and security settings</p>
            </div>
            
            {/* Tabs for navigation */}
            <div className="border-b border-[#3d3d3d]">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'profile'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'security'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'sessions'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Active Sessions
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'activity'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Activity History
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'applications'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Applications
                </button>
              </nav>
            </div>
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <form onSubmit={updateProfile}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                          <input 
                            type="text" 
                            name="first_name" 
                            placeholder="Your first name" 
                            className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                            value={formData.first_name}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                          <input 
                            type="text" 
                            name="last_name" 
                            placeholder="Your last name" 
                            className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                            value={formData.last_name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Account Information</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            name="email" 
                            className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 opacity-50"
                            value={formData.email}
                            readOnly
                          />
                          <p className="mt-1 text-xs text-gray-400">Email changes require verification and must be requested through support.</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Account Type</label>
                          <div className="flex items-center space-x-2 text-base mt-2">
                            {userData?.is_admin ? (
                              <span className="bg-purple-900/30 text-purple-300 border border-purple-800 px-3 py-1 rounded-full text-xs">
                                Administrator
                              </span>
                            ) : (
                              <span className="bg-blue-900/30 text-blue-300 border border-blue-800 px-3 py-1 rounded-full text-xs">
                                Standard User
                              </span>
                            )}
                            
                            {userData?.roles && userData.roles.length > 0 && userData.roles.map((role, index) => (
                              <span key={index} className="bg-indigo-900/30 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-full text-xs">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Account Status</label>
                          <div className="flex items-center mt-2">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                userData?.is_active ? 'bg-green-400' : 'bg-red-400'
                              }`}
                            ></div>
                            <span className="text-sm">
                              {userData?.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-[#3d3d3d]">
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Password change section */}
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  {passwordError && (
                    <div className="p-3 mb-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm">
                      {passwordError}
                    </div>
                  )}
                  <form onSubmit={changePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        name="current_password" 
                        placeholder="Your current password" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                      <input 
                        type="password" 
                        name="new_password" 
                        placeholder="Enter new password" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        name="confirm_password" 
                        placeholder="Confirm new password" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* Multi-factor Authentication */}
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Multi-factor Authentication</h3>
                    <div className={`text-sm ${userData?.mfa_enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                      {userData?.mfa_enabled ? 'Enabled' : 'Not Enabled'}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4">
                    Enhance your account security by enabling multi-factor authentication. This adds an additional layer of protection by requiring a verification code along with your password.
                  </p>
                  
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium ${
                      userData?.mfa_enabled 
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {userData?.mfa_enabled ? 'Disable MFA' : 'Enable MFA'}
                  </button>
                </div>
                
                {/* Password policy information */}
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4">Password Policy</h3>
                  
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Minimum 8 characters in length</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Must contain at least one uppercase letter</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Must contain at least one number</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Cannot be the same as your last 5 passwords</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Password expires every 90 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Active Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                <div className="p-6 border-b border-[#3d3d3d]">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <button 
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                      onClick={revokeAllSessions}
                    >
                      End All Other Sessions
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    These are your currently active sessions across all devices. You can terminate any session that you don't recognize.
                  </p>
                </div>
                
                <div className="divide-y divide-[#3d3d3d]">
                  {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <div key={index} className="p-4 hover:bg-[#2a2a2a]">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                              <span className="font-medium">
                                {session.user_agent?.split('/')[0] || 'Unknown Device'}
                              </span>
                              {session.current && (
                                <span className="ml-2 bg-blue-900/30 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full text-xs">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              {session.ip_address || 'Unknown IP'} • {session.user_agent || 'Unknown Browser'}
                            </div>
                            <div className="text-gray-400 text-xs mt-0.5">
                              Started: {formatDate(session.created_at)} • Expires: {formatDate(session.expires_at)}
                            </div>
                          </div>
                          
                          {!session.current && (
                            <button 
                              className="text-red-400 hover:text-red-300 text-sm"
                              onClick={() => revokeSession(session.id)}
                            >
                              End Session
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400">
                      No active sessions found beyond your current session.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Activity History Tab */}
            {activeTab === 'activity' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                <div className="p-6 border-b border-[#3d3d3d]">
                  <h3 className="text-lg font-medium">Activity History</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    A record of activities associated with your account.
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#1c1c1c] text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-3">Action</th>
                        <th className="p-3">Resource</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3d3d]">
                      {activityLogs.length > 0 ? (
                        activityLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-[#2a2a2a]">
                            <td className="p-3 font-medium">
                              {log.action}
                            </td>
                            <td className="p-3 text-gray-300">
                              {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                            </td>
                            <td className="p-3 text-gray-400 text-sm">
                              {log.ip_address || 'Unknown'}
                            </td>
                            <td className="p-3 text-gray-400 text-sm">
                              {formatDate(log.timestamp)}
                            </td>
                            <td className="p-3">
                              <button className="text-blue-400 hover:text-blue-300 text-sm">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-400">
                            No activity logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Applications Access Tab */}
            {activeTab === 'applications' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                <div className="p-6 border-b border-[#3d3d3d]">
                  <h3 className="text-lg font-medium">Application Access</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    View and manage applications that you can access based on your role and permissions.
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData?.permissions && userData.permissions.length > 0 ? (
                      <>
                        <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v3H5V6zm6 5H5v3h6v-3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">User Management</h4>
                              <p className="text-xs text-gray-400">User directory access</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            View and manage user accounts.
                          </p>
                          <a href="/dashboard/users" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center">
                            Access App
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </div>
                        
                        <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h10v8H5V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">Analytics Dashboard</h4>
                              <p className="text-xs text-gray-400">User activity analysis</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            View login trends and security metrics.
                          </p>
                          <a href="/dashboard" className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center">
                            Access App
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </div>
                        
                        <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">Security Settings</h4>
                              <p className="text-xs text-gray-400">Password and MFA</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            Manage security settings and preferences.
                          </p>
                          <button onClick={() => setActiveTab('security')} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center">
                            Access App
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-3 p-6 text-center text-gray-400">
                        You don't have access to any applications. Contact your administrator for assistance.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}