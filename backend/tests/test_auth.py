import unittest
import json
import os
import sys
from datetime import datetime, timedelta

# Add the parent directory to sys.path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import User, Role, Permission

class AuthTestCase(unittest.TestCase):
    """Test cases for authentication functionality"""

    def setUp(self):
        """Set up test client and database"""
        self.app = app
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.create_all()
            
            # Create test admin user
            admin_role = Role(name='admin', description='Administrator role', is_system_role=True)
            admin_user = User(
                email='admin@test.com',
                first_name='Admin',
                last_name='User',
                is_active=True,
                is_admin=True,
                role='admin'
            )
            admin_user.set_password('admin123')
            admin_user.roles.append(admin_role)
            
            # Create test regular user
            user_role = Role(name='user', description='Regular user role', is_system_role=True)
            regular_user = User(
                email='user@test.com',
                first_name='Regular',
                last_name='User',
                is_active=True,
                is_admin=False,
                role='user'
            )
            regular_user.set_password('user123')
            regular_user.roles.append(user_role)
            
            db.session.add(admin_role)
            db.session.add(user_role)
            db.session.add(admin_user)
            db.session.add(regular_user)
            db.session.commit()

    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_login_success(self):
        """Test successful login"""
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'admin@test.com', 'password': 'admin123'}),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', data)
        self.assertIn('user', data)
        self.assertEqual(data['user']['email'], 'admin@test.com')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'admin@test.com', 'password': 'wrongpassword'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)

    def test_protected_route_with_valid_token(self):
        """Test accessing protected route with valid token"""
        # First login to get token
        login_response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'admin@test.com', 'password': 'admin123'}),
            content_type='application/json'
        )
        token = json.loads(login_response.data)['token']
        
        # Access protected route
        response = self.client.get(
            '/api/protected',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(response.status_code, 200)

    def test_protected_route_without_token(self):
        """Test accessing protected route without token"""
        response = self.client.get('/api/protected')
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()