from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import bcrypt
import datetime
from dotenv import load_dotenv
import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address 
from models import db, User

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'fallback_secret_here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://iamuser:iampass@localhost/ixios_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# NEW: Create tables (run once)
with app.app_context():
    db.create_all()

# Rate limiter configuration
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# Registration route
@app.route('/api/register', methods=['POST'])
@limiter.limit("3/minute") # Rate limit registration attempts
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')  # Default role is 'user'

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 409

    # Create new user
    new_user = User(email=email, role=role)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500

# Login route
@app.route('/api/login', methods=['POST'])
@limiter.limit("5/minute") # Rate limit login attempts
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    
    # Add debug logging
    if not user:
        print(f"Login failed: User with email {email} not found")
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.check_password(password):
        print(f"Login failed: Incorrect password for user {email}")
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'email': email,
        'role': user.role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(
            seconds=int(os.getenv('JWT_EXPIRATION', 3600)))
    }, app.config['JWT_SECRET'], algorithm='HS256')

    return jsonify({"token": token})

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

if __name__ == '__main__':
    app.run(port=5000, debug=True)