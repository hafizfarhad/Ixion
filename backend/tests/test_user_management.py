import unittest
import json
import os
import sys
from datetime import datetime

# Add the parent directory to sys.path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import User, Role, Permission

class UserManagementTestCase(unittest.TestCase):
    """Test cases for user management functionality"""

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
            
            # Store IDs for later use
            self.admin_id = str(admin_user.id)
            self.user_id = str(regular_user.id)

    def tearDown(self):
        """Clean up after tests"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
    
    def get_admin_token(self):
        """Helper method to get admin authentication token"""
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'admin@test.com', 'password': 'admin123'}),
            content_type='application/json'
        )
        return json.loads(response.data)['token']
    
    def get_user_token(self):
        """Helper method to get regular user authentication token"""
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps({'email': 'user@test.com', 'password': 'user123'}),
            content_type='application/json'
        )
        return json.loads(response.data)['token']

    def test_list_users_as_admin(self):
        """Test listing all users as admin"""
        token = self.get_admin_token()
        response = self.client.get(
            '/api/users',
            headers={'Authorization': f'Bearer {token}'}
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 2)  # Should have admin and regular user

    def test_list_users_as_regular_user(self):
        """Test listing users as regular user (should be denied)"""
        token = self.get_user_token()
        response = self.client.get(
            '/api/users',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(response.status_code, 403)  # Should be forbidden

    def test_create_user_as_admin(self):
        """Test creating a new user as admin"""
        token = self.get_admin_token()
        response = self.client.post(
            '/api/users',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'email': 'newuser@test.com',
                'password': 'password123',
                'first_name': 'New',
                'last_name': 'User',
                'is_active': True,
                'is_admin': False
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['user']['email'], 'newuser@test.com')
        
        # Verify the user was created in the database
        with self.app.app_context():
            user = User.query.filter_by(email='newuser@test.com').first()
            self.assertIsNotNone(user)

    def test_update_user_profile(self):
        """Test updating user profile"""
        token = self.get_user_token()
        response = self.client.put(
            f'/api/users/{self.user_id}',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'first_name': 'Updated',
                'last_name': 'Name'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['user']['first_name'], 'Updated')
        self.assertEqual(data['user']['last_name'], 'Name')

    def test_user_cannot_update_other_user(self):
        """Test that a regular user cannot update another user's profile"""
        token = self.get_user_token()
        response = self.client.put(
            f'/api/users/{self.admin_id}',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'first_name': 'Hacked',
                'last_name': 'Admin'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 403)  # Should be forbidden

    def test_admin_can_update_any_user(self):
        """Test that admin can update any user's profile"""
        token = self.get_admin_token()
        response = self.client.put(
            f'/api/users/{self.user_id}',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'first_name': 'Admin',
                'last_name': 'Updated',
                'is_active': False  # Only admin can toggle this
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['user']['first_name'], 'Admin')
        self.assertEqual(data['user']['last_name'], 'Updated')
        self.assertEqual(data['user']['is_active'], False)

if __name__ == '__main__':
    unittest.main()