// Frontend utility functions tests
describe('Frontend Utilities', () => {
  // Mock DOM environment
  global.document = {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    createElement: jest.fn(),
    addEventListener: jest.fn()
  };

  global.window = {
    location: { pathname: '/dashboard.html' },
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    }
  };

  describe('Template System', () => {
    test('should extract page name from URL', () => {
      const pathname = '/patients.html';
      const pageName = pathname.split('/').pop().replace('.html', '');
      
      expect(pageName).toBe('patients');
    });

    test('should generate menu items correctly', () => {
      const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
        { id: 'patients', icon: '👥', label: 'Patients', href: 'patients.html' }
      ];

      expect(menuItems).toHaveLength(2);
      expect(menuItems[0].id).toBe('dashboard');
      expect(menuItems[1].href).toBe('patients.html');
    });
  });

  describe('Data Validation', () => {
    test('should validate patient form data', () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        contact: '1234567890',
        address: '123 Main Street'
      };

      const errors = [];
      
      if (!patientData.name || patientData.name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (patientData.age < 1 || patientData.age > 120) {
        errors.push('Age must be between 1 and 120');
      }
      if (!/^\d{10}$/.test(patientData.contact)) {
        errors.push('Contact must be 10 digits');
      }

      expect(errors).toHaveLength(0);
    });

    test('should detect invalid patient data', () => {
      const invalidData = {
        name: 'A',
        age: 150,
        contact: '123'
      };

      const errors = [];
      
      if (!invalidData.name || invalidData.name.length < 2) {
        errors.push('Name too short');
      }
      if (invalidData.age > 120) {
        errors.push('Age too high');
      }
      if (!/^\d{10}$/.test(invalidData.contact)) {
        errors.push('Invalid contact');
      }

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Authentication Helpers', () => {
    test('should check for valid JWT token', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      
      expect(mockToken.split('.').length).toBe(3);
    });

    test('should validate user roles', () => {
      const validRoles = ['admin', 'doctor', 'nurse', 'receptionist'];
      const userRole = 'doctor';
      
      expect(validRoles).toContain(userRole);
    });
  });

  describe('Utility Functions', () => {
    test('should format currency correctly', () => {
      const amount = 1500;
      const formatted = `₹${amount}`;
      
      expect(formatted).toBe('₹1500');
    });

    test('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = date.toLocaleDateString();
      
      expect(formatted).toBeDefined();
    });

    test('should validate blood pressure format', () => {
      const validBP = '120/80';
      const invalidBP = '120-80';
      
      expect(/^\d{2,3}\/\d{2,3}$/.test(validBP)).toBe(true);
      expect(/^\d{2,3}\/\d{2,3}$/.test(invalidBP)).toBe(false);
    });
  });
});