import unittest
import json
import os
import sys
from datetime import datetime

# Add the parent directory to sys.path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import User, Role, Permission

class RolesPermissionsTestCase(unittest.TestCase):
    """Test cases for roles and permissions functionality"""

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
            
            # Create sample permissions
            user_read = Permission(name='user:read', description='View user details', resource='user', action='read')
            user_create = Permission(name='user:create', description='Create users', resource='user', action='create')
            role_read = Permission(name='role:read', description='View role details', resource='role', action='read')
            
            # Add permissions to admin role
            admin_role.permissions.append(user_read)
            admin_role.permissions.append(user_create)
            admin_role.permissions.append(role_read)
            
            # Create user role with limited permissions
            user_role = Role(name='user', description='Regular user role', is_system_role=True)
            user_role.permissions.append(user_read)
            user_role.permissions.append(role_read)
            
            # Create regular user
            regular_user = User(
                email='user@test.com',
                first_name='Regular',
                last_name='User',
                is_active=True,
                is_admin=False,
                role='user'
            )
            regular_user.set_password('user123')
            
            # Associate users with roles
            admin_user.roles.append(admin_role)
            regular_user.roles.append(user_role)
            
            # Add to database
            db.session.add(admin_role)
            db.session.add(user_role)
            db.session.add(user_read)
            db.session.add(user_create)
            db.session.add(role_read)
            db.session.add(admin_user)
            db.session.add(regular_user)
            db.session.commit()
            
            # Store IDs for later use
            self.admin_role_id = str(admin_role.id)
            self.user_role_id = str(user_role.id)
            self.user_read_id = str(user_read.id)

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

    def test_list_roles_as_admin(self):
        """Test listing all roles as admin"""
        token = self.get_admin_token()
        response = self.client.get(
            '/api/roles',
            headers={'Authorization': f'Bearer {token}'}
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 2)  # Should have admin and user roles
        self.assertTrue(any(role['name'] == 'admin' for role in data))
        self.assertTrue(any(role['name'] == 'user' for role in data))

    def test_create_role_as_admin(self):
        """Test creating a new role as admin"""
        token = self.get_admin_token()
        response = self.client.post(
            '/api/roles',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'name': 'developer',
                'description': 'Developer role with code access',
                'permission_ids': [self.user_read_id]
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['role']['name'], 'developer')
        self.assertEqual(len(data['role']['permissions']), 1)
        
        # Verify the role was created in the database
        with self.app.app_context():
            role = Role.query.filter_by(name='developer').first()
            self.assertIsNotNone(role)
            self.assertEqual(len(role.permissions), 1)

    def test_update_role_as_admin(self):
        """Test updating a role as admin"""
        token = self.get_admin_token()
        response = self.client.put(
            f'/api/roles/{self.user_role_id}',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'description': 'Updated user role description',
                'permission_ids': [self.user_read_id]  # Only keep user:read permission
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['role']['description'], 'Updated user role description')
        self.assertEqual(len(data['role']['permissions']), 1)
        self.assertEqual(data['role']['permissions'][0]['name'], 'user:read')

    def test_delete_role_as_admin(self):
        """Test deleting a non-system role as admin"""
        # First create a new role that can be deleted
        token = self.get_admin_token()
        create_response = self.client.post(
            '/api/roles',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'name': 'temporary_role',
                'description': 'Temporary role for testing deletion',
                'is_system_role': False
            }),
            content_type='application/json'
        )
        create_data = json.loads(create_response.data)
        role_id = create_data['role']['id']
        
        # Now delete the role
        delete_response = self.client.delete(
            f'/api/roles/{role_id}',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(delete_response.status_code, 200)
        
        # Verify the role was deleted
        with self.app.app_context():
            role = Role.query.filter_by(name='temporary_role').first()
            self.assertIsNone(role)

    def test_cannot_delete_system_role(self):
        """Test that system roles cannot be deleted"""
        token = self.get_admin_token()
        response = self.client.delete(
            f'/api/roles/{self.admin_role_id}',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        self.assertEqual(response.status_code, 403)  # Should be forbidden
        
        # Verify the role still exists
        with self.app.app_context():
            role = Role.query.get(self.admin_role_id)
            self.assertIsNotNone(role)

    def test_list_permissions_as_admin(self):
        """Test listing all permissions as admin"""
        token = self.get_admin_token()
        response = self.client.get(
            '/api/permissions',
            headers={'Authorization': f'Bearer {token}'}
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 3)  # Should have user:read, user:create, role:read
        
        # Check that the expected permissions are there
        permission_names = [p['name'] for p in data]
        self.assertIn('user:read', permission_names)
        self.assertIn('user:create', permission_names)
        self.assertIn('role:read', permission_names)

    def test_create_permission_as_admin(self):
        """Test creating a new permission as admin"""
        token = self.get_admin_token()
        response = self.client.post(
            '/api/permissions',
            headers={'Authorization': f'Bearer {token}'},
            data=json.dumps({
                'name': 'role:delete',
                'description': 'Delete roles',
                'resource': 'role',
                'action': 'delete'
            }),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['permission']['name'], 'role:delete')
        
        # Verify the permission was created in the database
        with self.app.app_context():
            permission = Permission.query.filter_by(name='role:delete').first()
            self.assertIsNotNone(permission)

if __name__ == '__main__':
    unittest.main()