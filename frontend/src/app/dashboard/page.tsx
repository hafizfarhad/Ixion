'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import ChartCard from '@/components/ChartCard';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/protected', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract email and role from the message (format: "Hello email@example.com (Role: admin)")
        const messageRegex = /Hello (.*?) \(Role: (.*?)\)/;
        const matches = response.data.message.match(messageRegex);
        
        if (matches && matches.length === 3) {
          setUserName(matches[1]);
          setUserRole(matches[2]);
        }
        
        setIsLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem('jwtToken');
          router.push('/login');
        } else {
          const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error : 'Something went wrong';
          setError(errorMessage || 'Something went wrong');
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [router]);

  // Sidebar links with all the IAM features mentioned on the landing page
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
    { label: 'Billing', href: '/dashboard/billing' },
    { label: 'Help', href: '/dashboard/help' }
  ];

  // Enhanced security statistics with trends
  const securityStats = [
    { 
      title: 'Total Users', 
      value: '256', 
      type: 'default',
      trend: { value: 12, isUpward: true }
    },
    { 
      title: 'Active Sessions', 
      value: '187', 
      type: 'success',
      trend: { value: 8, isUpward: true }
    },
    { 
      title: 'Security Score', 
      value: '86/100', 
      type: 'warning',
      trend: { value: 5, isUpward: true }
    },
    { 
      title: 'Security Alerts', 
      value: '2', 
      type: 'danger',
      trend: { value: 50, isUpward: false }
    },
  ];

  // User activity data
  const recentActivity = [
    { user: 'Sarah Johnson', action: 'Login Succeeded', time: '2 minutes ago', status: 'success', location: 'Austin, TX', device: 'Windows/Chrome' },
    { user: 'Admin', action: 'Role Permission Modified', time: '1 hour ago', status: 'info', location: 'Los Angeles, CA', device: 'MacOS/Safari' },
    { user: 'Alex Petrov', action: 'Login Failed (Invalid Password)', time: '3 hours ago', status: 'danger', location: 'New York, NY', device: 'Linux/Firefox' },
    { user: 'Maria Garcia', action: 'Added to Finance Group', time: '1 day ago', status: 'info', location: 'Miami, FL', device: 'iOS/Safari' },
    { user: 'John Smith', action: 'Password Changed', time: '2 days ago', status: 'success', location: 'Chicago, IL', device: 'Android/Chrome' },
  ];

  // Security recommendations based on IAM best practices
  const securityRecommendations = [
    { 
      title: 'Enable MFA for Administrator Accounts',
      description: 'Multi-factor authentication significantly strengthens account security',
      priority: 'high',
      status: 'pending'
    },
    { 
      title: 'Review Inactive Users (14)',
      description: 'Users inactive for more than 90 days should be reviewed',
      priority: 'medium',
      status: 'pending'
    },
    { 
      title: 'Update Password Policy',
      description: 'Current policy does not meet industry standards',
      priority: 'high',
      status: 'in-progress'
    },
    { 
      title: 'Review Role Assignments',
      description: '3 users have potential privilege escalation paths',
      priority: 'medium',
      status: 'pending'
    },
  ];

  // Compliance status data
  const complianceStatus = [
    { framework: 'GDPR', status: 'Compliant', lastChecked: '2 days ago' },
    { framework: 'SOC 2', status: 'Compliant', lastChecked: '1 week ago' },
    { framework: 'HIPAA', status: 'Review Needed', lastChecked: '1 month ago' },
    { framework: 'ISO 27001', status: 'In Progress', lastChecked: '2 weeks ago' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c1c]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'success': return 'text-green-400';
      case 'danger': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'compliant': return 'text-green-400';
      case 'review needed': return 'text-yellow-400';
      case 'in progress': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'bg-red-900/30 text-red-300 border-red-800';
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'low': return 'bg-green-900/30 text-green-300 border-green-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1c] text-white">
      {/* Header with user info and logout */}
      <Header showLogout userName={userName} />
      
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar navigation with enhanced IAM options */}
        <Sidebar links={sidebarLinks} />
        
        {/* Main dashboard content - Adjusted margin-top to match the new sidebar position */}
        <main className="flex-1 p-6 ml-64 mt-8 overflow-y-auto h-[calc(100vh-5.5rem)]">
          {error ? (
            <div className="p-4 mb-6 bg-red-900/30 border border-red-800 text-red-300 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {/* Welcome section */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Welcome back, {userName}</h1>
                <p className="text-gray-400">Security Center Overview • <span className="text-green-400">System Status: Operational</span></p>
              </div>

              {/* Stats cards grid with enhanced security metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {securityStats.map((stat, index) => (
                  <StatsCard 
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    type={stat.type as 'default' | 'success' | 'warning' | 'danger'}
                    trend={stat.trend}
                  />
                ))}
              </div>

              {/* Security overview section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Identity statistics panel */}
                <div className="lg:col-span-2">
                  <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                    <div className="p-4 border-b border-[#3d3d3d]">
                      <h2 className="font-semibold text-lg">Identity Activity Summary</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-purple-400 mb-2">352</div>
                          <div className="text-sm text-gray-400">Successful Logins</div>
                          <div className="text-xs text-green-400 mt-2">↑ 12% past 30 days</div>
                        </div>
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-red-400 mb-2">18</div>
                          <div className="text-sm text-gray-400">Failed Attempts</div>
                          <div className="text-xs text-green-400 mt-2">↓ 8% past 30 days</div>
                        </div>
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-green-400 mb-2">243</div>
                          <div className="text-sm text-gray-400">MFA Challenges</div>
                          <div className="text-xs text-green-400 mt-2">↑ 22% past 30 days</div>
                        </div>
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-blue-400 mb-2">56</div>
                          <div className="text-sm text-gray-400">Role Changes</div>
                          <div className="text-xs text-yellow-400 mt-2">↑ 4% past 30 days</div>
                        </div>
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-yellow-400 mb-2">14</div>
                          <div className="text-sm text-gray-400">Password Resets</div>
                          <div className="text-xs text-red-400 mt-2">↑ 28% past 30 days</div>
                        </div>
                        <div className="text-center p-4 bg-[#1c1c1c] rounded-xl">
                          <div className="text-2xl font-bold text-purple-400 mb-2">85%</div>
                          <div className="text-sm text-gray-400">Auth Success Rate</div>
                          <div className="text-xs text-green-400 mt-2">↑ 3% past 30 days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security status panel */}
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                  <div className="p-4 border-b border-[#3d3d3d]">
                    <h2 className="font-semibold text-lg">Security Status</h2>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Authentication status */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">MFA Enrollment</span>
                        <span className="text-sm text-yellow-400">72%</span>
                      </div>
                      <div className="w-full bg-[#1c1c1c] rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    
                    {/* Access reviews */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Access Reviews</span>
                        <span className="text-sm text-green-400">93%</span>
                      </div>
                      <div className="w-full bg-[#1c1c1c] rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '93%' }}></div>
                      </div>
                    </div>
                    
                    {/* Password policy */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Password Policy Strength</span>
                        <span className="text-sm text-red-400">65%</span>
                      </div>
                      <div className="w-full bg-[#1c1c1c] rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    {/* API Security */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">API Security</span>
                        <span className="text-sm text-green-400">90%</span>
                      </div>
                      <div className="w-full bg-[#1c1c1c] rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    
                    {/* Last audit */}
                    <div className="pt-2 border-t border-[#3d3d3d] mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Last Security Audit</span>
                        <span className="text-sm text-white">8 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security recommendations */}
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden mb-8 shadow-md">
                <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Security Recommendations</h2>
                  <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
                </div>
                <div className="divide-y divide-[#3d3d3d]">
                  {securityRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 hover:bg-[#2d2d2d] transition-colors">
                      <div className="flex items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="text-base font-medium mr-2">{rec.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{rec.description}</p>
                        </div>
                        <div className="ml-4">
                          <button className="bg-purple-600 hover:bg-purple-500 text-white text-xs py-1 px-3 rounded-lg transition-colors">
                            Fix
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom grid: Activity + Compliance */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity logs table */}
                <div className="lg:col-span-2 bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                  <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Recent Activity</h2>
                    <button className="text-sm text-purple-400 hover:text-purple-300">View Logs</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#1c1c1c] text-xs uppercase text-gray-500">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Action</th>
                          <th className="p-3 hidden md:table-cell">Location</th>
                          <th className="p-3 hidden md:table-cell">Device</th>
                          <th className="p-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3d3d3d]">
                        {recentActivity.map((activity, index) => (
                          <tr key={index} className="hover:bg-[#2a2a2a]">
                            <td className="p-3 whitespace-nowrap">{activity.user}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={getStatusColor(activity.status)}>
                                {activity.action}
                              </span>
                            </td>
                            <td className="p-3 hidden md:table-cell text-sm text-gray-400">{activity.location}</td>
                            <td className="p-3 hidden md:table-cell text-sm text-gray-400">{activity.device}</td>
                            <td className="p-3 text-sm text-gray-400 whitespace-nowrap">{activity.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Compliance status */}
                <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md">
                  <div className="p-4 border-b border-[#3d3d3d]">
                    <h2 className="font-semibold text-lg">Compliance Status</h2>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {complianceStatus.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 hover:bg-[#2d2d2d] rounded-md transition-colors">
                          <div>
                            <div className="font-medium">{item.framework}</div>
                            <div className="text-xs text-gray-400">Last checked: {item.lastChecked}</div>
                          </div>
                          <div className={`text-sm ${getStatusColor(item.status)}`}>
                            {item.status}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <button className="w-full py-2 border border-[#3d3d3d] hover:bg-[#2d2d2d] rounded-md transition-colors text-sm">
                        Run Compliance Check
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}