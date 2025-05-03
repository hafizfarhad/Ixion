# IXION IAM - Identity and Access Management System

IXION IAM is a comprehensive Identity and Access Management solution designed to provide secure authentication, authorization, and user management for modern applications. Built with Flask and React, it offers a robust and scalable approach to managing user identities and permissions.

## Table of Contents
- [Features](#features)
- [System Architecture](#system-architecture)
- [Component Diagrams](#component-diagrams)
- [Flow Diagrams](#flow-diagrams)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

IXION IAM provides a set of identity and access management features:

### Authentication
- **User Login/Signup**: Secure email and password authentication
- **JWT Token Authentication**: Stateless authentication using JSON Web Tokens
- **Session Management**: Control and manage user sessions

### User Management
- **User CRUD Operations**: Complete lifecycle management for user accounts
- **User Profile Management**: Self-service profile updates
- **User Status Control**: Activate/deactivate user accounts

### Role-Based Access Control (RBAC)
- **Role Management**: Create, update, and delete roles
- **Permission Assignment**: Assign granular permissions to roles
- **User-Role Assignment**: Associate users with appropriate roles

### Invitation System
- **User Invitations**: Invite new users to the system
- **Invitation Tracking**: Monitor pending and used invitations
- **Secure Signup Process**: Guided registration through invitation links

### Security Features
- **Password Hashing**: Secure password storage using bcrypt
- **Rate Limiting**: Protection against brute force attacks
- **Comprehensive Audit Logging**: Track all security-relevant actions

### Administration
- **Admin Dashboard**: Web interface for system administration
- **User Administration**: Manage users, roles, and permissions
- **Access Request Workflow**: Process and approve access requests

## System Architecture

IXION IAM follows a modern web application architecture with separated frontend and backend components.

### High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Frontend   │────▶│  Backend    │────▶│  Database   │
│  (React)    │     │  (Flask)    │     │ (PostgreSQL)│
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Backend Architecture

The Flask backend is organized into the following components:

- **Routes**: API endpoints and request handling
- **Models**: Data models and database schema
- **Authentication**: JWT token generation and validation
- **Authorization**: Permission checking and access control
- **Services**: Business logic implementation

### Frontend Architecture

The React frontend consists of:

- **Components**: Reusable UI elements
- **Pages**: Screen implementations
- **Services**: API communication
- **Store**: State management
- **Auth**: Authentication handling

## Component Diagrams

### Backend Components

```
┌───────────────────────────────────────────────────────┐
│                    Flask Application                  │
│                                                       │
│  ┌───────────┐   ┌───────────┐    ┌───────────────┐   │
│  │           │   │           │    │               │   │
│  │   Routes  │──▶│  Services │───▶│     Models    │   │
│  │           │   │           │    │               │   │
│  └───────────┘   └───────────┘    └───────────────┘   │
│        │                                 ▲            │
│        ▼                                 │            │
│  ┌───────────┐                    ┌─────────────┐     │
│  │           │                    │             │     │
│  │ Middleware│───────────────────▶│  Database   │     │
│  │           │                    │             │     │
│  └───────────┘                    └─────────────┘     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Frontend Components

```
┌───────────────────────────────────────────────────────┐
│                   React Application                   │
│                                                       │
│  ┌───────────┐   ┌───────────┐    ┌───────────────┐   │
│  │           │   │           │    │               │   │
│  │   Pages   │──▶│Components │◀───│   Context     │   │
│  │           │   │           │    │               │   │
│  └───────────┘   └───────────┘    └───────────────┘   │
│        │                ▲                ▲            │
│        ▼                │                │            │
│  ┌───────────┐    ┌────────────┐   ┌────────────┐     │
│  │           │    │            │   │            │     │
│  │  Routing  │    │  Services  │──▶│Auth Service│     │
│  │           │    │            │   │            │     │
│  └───────────┘    └────────────┘   └────────────┘     │
│                          │                            │
│                          ▼                            │
│                   ┌─────────────┐                     │
│                   │             │                     │
│                   │   API       │                     │
│                   │             │                     │
│                   └─────────────┘                     │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Flow Diagrams

### Authentication Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│          │          │          │          │          │
│  Client  │          │  Server  │          │ Database │
│          │          │          │          │          │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ 1. Login Request    │                     │
     │ (email/password)    │                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ 2. Query User       │
     │                     │────────────────────▶│
     │                     │                     │
     │                     │ 3. Return User Data │
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ 4. Verify Password  │
     │                     │                     │
     │                     │ 5. Generate JWT     │
     │                     │                     │
     │ 6. Return JWT Token │                     │
     │◀────────────────────│                     │
     │                     │                     │
     │ 7. Request with JWT │                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ 8. Validate JWT     │
     │                     │                     │
     │ 9. Response         │                     │
     │◀────────────────────│                     │
     │                     │                     │
```

### User Creation Flow

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│          │          │          │          │          │
│  Admin   │          │  Server  │          │ Database │
│          │          │          │          │          │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │                     │                     │
     │ 1. Create User      │                     │
     │ Request             │                     │
     │────────────────────▶│                     │
     │                     │                     │
     │                     │ 2. Validate Input   │
     │                     │                     │
     │                     │ 3. Hash Password    │
     │                     │                     │
     │                     │ 4. Insert User      │
     │                     │────────────────────▶│
     │                     │                     │
     │                     │ 5. Return User ID   │
     │                     │◀────────────────────│
     │                     │                     │
     │                     │ 6. Add Role         │
     │                     │ Assignments         │
     │                     │────────────────────▶│
     │                     │                     │
     │                     │ 7. Create           │
     │                     │ Audit Log           │
     │                     │────────────────────▶│
     │                     │                     │
     │ 8. Return Success   │                     │
     │◀────────────────────│                     │
     │                     │                     │
```

### Invitation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│  Admin   │     │  Server  │     │  Email   │     │  Invitee │
│          │     │          │     │          │     │          │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Create      │                │                │
     │ Invitation     │                │                │
     │───────────────▶│                │                │
     │                │                │                │
     │                │ 2. Generate    │                │
     │                │ Token          │                │
     │                │                │                │
     │                │ 3. Store       │                │
     │                │ Invitation     │                │
     │                │                │                │
     │ 4. Return      │                │                │
     │ Invitation Data│                │                │
     │◀───────────────│                │                │
     │                │                │                │
     │                │ 5. Send Email  │                │
     │                │───────────────▶│                │
     │                │                │                │
     │                │                │ 6. Deliver     │
     │                │                │ Invitation     │
     │                │                │───────────────▶│
     │                │                │                │
     │                │                │                │
     │                │                │ 7. Access      │
     │                │                │ Invitation Link│
     │                │◀────────────────────────────────│
     │                │                │                │
     │                │ 8. Validate    │                │
     │                │ Token          │                │
     │                │                │                │
     │                │ 9. Create User │                │
     │                │ Account        │                │
     │                │                │                │
     │                │ 10. Return     │                │
     │                │ JWT Token      │                │
     │                │────────────────────────────────▶│
     │                │                │                │
```

## Database Schema

IXION IAM uses a relational database with the following key entities:

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │ User Roles  │       │    Roles    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ user_id     │       │ id          │
│ email       │       │ role_id     │       │ name        │
│ password    │◀─────▶│             │◀─────▶│ description │
│ first_name  │       └─────────────┘       │ system_role │
│ last_name   │                             └─────────────┘
│ is_active   │                                    ▲
│ is_admin    │                                    │
│ created_at  │                                    │
│ updated_at  │       ┌──────────────┐       ┌─────────────┐
│ last_login  │       │    Role      │       │ Permissions │
└─────────────┘       │ Permissions  │       ├─────────────┤
      ▲               ├──────────────┤       │ id          │
      │               │ role_id      │       │ name        │
      │               │ permission_id│◀─────▶│ description │
      │               └──────────────┘       │ resource    │
      │                                      │ action      │
      │                                      └─────────────┘
      │
      │               ┌─────────────┐
      │               │ Invitations │
      │               ├─────────────┤
      └──────────────▶│ id          │
                      │ email       │
                      │ token       │
                      │ role_id     │
                      │ invited_by  │
                      │ used        │
                      │ expires_at  │
                      └─────────────┘
                             ▲
                             │
      ┌─────────────┐        │
      │ Audit Logs  │        │
      ├─────────────┤        │
      │ id          │        │
      │ user_id     │◀───────┘
      │ action      │
      │ resource    │
      │ resource_id │
      │ details     │
      │ ip_address  │
      │ timestamp   │
      └─────────────┘
```

## API Documentation

IXION IAM exposes a RESTful API for authentication, user management, and access control.

### Authentication Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/auth/login` | POST | Authenticate user and return JWT token | None |
| `/api/auth/signup` | POST | Register new user | None |
| `/api/protected` | GET | Test protected route | Valid JWT |

### User Management Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/users` | GET | List all users | Admin |
| `/api/users` | POST | Create new user | Admin |
| `/api/users/:id` | GET | Get user details | Admin or Self |
| `/api/users/:id` | PUT | Update user | Admin or Self |
| `/api/users/:id` | DELETE | Delete user | Admin |

### Role Management Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/roles` | GET | List all roles | Admin |
| `/api/roles` | POST | Create new role | Admin |
| `/api/roles/:id` | PUT | Update role | Admin |
| `/api/roles/:id` | DELETE | Delete role | Admin |

### Permission Management Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/permissions` | GET | List all permissions | Admin |
| `/api/permissions` | POST | Create new permission | Admin |

### Invitation Management Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/invitations` | POST | Create invitation | Admin |
| `/api/invitations` | GET | List active invitations | Admin |
| `/api/invitations/:id` | DELETE | Revoke invitation | Admin |
| `/api/accept-invitation` | POST | Accept invitation | None |

### System Endpoints

| Endpoint | Method | Description | Required Permissions |
|----------|--------|-------------|---------------------|
| `/api/system/status` | GET | Get system status | None |
| `/api/audit-logs` | GET | Get audit logs | Admin |

## Installation

### Prerequisites

- Python 3.9+
- Node.js 14+
- PostgreSQL 12+
- Docker and Docker Compose (optional)

### Backend Setup

1. **Clone the repository**

```bash
git clone https://github.com/hafizfarhad/Ixion.git
cd Ixion/backend
```

2. **Create and activate a virtual environment**

```bash
python -m venv Ixion-venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set environment variables**

Create a `.env` file in the backend directory:

```
JWT_SECRET=your_secure_jwt_secret_key
DATABASE_URL=postgresql://username:password@localhost/IXION_db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

5. **Initialize the database**

```bash
# Create the PostgreSQL database
createdb IXION_db

# Initialize database schema and default roles
python app.py
```

6. **Run the backend server**

```bash
python app.py
```

The backend server will be available at http://localhost:5000.

### Frontend Setup

1. **Navigate to the frontend directory**

```bash
cd ../frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure API endpoint**

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Run the frontend development server**

```bash
npm start
```

The frontend will be available at http://localhost:3000.

### Docker Deployment

For containerized deployment, use Docker Compose:

```bash
# From the project root
docker-compose up -d # If you get permission error - use `sudo`
```

This will start both the frontend and backend services along with a PostgreSQL database.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | fallback_secret_here |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://iamuser:iampass@localhost/IXION_db |
| `ADMIN_EMAIL` | Default admin email | admin@ixion.com |
| `ADMIN_PASSWORD` | Default admin password | admin123 |

### Customizing Roles and Permissions

The system initializes with default roles (admin, user) and permissions. To customize:

1. Modify the `initialize_db()` function in `app.py`
2. Add or modify permissions in the permissions list
3. Update role-permission assignments

## Usage

### First-Time Setup

1. Access the frontend application at http://localhost:3000
2. Log in using the default admin credentials:
   - Email: admin@ixion.com (or the value of `ADMIN_EMAIL`)
   - Password: admin123 (or the value of `ADMIN_PASSWORD`)
3. Change the default admin password immediately
4. Create additional users through the admin interface or invitation system

### User Management

As an administrator, you can:
- Create, view, update, and delete users
- Assign roles to users
- Activate/deactivate user accounts
- Send invitations to new users

### Role Management

Administrators can:
- Create and manage roles
- Define permissions for each role
- Assign roles to users

### Permission Management

Administrators can:
- View available permissions
- Create custom permissions
- Assign permissions to roles

## Security Considerations

IXION IAM implements several security features, but consider the following best practices:

1. **Use strong secrets**: Replace the default JWT secret with a strong, randomly generated value
2. **Secure communications**: Use HTTPS in production environments
3. **Regular updates**: Keep dependencies updated to patch security vulnerabilities
4. **Password policies**: Implement password complexity requirements
5. **Monitoring**: Review audit logs regularly for suspicious activities
6. **Access review**: Periodically review user access rights

## Development Roadmap

Future enhancements planned for IXION IAM:

- Multi-factor authentication (MFA)
- Social login integration
- Password reset functionality
- Enhanced audit logging and reporting
- User session management
- API rate limiting improvements
- Self-service access requests

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/hafizfarhad/Ixion/blob/main/LICENSE) file for details.

---

© 2025 IXION IAM Project