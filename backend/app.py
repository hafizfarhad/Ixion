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
from routes import bp

# Load environment variables from .env
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'fallback_secret_here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://iamuser:iampass@localhost/ixios_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Register blueprint for routes
app.register_blueprint(bp, url_prefix='/api')

# Rate limiter setup
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Function to seed initial data
def initialize_db():
    # Only seed once when no roles exist
    if Role.query.count() > 0:
        return

    # Create roles
    admin_role = Role(
        name='admin',
        description='Administrator with full access',
        is_system_role=True
    )
    user_role = Role(
        name='user',
        description='Regular user with limited access',
        is_system_role=True
    )

    # Explicit permission list
    permissions = [
        Permission(name='user:list', description='List users', resource='user', action='list'),
        Permission(name='user:read', description='View user details', resource='user', action='read'),
        Permission(name='user:create', description='Create users', resource='user', action='create'),
        Permission(name='user:update', description='Update users', resource='user', action='update'),
        Permission(name='user:delete', description='Delete users', resource='user', action='delete'),
        Permission(name='role:list', description='List roles', resource='role', action='list'),
        Permission(name='role:read', description='View role details', resource='role', action='read'),
        Permission(name='role:create', description='Create roles', resource='role', action='create'),
        Permission(name='role:update', description='Update roles', resource='role', action='update'),
        Permission(name='role:delete', description='Delete roles', resource='role', action='delete'),
        Permission(name='permission:list', description='List permissions', resource='permission', action='list'),
        Permission(name='permission:read', description='View permission details', resource='permission', action='read'),
        Permission(name='permission:create', description='Create permissions', resource='permission', action='create'),
        Permission(name='permission:update', description='Update permissions', resource='permission', action='update'),
        Permission(name='permission:delete', description='Delete permissions', resource='permission', action='delete'),
        Permission(name='group:list', description='List groups', resource='group', action='list'),
        Permission(name='group:read', description='View group details', resource='group', action='read'),
        Permission(name='group:create', description='Create groups', resource='group', action='create'),
        Permission(name='group:update', description='Update groups', resource='group', action='update'),
        Permission(name='group:delete', description='Delete groups', resource='group', action='delete'),
        Permission(name='policy:list', description='List policies', resource='policy', action='list'),
        Permission(name='policy:read', description='View policy details', resource='policy', action='read'),
        Permission(name='policy:create', description='Create policies', resource='policy', action='create'),
        Permission(name='policy:update', description='Update policies', resource='policy', action='update'),
        Permission(name='policy:delete', description='Delete policies', resource='policy', action='delete'),
        Permission(name='audit:list', description='View audit logs', resource='audit', action='list'),
        Permission(name='security:list', description='List security events', resource='security', action='list'),
        Permission(name='security:update', description='Update security events', resource='security', action='update'),
        Permission(name='application:list', description='List applications', resource='application', action='list'),
        Permission(name='application:read', description='View application details', resource='application', action='read'),
        Permission(name='application:create', description='Create applications', resource='application', action='create'),
        Permission(name='application:update', description='Update applications', resource='application', action='update'),
        Permission(name='application:delete', description='Delete applications', resource='application', action='delete'),
    ]

    # Attach all permissions to admin role
    for p in permissions:
        db.session.add(p)
        admin_role.permissions.append(p)

    # Attach subset to user role
    user_perms = {'user:read', 'role:list', 'role:read', 'group:list', 'group:read'}
    for p in permissions:
        if p.name in user_perms:
            user_role.permissions.append(p)

    db.session.add_all([admin_role, user_role])

    # Create or update the admin user
    admin_email    = os.getenv('ADMIN_EMAIL', 'admin@ixion.com')
    admin_password = os.getenv('ADMIN_PASSWORD', 'securepassword123')

    admin = User.query.filter_by(email=admin_email).first()
    if not admin:
        admin = User(
            email=admin_email,
            first_name='Admin',
            last_name='User',
            is_active=True,
            is_admin=True,
            role='admin'
        )
        db.session.add(admin)

    admin.set_password(admin_password)
    if admin_role not in admin.roles:
        admin.roles.append(admin_role)

    db.session.commit()
    app.logger.info(f"[seed] Default roles & admin ({admin_email}) created.")

# Replace @app.before_first_request with an alternative approach
@app.before_request
def setup_database_once():
    if not hasattr(app, 'db_initialized'):
        with app.app_context():
            db.create_all()
            initialize_db()
            app.db_initialized = True

@app.route('/api/protected')
def protected():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(' ', 1)[1]
    try:
        decoded = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        return jsonify({"message": f"Hello {decoded.get('email')} (Role: {decoded.get('role')})"})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

@app.route('/api/hello')
def hello():
    return jsonify({"message": "Hello from IAM backend!"})

@app.route('/api/system/status', methods=['GET'])
def system_status():
    has_users = User.query.count() > 0
    return jsonify({"has_users": has_users, "version": "1.0.0"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)