#!/usr/bin/env python3
import unittest
import os
import sys

# Add the current directory to the path so we can import from backend
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == '__main__':
    # Discover and run tests
    test_loader = unittest.TestLoader()
    test_dir = os.path.join(os.path.dirname(__file__), 'tests')
    test_suite = test_loader.discover(test_dir, pattern='test_*.py')
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Exit with appropriate status code
    sys.exit(not result.wasSuccessful())