# Ixion: Identity and Access Management System

## Setup Instructions

### Frontend
`npx create-next-app@latest frontend`

`npm install axios`

`npm install react-icons`

`npm install @headlessui/react`

`npm install recharts` (Required for IAM dashboard visualizations)

### Backend
__venv:__

`pip install flask`
`pip install flask-cors`

`pip install python-dotenv pyjwt`

`pip install bcrypt`

`pip install flask-sqlalchemy psycopg2-binary`


### Database

`sudo systemctl status postgresql`

`sudo systemctl start postgresql`

`sudo systemctl start postgresql`

`sudo -u postgres createdb ixios_db`

`sudo -u postgres psql -c "CREATE USER iamuser WITH PASSWORD 'iampass';"`

`sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ixios_db TO iamuser;"`

`sudo -u postgres psql -c "ALTER USER iamuser WITH SUPERUSER;"`

`psql -U iamuser -d ixios_db -c "SELECT * FROM user;"`

### To run docker-compose.yml

`sudo docker-compose build --no-cache`

`sudo docker-compose up -d`

`sudo docker ps -a`

`sudo docker-compose down -v`

## IAM Dashboard Implementation Documentation

### 1. Data Flow Architecture

The Ixion IAM system implements a structured data flow between the frontend components and backend API:

#### Authentication Flow
1. **User Login**:
   - Frontend sends credentials to `/api/login` endpoint
   - Backend validates credentials and returns JWT token
   - Token is stored in localStorage via `useAuth` hook
   - Auth context updates with user data

2. **Auth State Management**:
   - `AuthProvider` wraps the application to provide auth context
   - Components access auth state via `useAuth()` hook
   - Token is included in all API requests via axios interceptors

#### Dashboard Data Flow

**Admin Dashboard Flow**:
1. Dashboard component mounts and checks user role
2. `useIamData` hook initiates parallel data fetching:
   - User status distribution → `/api/iam/users/status-distribution`
   - Permission usage data → `/api/iam/permissions/usage`
   - Risk scores → `/api/iam/security/risk-score`
   - Security metrics → `/api/iam/security/metrics`
   - Activity logs → `/api/iam/activities`
   - Access requests → `/api/iam/access-requests`
3. Data is passed to respective visualization components
4. Periodic refresh occurs based on configured intervals

**User Dashboard Flow**:
1. Dashboard component mounts and identifies non-admin user
2. `useIamData` hook fetches user-specific data:
   - User's activities → `/api/iam/activities/user/{user_id}`
   - User's access requests → `/api/iam/access-requests/user/{user_id}`
   - User's risk score → `/api/iam/security/user-risk/{user_id}`
3. Data is rendered in user-focused interface components

#### Error Handling Flow
1. API requests throw exceptions for network/auth errors
2. `useIamData` hook captures errors in state
3. Components conditionally render error states
4. Automatic retry logic attempts to recover from transient failures

### 2. IAM Component Documentation

#### Authentication Components

##### `useAuth` Hook
**Purpose**: Central authentication management for the application
**Location**: `/frontend/src/hooks/useAuth.ts`
**Features**:
- User state management with TypeScript interfaces
- JWT token handling with secure storage
- Role-based access control helpers
- Permission checking functionality

**Example Usage**:
```typescript
const { user, isAdmin, hasPermission, login, logout } = useAuth();

// Role-based rendering
{isAdmin && <AdminOnlyComponent />}

// Permission-based access
{hasPermission('user:create') && <CreateUserButton />}
```

#### IAM-Specific Visualization Components

##### `UserStatusWidget`
**Purpose**: Display distribution of user account statuses
**Location**: `/frontend/src/components/IAM/UserStatusWidget.tsx`
**Props**:
- `data`: Array of status objects with name, value, and color
- `title`: Optional widget title

**Data Structure**:
```typescript
{
  name: string;    // Status name (e.g., "Active")
  value: number;   // Count of users with this status
  color: string;   // Color code for the status
}
```

##### `PermissionHeatmap`
**Purpose**: Visualize role-permission relationships and usage patterns
**Location**: `/frontend/src/components/IAM/PermissionHeatmap.tsx`
**Props**:
- `data`: Array of role-permission-value mappings
- `roles`: Array of role names
- `permissions`: Array of permission names
- `title`: Optional widget title

**Data Structure**:
```typescript
{
  role: string;        // Role name
  permission: string;  // Permission name
  value: number;       // Usage intensity (0-1)
}
```

##### `RiskScoreGauge`
**Purpose**: Display security risk scores with historical comparison
**Location**: `/frontend/src/components/IAM/RiskScoreGauge.tsx`
**Props**:
- `score`: Current risk score (0-100)
- `previousScore`: Optional previous score for trend comparison
- `threshold`: Object defining low/medium/high thresholds
- `title`: Optional widget title

**Data Structure**:
```typescript
{
  score: number;
  previousScore?: number;
  threshold: {
    low: number;
    medium: number;
    high: number;
  }
}
```

##### `ActivityTimeline`
**Purpose**: Chronological display of user activities with status indicators
**Location**: `/frontend/src/components/IAM/ActivityTimeline.tsx`
**Props**:
- `activities`: Array of activity items
- `title`: Optional timeline title
- `maxItems`: Maximum items to display
- `showViewAll`: Whether to show "View All" button
- `onViewAll`: Callback for view all action

**Data Structure**:
```typescript
{
  id: string | number;
  user: string;
  action: string;
  resource: string;
  time: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  details?: string;
}
```

#### Data Fetching Components

##### `useIamData` Hook
**Purpose**: Standardized data fetching with error handling for IAM components
**Location**: `/frontend/src/hooks/useIamData.ts`
**Features**:
- TypeScript generics for type-safe data fetching
- Automatic JWT token inclusion
- Loading/error state management
- Configurable refresh intervals
- Manual refetch capability

**Example Usage**:
```typescript
const { data, isLoading, error, refetch } = useIamData<UserStatusDistribution>({
  endpoint: 'http://localhost:5000/api/iam/users/status-distribution',
  initialData: { active: 0, inactive: 0, suspended: 0, locked: 0, pending: 0 },
  refreshInterval: 60000, // Refresh every minute
});
```

### 3. Access Control Implementation

#### Role-Based Access Control

The Ixion dashboard implements role-based access control at multiple levels:

##### 1. Route-Level RBAC (Frontend)
```typescript
// Dashboard component with role-based rendering
export default function Dashboard() {
  const { user, loading, isAdmin } = useAuth();
  
  // Only show certain links based on user role
  const filteredLinks = isAdmin 
    ? sidebarLinks 
    : sidebarLinks.filter(link => 
        !['/dashboard/users', '/dashboard/roles'].includes(link.href)
      );
      
  // Conditional dashboard rendering based on role
  return (
    // ...
    <main>
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </main>
    // ...
  );
}
```

##### 2. API-Level RBAC (Backend)
```python
# Decorator to check admin status
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({"error": "Admin privileges required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Admin-only endpoint example
@iam_bp.route('/users/status-distribution', methods=['GET'])
@token_required
@admin_required
def get_user_status_distribution(current_user):
    # Admin-only logic here
```

##### 3. Data-Level Access Control
```python
# User Activity (User-specific data access control)
@iam_bp.route('/activities/user/<int:user_id>', methods=['GET'])
@token_required
def get_user_activities(current_user, user_id):
    # Only allow users to view their own activities or admins to view any
    if not current_user.is_admin and current_user.id != user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # Get the user
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Return data for authorized request
```

#### Permission-Based Access Control

The system also supports granular permission-based access control:

```typescript
// In components:
const { hasPermission } = useAuth();

// Conditional rendering based on specific permissions
{hasPermission('user:create') && (
  <button className="create-user-btn">Create User</button>
)}

// Backend permission enforcement:
def permission_required(permission):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            user_permissions = get_user_permissions(current_user)
            if permission not in user_permissions:
                return jsonify({"error": f"Required permission: {permission}"}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
```

### 4. IAM-Specific Security Considerations

#### Token Security
- **Current Implementation**: JWT tokens stored in localStorage
- **Security Risk**: Vulnerable to XSS attacks
- **Recommended Enhancement**: 
  ```typescript
  // Use HttpOnly cookies for token storage instead
  // Backend:
  @app.route('/api/login', methods=['POST'])
  def login():
      # Authenticate user
      response = jsonify({"success": True})
      response.set_cookie('auth_token', token, httponly=True, secure=True)
      return response
      
  // Frontend:
  const login = async (email, password) => {
    try {
      // Send credentials
      await axios.post('/api/login', { email, password }, {
        withCredentials: true  // Important for cookie handling
      });
      // Token is now in HttpOnly cookie, not accessible to JS
    } catch (err) {
      // Handle error
    }
  };
  ```

#### Secure API Implementation
- **Current Implementation**: Direct API calls to specific endpoints
- **Security Risk**: Potential for CSRF attacks
- **Recommended Enhancement**: 
  - Implement CSRF tokens for state-changing operations
  - Add rate limiting on authentication endpoints
  - Implement API versioning for backward compatibility

#### Session Management
- **Current Implementation**: Basic JWT validation
- **Security Risk**: No token revocation mechanism
- **Recommended Enhancement**:
  ```typescript
  // Add token blacklisting/revocation
  // Backend:
  revoked_tokens = set()
  
  @app.route('/api/logout', methods=['POST'])
  @token_required
  def logout(current_user):
      token = get_token_from_request()
      revoked_tokens.add(token)
      return jsonify({"success": True})
  
  def token_required(f):
      @wraps(f)
      def decorated(*args, **kwargs):
          token = get_token_from_request()
          if token in revoked_tokens:
              return jsonify({"error": "Token revoked"}), 401
          # Continue with normal token validation
      return decorated
  ```

#### Sensitive Data Exposure
- **Current Implementation**: Full user data fetched in some endpoints
- **Security Risk**: Potential exposure of sensitive user attributes
- **Recommended Enhancement**:
  - Implement data masking for sensitive fields
  - Create separate DTOs (Data Transfer Objects) for different views
  - Add field-level access control

#### Activity Monitoring
- **Current Implementation**: Basic activity logging
- **Security Enhancement**:
  - Implement real-time security alerting for suspicious activities
  - Add anomaly detection for access patterns
  - Create automated response workflows for security incidents

#### Multi-Factor Authentication
- **Current Implementation**: MFA status tracking only
- **Security Enhancement**:
  ```typescript
  // Frontend MFA flow implementation
  const login = async (email, password) => {
    const { requiresMfa, mfaToken } = await authService.login(email, password);
    
    if (requiresMfa) {
      setMfaRequired(true);
      setMfaToken(mfaToken);
    } else {
      // Normal login success flow
    }
  };
  
  const completeMfa = async (code) => {
    const { token, user } = await authService.verifyMfa(mfaToken, code);
    // Complete login after MFA
  };
  ```

## Implementation Roadmap

1. **Immediate Security Enhancements**:
   - Switch from localStorage to HttpOnly cookies
   - Implement proper CSRF protection
   - Add rate limiting on authentication endpoints

2. **Advanced IAM Features**:
   - Multi-factor authentication implementation
   - Just-in-time access provisioning
   - Automated access recertification workflows

3. **Monitoring Capabilities**:
   - Real-time security alerts
   - Anomaly detection for access patterns
   - Access usage analytics dashboard

4. **Compliance Features**:
   - Compliance report generation
   - Audit trail enhancements
   - Regulatory framework mappings



## Workflow

```
flowchart TD
    subgraph "User Onboarding"
        A1[HR/Manager] -->|Creates user account| B1[Admin Dashboard]
        B1 -->|Sets initial role| C1[User Repository]
        C1 -->|Sends credentials| D1[New User]
        D1 -->|First login| E1[Force password change]
        E1 -->|Complete setup| F1[User Dashboard]
    end

    subgraph "Daily User Operations"
        U1[End User] -->|Login| U2[Authentication Service]
        U2 -->|Validates credentials| U3{Valid?}
        U3 -->|Yes| U4[User Dashboard]
        U3 -->|No| U5[Login error]
        U4 -->|View resources| U6[Application Portal]
        U4 -->|Manage profile| U7[Profile Management]
        U4 -->|Request access| U8[Access Request]
        U8 -->|Submit request| U9[Request Workflow]
    end

    subgraph "Administrator Activities"
        A2[Admin] -->|Login| A3[Admin Dashboard]
        A3 -->|User Management| A4[User Admin]
        A3 -->|Role Management| A5[Role Admin]
        A3 -->|Review reports| A6[Audit Logs]
        A3 -->|Configure system| A7[System Settings]
        A3 -->|Review requests| A8[Access Requests]
        A8 -->|Approve/Deny| A9[Update permissions]
    end

    subgraph "Security Enforcement"
        S1[User Request] -->|Access resource| S2[Authorization Service]
        S2 -->|Check permissions| S3{Authorized?}
        S3 -->|Yes| S4[Grant Access]
        S3 -->|No| S5[Access Denied]
        S4 & S5 -->|Log activity| S6[Audit Logging]
    end

    subgraph "Access Request Flow"
        R1[User] -->|Request access| R2[Create request]
        R2 -->|Submit| R3[Pending Request]
        R3 -->|Notify| R4[Admin/Manager]
        R4 -->|Review| R5{Decision}
        R5 -->|Approve| R6[Update permissions]
        R5 -->|Deny| R7[Rejection notice]
        R6 & R7 -->|Notify user| R8[User notification]
        R6 -->|Automatic provisioning| R9[Access granted]
    end

    %% Connections between subgraphs
    F1 -.-> U1
    U9 -.-> R1
    A9 -.-> R6
    S6 -.-> A6
```