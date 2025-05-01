'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { User, ActivityLog, InputChangeEvent, SelectChangeEvent } from '@/types';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    actionType: '',
    userId: '',
    resource: '',
    status: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 50
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  
  const router = useRouter();

  // Fetch activity logs on initial load and when filters change
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    // Check user permissions
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/iam/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentUser(response.data);
        
        // Check if user has admin permissions
        if (!response.data.is_admin && !response.data.permissions.includes('activity:list')) {
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
    
    // Fetch activity logs with filters
    const fetchActivityLogs = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        });
        
        if (filters.actionType) queryParams.append('action_type', filters.actionType);
        if (filters.userId) queryParams.append('user_id', filters.userId);
        if (filters.resource) queryParams.append('resource', filters.resource);
        if (filters.status) queryParams.append('status', filters.status);
        if (searchQuery) queryParams.append('search', searchQuery);
        
        const response = await axios.get(`http://localhost:5000/api/iam/activity?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setLogs(response.data.logs || []);
        setPagination({
          ...pagination,
          totalPages: Math.ceil(response.data.total / pagination.limit)
        });
        setIsLoading(false);
      } catch (err) {
        setError('Failed to fetch activity logs');
        setIsLoading(false);
      }
    };
    
    const initializeData = async () => {
      const hasPermission = await fetchCurrentUser();
      if (hasPermission) {
        await fetchActivityLogs();
      }
    };
    
    initializeData();
    
  }, [router, pagination.page, pagination.limit, dateRange, filters, searchQuery]);

  // Handle date range changes
  const handleDateRangeChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };

  // Handle filter changes
  const handleFilterChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    // Reset to first page when filters change
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when search changes
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        page: newPage
      });
    }
  };

  // Show log detail modal
  const showLogDetail = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Handle export functionality
  const handleExport = async () => {
    const token = localStorage.getItem('jwtToken');
    
    try {
      const queryParams = new URLSearchParams({
        format: exportFormat,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      });
      
      if (filters.actionType) queryParams.append('action_type', filters.actionType);
      if (filters.userId) queryParams.append('user_id', filters.userId);
      if (filters.resource) queryParams.append('resource', filters.resource);
      if (filters.status) queryParams.append('status', filters.status);
      if (searchQuery) queryParams.append('search', searchQuery);
      
      const response = await axios.get(
        `http://localhost:5000/api/iam/activity/export?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      setShowExportOptions(false);
    } catch (err) {
      setError('Failed to export logs');
    }
  };

  // Get CSS class for activity type
  const getActivityTypeClass = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'login':
        return 'bg-green-900/30 text-green-300';
      case 'logout':
        return 'bg-blue-900/30 text-blue-300';
      case 'create':
        return 'bg-purple-900/30 text-purple-300';
      case 'update':
        return 'bg-yellow-900/30 text-yellow-300';
      case 'delete':
        return 'bg-red-900/30 text-red-300';
      case 'read':
        return 'bg-gray-900/30 text-gray-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  // Get status indicator class
  const getStatusClass = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-400';
      case 'failure':
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
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
                  <h1 className="text-2xl font-bold mb-1">Activity Logs</h1>
                  <p className="text-gray-400">Track and analyze user actions across your system</p>
                </div>
                
                {/* Export button with dropdown */}
                <div className="relative">
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center"
                    onClick={() => setShowExportOptions(!showExportOptions)}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  
                  {showExportOptions && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#252525] ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-gray-400 uppercase">Export Format</div>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${exportFormat === 'csv' ? 'text-purple-400' : 'text-gray-300 hover:bg-[#3d3d3d]'}`}
                          onClick={() => setExportFormat('csv')}
                        >
                          CSV
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${exportFormat === 'json' ? 'text-purple-400' : 'text-gray-300 hover:bg-[#3d3d3d]'}`}
                          onClick={() => setExportFormat('json')}
                        >
                          JSON
                        </button>
                        <button 
                          className={`w-full text-left px-4 py-2 text-sm ${exportFormat === 'pdf' ? 'text-purple-400' : 'text-gray-300 hover:bg-[#3d3d3d]'}`}
                          onClick={() => setExportFormat('pdf')}
                        >
                          PDF
                        </button>
                        <div className="border-t border-[#3d3d3d] my-1"></div>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#3d3d3d]"
                          onClick={handleExport}
                        >
                          Download {exportFormat.toUpperCase()}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Filters section */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                <h2 className="text-lg font-medium mb-4">Filters</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate"
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input 
                      type="date" 
                      name="endDate"
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Action Type</label>
                    <select 
                      name="actionType"
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                      value={filters.actionType}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Actions</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                      <option value="create">Create</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                      <option value="read">Read</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select 
                      name="status"
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Status</option>
                      <option value="success">Success</option>
                      <option value="failure">Failure</option>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Resource</label>
                    <select 
                      name="resource"
                      className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                      value={filters.resource}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Resources</option>
                      <option value="user">User</option>
                      <option value="role">Role</option>
                      <option value="permission">Permission</option>
                      <option value="policy">Policy</option>
                      <option value="group">Group</option>
                      <option value="application">Application</option>
                      <option value="session">Session</option>
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
                        placeholder="Search by user, IP, description..."
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] text-white py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:border-purple-500"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Activity logs table */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1c1c1c] text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-left">Timestamp</th>
                        <th className="px-6 py-3 text-left">User</th>
                        <th className="px-6 py-3 text-left">Action</th>
                        <th className="px-6 py-3 text-left">Resource</th>
                        <th className="px-6 py-3 text-left">IP Address</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3d3d3d]">
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <tr key={log.id || index} className="hover:bg-[#2a2a2a]">
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                                  {log.user?.email.substring(0, 2).toUpperCase() || 'SY'}
                                </div>
                                <span className="text-sm">{log.user?.email || 'System'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${getActivityTypeClass(log.action_type)}`}>
                                {log.action_type || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {log.resource_type ? (
                                <span className="capitalize">{log.resource_type}</span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-mono">
                              {log.ip_address || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div 
                                  className={`w-2 h-2 rounded-full mr-2 ${getStatusClass(log.status)}`}
                                ></div>
                                <span className="text-sm capitalize">{log.status || 'Unknown'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                onClick={() => showLogDetail(log)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                            No activity logs found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {logs.length > 0 && (
                  <div className="flex justify-between items-center px-6 py-3 bg-[#1c1c1c] border-t border-[#3d3d3d]">
                    <div className="text-sm text-gray-400">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, logs.length + ((pagination.page - 1) * pagination.limit))}
                      </span>{' '}
                      of many results
                    </div>
                    <div className="flex space-x-1">
                      <button
                        className={`px-2 py-1 rounded ${
                          pagination.page === 1
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:bg-[#3d3d3d]'
                        }`}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            className={`px-3 py-1 rounded ${
                              pagination.page === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-300 hover:bg-[#3d3d3d]'
                            }`}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        className={`px-2 py-1 rounded ${
                          pagination.page === pagination.totalPages
                            ? 'text-gray-500 cursor-not-allowed'
                            : 'text-gray-300 hover:bg-[#3d3d3d]'
                        }`}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Summary statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                  <div className="text-sm text-gray-400">Total Events</div>
                  <div className="text-2xl font-bold mt-1">{logs.length}</div>
                </div>
                
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                  <div className="text-sm text-gray-400">Successful Events</div>
                  <div className="text-2xl font-bold mt-1 text-green-400">
                    {logs.filter(log => log.status === 'success').length}
                  </div>
                </div>
                
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                  <div className="text-sm text-gray-400">Failed Events</div>
                  <div className="text-2xl font-bold mt-1 text-red-400">
                    {logs.filter(log => log.status === 'failure' || log.status === 'error').length}
                  </div>
                </div>
                
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4">
                  <div className="text-sm text-gray-400">Unique Users</div>
                  <div className="text-2xl font-bold mt-1 text-purple-400">
                    {new Set(logs.map(log => log.user?.id).filter(Boolean)).size}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Log Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#252525] border border-[#3d3d3d] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Details</h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowDetailModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Event summary */}
            <div className="bg-[#1c1c1c] rounded-lg p-4 mb-6 border border-[#3d3d3d]">
              <div className="flex items-center mb-3">
                <span className={`px-2 py-1 rounded-full text-xs mr-3 ${getActivityTypeClass(selectedLog.action_type)}`}>
                  {selectedLog.action_type || 'Unknown'}
                </span>
                <span className="text-gray-400 text-sm">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-md font-medium">{selectedLog.description || 'No description available'}</p>
            </div>
            
            {/* Event details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">User</p>
                  <p className="font-medium">
                    {selectedLog.user?.email || 'System'}
                  </p>
                </div>
                
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <div className="flex items-center">
                    <div 
                      className={`w-2 h-2 rounded-full mr-2 ${getStatusClass(selectedLog.status)}`}
                    ></div>
                    <span className="font-medium capitalize">{selectedLog.status || 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">IP Address</p>
                  <p className="font-medium font-mono">
                    {selectedLog.ip_address || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-1">User Agent</p>
                  <p className="font-medium text-sm truncate">
                    {selectedLog.user_agent || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                <p className="text-sm text-gray-400 mb-1">Resource</p>
                <div className="flex items-center">
                  <span className="font-medium capitalize">
                    {selectedLog.resource_type || 'N/A'}
                  </span>
                  {selectedLog.resource_id && (
                    <span className="ml-2 text-sm text-gray-400">
                      ID: {selectedLog.resource_id}
                    </span>
                  )}
                </div>
              </div>
              
              {selectedLog.details && (
                <div className="bg-[#1c1c1c] rounded-lg p-4 border border-[#3d3d3d]">
                  <p className="text-sm text-gray-400 mb-2">Additional Details</p>
                  <pre className="text-xs overflow-x-auto bg-[#121212] p-3 rounded-lg">
                    {typeof selectedLog.details === 'object' 
                      ? JSON.stringify(selectedLog.details, null, 2) 
                      : selectedLog.details}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                className="px-4 py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded-lg"
                onClick={() => setShowDetailModal(false)}
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