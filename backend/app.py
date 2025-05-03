from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import bcrypt
import datetime
from dotenv import load_dotenv
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address 
from models import db, User, Role, Permission
import json
from routes import bp

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'fallback_secret_here')  # Standardized to JWT_SECRET
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://iamuser:iampass@localhost/ixios_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Register the IAM blueprint
app.register_blueprint(bp, url_prefix='/api/iam')

# Rate limiter configuration
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Initialize database with default roles and permissions
def initialize_db():
    # First drop all tables and recreate them to avoid type mismatches
    db.drop_all()
    db.create_all()
    
    # Only initialize if the database is empty
    if Role.query.count() == 0:
        # Create default roles
        admin_role = Role(name='admin', description='Administrator with full access', is_system_role=True)
        user_role = Role(name='user', description='Regular user with limited access', is_system_role=True)
        
        # Create permissions
        permissions = [
            # User management permissions
            Permission(name='user:list', description='List users', resource='user', action='list'),
            Permission(name='user:read', description='View user details', resource='user', action='read'),
            Permission(name='user:create', description='Create users', resource='user', action='create'),
            Permission(name='user:update', description='Update users', resource='user', action='update'),
            Permission(name='user:delete', description='Delete users', resource='user', action='delete'),
            
            # Role management permissions
            Permission(name='role:list', description='List roles', resource='role', action='list'),
            Permission(name='role:read', description='View role details', resource='role', action='read'),
            Permission(name='role:create', description='Create roles', resource='role', action='create'),
            Permission(name='role:update', description='Update roles', resource='role', action='update'),
            Permission(name='role:delete', description='Delete roles', resource='role', action='delete'),
            
            # Permission management permissions
            Permission(name='permission:list', description='List permissions', resource='permission', action='list'),
            Permission(name='permission:read', description='View permission details', resource='permission', action='read'),
            Permission(name='permission:create', description='Create permissions', resource='permission', action='create'),
            Permission(name='permission:update', description='Update permissions', resource='permission', action='update'),
            Permission(name='permission:delete', description='Delete permissions', resource='permission', action='delete'),
            
            # Group management permissions
            Permission(name='group:list', description='List groups', resource='group', action='list'),
            Permission(name='group:read', description='View group details', resource='group', action='read'),
            Permission(name='group:create', description='Create groups', resource='group', action='create'),
            Permission(name='group:update', description='Update groups', resource='group', action='update'),
            Permission(name='group:delete', description='Delete groups', resource='group', action='delete'),
            
            # Policy management permissions
            Permission(name='policy:list', description='List policies', resource='policy', action='list'),
            Permission(name='policy:read', description='View policy details', resource='policy', action='read'),
            Permission(name='policy:create', description='Create policies', resource='policy', action='create'),
            Permission(name='policy:update', description='Update policies', resource='policy', action='update'),
            Permission(name='policy:delete', description='Delete policies', resource='policy', action='delete'),
            
            # Audit log permissions
            Permission(name='audit:list', description='View audit logs', resource='audit', action='list'),
            
            # Security event permissions
            Permission(name='security:list', description='List security events', resource='security', action='list'),
            Permission(name='security:update', description='Update security events', resource='security', action='update'),
            
            # Application management permissions
            Permission(name='application:list', description='List applications', resource='application', action='list'),
            Permission(name='application:read', description='View application details', resource='application', action='read'),
            Permission(name='application:create', description='Create applications', resource='application', action='create'),
            Permission(name='application:update', description='Update applications', resource='application', action='update'),
            Permission(name='application:delete', description='Delete applications', resource='application', action='delete'),
        ]
        
        # Add all permissions to admin role
        for permission in permissions:
            db.session.add(permission)
            admin_role.permissions.append(permission)
        
        # Add limited permissions to user role
        user_permissions = [p for p in permissions if p.name in [
            'user:read',  # Users can view their own details
            'role:list',  # Users can view available roles
            'role:read',
            'group:list',  # Users can view available groups
            'group:read',
        ]]
        
        for permission in user_permissions:
            user_role.permissions.append(permission)
        
        db.session.add(admin_role)
        db.session.add(user_role)
        
        # Get admin credentials from environment variables
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@ixion.com')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        # Always create or update the admin user with the latest credentials
        # This ensures the admin user is created with the correct environment variable values
        admin_user = User.query.filter_by(email=admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email, 
                first_name='Admin',
                last_name='User',
                is_active=True,
                is_admin=True,
                role='admin'
            )
            db.session.add(admin_user)
        
        # Set the password (will update it if user already exists)
        admin_user.set_password(admin_password)
        
        # Ensure admin has the admin role
        if admin_role not in admin_user.roles:
            admin_user.roles.append(admin_role)
        
        db.session.commit()
        print(f"Admin user {admin_email} created/updated successfully")
        print("Database initialized with default roles and permissions")

# Registration route
@app.route('/api/register', methods=['POST'])
@limiter.limit("3/minute") # Rate limit registration attempts
def register():
    data = request.get_json()
    
    # Debug line to check incoming data
    print(f"Registration request received: {data}")
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'

    if not email or not password:
        print("Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    # Check if user already exists
    try:
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"User with email {email} already exists")
            return jsonify({"error": "User already exists"}), 409

        # Create new user
        new_user = User(email=email, role=role)
        new_user.set_password(password)
        
        # Add default user role
        default_role = Role.query.filter_by(name='user').first()
        if default_role:
            new_user.roles.append(default_role)
        
        db.session.add(new_user)
        db.session.commit()
        print(f"User {email} registered successfully")
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed", "message": str(e)}), 500

# Login route
@app.route('/api/login', methods=['POST'])
@limiter.limit("5/minute") # Rate limit login attempts
def login():
    data = request.get_json()
    
    # Debug line
    print(f"Login request received: {data}")
    
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        print("Missing email or password")
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    
    # Add debug logging
    if not user:
        print(f"Login failed: User with email {email} not found")
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.check_password(password):
        print(f"Login failed: Incorrect password for user {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    # Update last login timestamp
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()

    print(f"User {email} logged in successfully")
    
    # Use the user model method to generate token
    token = user.generate_auth_token(
        expiration=int(os.getenv('JWT_EXPIRATION', 3600))
    )

    return jsonify({
        "token": token,
        "user": {
            "id": str(user.id),  # Convert UUID to string
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "roles": [role.name for role in user.roles],
            "is_admin": user.is_admin
        }
    })

# Flask middleware for protected routes
@app.route('/api/protected')
def protected():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401

    try:
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(
            token,
            app.config['JWT_SECRET'],
            algorithms=['HS256']
        )
        return jsonify({"message": f"Hello {decoded['email']} (Role: {decoded['role']})"})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError as e:
        print(f"Invalid token error: {str(e)}")  # Debug logging
        return jsonify({"error": "Invalid token"}), 401

@app.route('/api/hello')
def hello():
    return jsonify({"message": "Hello from IAM backend!"})

# Add a system status endpoint for the frontend to check if setup is needed
@app.route('/api/system/status', methods=['GET'])
def system_status():
    # Check if any users exist in the system
    has_users = User.query.count() > 0
    
    # Return the system status
    return jsonify({
        "has_users": has_users,
        "version": "1.0.0"
    })

if __name__ == '__main__':
    with app.app_context():
        initialize_db()  # Initialize database on startup
    app.run(host='0.0.0.0', port=5000, debug=True)