// Common interface definitions for the application

// User interfaces
export interface User {
  id?: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  is_active?: boolean;
  mfa_enabled?: boolean;
  roles?: string[];
  permissions: string[];
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

// IAM specific interfaces
export interface UserStatusDistribution {
  active: number;
  inactive: number;
  suspended: number;
  locked: number;
  pending: number;
}

export interface PermissionUsage {
  role: string;
  permission: string;
  value: number;
}

export interface SecurityMetric {
  name: string;
  value: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
  trend: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export interface RiskScore {
  score: number;
  previousScore?: number;
  lastUpdated: string;
  factors: {
    name: string;
    impact: number;
    status: 'good' | 'warning' | 'critical';
  }[];
}

export interface AccessRequest {
  id: string;
  userId: string;
  userName: string;
  resourceType: string;
  resourceName: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied';
  approver?: string;
  approvalDate?: string;
  justification: string;
}

// Activity log interfaces
export interface ActivityLog {
  id?: string;
  timestamp: string;
  user?: {
    id?: string;
    email: string;
  };
  action_type?: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  status?: string;
  description?: string;
  user_agent?: string;
  details?: any;
}

// Role interfaces
export interface Role {
  id?: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at?: string;
  updated_at?: string;
}

// Permission interfaces
export interface Permission {
  id?: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  created_at?: string;
  updated_at?: string;
}

// Group interfaces
export interface Group {
  id?: string;
  name: string;
  description?: string;
  members?: string[] | User[];
  roles?: string[] | Role[];
  created_at?: string;
  updated_at?: string;
}

// Common props interfaces
export interface SidebarProps {
  links: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export interface HeaderProps {
  showLogout?: boolean;
  showSignIn?: boolean;
  showSignUp?: boolean;
  userName?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  type?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isUpward: boolean;
  };
  period?: string;
}

// Common event types
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type TextareaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;