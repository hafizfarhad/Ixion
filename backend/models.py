import os
import datetime
import uuid
import jwt
import bcrypt
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID

db = SQLAlchemy()

# User-Role association table for many-to-many relationship
user_roles = db.Table('user_roles',
    db.Column('user_id', UUID(as_uuid=True), db.ForeignKey('users.id')),
    db.Column('role_id', UUID(as_uuid=True), db.ForeignKey('roles.id'))
)

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(50), default='user')  # Legacy field for backward compatibility
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    audit_logs = db.relationship('AuditLog', backref='user', lazy='dynamic')
    access_requests = db.relationship('AccessRequest', backref='requester', foreign_keys='AccessRequest.requester_id', lazy='dynamic')
    approved_requests = db.relationship('AccessRequest', backref='approver', foreign_keys='AccessRequest.approver_id', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'roles': [role.to_dict() for role in self.roles]
        }
        
    def __repr__(self):
        return f'<User {self.email}>'
    
    def generate_auth_token(self, expiration=3600):
        """Generate a JWT token for the user with their permissions"""
        # Get all permissions from all roles
        permissions = []
        for role in self.roles:
            for permission in role.permissions:
                permissions.append(permission.name)
                
        payload = {
            'user_id': str(self.id),
            'email': self.email,
            'role': self.role,  # Legacy field
            'roles': [role.name for role in self.roles],
            'is_admin': self.is_admin,
            'permissions': list(set(permissions)),  # Remove duplicates
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expiration)
        }
        return jwt.encode(payload, os.getenv('JWT_SECRET', 'fallback_secret_here'), algorithm='HS256')

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    is_system_role = db.Column(db.Boolean, default=False)  # Added missing field
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    permissions = db.relationship('Permission', secondary='role_permissions', backref=db.backref('roles', lazy='dynamic'))
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'permissions': [permission.to_dict() for permission in self.permissions]
        }
        
    def __repr__(self):
        return f'<Role {self.name}>'

class Permission(db.Model):
    __tablename__ = 'permissions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=True)
    resource = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'description': self.description,
            'resource': self.resource,
            'action': self.action
        }
        
    def __repr__(self):
        return f'<Permission {self.name}>'

# Association table for Role-Permission relationship
role_permissions = db.Table('role_permissions',
    db.Column('role_id', UUID(as_uuid=True), db.ForeignKey('roles.id')),
    db.Column('permission_id', UUID(as_uuid=True), db.ForeignKey('permissions.id'))
)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    action = db.Column(db.String(50), nullable=False)
    resource_type = db.Column(db.String(50), nullable=True)
    resource_id = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'user_email': self.user.email if self.user else None,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
        
    def __repr__(self):
        return f'<AuditLog {self.id}>'

class AccessRequest(db.Model):
    __tablename__ = 'access_requests'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    role_id = db.Column(UUID(as_uuid=True), db.ForeignKey('roles.id'))
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    reason = db.Column(db.Text, nullable=True)
    approver_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=True)
    approval_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationship
    role = db.relationship('Role')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'requester_id': str(self.requester_id),
            'requester_email': self.requester.email if self.requester else None,
            'role_id': str(self.role_id) if self.role_id else None,
            'role_name': self.role.name if self.role else None,
            'status': self.status,
            'reason': self.reason,
            'approver_id': str(self.approver_id) if self.approver_id else None,
            'approver_email': self.approver.email if self.approver else None,
            'approval_notes': self.approval_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
    def __repr__(self):
        return f'<AccessRequest {self.id}>'

class UserInvitation(db.Model):
    __tablename__ = 'user_invitations'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    token = db.Column(db.String(128), unique=True, nullable=False)
    role_id = db.Column(UUID(as_uuid=True), db.ForeignKey('roles.id'), nullable=True)
    invited_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    used = db.Column(db.Boolean, default=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    role = db.relationship('Role')
    inviter = db.relationship('User', foreign_keys=[invited_by])
    
    def is_expired(self):
        return datetime.datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role_id': str(self.role_id) if self.role_id else None,
            'role_name': self.role.name if self.role else None,
            'invited_by': str(self.invited_by),
            'inviter_email': self.inviter.email if self.inviter else None,
            'used': self.used,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_expired': self.is_expired()
        }
        
    def __repr__(self):
        return f'<UserInvitation {self.email}>'