"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Permission, User, InputChangeEvent, FormSubmitEvent, TextareaChangeEvent } from '@/types';

// Define interfaces for the component state
interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
  permissions?: Permission[];
}

interface GroupedPermissions {
  [resource: string]: Permission[];
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewPermissionsModal, setShowViewPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
    is_system_role: false
  });
  const router = useRouter();

  // Fetch roles and permissions on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch current user data
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUser(response.data);
        
        // Check if user has admin permissions
        if (!response.data.is_admin && !response.data.permissions.includes('role:list')) {
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
    
    // Fetch roles
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRoles(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch roles');
        setIsLoading(false);
      }
    };
    
    // Fetch available permissions
    const fetchPermissions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/permissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPermissions(response.data);
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      }
    };
    
    const initializeData = async () => {
      const hasPermission = await fetchCurrentUser();
      if (hasPermission) {
        await Promise.all([fetchRoles(), fetchPermissions()]);
      }
    };
    
    initializeData();
    
  }, [router]);

  // Group permissions by resource for easier management
  const groupedPermissions: GroupedPermissions = permissions.reduce((acc, permission) => {
    // Ensure resource is a valid string, fallback to 'other' if undefined
    const resource = permission.resource || 'other';
    
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as GroupedPermissions);

  // Handle form input changes
  const handleInputChange = (e: InputChangeEvent | TextareaChangeEvent) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Handle permission selection changes
  const handlePermissionChange = (e: InputChangeEvent, permissionId: string) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId]
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(id => id !== permissionId)
      });
    }
  };
  
  // Handle select/deselect all permissions for a resource
  const handleSelectResourcePermissions = (resourceName: string, isSelect: boolean) => {
    if (isSelect) {
      // Add all permissions for this resource that aren't already selected
      // Filter out any undefined IDs to ensure we have only strings
      const permissionIds = groupedPermissions[resourceName]
        .map(p => p.id)
        .filter((id): id is string => id !== undefined);
      
      const newPermissions = [...new Set([...formData.permissions, ...permissionIds])];
      setFormData({
        ...formData,
        permissions: newPermissions
      });
    } else {
      // Remove all permissions for this resource
      const permissionIds = groupedPermissions[resourceName]
        .map(p => p.id)
        .filter((id): id is string => id !== undefined);
        
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(id => !permissionIds.includes(id))
      });
    }
  };
  
  // Handle add role form submission
  const handleAddRole = async (e: FormSubmitEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name) {
      setError('Role name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.post('http://localhost:5000/api/iam/roles', {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        is_system_role: formData.is_system_role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh roles
      setFormData({
        name: '',
        description: '',
        permissions: [],
        is_system_role: false
      });
      setShowAddModal(false);
      
      // Fetch updated roles
      const response = await axios.get('http://localhost:5000/api/iam/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create role');
      }
    }
  };
  
  // Handle edit role form submission
  const handleEditRole = async (e: FormSubmitEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name) {
      setError('Role name is required');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      
      await axios.put(`http://localhost:5000/api/iam/roles/${selectedRole?.id}`, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
        is_system_role: formData.is_system_role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh roles
      setFormData({
        name: '',
        description: '',
        permissions: [],
        is_system_role: false
      });
      setShowEditModal(false);
      setSelectedRole(null);
      
      // Fetch updated roles
      const response = await axios.get('http://localhost:5000/api/iam/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update role');
      }
    }
  };
  
  // Handle role deletion
  const handleDeleteRole = async (roleId: string, isSystemRole?: boolean) => {
    // Prevent deletion of system roles
    if (isSystemRole) {
      setError('System roles cannot be deleted');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.delete(`http://localhost:5000/api/iam/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch updated roles
      const response = await axios.get('http://localhost:5000/api/iam/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRoles(response.data);
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to delete role');
      }
    }
  };
  
  // Open edit modal and populate form with role data
  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    // Make sure permissions.map doesn't include undefined values
    const safePermissionIds = role.permissions 
      ? role.permissions
          .map(p => p.id)
          .filter((id): id is string => id !== undefined)
      : [];
      
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: safePermissionIds,
      is_system_role: role.is_system_role || false
    });
    setShowEditModal(true);
  };
  
  // Open view permissions modal
  const openViewPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setShowViewPermissionsModal(true);
  };

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
      {/* Header */}
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
                  <h1 className="text-2xl font-bold mb-1">Role Management</h1>
                  <p className="text-gray-400">Define and manage roles and permissions</p>
                </div>
                <button 
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center"
                  onClick={() => setShowAddModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Add Role
                </button>
              </div>
              
              {/* Roles table */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1c1c1c] text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">Role Name</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Permissions</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3d3d]">
                      {roles.length > 0 ? (
                        roles.map(role => (
                          <tr key={role.id} className="hover:bg-[#2a2a2a]">
                            <td className="px-6 py-4 font-medium">
                              {role.name}
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {role.description || 'No description'}
                            </td>
                            <td className="px-6 py-4">
                              <span 
                                className={`px-2 py-1 rounded-full text-xs ${
                                  role.is_system_role 
                                    ? 'bg-blue-900/30 text-blue-300' 
                                    : 'bg-purple-900/30 text-purple-300'
                                }`}
                              >
                                {role.is_system_role ? 'System' : 'Custom'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="text-gray-300">
                                  {role.permissions ? role.permissions.length : 0} permissions
                                </span>
                                <button 
                                  className="ml-2 text-blue-400 hover:text-blue-300 text-xs"
                                  onClick={() => openViewPermissionsModal(role)}
                                >
                                  View
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-blue-400 hover:text-blue-300"
                                  onClick={() => openEditModal(role)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className={`text-red-400 hover:text-red-300 ${role.is_system_role ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  onClick={() => handleDeleteRole(role.id, role.is_system_role)}
                                  disabled={role.is_system_role}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                            No roles found
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
      
      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Role</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="e.g. Finance Manager" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  name="description" 
                  placeholder="Role description" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 min-h-[80px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  id="is_system_role" 
                  name="is_system_role" 
                  className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                  checked={formData.is_system_role}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_system_role" className="ml-2 text-sm text-gray-300">
                  System Role (restrict modifications)
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Permissions</label>
                <div className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg p-4">
                  {/* Organize permissions by resource */}
                  {Object.keys(groupedPermissions).sort().map(resourceName => (
                    <div key={resourceName} className="mb-6">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#3d3d3d]">
                        <h3 className="font-medium text-md capitalize">{resourceName}</h3>
                        <div className="flex space-x-2">
                          <button 
                            type="button"
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => handleSelectResourcePermissions(resourceName, true)}
                          >
                            Select All
                          </button>
                          <button 
                            type="button"
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => handleSelectResourcePermissions(resourceName, false)}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {groupedPermissions[resourceName].map(permission => (
                          <div key={permission.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`perm-${permission.id}`} 
                              className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                              checked={permission.id ? formData.permissions.includes(permission.id) : false}
                              onChange={(e) => permission.id && handlePermissionChange(e, permission.id)}
                            />
                            <label htmlFor={`perm-${permission.id}`} className="ml-2 text-sm text-gray-300">
                              {permission.action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Role</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowEditModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="e.g. Finance Manager" 
                  className={`w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 ${
                    selectedRole?.is_system_role ? 'opacity-70' : ''
                  }`}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={selectedRole?.is_system_role}
                />
                {selectedRole?.is_system_role && (
                  <p className="text-yellow-400 text-xs mt-1">System role names cannot be modified</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  name="description" 
                  placeholder="Role description" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 min-h-[80px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  id="edit-is_system_role" 
                  name="is_system_role" 
                  className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                  checked={formData.is_system_role}
                  onChange={handleInputChange}
                  disabled={selectedRole?.is_system_role}
                />
                <label htmlFor="edit-is_system_role" className="ml-2 text-sm text-gray-300">
                  System Role (restrict modifications)
                </label>
                {selectedRole?.is_system_role && (
                  <span className="ml-2 text-yellow-400 text-xs">System role status cannot be changed</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Permissions</label>
                <div className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg p-4">
                  {/* Organize permissions by resource */}
                  {Object.keys(groupedPermissions).sort().map(resourceName => (
                    <div key={resourceName} className="mb-6">
                      <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#3d3d3d]">
                        <h3 className="font-medium text-md capitalize">{resourceName}</h3>
                        <div className="flex space-x-2">
                          <button 
                            type="button"
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => handleSelectResourcePermissions(resourceName, true)}
                          >
                            Select All
                          </button>
                          <button 
                            type="button"
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => handleSelectResourcePermissions(resourceName, false)}
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {groupedPermissions[resourceName].map(permission => (
                          <div key={permission.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`edit-perm-${permission.id}`} 
                              className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                              checked={permission.id ? formData.permissions.includes(permission.id) : false}
                              onChange={(e) => permission.id && handlePermissionChange(e, permission.id)}
                            />
                            <label htmlFor={`edit-perm-${permission.id}`} className="ml-2 text-sm text-gray-300">
                              {permission.action}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Permissions Modal */}
      {showViewPermissionsModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedRole.name} Permissions</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowViewPermissionsModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg p-4">
              {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                <div>
                  {/* Group permissions by resource for display */}
                  {Object.entries(
                    selectedRole.permissions.reduce((acc: Record<string, any[]>, perm) => {
                      const resource = perm.resource || 'other';
                      if (!acc[resource]) {
                        acc[resource] = [];
                      }
                      acc[resource].push(perm);
                      return acc;
                    }, {})
                  ).sort().map(([resourceName, perms]) => (
                    <div key={resourceName} className="mb-4">
                      <h3 className="font-medium text-md capitalize border-b border-[#3d3d3d] pb-1 mb-2">
                        {resourceName}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {perms.map(perm => (
                          <div key={perm.id} className="text-sm text-gray-300 flex items-center">
                            <svg className="h-4 w-4 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <p className="text-gray-400 text-center py-4">This role has no permissions assigned</p>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                type="button" 
                className="px-4 py-2 bg-[#3d3d3d] rounded-lg hover:bg-[#4d4d4d]"
                onClick={() => setShowViewPermissionsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}