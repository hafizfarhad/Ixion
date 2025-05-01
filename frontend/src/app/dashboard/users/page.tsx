'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import InviteUserForm from '@/components/IAM/InviteUserForm';
import { User, Role, InputChangeEvent, SelectChangeEvent, FormSubmitEvent } from '@/types';

// Additional interfaces for this component
interface UserFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: string;
  is_active: boolean;
}

interface UserActivity {
  id?: string;
  timestamp: string;
  action_type?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActionMenu, setShowBulkActionMenu] = useState(false);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [userDetailTab, setUserDetailTab] = useState('profile');
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: '',
    is_active: true
  });
  const router = useRouter();

  // Fetch users and roles on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch current user data to check permissions
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUser(response.data);
        
        // Check if user has admin permissions
        if (!response.data.is_admin && !response.data.permissions.includes('user:list')) {
          setError('You do not have permission to view this page');
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
          return false;
        }
        return true;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          router.push('/login');
        }
        setError('Failed to fetch user data');
        return false;
      }
    };
    
    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setIsLoading(false);
      }
    };
    
    // Fetch roles for dropdown
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRoles(response.data);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    
    const initializeData = async () => {
      const hasPermission = await fetchCurrentUser();
      if (hasPermission) {
        await Promise.all([fetchUsers(), fetchRoles()]);
      }
    };
    
    initializeData();
    
  }, [router]);

  // Function to handle form input changes
  const handleInputChange = (e: InputChangeEvent | SelectChangeEvent) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Handle add user form submission
  const handleAddUser = async (e: FormSubmitEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.post('http://localhost:5000/api/iam/users', {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: formData.role_id || null,
        is_active: formData.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh users
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: '',
        is_active: true
      });
      setShowAddModal(false);
      
      // Fetch updated users
      const response = await axios.get('http://localhost:5000/api/iam/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create user');
      }
    }
  };
  
  // Handle edit user form submission
  const handleEditUser = async (e: FormSubmitEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    // Check if selectedUser is null
    if (!selectedUser) {
      setError('No user selected for editing');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      
      // Prepare update data - don't send password if it's empty (not changing)
      const updateData: {
        email: string;
        first_name: string;
        last_name: string;
        role_id: string | null;
        is_active: boolean;
        password?: string; // Make password optional
      } = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role_id: formData.role_id || null,
        is_active: formData.is_active
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await axios.put(`http://localhost:5000/api/iam/users/${selectedUser.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh users
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role_id: '',
        is_active: true
      });
      setShowEditModal(false);
      setSelectedUser(null);
      
      // Fetch updated users
      const response = await axios.get('http://localhost:5000/api/iam/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update user');
      }
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`http://localhost:5000/api/iam/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch updated users
      const response = await axios.get('http://localhost:5000/api/iam/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete user');
      }
    }
  };
  
  // Open edit modal and populate form with user data
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    // Get the first role ID if available
    const roleId = user.roles && user.roles.length > 0 ? user.roles[0] : '';
    
    setFormData({
      email: user.email,
      password: '', // Don't populate password for security
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role_id: roleId,
      is_active: user.is_active || false
    });
    setShowEditModal(true);
  };
  
  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(`http://localhost:5000/api/iam/users/${userId}`, 
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus } 
          : user
      ));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update user status');
      }
    }
  };
  
  // Handle bulk actions on selected users
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (!selectedUsers.length) {
      return;
    }

    if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      
      if (action === 'delete') {
        // Delete selected users
        await Promise.all(
          selectedUsers.map(userId => 
            axios.delete(`http://localhost:5000/api/iam/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
      } else {
        // Activate or deactivate users
        await Promise.all(
          selectedUsers.map(userId => 
            axios.put(`http://localhost:5000/api/iam/users/${userId}`, 
              { is_active: action === 'activate' },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
      }

      // Fetch updated users
      const response = await axios.get('http://localhost:5000/api/iam/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      setSelectedUsers([]);
      setShowBulkActionMenu(false);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(`Failed to ${action} users`);
      }
    }
  };

  // Handle select/deselect single user
  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Handle select/deselect all users
  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // If all users are selected, deselect all
      setSelectedUsers([]);
    } else {
      // Otherwise, select all filtered users
      setSelectedUsers(filteredUsers.map(user => user.id as string));
    }
  };
  
  // Open user detail modal
  const openUserDetailModal = (user: User) => {
    setSelectedUser(user);
    
    // Fetch user activity if needed
    if (user.id) {
      fetchUserActivity(user.id);
    }
    
    setShowDetailModal(true);
  };
  
  // Fetch user activity logs
  const fetchUserActivity = async (userId: string) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`http://localhost:5000/api/iam/activity?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserActivity(response.data || []);
    } catch (err) {
      console.error('Failed to fetch user activity:', err);
      setUserActivity([]);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase().trim().split(' ');
    
    // Get the role name from the first role if available
    let roleName = '';
    if (user.roles && user.roles.length > 0) {
      const firstRole = user.roles[0];
      if (typeof firstRole === 'string') {
        roleName = firstRole;
      } else {
        // Since TypeScript doesn't understand our runtime check fully,
        // we need to use a type assertion here
        const roleObj = firstRole as unknown as {name?: string};
        roleName = roleObj.name || '';
      }
    }
    
    const userDataString = `${user.email} ${user.first_name || ''} ${user.last_name || ''} ${roleName}`.toLowerCase();
    
    return searchTerms.every(term => userDataString.includes(term));
  });

  // Loading state
  if (isLoading && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Header with user info and logout */}
      <Header showLogout userName={currentUser?.email} />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar navigation */}
        <Sidebar 
          links={[
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
          ]} 
        />
        
        {/* Main content */}
        <main className="flex-1 p-6 ml-64 mt-8 overflow-y-auto h-[calc(100vh-5.5rem)]">
          {error ? (
            <div className="p-4 mb-6 bg-red-900/30 border border-red-800 text-red-300 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {/* Page header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold mb-1">User Management</h1>
                  <p className="text-gray-400">Manage users and their access</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className="bg-[#3d3d3d] hover:bg-[#4d4d4d] px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setShowAddModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Create User
                  </button>
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Invite User
                  </button>
                </div>
              </div>
              
              {/* Search and filter bar */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    className="bg-[#252525] border border-[#3d3d3d] text-white py-2 pl-10 pr-4 rounded-lg w-full focus:outline-none focus:border-purple-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Bulk actions menu */}
                <div className="flex items-center space-x-4">
                  {selectedUsers.length > 0 && (
                    <div className="relative">
                      <button
                        className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg font-medium flex items-center"
                        onClick={() => setShowBulkActionMenu(!showBulkActionMenu)}
                      >
                        Bulk Actions ({selectedUsers.length})
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Bulk actions menu */}
                      {showBulkActionMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#252525] ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3d3d3d]"
                              onClick={() => handleBulkAction('activate')}
                            >
                              Activate Users
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3d3d3d]"
                              onClick={() => handleBulkAction('deactivate')}
                            >
                              Deactivate Users
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#3d3d3d]"
                              onClick={() => handleBulkAction('delete')}
                            >
                              Delete Users
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <span className="text-gray-400 text-sm">
                    {filteredUsers.length} users
                  </span>
                </div>
              </div>
              
              {/* Users table */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1c1c1c] text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-2 py-3 text-left">
                          <input
                            type="checkbox"
                            className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                            checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                            onChange={handleSelectAllUsers}
                          />
                        </th>
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Email</th>
                        <th className="px-6 py-3 text-left">Role</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3d3d]">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-[#2a2a2a]">
                            <td className="px-2 py-4">
                              <input
                                type="checkbox"
                                className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                                checked={user.id ? selectedUsers.includes(user.id) : false}
                                onChange={() => user.id && handleSelectUser(user.id)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3 text-sm font-medium">
                                  {user.first_name && user.last_name 
                                    ? `${user.first_name[0]}${user.last_name[0]}` 
                                    : user.email.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div 
                                    className="font-medium cursor-pointer hover:text-purple-400"
                                    onClick={() => openUserDetailModal(user)}
                                  >
                                    {user.first_name && user.last_name 
                                      ? `${user.first_name} ${user.last_name}` 
                                      : 'No name'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {user.email}
                            </td>
                            <td className="px-6 py-4">
                              {user.roles && user.roles.length > 0 ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-purple-900/30 text-purple-300">
                                  {typeof user.roles[0] === 'string' 
                                    ? user.roles[0] 
                                    : (user.roles[0] as unknown as {name?: string}).name || ''}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-sm">No role assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div 
                                  className={`w-3 h-3 rounded-full mr-2 ${
                                    user.is_active ? 'bg-green-400' : 'bg-red-400'
                                  }`}
                                ></div>
                                <span className="text-sm">{user.is_active ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <button 
                                  className="text-blue-400 hover:text-blue-300"
                                  onClick={() => openEditModal(user)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="text-purple-400 hover:text-purple-300"
                                  onClick={() => user.id && toggleUserStatus(user.id, user.is_active || false)}
                                >
                                  {user.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id as string)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                            {searchQuery 
                              ? 'No users found matching your search criteria' 
                              : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-400">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="user@example.com" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password <span className="text-red-400">*</span></label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Minimum 8 characters" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    placeholder="First name" 
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
                    placeholder="Last name" 
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select 
                  name="role_id" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.role_id}
                  onChange={handleInputChange}
                >
                  <option value="">No role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="is_active" 
                  name="is_active" 
                  className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                  Active account
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#3d3d3d]">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-[#3d3d3d] rounded-lg hover:bg-[#3d3d3d]"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Invite New User</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowInviteModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="mb-4 text-gray-400 text-sm">
              An invitation email will be sent to the user with instructions to set up their account.
            </p>
            
            <InviteUserForm 
              roles={roles} 
              onInviteSent={() => {
                setShowInviteModal(false);
                // Optionally refresh the user list after invitation is sent
                // fetchUsers();
              }}
              onCancel={() => setShowInviteModal(false)}
            />
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-400">*</span></label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="user@example.com" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password <span className="text-sm font-normal">(leave blank to keep current)</span>
                </label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Change password" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    placeholder="First name" 
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
                    placeholder="Last name" 
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select 
                  name="role_id" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.role_id}
                  onChange={handleInputChange}
                >
                  <option value="">No role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="edit-is_active" 
                  name="is_active" 
                  className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <label htmlFor="edit-is_active" className="ml-2 text-sm text-gray-300">
                  Active account
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#3d3d3d]">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-[#3d3d3d] rounded-lg hover:bg-[#3d3d3d]"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowDetailModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* User info header */}
            <div className="flex items-center mb-6 p-4 bg-[#1c1c1c] rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-xl font-medium">
                  {selectedUser.first_name && selectedUser.last_name 
                    ? `${selectedUser.first_name[0]}${selectedUser.last_name[0]}` 
                    : selectedUser.email.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">
                  {selectedUser.first_name && selectedUser.last_name 
                    ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                    : 'No name provided'}
                </h3>
                <p className="text-gray-400">{selectedUser.email}</p>
                <div className="flex mt-2">
                  {selectedUser.roles && selectedUser.roles.length > 0 && (
                    <span className="mr-2 px-2 py-1 rounded-full text-xs bg-purple-900/30 text-purple-300">
                      {typeof selectedUser.roles[0] === 'string' 
                        ? selectedUser.roles[0] 
                        : (selectedUser.roles[0] as unknown as {name?: string}).name || ''}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedUser.is_active 
                      ? 'bg-green-900/30 text-green-300' 
                      : 'bg-red-900/30 text-red-300'
                  }`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
                  onClick={() => openEditModal(selectedUser)}
                >
                  Edit
                </button>
                <button 
                  className="px-3 py-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg text-sm"
                  onClick={() => selectedUser.id && toggleUserStatus(selectedUser.id, selectedUser.is_active || false)}
                >
                  {selectedUser.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
            
            {/* Tabs for different sections */}
            <div className="border-b border-[#3d3d3d] mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setUserDetailTab('profile')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    userDetailTab === 'profile'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setUserDetailTab('permissions')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    userDetailTab === 'permissions'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Permissions
                </button>
                <button
                  onClick={() => setUserDetailTab('activity')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    userDetailTab === 'activity'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Activity
                </button>
              </nav>
            </div>
            
            {/* Profile Tab */}
            {userDetailTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                  <h3 className="text-md font-medium mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400">User ID</div>
                      <div className="font-mono text-sm mt-1">{selectedUser.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="text-sm mt-1">{selectedUser.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Full Name</div>
                      <div className="text-sm mt-1">
                        {selectedUser.first_name && selectedUser.last_name 
                          ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                          : 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <div className="text-sm mt-1 flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-2 ${
                            selectedUser.is_active ? 'bg-green-400' : 'bg-red-400'
                          }`}
                        ></div>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                  <h3 className="text-md font-medium mb-4">Role & Access</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-400">Assigned Role</div>
                      <div className="text-sm mt-1">
                        {selectedUser.roles && selectedUser.roles.length > 0 
                          ? (typeof selectedUser.roles[0] === 'string' 
                              ? selectedUser.roles[0] 
                              : (selectedUser.roles[0] as unknown as {name?: string}).name || '')
                        : 'No role assigned'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Role Description</div>
                      <div className="text-sm mt-1">
                        {selectedUser.roles && selectedUser.roles.length > 0 && typeof selectedUser.roles[0] !== 'string'
                          ? ((selectedUser.roles[0] as unknown as {description?: string}).description || 'No description available')
                          : 'No description available'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Created On</div>
                      <div className="text-sm mt-1">
                        {selectedUser.created_at 
                          ? new Date(selectedUser.created_at).toLocaleDateString() 
                          : 'Unknown'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Last Login</div>
                      <div className="text-sm mt-1">
                        {selectedUser.last_login 
                          ? new Date(selectedUser.last_login).toLocaleString() 
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Permissions Tab */}
            {userDetailTab === 'permissions' && (
              <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium">User Permissions</h3>
                  {selectedUser.roles && selectedUser.roles.length > 0 && typeof selectedUser.roles[0] !== 'string' && (
                    <span className="text-xs text-gray-400">
                      Inherited from role: <span className="text-purple-400">
                        {(selectedUser.roles[0] as unknown as {name?: string}).name || ''}
                      </span>
                    </span>
                  )}
                </div>
                
                {selectedUser.roles && selectedUser.roles.length > 0 && typeof selectedUser.roles[0] !== 'string' && 
                 (selectedUser.roles[0] as unknown as {permissions?: any[]}).permissions ? (
                  <div>
                    {Object.entries(
                      ((selectedUser.roles[0] as unknown as {permissions?: any[]}).permissions || []).reduce((acc: Record<string, any[]>, perm) => {
                        if (!acc[perm.resource]) {
                          acc[perm.resource] = [];
                        }
                        acc[perm.resource].push(perm);
                        return acc;
                      }, {})
                    ).sort().map(([resourceName, perms]: [string, any[]]) => (
                      <div key={resourceName} className="mb-4">
                        <h4 className="font-medium text-sm capitalize border-b border-[#3d3d3d] pb-1 mb-2">
                          {resourceName}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {perms.map((perm: any) => (
                            <div key={perm.id} className="text-xs text-gray-300 flex items-center">
                              <svg className="h-3 w-3 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {perm.action}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">This user has no permissions</p>
                )}
              </div>
            )}
            
            {/* Activity Tab */}
            {userDetailTab === 'activity' && (
              <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                <h3 className="text-md font-medium mb-4">Recent Activity</h3>
                
                {userActivity.length > 0 ? (
                  <div className="space-y-3">
                    {userActivity.map((activity, index) => (
                      <div key={index} className="p-3 border-b border-[#3d3d3d] last:border-0">
                        <div className="flex items-start">
                          <div className={`mt-1 w-2 h-2 rounded-full mr-3 ${
                            activity.action_type === 'login' ? 'bg-green-400' : 
                            activity.action_type === 'logout' ? 'bg-blue-400' :
                            activity.action_type === 'update' ? 'bg-yellow-400' :
                            activity.action_type === 'create' ? 'bg-purple-400' :
                            activity.action_type === 'delete' ? 'bg-red-400' : 'bg-gray-400'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-400">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {activity.ip_address} - {activity.user_agent?.split('/')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No activity records found for this user</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}