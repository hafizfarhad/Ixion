'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Define interfaces for type safety
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  permissions?: string[];
}

interface Resource {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface AccessRequest {
  id: string;
  requester: User;
  resource_type: string;
  resource_id?: string;
  access_level: string;
  justification: string;
  is_temporary: boolean;
  expiry_date?: string;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  approval_date?: string;
  approver?: User | null; // Updated to allow null
  approver_notes?: string | null; // Updated to allow null
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [requestNote, setRequestNote] = useState('');
  const [formData, setFormData] = useState({
    resource_type: '',
    resource_id: '',
    access_level: '',
    justification: '',
    duration: 'permanent', // permanent, temporary
    expiry_date: '',
    comments: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    resourceType: '',
    search: ''
  });
  
  const router = useRouter();

  // Fetch requests on initial load
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
        setIsAdmin(response.data.is_admin || response.data.permissions?.includes('request:approve'));
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
    
    // Fetch access requests
    const fetchAccessRequests = async () => {
      try {
        // If user is admin, fetch all requests, otherwise fetch only their own
        const url = isAdmin ? 
          'http://localhost:5000/api/iam/access-requests' : 
          'http://localhost:5000/api/iam/access-requests/my-requests';
          
        const response = await axios.get<AccessRequest[]>(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setRequests(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch access requests');
        setIsLoading(false);
      }
    };
    
    // Fetch available resources
    const fetchResources = async () => {
      try {
        const response = await axios.get<Resource[]>('http://localhost:5000/api/iam/resources', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      }
    };
    
    const initializeData = async () => {
      const userFetched = await fetchCurrentUser();
      if (userFetched) {
        await Promise.all([fetchAccessRequests(), fetchResources()]);
      }
    };
    
    initializeData();
    
  }, [router, isAdmin]);

  // Filter requests based on activeTab and search filters
  const filteredRequests = requests.filter(request => {
    // First filter by tab (status)
    if (activeTab === 'pending' && request.status !== 'pending') return false;
    if (activeTab === 'approved' && request.status !== 'approved') return false;
    if (activeTab === 'rejected' && request.status !== 'rejected') return false;
    if (activeTab === 'all' && filters.status && request.status !== filters.status) return false;
    
    // Then filter by resource type
    if (filters.resourceType && request.resource_type !== filters.resourceType) return false;
    
    // Finally, filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const requestData = `${request.requester?.email || ''} ${request.resource_type || ''} ${request.justification || ''}`.toLowerCase();
      return requestData.includes(searchTerm);
    }
    
    return true;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Open request detail modal
  const openDetailModal = (request: AccessRequest) => {
    setSelectedRequest(request);
    setRequestNote('');
    setShowDetailModal(true);
  };
  
  // Submit a new access request
  const handleSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.resource_type || !formData.access_level || !formData.justification) {
      setError('Please fill out all required fields');
      return;
    }
    
    // For temporary access, require expiry date
    if (formData.duration === 'temporary' && !formData.expiry_date) {
      setError('Please specify an expiry date for temporary access');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      
      // Prepare request data
      const requestData = {
        resource_type: formData.resource_type,
        resource_id: formData.resource_id || null,
        access_level: formData.access_level,
        justification: formData.justification,
        is_temporary: formData.duration === 'temporary',
        expiry_date: formData.duration === 'temporary' ? formData.expiry_date : null,
        comments: formData.comments || null
      };
      
      await axios.post('http://localhost:5000/api/iam/access-requests', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and close modal
      setFormData({
        resource_type: '',
        resource_id: '',
        access_level: '',
        justification: '',
        duration: 'permanent',
        expiry_date: '',
        comments: ''
      });
      setShowNewRequestModal(false);
      
      // Refresh requests
      const response = await axios.get(
        isAdmin ? 'http://localhost:5000/api/iam/access-requests' : 'http://localhost:5000/api/iam/access-requests/my-requests', 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRequests(response.data);
      
    } catch (err: unknown) {
      let errorMessage = 'Failed to submit access request';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    }
  };
  
  // Approve access request
  const handleApproveRequest = async () => {
    if (!isAdmin || !selectedRequest) return;
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.post(`http://localhost:5000/api/iam/access-requests/${selectedRequest.id}/approve`, 
        { notes: requestNote || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'approved' as const, approver: currentUser, approval_date: new Date().toISOString(), approver_notes: requestNote || null } 
          : req
      ));
      
      // Close modal
      setShowDetailModal(false);
      setSelectedRequest(null);
      
    } catch (err: unknown) {
      let errorMessage = 'Failed to approve request';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    }
  };
  
  // Reject access request
  const handleRejectRequest = async () => {
    if (!isAdmin || !selectedRequest) return;
    
    if (!requestNote) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.post(`http://localhost:5000/api/iam/access-requests/${selectedRequest.id}/reject`, 
        { notes: requestNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected' as const, approver: currentUser, approval_date: new Date().toISOString(), approver_notes: requestNote } 
          : req
      ));
      
      // Close modal
      setShowDetailModal(false);
      setSelectedRequest(null);
      
    } catch (err: unknown) {
      let errorMessage = 'Failed to reject request';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    }
  };
  
  // Cancel access request (only requester can cancel their pending requests)
  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this access request?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.post(`http://localhost:5000/api/iam/access-requests/${requestId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setRequests(requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'cancelled' as const } 
          : req
      ));
      
    } catch (err: unknown) {
      let errorMessage = 'Failed to cancel request';
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    }
  };
  
  // Get badge color based on status
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-blue-900/30 text-blue-300';
      case 'approved':
        return 'bg-green-900/30 text-green-300';
      case 'rejected':
        return 'bg-red-900/30 text-red-300';
      case 'cancelled':
        return 'bg-gray-900/30 text-gray-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
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
            { label: 'Access Requests', href: '/dashboard/access-requests' },
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
                  <h1 className="text-2xl font-bold mb-1">Access Requests</h1>
                  <p className="text-gray-400">Manage and track access requests across your organization</p>
                </div>
                <button 
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center"
                  onClick={() => setShowNewRequestModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  New Request
                </button>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-[#3d3d3d]">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'pending'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Pending
                    {requests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-full text-xs">
                        {requests.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('approved')}
                    className={`py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'approved'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'rejected'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`py-4 text-sm font-medium border-b-2 ${
                      activeTab === 'all'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    All Requests
                  </button>
                </nav>
              </div>
              
              {/* Filters - only show in "All" tab */}
              {activeTab === 'all' && (
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select 
                        name="status"
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Resource Type</label>
                      <select 
                        name="resourceType"
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={filters.resourceType}
                        onChange={handleFilterChange}
                      >
                        <option value="">All Resources</option>
                        <option value="role">Role</option>
                        <option value="permission">Permission</option>
                        <option value="application">Application</option>
                        <option value="group">Group</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="search"
                          placeholder="Search by requester, resource..."
                          className="w-full bg-[#1c1c1c] border border-[#3d3d3d] text-white py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:border-purple-500"
                          value={filters.search}
                          onChange={handleFilterChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Access requests table */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1c1c1c] text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Requester</th>
                        <th className="px-6 py-3 text-left">Resource</th>
                        <th className="px-6 py-3 text-left">Access Level</th>
                        <th className="px-6 py-3 text-left">Requested</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3d3d]">
                      {filteredRequests.length > 0 ? (
                        filteredRequests.map(request => (
                          <tr key={request.id} className="hover:bg-[#2a2a2a]">
                            <td className="px-6 py-4 text-sm font-mono">
                              {request.id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                                  {request.requester?.email.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm">{request.requester?.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium capitalize">{request.resource_type}</div>
                                {request.resource_id && (
                                  <div className="text-xs text-gray-400">ID: {request.resource_id}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {request.access_level}
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {new Date(request.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(request.status)}`}>
                                {request.status}
                              </span>
                              {request.is_temporary && (
                                <span className="ml-2 text-xs text-gray-400">(Temporary)</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-3">
                                <button 
                                  className="text-blue-400 hover:text-blue-300 text-sm"
                                  onClick={() => openDetailModal(request)}
                                >
                                  View
                                </button>
                                
                                {/* Only show approve/reject for pending requests and admin users */}
                                {isAdmin && request.status === 'pending' && (
                                  <>
                                    <button 
                                      className="text-green-400 hover:text-green-300 text-sm"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setRequestNote('');
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      Approve
                                    </button>
                                    <button 
                                      className="text-red-400 hover:text-red-300 text-sm"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setRequestNote('');
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                
                                {/* Only show cancel for pending requests and the requester */}
                                {request.status === 'pending' && request.requester?.id === currentUser?.id && (
                                  <button 
                                    className="text-gray-400 hover:text-gray-300 text-sm"
                                    onClick={() => handleCancelRequest(request.id)}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                            No access requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Statistics for admins */}
              {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                    <div className="text-sm text-gray-400">Pending Requests</div>
                    <div className="text-2xl font-bold mt-1 text-blue-400">
                      {requests.filter(r => r.status === 'pending').length}
                    </div>
                  </div>
                  
                  <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                    <div className="text-sm text-gray-400">Approved (Last 30 Days)</div>
                    <div className="text-2xl font-bold mt-1 text-green-400">
                      {requests.filter(r => 
                        r.status === 'approved' && 
                        r.approval_date && new Date(r.approval_date) >= new Date(new Date().setDate(new Date().getDate() - 30))
                      ).length}
                    </div>
                  </div>
                  
                  <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                    <div className="text-sm text-gray-400">Average Resolution Time</div>
                    <div className="text-2xl font-bold mt-1 text-purple-400">
                      {requests.length > 0 ? '24 hours' : '-'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">New Access Request</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowNewRequestModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Resource Type <span className="text-red-400">*</span>
                </label>
                <select 
                  name="resource_type" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.resource_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Resource Type</option>
                  <option value="role">Role</option>
                  <option value="permission">Permission</option>
                  <option value="application">Application</option>
                  <option value="group">Group</option>
                </select>
              </div>
              
              {formData.resource_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Specific Resource
                  </label>
                  <select 
                    name="resource_id" 
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    value={formData.resource_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Any {formData.resource_type}</option>
                    {resources
                      .filter(resource => resource.type === formData.resource_type)
                      .map(resource => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">
                    Leave blank to request access to all resources of this type
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Access Level <span className="text-red-400">*</span>
                </label>
                <select 
                  name="access_level" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                  value={formData.access_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Access Level</option>
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Duration
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="permanent" 
                      name="duration" 
                      value="permanent"
                      checked={formData.duration === 'permanent'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="permanent" className="text-sm text-gray-300">
                      Permanent access
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="temporary" 
                      name="duration" 
                      value="temporary"
                      checked={formData.duration === 'temporary'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="temporary" className="text-sm text-gray-300">
                      Temporary access
                    </label>
                  </div>
                </div>
              </div>
              
              {formData.duration === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="expiry_date" 
                    className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required={formData.duration === 'temporary'}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Justification <span className="text-red-400">*</span>
                </label>
                <textarea 
                  name="justification" 
                  placeholder="Why do you need this access?" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 min-h-[80px]"
                  value={formData.justification}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Additional Comments
                </label>
                <textarea 
                  name="comments" 
                  placeholder="Any additional information to support your request" 
                  className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 min-h-[60px]"
                  value={formData.comments}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#3d3d3d]">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-[#3d3d3d] rounded-lg hover:bg-[#3d3d3d]"
                  onClick={() => setShowNewRequestModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Access Request Details</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowDetailModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Request summary header */}
            <div className="bg-[#1c1c1c] rounded-lg p-4 mb-6 border border-[#3d3d3d]">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs mr-3 ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                    <span className="text-gray-400 text-sm">
                      Requested on {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium capitalize">
                    {selectedRequest.access_level} access to {selectedRequest.resource_type}
                    {selectedRequest.resource_id ? ` (ID: ${selectedRequest.resource_id})` : ''}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Request ID</div>
                  <div className="font-mono">{selectedRequest.id.substring(0, 8)}</div>
                </div>
              </div>
            </div>
            
            {/* Request details */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">Requester</p>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                      {selectedRequest.requester?.email.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">
                      {selectedRequest.requester?.email}
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">Duration</p>
                  <p className="font-medium">
                    {selectedRequest.is_temporary 
                      ? `Temporary (until ${selectedRequest.expiry_date ? new Date(selectedRequest.expiry_date).toLocaleDateString() : 'unknown date'})` 
                      : 'Permanent'}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                <p className="text-sm text-gray-400 mb-1">Justification</p>
                <p className="whitespace-pre-wrap">{selectedRequest.justification}</p>
              </div>
              
              {selectedRequest.comments && (
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">Additional Comments</p>
                  <p className="whitespace-pre-wrap">{selectedRequest.comments}</p>
                </div>
              )}
              
              {selectedRequest.status !== 'pending' && (
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">Decision Details</p>
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Decision by: </span>
                    <span className="font-medium">{selectedRequest.approver?.email || 'System'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Date: </span>
                    <span className="font-medium">
                      {selectedRequest.approval_date 
                        ? new Date(selectedRequest.approval_date).toLocaleString() 
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedRequest.approver_notes && (
                    <div>
                      <span className="text-sm text-gray-400">Notes: </span>
                      <p className="mt-1 whitespace-pre-wrap">{selectedRequest.approver_notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Admin actions for pending requests */}
              {isAdmin && selectedRequest.status === 'pending' && (
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm font-medium mb-2">Decision</p>
                  <textarea 
                    placeholder="Add notes about your decision (required for rejections)" 
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500 min-h-[80px] mb-4"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                  />
                  <div className="flex justify-end space-x-3">
                    <button 
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                      onClick={handleRejectRequest}
                    >
                      Reject
                    </button>
                    <button 
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
                      onClick={handleApproveRequest}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {!(isAdmin && selectedRequest.status === 'pending') && (
              <div className="flex justify-end mt-6">
                <button 
                  className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}