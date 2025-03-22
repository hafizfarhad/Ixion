from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import bcrypt
import datetime
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'fallback_secret_here')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

# Login route
@app.route('/api/login', methods=['POST'])
def login():
    # Mock user database (replace with real DB later)
    valid_users = {
        "admin@test.com": {"password": hash_password("secure123"), "role": "admin"},
        "user@test.com": {"password": hash_password("userpass"), "role": "user"}
    }

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = valid_users.get(email)
    
    if not user or not check_password(password, user['password_hash']):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'email': email,
        'role': user['role'],
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