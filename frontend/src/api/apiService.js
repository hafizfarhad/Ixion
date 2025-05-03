const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  // Auth endpoints
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    return response.json();
  },
  
  async register(email, password, firstName, lastName) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password,
        first_name: firstName,
        last_name: lastName
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    return response.json();
  },
  
  // User endpoints
  async getUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    
    return response.json();
  },
  
  async getUser(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user');
    }
    
    return response.json();
  },
  
  async updateUser(userId, userData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user');
    }
    
    return response.json();
  },
  
  async deleteUser(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete user');
    }
    
    return response.json();
  },

  async createUser(userData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
  
    return response.json();
  },
  
  // Role endpoints
  async getRoles() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch roles');
    }
    
    return response.json();
  },
  
  async createRole(roleData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create role');
    }
    
    return response.json();
  },

  async updateRole(roleId, roleData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roleData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update role');
    }
  
    return response.json();
  },

  async deleteRole(roleId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete role');
    }
  
    return response.json();
  },

  async getPermissions() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch permissions');
    }

    return response.json();
  },

  async createPermission(permissionData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(permissionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create permission');
    }

    return response.json();
  },
  
  // Invitation endpoints
  async getInvitations() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch invitations');
    }
    
    return response.json();
  },
  
  async createInvitation(invitationData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(invitationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create invitation');
    }
    
    return response.json();
  },
  
  async revokeInvitation(invitationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to revoke invitation');
    }
    
    return response.json();
  },
  
  // System status
  async getSystemStatus() {
    const response = await fetch(`${API_BASE_URL}/system/status`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch system status');
    }
    
    return response.json();
  },

  async getAuditLogs() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch audit logs');
    }

    return response.json();
  },
};

export default apiService;