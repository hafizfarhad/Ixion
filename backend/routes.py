from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import secrets
import jwt
from models import db, User, Role, Permission, AuditLog, AccessRequest, UserInvitation
from functools import wraps
import os
from flask_cors import CORS

bp = Blueprint('api', __name__)

# Enable CORS for all routes
CORS(bp, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing

# Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            print("DEBUG: Authentication token is missing!")  # Debug log
            return jsonify({'message': 'Authentication token is missing!'}), 401
        
        try:
            # Decode the JWT token using the standardized JWT_SECRET
            data = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                print("DEBUG: Invalid authentication token!")  # Debug log
                return jsonify({'message': 'Invalid authentication token!'}), 401
                
        except jwt.ExpiredSignatureError:
            print("DEBUG: Token has expired!")  # Debug log
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            print("DEBUG: Invalid token!")  # Debug log
            return jsonify({'message': 'Invalid token!'}), 401
            
        print(f"DEBUG: Token validated for user {current_user.email}")  # Debug log
        return f(current_user, *args, **kwargs)
    
    return decorated

# Check if user is admin middleware
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

# Authentication Routes
@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password!'}), 400
        
    user = User.query.filter(db.func.lower(User.email) == data['email'].lower()).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password!'}), 401
        
    if not user.is_active:
        return jsonify({'message': 'Account is deactivated. Please contact an administrator.'}), 403
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create JWT token
    token_payload = {
        'user_id': str(user.id),
        'email': user.email,  # Include email in the token payload
        'is_admin': user.is_admin,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(token_payload, os.environ.get('JWT_SECRET'), algorithm='HS256')  # Updated to JWT_SECRET
    
    # Log the login activity
    log = AuditLog(
        user_id=user.id,
        action='login',
        resource_type='auth',
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@bp.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields!'}), 400
        
    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'Email already registered!'}), 409
    
    # Check if this is the first user (who becomes admin)
    is_first_user = User.query.count() == 0
    
    # Create new user
    new_user = User(
        email=data['email'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        is_admin=is_first_user  # First user is admin
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    # Log the registration
    log = AuditLog(
        user_id=new_user.id,
        action='register',
        resource_type='user',
        resource_id=str(new_user.id),
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    # Create JWT token
    token_payload = {
        'user_id': str(new_user.id),
        'email': new_user.email,  # Include email in the token payload
        'is_admin': new_user.is_admin,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(token_payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
    
    return jsonify({
        'message': 'User registered successfully!',
        'token': token,
        'user': new_user.to_dict()
    }), 201

# User management routes
@bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    try:
        print(f"Admin Access: {current_user.email}")  # Debug log
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        print(f"Error fetching users: {str(e)}")  # Debug log
        return jsonify({'message': 'Failed to fetch users', 'error': str(e)}), 500

@bp.route('/users/<user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    # Regular users can only see their own information
    if not current_user.is_admin and str(current_user.id) != user_id:
        return jsonify({'message': 'Permission denied!'}), 403
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found!'}), 404
        
    return jsonify(user.to_dict()), 200

@bp.route('/users/<user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    # Regular users can only update their own information
    if not current_user.is_admin and str(current_user.id) != user_id:
        return jsonify({'message': 'Permission denied!'}), 403
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found!'}), 404
        
    data = request.get_json()
    
    # Only admins can change these fields
    if current_user.is_admin:
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
    
    # Fields that any user can change for themselves
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    # Log the update
    log = AuditLog(
        user_id=current_user.id,
        action='update',
        resource_type='user',
        resource_id=str(user.id),
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully!',
        'user': user.to_dict()
    }), 200

@bp.route('/users/<user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found!'}), 404
        
    # Don't allow deleting self
    if str(current_user.id) == user_id:
        return jsonify({'message': 'Cannot delete your own account!'}), 400
        
    db.session.delete(user)
    db.session.commit()
    
    # Log the deletion
    log = AuditLog(
        user_id=current_user.id,
        action='delete',
        resource_type='user',
        resource_id=user_id,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'User deleted successfully!'}), 200

@bp.route('/users', methods=['POST'])
@token_required
@admin_required
def create_user(current_user):
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists!'}), 409
    
    # Create new user
    new_user = User(
        email=data['email'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        is_active=data.get('is_active', True),
        is_admin=data.get('is_admin', False)
    )
    new_user.set_password(data['password'])
    
    # Assign roles if provided
    if 'role_ids' in data:
        roles = Role.query.filter(Role.id.in_(data['role_ids'])).all()
        new_user.roles = roles
    
    db.session.add(new_user)
    db.session.commit()
    
    # Log the creation
    log = AuditLog(
        user_id=current_user.id,
        action='create',
        resource_type='user',
        resource_id=str(new_user.id),
        details=f"Created user {data['email']}",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!', 'user': new_user.to_dict()}), 201

# Role management routes
@bp.route('/roles', methods=['GET'])
@token_required
@admin_required
def get_roles(current_user):
    try:
        roles = Role.query.all()
        return jsonify([{
            'id': str(role.id),  # Ensure role ID is included
            'name': role.name,
            'description': role.description,
            'permissions': [permission.to_dict() for permission in role.permissions]
        } for role in roles]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch roles', 'error': str(e)}), 500

@bp.route('/roles', methods=['POST'])
@token_required
@admin_required
def create_role(current_user):
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Role name is required!'}), 400
        
    # Check if role already exists
    existing_role = Role.query.filter_by(name=data['name']).first()
    if existing_role:
        return jsonify({'message': 'Role already exists!'}), 409
        
    new_role = Role(
        name=data['name'],
        description=data.get('description')
    )
    
    # Add permissions if provided
    if 'permission_ids' in data and data['permission_ids']:
        permissions = Permission.query.filter(Permission.id.in_(data['permission_ids'])).all()
        new_role.permissions = permissions
    
    db.session.add(new_role)
    db.session.commit()
    
    # Log the creation
    log = AuditLog(
        user_id=current_user.id,
        action='create',
        resource_type='role',
        resource_id=str(new_role.id),
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Role created successfully!',
        'role': new_role.to_dict()
    }), 201

@bp.route('/roles/<role_id>', methods=['PUT'])
@token_required
@admin_required
def update_role(current_user, role_id):
    data = request.get_json()
    
    role = Role.query.get(role_id)
    if not role:
        return jsonify({'message': 'Role not found!'}), 404
    
    if 'name' in data:
        role.name = data['name']
    if 'description' in data:
        role.description = data['description']
    if 'permission_ids' in data:
        permissions = Permission.query.filter(Permission.id.in_(data['permission_ids'])).all()
        role.permissions = permissions
    
    db.session.commit()
    
    # Log the update
    log = AuditLog(
        user_id=current_user.id,
        action='update',
        resource_type='role',
        resource_id=str(role.id),
        details=f"Updated role {role.name}",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({
        'message': 'Role updated successfully!',
        'role': role.to_dict()
    }), 200

@bp.route('/roles/<role_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_role(current_user, role_id):
    role = Role.query.get(role_id)
    if not role:
        return jsonify({'message': 'Role not found!'}), 404

    # Prevent deletion of system roles
    if role.is_system_role:
        return jsonify({'message': 'System roles cannot be deleted!'}), 403

    db.session.delete(role)
    db.session.commit()

    # Log the deletion
    log = AuditLog(
        user_id=current_user.id,
        action='delete',
        resource_type='role',
        resource_id=str(role.id),
        details=f"Deleted role {role.name}",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()

    return jsonify({'message': 'Role deleted successfully!'}), 200

# Invitation System Routes
from uuid import UUID

@bp.route('/invitations', methods=['POST'])
@token_required
@admin_required
def create_invitation(current_user):
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required!'}), 400
        
    # Check if user with this email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'message': 'User with this email already exists!'}), 409
    
    # Validate and convert role_ids to UUIDs
    role_ids = data.get('role_ids', [])
    try:
        role_ids = [UUID(role_id) for role_id in role_ids]
    except ValueError:
        return jsonify({'message': 'Invalid role ID(s) provided!'}), 400
    
    # Create the user directly
    new_user = User(
        email=data['email'],
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        is_active=True,
        is_admin=False  # Default to non-admin; can be changed by admins later
    )
    new_user.set_password(data['password'])
    
    # Assign roles if provided
    if role_ids:
        roles = Role.query.filter(Role.id.in_(role_ids)).all()
        new_user.roles = roles
    
    db.session.add(new_user)
    db.session.commit()
    
    # Log the creation
    log = AuditLog(
        user_id=current_user.id,
        action='create',
        resource_type='user',
        resource_id=str(new_user.id),
        details=f"Created user {data['email']} via invitation",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    # Generate JWT token for the new user
    token_payload = {
        'user_id': str(new_user.id),
        'is_admin': new_user.is_admin,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    token = jwt.encode(token_payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
    
    return jsonify({
        'message': 'User invited and created successfully!',
        'user': new_user.to_dict(),
        'token': token
    }), 201

@bp.route('/invitations', methods=['GET'])
@token_required
@admin_required
def list_invitations(current_user):
    # Get active (unused and not expired) invitations
    active_invitations = UserInvitation.query.filter_by(used=False).filter(
        UserInvitation.expires_at > datetime.utcnow()
    ).all()
    
    return jsonify([inv.to_dict() for inv in active_invitations]), 200

@bp.route('/invitations/<invitation_id>', methods=['DELETE'])
@token_required
@admin_required
def revoke_invitation(current_user, invitation_id):
    invitation = UserInvitation.query.get(invitation_id)
    if not invitation:
        return jsonify({'message': 'Invitation not found!'}), 404
    # Instead of deleting, we'll set the expiration to now (effectively revoking it)
    invitation.expires_at = datetime.utcnow()
    db.session.commit()
    
    # Log the revocation
    log = AuditLog(
        user_id=current_user.id,
        action='revoke',
        resource_type='user_invitation',
        resource_id=str(invitation.id),
        details=f"Revoked invitation for {invitation.email}",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Invitation revoked successfully!'}), 200

@bp.route('/accept-invitation', methods=['POST'])
def accept_invitation():
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({'message': 'Token and password are required!'}), 400
        
    # Find the invitation
    invitation = UserInvitation.query.filter_by(token=data['token']).first()
    if not invitation:
        return jsonify({'message': 'Invalid invitation token!'}), 404
    if invitation.used:
        return jsonify({'message': 'This invitation has already been used!'}), 400
    if invitation.is_expired():
        return jsonify({'message': 'This invitation has expired!'}), 400
    
    # Create the user
    new_user = User(
        email=invitation.email,
        first_name=invitation.first_name,
        last_name=invitation.last_name,
        is_admin=False  # Default to non-admin; can be changed by admins later
    )
    new_user.set_password(data['password'])
    
    # Assign role if specified in the invitation
    if invitation.role_id:
        role = Role.query.get(invitation.role_id)
        if role:
            new_user.roles.append(role)
    
    # Mark invitation as used
    invitation.used = True
    
    db.session.add(new_user)
    db.session.commit()
    
    # Log the acceptance
    log = AuditLog(
        user_id=new_user.id,
        action='register',
        resource_type='user',
        resource_id=str(new_user.id),
        details="Registered via invitation",
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.add(log)
    db.session.commit()
    
    # Create JWT token
    token_payload = {
        'user_id': str(new_user.id),
        'is_admin': new_user.is_admin,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(token_payload, os.environ.get('JWT_SECRET'), algorithm='HS256')
    
    return jsonify({
        'message': 'Account created successfully!',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@bp.route('/permissions', methods=['GET'])
@token_required
@admin_required
def get_permissions(current_user):
    try:
        permissions = Permission.query.all()
        return jsonify([permission.to_dict() for permission in permissions]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch permissions', 'error': str(e)}), 500

@bp.route('/permissions', methods=['POST'])
@token_required
@admin_required
def create_permission(current_user):
    data = request.get_json()

    if not data or not data.get('name') or not data.get('resource') or not data.get('action'):
        return jsonify({'message': 'Name, resource, and action are required!'}), 400

    # Check if permission already exists
    existing_permission = Permission.query.filter_by(
        name=data['name']
    ).first()
    if existing_permission:
        return jsonify({'message': 'Permission already exists!'}), 409

    new_permission = Permission(
        name=data['name'],
        description=data.get('description'),
        resource=data['resource'],
        action=data['action']
    )

    db.session.add(new_permission)
    db.session.commit()

    return jsonify({
        'message': 'Permission created successfully!',
        'permission': new_permission.to_dict()
    }), 201

@bp.route('/audit-logs', methods=['GET'])
@token_required
@admin_required
def get_audit_logs(current_user):
    try:
        logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch audit logs', 'error': str(e)}), 500