'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import UserStatusWidget from '@/components/IAM/UserStatusWidget';
import PermissionHeatmap from '@/components/IAM/PermissionHeatmap';
import RiskScoreGauge from '@/components/IAM/RiskScoreGauge';
import ActivityTimeline from '@/components/IAM/ActivityTimeline';
import { useAuth } from '@/hooks/useAuth';
import { useIamData } from '@/hooks/useIamData';
import { 
  User, 
  StatsCardProps, 
  UserStatusDistribution,
  SecurityMetric,
  PermissionUsage,
  RiskScore,
  AccessRequest
} from '@/types';

// AdminDashboard component
const AdminDashboard = () => {
  // Fetch user status distribution data
  const { data: userStatusData, isLoading: loadingUserStatus, error: userStatusError } = useIamData<UserStatusDistribution>({
    endpoint: 'http://localhost:5000/api/iam/users/status-distribution',
    initialData: { active: 0, inactive: 0, suspended: 0, locked: 0, pending: 0 },
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch permission usage data
  const { data: permissionData, isLoading: loadingPermission } = useIamData<{
    data: PermissionUsage[],
    roles: string[],
    permissions: string[]
  }>({
    endpoint: 'http://localhost:5000/api/iam/permissions/usage',
    initialData: { data: [], roles: [], permissions: [] },
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch risk score data
  const { data: riskScoreData, isLoading: loadingRiskScore } = useIamData<RiskScore>({
    endpoint: 'http://localhost:5000/api/iam/security/risk-score',
    initialData: {
      score: 0,
      previousScore: 0,
      lastUpdated: '',
      factors: []
    },
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch security metrics data
  const { data: securityMetrics, isLoading: loadingSecurityMetrics } = useIamData<SecurityMetric[]>({
    endpoint: 'http://localhost:5000/api/iam/security/metrics',
    initialData: [],
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch recent activity data
  const { data: recentActivities, isLoading: loadingActivities } = useIamData<any[]>({
    endpoint: 'http://localhost:5000/api/iam/activities',
    initialData: [],
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch access requests data
  const { data: accessRequests, isLoading: loadingAccessRequests } = useIamData<AccessRequest[]>({
    endpoint: 'http://localhost:5000/api/iam/access-requests',
    initialData: [],
    refreshInterval: 60000, // Refresh every minute
  });

  // Convert userStatusData to format for UserStatusWidget
  const userStatusChartData = [
    { name: 'Active', value: userStatusData.active, color: '#4ade80' }, // green
    { name: 'Inactive', value: userStatusData.inactive, color: '#94a3b8' }, // slate
    { name: 'Suspended', value: userStatusData.suspended, color: '#f87171' }, // red
    { name: 'Locked', value: userStatusData.locked, color: '#fb923c' }, // orange
    { name: 'Pending', value: userStatusData.pending, color: '#facc15' }, // yellow
  ].filter(item => item.value > 0); // Remove zero values

  // Format activity data for timeline
  const formattedActivities = recentActivities.map((activity, index) => ({
    id: activity.id || index,
    user: activity.user?.email || 'Unknown User',
    action: activity.action_type || 'Unknown Action',
    resource: activity.resource_type || '',
    time: new Date(activity.timestamp).toLocaleString(),
    status: mapStatusToType(activity.status),
    details: activity.description
  }));

  // Helper function to map status to type
  function mapStatusToType(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': case 'failed': return 'danger';
      default: return 'info';
    }
  }

  // Use mocked data if API requests are not implemented
  useEffect(() => {
    if (loadingUserStatus && loadingPermission && loadingRiskScore && loadingSecurityMetrics) {
      console.log('Using mock data for demo purposes');
    }
  }, [loadingUserStatus, loadingPermission, loadingRiskScore, loadingSecurityMetrics]);

  // Mock data for development and demonstration
  const mockUserStatus = [
    { name: 'Active', value: 156, color: '#4ade80' },
    { name: 'Inactive', value: 43, color: '#94a3b8' },
    { name: 'Suspended', value: 12, color: '#f87171' },
    { name: 'Locked', value: 8, color: '#fb923c' },
    { name: 'Pending', value: 37, color: '#facc15' }
  ];

  // Mock data for permission heatmap
  const mockPermissionData = {
    data: [
      { role: 'Admin', permission: 'User:Create', value: 0.9 },
      { role: 'Admin', permission: 'User:Delete', value: 0.4 },
      { role: 'Admin', permission: 'Role:Manage', value: 0.7 },
      { role: 'Manager', permission: 'User:Create', value: 0.6 },
      { role: 'Manager', permission: 'User:Delete', value: 0.1 },
      { role: 'Manager', permission: 'Role:Manage', value: 0.3 },
      { role: 'User', permission: 'User:Create', value: 0 },
      { role: 'User', permission: 'User:Delete', value: 0 },
      { role: 'User', permission: 'Role:Manage', value: 0 }
    ],
    roles: ['Admin', 'Manager', 'User'],
    permissions: ['User:Create', 'User:Delete', 'Role:Manage']
  };

  // Stats cards data
  const statsCardsData: StatsCardProps[] = [
    {
      title: 'Total Users',
      value: userStatusChartData.reduce((sum, item) => sum + item.value, 0) || 256,
      type: 'default',
      trend: { value: 12, isUpward: true }
    },
    {
      title: 'Pending Requests',
      value: accessRequests.filter(req => req.status === 'pending').length || 18,
      type: 'warning',
      trend: { value: 5, isUpward: true }
    },
    {
      title: 'Security Score',
      value: `${riskScoreData.score || 86}/100`,
      type: riskScoreData.score > 80 ? 'success' : riskScoreData.score > 60 ? 'warning' : 'danger',
      trend: { 
        value: Math.abs((riskScoreData.score || 0) - (riskScoreData.previousScore || 0)), 
        isUpward: (riskScoreData.score || 0) > (riskScoreData.previousScore || 0) 
      }
    },
    {
      title: 'Critical Alerts',
      value: securityMetrics.filter(metric => metric.status === 'critical').length || 2,
      type: 'danger',
      trend: { value: 50, isUpward: false }
    }
  ];

  const pendingAccessRequests = (accessRequests.length > 0 ? accessRequests : [
    {
      id: '1',
      userId: 'user1',
      userName: 'Jane Smith',
      resourceType: 'Role',
      resourceName: 'Finance Manager',
      requestDate: '2025-04-28T10:00:00Z',
      status: 'pending',
      justification: 'Need access for quarterly financial review'
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'John Doe',
      resourceType: 'Application',
      resourceName: 'HR System',
      requestDate: '2025-04-27T14:30:00Z',
      status: 'pending',
      justification: 'Taking over onboarding responsibilities'
    }
  ]).filter(req => req.status === 'pending');

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">IAM Admin Dashboard</h1>
        <p className="text-gray-400">Identity & Access Management Overview • <span className="text-green-400">System Status: Operational</span></p>
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCardsData.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            type={stat.type}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Main dashboard panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Status Distribution */}
        <div>
          <UserStatusWidget 
            data={userStatusChartData.length > 0 ? userStatusChartData : mockUserStatus} 
            title="User Status Distribution"
          />
        </div>

        {/* Permission Usage Heatmap */}
        <div>
          <PermissionHeatmap 
            data={permissionData.data.length > 0 ? permissionData.data : mockPermissionData.data}
            roles={permissionData.roles.length > 0 ? permissionData.roles : mockPermissionData.roles}
            permissions={permissionData.permissions.length > 0 ? permissionData.permissions : mockPermissionData.permissions}
            title="Permission Usage Heatmap"
          />
        </div>

        {/* Risk Score Gauge */}
        <div>
          <RiskScoreGauge 
            score={riskScoreData.score || 86}
            previousScore={riskScoreData.previousScore || 81}
            threshold={{ low: 30, medium: 70, high: 90 }}
            title="Security Risk Score"
          />
        </div>
      </div>

      {/* Bottom grid: Pending Access Requests + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Access Requests */}
        <div className="lg:col-span-1">
          <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
              <h2 className="font-semibold text-lg">Pending Access Requests</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                View All
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {pendingAccessRequests.length > 0 ? (
                  pendingAccessRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-[#1c1c1c] rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{request.userName}</span>
                        <span className="text-xs text-yellow-400 px-2 py-1 bg-yellow-900/30 rounded-full">Pending</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        Requesting access to <span className="text-white">{request.resourceName}</span> ({request.resourceType})
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        "{request.justification}"
                      </p>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
                          Approve
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                          Deny
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No pending access requests
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline 
            activities={formattedActivities.length > 0 ? formattedActivities : [
              {
                id: 1,
                user: 'admin@example.com',
                action: 'Created',
                resource: 'new user account',
                time: '10 minutes ago',
                status: 'success',
                details: 'Created account for john.doe@company.com'
              },
              {
                id: 2,
                user: 'system',
                action: 'Detected',
                resource: 'suspicious login attempt',
                time: '45 minutes ago',
                status: 'danger',
                details: 'Multiple failed login attempts from 203.0.113.42'
              },
              {
                id: 3,
                user: 'jane.smith@company.com',
                action: 'Requested',
                resource: 'role change',
                time: '2 hours ago',
                status: 'warning',
                details: 'Requested promotion to Senior Developer role'
              },
              {
                id: 4,
                user: 'admin@example.com',
                action: 'Modified',
                resource: 'permission policy',
                time: '3 hours ago',
                status: 'info',
                details: 'Updated file access permissions for Marketing group'
              }
            ]}
            title="Recent Activity"
            maxItems={5}
            showViewAll={true}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>
    </div>
  );
};

// UserDashboard component
const UserDashboard = () => {
  const { user } = useAuth();
  
  // Safely access user ID with fallback
  const userId = user?.id || 0;
  
  // Fetch user's activity data
  const { data: userActivities, isLoading: loadingActivities } = useIamData<any[]>({
    endpoint: `http://localhost:5000/api/iam/activities/user/${userId}`,
    initialData: [],
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch user's access requests
  const { data: userAccessRequests, isLoading: loadingAccessRequests } = useIamData<AccessRequest[]>({
    endpoint: `http://localhost:5000/api/iam/access-requests/user/${userId}`,
    initialData: [],
    refreshInterval: 60000, // Refresh every minute
  });

  // Fetch user's risk score
  const { data: userRiskScore, isLoading: loadingRiskScore } = useIamData<{
    score: number;
    previousScore?: number;
    lastUpdated: string;
  }>({
    endpoint: `http://localhost:5000/api/iam/security/user-risk/${userId}`,
    initialData: { score: 0, previousScore: 0, lastUpdated: '' },
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  // Format user activity data for timeline
  const formattedUserActivities = userActivities.map((activity, index) => ({
    id: activity.id || index,
    user: activity.user?.email || user?.email || 'You',
    action: activity.action_type || 'Unknown Action',
    resource: activity.resource_type || '',
    time: new Date(activity.timestamp).toLocaleString(),
    status: mapStatusToType(activity.status),
    details: activity.description
  }));

  // Helper function to map status to type
  function mapStatusToType(status: string): 'success' | 'warning' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': case 'failed': return 'danger';
      default: return 'info';
    }
  }

  // Mock data for user dashboard development
  const mockUserActivities = [
    {
      id: 1,
      user: user?.email || 'You',
      action: 'Logged in',
      resource: 'Ixion IAM System',
      time: '5 minutes ago',
      status: 'success' as const,
      details: 'Successful login from usual location'
    },
    {
      id: 2,
      user: user?.email || 'You',
      action: 'Accessed',
      resource: 'Financial Reports',
      time: '2 hours ago',
      status: 'info' as const,
      details: 'Viewed Q1 financial summary'
    },
    {
      id: 3,
      user: user?.email || 'You',
      action: 'Requested',
      resource: 'role access',
      time: 'Yesterday, 3:42 PM',
      status: 'warning' as const,
      details: 'Requested access to Project Manager role'
    },
    {
      id: 4,
      user: user?.email || 'You',
      action: 'Changed',
      resource: 'password',
      time: '3 days ago',
      status: 'success' as const,
      details: 'Password updated successfully'
    }
  ];

  // User's permissions and access list
  const userPermissions = user?.permissions || [];
  const mockAccessList = [
    { type: 'Application', name: 'Email System', status: 'active', lastUsed: '12 minutes ago' },
    { type: 'Application', name: 'CRM System', status: 'active', lastUsed: '2 days ago' },
    { type: 'Role', name: 'Marketing Specialist', status: 'active', lastUsed: 'Current' },
    { type: 'Resource', name: 'Marketing Assets Folder', status: 'active', lastUsed: '5 days ago' },
    { type: 'Resource', name: 'Customer Data', status: 'active', lastUsed: '3 weeks ago' },
  ];

  // Stats for user dashboard
  const userStats = [
    {
      title: 'Security Score',
      value: userRiskScore.score || 92,
      type: (userRiskScore.score || 92) > 80 ? 'success' : 'warning',
      trend: { 
        value: Math.abs((userRiskScore.score || 92) - (userRiskScore.previousScore || 90)), 
        isUpward: (userRiskScore.score || 92) > (userRiskScore.previousScore || 90) 
      }
    },
    {
      title: 'Last Password Change',
      value: '14 days ago',
      type: 'default'
    },
    {
      title: 'Access Requests',
      value: userAccessRequests.length || 1,
      type: userAccessRequests.filter(r => r.status === 'pending').length > 0 ? 'warning' : 'success'
    },
    {
      title: 'MFA Status',
      value: user?.mfa_enabled ? 'Enabled' : 'Disabled',
      type: user?.mfa_enabled ? 'success' : 'danger'
    }
  ];

  // If user is not properly loaded, don't try to render components that depend on user data
  if (!user || !user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="text-center">
          <p className="text-lg mb-4">Loading user data...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.first_name || user?.email?.split('@')[0] || 'User'}</h1>
        <p className="text-gray-400">Personal Security Dashboard • <span className="text-green-400">Your account is secure</span></p>
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userStats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            type={stat.type as 'default' | 'success' | 'warning' | 'danger'}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Main dashboard panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Risk Score */}
        <div>
          <RiskScoreGauge 
            score={userRiskScore.score || 92}
            previousScore={userRiskScore.previousScore || 90}
            threshold={{ low: 30, medium: 70, high: 90 }}
            title="Your Security Score"
          />
        </div>

        {/* Access Requests */}
        <div className="lg:col-span-2">
          <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
              <h2 className="font-semibold text-lg">Your Access Requests</h2>
              <button className="text-sm text-purple-400 hover:text-purple-300">
                New Request
              </button>
            </div>
            <div className="p-4">
              {userAccessRequests.length > 0 ? (
                <div className="space-y-4">
                  {userAccessRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-[#1c1c1c] rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{request.resourceName}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'approved' 
                            ? 'bg-green-900/30 text-green-400'
                            : request.status === 'denied'
                            ? 'bg-red-900/30 text-red-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {request.resourceType} • Requested on {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      {request.status !== 'pending' && (
                        <p className="text-xs text-gray-400">
                          {request.status === 'approved' 
                            ? `Approved by ${request.approver} on ${new Date(request.approvalDate || '').toLocaleDateString()}`
                            : `Denied by ${request.approver} on ${new Date(request.approvalDate || '').toLocaleDateString()}`
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[#1c1c1c] rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Project Manager Role</span>
                      <span className="text-xs text-yellow-400 px-2 py-1 bg-yellow-900/30 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      Role • Requested on Apr 28, 2025
                    </p>
                  </div>
                  <div className="text-center mt-4">
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      Request New Access
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid: Current Access + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Access */}
        <div className="lg:col-span-1">
          <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#3d3d3d]">
              <h2 className="font-semibold text-lg">Your Access</h2>
            </div>
            <div className="p-4">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-[#3d3d3d]">
                  <thead className="bg-[#1c1c1c]">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Resource
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Last Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#252525] divide-y divide-[#3d3d3d]">
                    {mockAccessList.map((access, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{access.name}</div>
                          <div className="text-xs text-gray-400">{access.type}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {access.lastUsed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <ActivityTimeline 
            activities={formattedUserActivities.length > 0 ? formattedUserActivities : mockUserActivities}
            title="Your Recent Activity"
            maxItems={5}
            showViewAll={true}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading, isAdmin } = useAuth();
  
  const router = useRouter();

  // Sidebar links with all the IAM features mentioned on the landing page
  const sidebarLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/dashboard/users' },
    { label: 'Roles', href: '/dashboard/roles' },
    { label: 'Access Requests', href: '/dashboard/access-requests' },
    { label: 'Activity', href: '/dashboard/activity' },
    { label: 'Settings', href: '/dashboard/settings' },
    { label: 'Profile', href: '/dashboard/profile' }
  ];

  // Only show certain links based on user role
  const filteredLinks = isAdmin 
    ? sidebarLinks 
    : sidebarLinks.filter(link => 
        !['/dashboard/users', '/dashboard/roles'].includes(link.href)
      );

  useEffect(() => {
    // Add proper cleanup to prevent state updates after unmounting
    let isMounted = true;
    
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (isMounted) {
        setUserName(user.email || '');
        setIsLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Add extra guard to ensure user exists before rendering the dashboard
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="text-center">
          <p className="text-lg mb-4">Session expired or not logged in</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Header with user info and logout */}
      <Header showLogout userName={userName} />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar navigation with enhanced IAM options */}
        <Sidebar links={filteredLinks} />
        
        {/* Main dashboard content - Adjusted margin-top to match the new sidebar position */}
        <main className="flex-1 p-6 ml-64 mt-8 overflow-y-auto h-[calc(100vh-5.5rem)]">
          {error ? (
            <div className="p-4 mb-6 bg-red-900/30 border border-red-800 text-red-300 rounded-lg">
              {error}
            </div>
          ) : (
            isAdmin ? <AdminDashboard /> : <UserDashboard />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardContent;