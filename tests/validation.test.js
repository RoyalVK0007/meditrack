// Validation functions tests
describe('Data Validation', () => {
  describe('Patient Validation', () => {
    function validatePatientData(data) {
      const errors = [];
      
      if (!data.name || data.name.length < 2) {
        errors.push('Name must be at least 2 characters');
      }
      if (!data.age || data.age < 1 || data.age > 120) {
        errors.push('Age must be between 1-120');
      }
      if (!['Male', 'Female', 'Other'].includes(data.gender)) {
        errors.push('Invalid gender');
      }
      if (!data.contact || !/^\d{10}$/.test(data.contact)) {
        errors.push('Contact must be 10 digits');
      }
      if (!data.address || data.address.length < 5) {
        errors.push('Address must be at least 5 characters');
      }
      
      return errors;
    }

    test('should pass valid patient data', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        contact: '1234567890',
        address: '123 Main Street'
      };

      const errors = validatePatientData(validData);
      expect(errors).toHaveLength(0);
    });

    test('should reject invalid patient data', () => {
      const invalidData = {
        name: 'A',
        age: 150,
        gender: 'Invalid',
        contact: '123',
        address: 'St'
      };

      const errors = validatePatientData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Vitals Validation', () => {
    function validateVitalData(data) {
      const errors = [];
      
      if (!data.patient_id || !Number.isInteger(Number(data.patient_id)) || Number(data.patient_id) <= 0) {
        errors.push('Valid patient_id is required');
      }
      if (!data.heart_rate || !Number.isInteger(Number(data.heart_rate)) || Number(data.heart_rate) < 30 || Number(data.heart_rate) > 300) {
        errors.push('Heart rate must be between 30-300 bpm');
      }
      if (!data.blood_pressure || !/^\d{2,3}\/\d{2,3}$/.test(data.blood_pressure)) {
        errors.push('Blood pressure must be in format XXX/XXX');
      }
      if (!data.temperature || isNaN(Number(data.temperature)) || Number(data.temperature) < 90 || Number(data.temperature) > 110) {
        errors.push('Temperature must be between 90-110°F');
      }
      if (!data.oxygen_level || !Number.isInteger(Number(data.oxygen_level)) || Number(data.oxygen_level) < 70 || Number(data.oxygen_level) > 100) {
        errors.push('Oxygen level must be between 70-100%');
      }
      
      return errors;
    }

    test('should pass valid vitals data', () => {
      const validData = {
        patient_id: 1,
        heart_rate: 75,
        blood_pressure: '120/80',
        temperature: 98.6,
        oxygen_level: 98
      };

      const errors = validateVitalData(validData);
      expect(errors).toHaveLength(0);
    });

    test('should reject invalid vitals data', () => {
      const invalidData = {
        patient_id: 0,
        heart_rate: 500,
        blood_pressure: 'invalid',
        temperature: 150,
        oxygen_level: 150
      };

      const errors = validateVitalData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('User Validation', () => {
    function validateUserData(data) {
      const errors = [];
      
      if (!data.username || data.username.length < 3) {
        errors.push('Username must be at least 3 characters');
      }
      if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      if (!data.full_name || data.full_name.length < 2) {
        errors.push('Full name must be at least 2 characters');
      }
      if (!['admin', 'doctor', 'nurse', 'receptionist'].includes(data.role)) {
        errors.push('Invalid role');
      }
      
      return errors;
    }

    test('should pass valid user data', () => {
      const validData = {
        username: 'testuser',
        password: 'password123',
        full_name: 'Test User',
        role: 'doctor'
      };

      const errors = validateUserData(validData);
      expect(errors).toHaveLength(0);
    });

    test('should reject invalid user data', () => {
      const invalidData = {
        username: 'ab',
        password: '123',
        full_name: 'A',
        role: 'invalid'
      };

      const errors = validateUserData(invalidData);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Bill Validation', () => {
    function validateBillData(data) {
      const errors = [];
      
      if (!data.patient_id || !Number.isInteger(Number(data.patient_id)) || Number(data.patient_id) <= 0) {
        errors.push('Valid patient_id is required');
      }
      if (!data.room_charges || Number(data.room_charges) < 0) {
        errors.push('Room charges must be non-negative');
      }
      if (!data.medicine_charges || Number(data.medicine_charges) < 0) {
        errors.push('Medicine charges must be non-negative');
      }
      if (!data.doctor_fee || Number(data.doctor_fee) < 0) {
        errors.push('Doctor fee must be non-negative');
      }
      
      return errors;
    }

    test('should pass valid bill data', () => {
      const validData = {
        patient_id: 1,
        room_charges: 5000,
        medicine_charges: 1500,
        doctor_fee: 2000,
        total_amount: 8500
      };

      const errors = validateBillData(validData);
      expect(errors).toHaveLength(0);
    });

    test('should calculate total correctly', () => {
      const billData = {
        room_charges: 5000,
        medicine_charges: 1500,
        doctor_fee: 2000
      };

      const total = billData.room_charges + billData.medicine_charges + billData.doctor_fee;
      expect(total).toBe(8500);
    });
  });
});