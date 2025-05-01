'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

// Define interfaces for the component state
interface Policy {
  id: string;
  name: string;
  description?: string;
  policy_type: 'password' | 'session' | 'mfa' | 'login';
  settings: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface PasswordPolicySettings {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history: number;
  expiry_days: number;
  is_active: boolean;
}

interface SessionPolicySettings {
  session_timeout: number;
  max_sessions_per_user: number;
  refresh_token_expiry: number;
  access_token_expiry: number;
  remember_me_duration: number;
  ip_binding: boolean;
  is_active: boolean;
}

interface MfaPolicySettings {
  require_for_admins: boolean;
  require_for_all_users: boolean;
  remember_device_days: number;
  is_active: boolean;
}

interface LoginPolicySettings {
  max_login_attempts: number;
  lockout_duration: number;
  require_captcha_after_failures: number;
  geo_restrictions_enabled: boolean;
  allowed_countries: string[];
  is_active: boolean;
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const router = useRouter();

  // Password policy settings state
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicySettings>({
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    password_history: 5,
    expiry_days: 90,
    is_active: true
  });

  // Session policy settings state
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicySettings>({
    session_timeout: 60, // minutes
    max_sessions_per_user: 5,
    refresh_token_expiry: 7, // days
    access_token_expiry: 60, // minutes
    remember_me_duration: 30, // days
    ip_binding: false,
    is_active: true
  });

  // MFA policy settings state
  const [mfaPolicy, setMfaPolicy] = useState<MfaPolicySettings>({
    require_for_admins: true,
    require_for_all_users: false,
    remember_device_days: 30,
    is_active: true
  });

  // Login policy settings state
  const [loginPolicy, setLoginPolicy] = useState<LoginPolicySettings>({
    max_login_attempts: 5,
    lockout_duration: 30, // minutes
    require_captcha_after_failures: 3,
    geo_restrictions_enabled: false,
    allowed_countries: [],
    is_active: true
  });

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
        
        // Check if user has admin permissions
        if (!response.data.is_admin && !response.data.permissions.includes('policy:read')) {
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
        } else {
          setError('Failed to fetch user data');
          setIsLoading(false);
        }
        return false;
      }
    };

    const fetchPolicies = async () => {
      try {
        const response = await axios.get<Policy[]>('http://localhost:5000/api/iam/policies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPolicies(response.data || []);
        
        // Update state with actual policies from the server
        response.data.forEach((policy: Policy) => {
          try {
            const settings = typeof policy.settings === 'string' 
              ? JSON.parse(policy.settings) 
              : policy.settings;
              
            if (policy.policy_type === 'password') {
              setPasswordPolicy(prev => ({ ...prev, ...settings, is_active: policy.is_active }));
            } else if (policy.policy_type === 'session') {
              setSessionPolicy(prev => ({ ...prev, ...settings, is_active: policy.is_active }));
            } else if (policy.policy_type === 'mfa') {
              setMfaPolicy(prev => ({ ...prev, ...settings, is_active: policy.is_active }));
            } else if (policy.policy_type === 'login') {
              setLoginPolicy(prev => ({ ...prev, ...settings, is_active: policy.is_active }));
            }
          } catch (e) {
            console.error('Error parsing policy settings:', e);
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch policies:', err);
        setIsLoading(false);
      }
    };

    const initialize = async () => {
      const hasPermission = await fetchUserData();
      if (hasPermission) {
        await fetchPolicies();
      }
    };

    initialize();
  }, [router]);

  // Handle form input changes for password policy
  const handlePasswordPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPasswordPolicy({ ...passwordPolicy, [name]: checked });
    } else if (type === 'number') {
      setPasswordPolicy({ ...passwordPolicy, [name]: parseInt(value) });
    } else {
      setPasswordPolicy({ ...passwordPolicy, [name]: value });
    }
  };

  // Handle form input changes for session policy
  const handleSessionPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setSessionPolicy({ ...sessionPolicy, [name]: checked });
    } else if (type === 'number') {
      setSessionPolicy({ ...sessionPolicy, [name]: parseInt(value) });
    } else {
      setSessionPolicy({ ...sessionPolicy, [name]: value });
    }
  };

  // Handle form input changes for MFA policy
  const handleMfaPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setMfaPolicy({ ...mfaPolicy, [name]: checked });
    } else if (type === 'number') {
      setMfaPolicy({ ...mfaPolicy, [name]: parseInt(value) });
    } else {
      setMfaPolicy({ ...mfaPolicy, [name]: value });
    }
  };

  // Handle form input changes for login policy
  const handleLoginPolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setLoginPolicy({ ...loginPolicy, [name]: checked });
    } else if (type === 'number') {
      setLoginPolicy({ ...loginPolicy, [name]: parseInt(value) });
    } else {
      setLoginPolicy({ ...loginPolicy, [name]: value });
    }
  };

  // Save password policy
  const savePasswordPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      // Find existing policy or create a new one
      const existingPolicy = policies.find(p => p.policy_type === 'password');
      
      if (existingPolicy) {
        // Update existing policy
        await axios.put(`http://localhost:5000/api/iam/policies/${existingPolicy.id}`, {
          name: 'Password Policy',
          policy_type: 'password',
          settings: passwordPolicy,
          is_active: passwordPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new policy
        await axios.post('http://localhost:5000/api/iam/policies', {
          name: 'Password Policy',
          description: 'System-wide password requirements',
          policy_type: 'password',
          settings: passwordPolicy,
          is_active: passwordPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccessMessage('Password policy saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save password policy');
      }
    }
  };

  // Save session policy
  const saveSessionPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      // Find existing policy or create a new one
      const existingPolicy = policies.find(p => p.policy_type === 'session');
      
      if (existingPolicy) {
        // Update existing policy
        await axios.put(`http://localhost:5000/api/iam/policies/${existingPolicy.id}`, {
          name: 'Session Policy',
          policy_type: 'session',
          settings: sessionPolicy,
          is_active: sessionPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new policy
        await axios.post('http://localhost:5000/api/iam/policies', {
          name: 'Session Policy',
          description: 'System-wide session settings',
          policy_type: 'session',
          settings: sessionPolicy,
          is_active: sessionPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccessMessage('Session policy saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save session policy');
      }
    }
  };

  // Save MFA policy
  const saveMfaPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      // Find existing policy or create a new one
      const existingPolicy = policies.find(p => p.policy_type === 'mfa');
      
      if (existingPolicy) {
        // Update existing policy
        await axios.put(`http://localhost:5000/api/iam/policies/${existingPolicy.id}`, {
          name: 'Multi-factor Authentication Policy',
          policy_type: 'mfa',
          settings: mfaPolicy,
          is_active: mfaPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new policy
        await axios.post('http://localhost:5000/api/iam/policies', {
          name: 'Multi-factor Authentication Policy',
          description: 'System-wide MFA requirements',
          policy_type: 'mfa',
          settings: mfaPolicy,
          is_active: mfaPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccessMessage('MFA policy saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save MFA policy');
      }
    }
  };

  // Save login policy
  const saveLoginPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setError('');
    
    const token = localStorage.getItem('jwtToken');
    
    try {
      // Find existing policy or create a new one
      const existingPolicy = policies.find(p => p.policy_type === 'login');
      
      if (existingPolicy) {
        // Update existing policy
        await axios.put(`http://localhost:5000/api/iam/policies/${existingPolicy.id}`, {
          name: 'Login Policy',
          policy_type: 'login',
          settings: loginPolicy,
          is_active: loginPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new policy
        await axios.post('http://localhost:5000/api/iam/policies', {
          name: 'Login Policy',
          description: 'System-wide login security settings',
          policy_type: 'login',
          settings: loginPolicy,
          is_active: loginPolicy.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccessMessage('Login policy saved successfully');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to save login policy');
      }
    }
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
              <h1 className="text-2xl font-bold mb-1">System Settings</h1>
              <p className="text-gray-400">Configure global system settings and security policies</p>
            </div>
            
            {/* Tabs for navigation */}
            <div className="border-b border-[#3d3d3d]">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'general'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'password'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Password Policy
                </button>
                <button
                  onClick={() => setActiveTab('session')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'session'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Session Management
                </button>
                <button
                  onClick={() => setActiveTab('mfa')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'mfa'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  MFA
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'login'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Login Security
                </button>
              </nav>
            </div>
            
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="text-sm text-gray-400">System Name</div>
                        <div className="font-medium mt-1">Ixion IAM Platform</div>
                      </div>
                      
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="text-sm text-gray-400">Version</div>
                        <div className="font-medium mt-1">1.0.0-alpha</div>
                      </div>
                      
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="text-sm text-gray-400">Environment</div>
                        <div className="font-medium mt-1">Development</div>
                      </div>
                      
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="text-sm text-gray-400">Last Updated</div>
                        <div className="font-medium mt-1">{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Status</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-400">API Status</div>
                            <div className="font-medium mt-1 flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                              Operational
                            </div>
                          </div>
                          <button className="text-purple-400 hover:text-purple-300 text-sm">
                            Run Health Check
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-[#1c1c1c] p-4 rounded-lg border border-[#3d3d3d]">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-400">Database Status</div>
                            <div className="font-medium mt-1 flex items-center">
                              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                              Connected
                            </div>
                          </div>
                          <button className="text-purple-400 hover:text-purple-300 text-sm">
                            Test Connection
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t border-[#3d3d3d] pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Maintenance Mode</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          When enabled, only administrators can access the system.
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="maintenance-toggle"
                          className="opacity-0 absolute w-0 h-0"
                        />
                        <label
                          htmlFor="maintenance-toggle"
                          className={`block cursor-pointer w-12 h-6 rounded-full ${false ? 'bg-purple-600' : 'bg-[#3d3d3d]'}`}
                        >
                          <span
                            className={`block w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                              false ? 'transform translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Debug Mode</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Enable detailed error messages and logging.
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="debug-toggle"
                          className="opacity-0 absolute w-0 h-0"
                        />
                        <label
                          htmlFor="debug-toggle"
                          className={`block cursor-pointer w-12 h-6 rounded-full ${false ? 'bg-purple-600' : 'bg-[#3d3d3d]'}`}
                        >
                          <span
                            className={`block w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                              false ? 'transform translate-x-6' : ''
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Password Policy Tab */}
            {activeTab === 'password' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <form onSubmit={savePasswordPolicy}>
                  <h3 className="text-lg font-medium mb-4">Password Policy Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Minimum Password Length
                      </label>
                      <input 
                        type="number" 
                        name="min_length" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordPolicy.min_length}
                        onChange={handlePasswordPolicyChange}
                        min="6"
                        max="32"
                      />
                      <p className="mt-1 text-xs text-gray-400">Recommended: 8 or higher</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Password History
                      </label>
                      <input 
                        type="number" 
                        name="password_history" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordPolicy.password_history}
                        onChange={handlePasswordPolicyChange}
                        min="0"
                        max="24"
                      />
                      <p className="mt-1 text-xs text-gray-400">Number of previous passwords that cannot be reused</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Password Expiry (days)
                      </label>
                      <input 
                        type="number" 
                        name="expiry_days" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={passwordPolicy.expiry_days}
                        onChange={handlePasswordPolicyChange}
                        min="0"
                        max="365"
                      />
                      <p className="mt-1 text-xs text-gray-400">Set to 0 for no expiration</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_uppercase" 
                        name="require_uppercase" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={passwordPolicy.require_uppercase}
                        onChange={handlePasswordPolicyChange}
                      />
                      <label htmlFor="require_uppercase" className="ml-2 text-sm text-gray-300">
                        Require at least one uppercase letter
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_lowercase" 
                        name="require_lowercase" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={passwordPolicy.require_lowercase}
                        onChange={handlePasswordPolicyChange}
                      />
                      <label htmlFor="require_lowercase" className="ml-2 text-sm text-gray-300">
                        Require at least one lowercase letter
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_numbers" 
                        name="require_numbers" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={passwordPolicy.require_numbers}
                        onChange={handlePasswordPolicyChange}
                      />
                      <label htmlFor="require_numbers" className="ml-2 text-sm text-gray-300">
                        Require at least one number
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_special_chars" 
                        name="require_special_chars" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={passwordPolicy.require_special_chars}
                        onChange={handlePasswordPolicyChange}
                      />
                      <label htmlFor="require_special_chars" className="ml-2 text-sm text-gray-300">
                        Require at least one special character (e.g., !@#$%^&*)
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      id="password_policy_active" 
                      name="is_active" 
                      className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                      checked={passwordPolicy.is_active}
                      onChange={handlePasswordPolicyChange}
                    />
                    <label htmlFor="password_policy_active" className="ml-2 text-sm text-white">
                      Enable password policy
                    </label>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-[#3d3d3d]">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Save Password Policy
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Session Management Tab */}
            {activeTab === 'session' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <form onSubmit={saveSessionPolicy}>
                  <h3 className="text-lg font-medium mb-4">Session Management Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <input 
                        type="number" 
                        name="session_timeout" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={sessionPolicy.session_timeout}
                        onChange={handleSessionPolicyChange}
                        min="5"
                        max="1440"
                      />
                      <p className="mt-1 text-xs text-gray-400">Inactive sessions will be terminated after this period</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Max Sessions Per User
                      </label>
                      <input 
                        type="number" 
                        name="max_sessions_per_user" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={sessionPolicy.max_sessions_per_user}
                        onChange={handleSessionPolicyChange}
                        min="1"
                        max="100"
                      />
                      <p className="mt-1 text-xs text-gray-400">Maximum number of concurrent sessions allowed per user</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Access Token Expiry (minutes)
                      </label>
                      <input 
                        type="number" 
                        name="access_token_expiry" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={sessionPolicy.access_token_expiry}
                        onChange={handleSessionPolicyChange}
                        min="5"
                        max="1440"
                      />
                      <p className="mt-1 text-xs text-gray-400">JWT access tokens will expire after this period</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Refresh Token Expiry (days)
                      </label>
                      <input 
                        type="number" 
                        name="refresh_token_expiry" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={sessionPolicy.refresh_token_expiry}
                        onChange={handleSessionPolicyChange}
                        min="1"
                        max="90"
                      />
                      <p className="mt-1 text-xs text-gray-400">Refresh tokens will expire after this period</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Remember Me Duration (days)
                      </label>
                      <input 
                        type="number" 
                        name="remember_me_duration" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={sessionPolicy.remember_me_duration}
                        onChange={handleSessionPolicyChange}
                        min="1"
                        max="90"
                      />
                      <p className="mt-1 text-xs text-gray-400">Duration for extended sessions when "Remember Me" is selected</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="ip_binding" 
                        name="ip_binding" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={sessionPolicy.ip_binding}
                        onChange={handleSessionPolicyChange}
                      />
                      <label htmlFor="ip_binding" className="ml-2 text-sm text-gray-300">
                        Enable IP binding (sessions are tied to the IP address they were created from)
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      id="session_policy_active" 
                      name="is_active" 
                      className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                      checked={sessionPolicy.is_active}
                      onChange={handleSessionPolicyChange}
                    />
                    <label htmlFor="session_policy_active" className="ml-2 text-sm text-white">
                      Enable session policy
                    </label>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-[#3d3d3d]">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Save Session Policy
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* MFA Settings Tab */}
            {activeTab === 'mfa' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <form onSubmit={saveMfaPolicy}>
                  <h3 className="text-lg font-medium mb-4">Multi-factor Authentication Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Remember Device (days)
                      </label>
                      <input 
                        type="number" 
                        name="remember_device_days" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={mfaPolicy.remember_device_days}
                        onChange={handleMfaPolicyChange}
                        min="0"
                        max="90"
                      />
                      <p className="mt-1 text-xs text-gray-400">How long to remember devices before requiring MFA again (0 disables this feature)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_for_admins" 
                        name="require_for_admins" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={mfaPolicy.require_for_admins}
                        onChange={handleMfaPolicyChange}
                      />
                      <label htmlFor="require_for_admins" className="ml-2 text-sm text-gray-300">
                        Require MFA for administrator accounts
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="require_for_all_users" 
                        name="require_for_all_users" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={mfaPolicy.require_for_all_users}
                        onChange={handleMfaPolicyChange}
                      />
                      <label htmlFor="require_for_all_users" className="ml-2 text-sm text-gray-300">
                        Require MFA for all users
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      id="mfa_policy_active" 
                      name="is_active" 
                      className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                      checked={mfaPolicy.is_active}
                      onChange={handleMfaPolicyChange}
                    />
                    <label htmlFor="mfa_policy_active" className="ml-2 text-sm text-white">
                      Enable MFA policy
                    </label>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-[#3d3d3d]">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Save MFA Policy
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Login Security Tab */}
            {activeTab === 'login' && (
              <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] overflow-hidden shadow-md p-6">
                <form onSubmit={saveLoginPolicy}>
                  <h3 className="text-lg font-medium mb-4">Login Security Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Max Login Attempts
                      </label>
                      <input 
                        type="number" 
                        name="max_login_attempts" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={loginPolicy.max_login_attempts}
                        onChange={handleLoginPolicyChange}
                        min="1"
                        max="20"
                      />
                      <p className="mt-1 text-xs text-gray-400">Number of failed attempts before account lockout</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Lockout Duration (minutes)
                      </label>
                      <input 
                        type="number" 
                        name="lockout_duration" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={loginPolicy.lockout_duration}
                        onChange={handleLoginPolicyChange}
                        min="1"
                        max="1440"
                      />
                      <p className="mt-1 text-xs text-gray-400">Duration accounts remain locked after failed attempts</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Enable CAPTCHA After Failed Attempts
                      </label>
                      <input 
                        type="number" 
                        name="require_captcha_after_failures" 
                        className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                        value={loginPolicy.require_captcha_after_failures}
                        onChange={handleLoginPolicyChange}
                        min="0"
                        max="10"
                      />
                      <p className="mt-1 text-xs text-gray-400">Show CAPTCHA after this many failed attempts (0 to disable)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="geo_restrictions_enabled" 
                        name="geo_restrictions_enabled" 
                        className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                        checked={loginPolicy.geo_restrictions_enabled}
                        onChange={handleLoginPolicyChange}
                      />
                      <label htmlFor="geo_restrictions_enabled" className="ml-2 text-sm text-gray-300">
                        Enable geographic restrictions
                      </label>
                    </div>
                    
                    {loginPolicy.geo_restrictions_enabled && (
                      <div className="ml-6 mt-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Allowed Countries (comma-separated ISO codes)
                        </label>
                        <input 
                          type="text" 
                          placeholder="US,CA,GB,AU,..." 
                          className="w-full bg-[#1c1c1c] border border-[#3d3d3d] rounded-lg py-2 px-4 focus:outline-none focus:border-purple-500"
                          value={loginPolicy.allowed_countries.join(',')}
                          onChange={(e) => {
                            const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                            setLoginPolicy({ ...loginPolicy, allowed_countries: countries });
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-400">Leave empty to allow all countries</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      id="login_policy_active" 
                      name="is_active" 
                      className="rounded bg-[#1c1c1c] border-[#3d3d3d] text-purple-500 focus:ring-purple-500"
                      checked={loginPolicy.is_active}
                      onChange={handleLoginPolicyChange}
                    />
                    <label htmlFor="login_policy_active" className="ml-2 text-sm text-white">
                      Enable login security policy
                    </label>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-[#3d3d3d]">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Save Login Security Policy
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}