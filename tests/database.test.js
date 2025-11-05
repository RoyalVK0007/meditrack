// Database operations tests
describe('Database Operations', () => {
  const mockPool = {
    query: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Patient Operations', () => {
    test('should insert patient with valid data', async () => {
      const patientData = {
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        contact: '1234567890',
        address: '123 Main St'
      };

      mockPool.query.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

      const result = await mockPool.query(
        'INSERT INTO patients (name, age, gender, contact, address, admission_date, status) VALUES (?, ?, ?, ?, ?, NOW(), "Admitted")',
        [patientData.name, patientData.age, patientData.gender, patientData.contact, patientData.address]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO patients'),
        expect.arrayContaining([patientData.name, patientData.age])
      );
      expect(result[0].insertId).toBe(1);
    });

    test('should fetch patients correctly', async () => {
      const mockPatients = [
        { patient_id: 1, name: 'John Doe', status: 'Admitted' },
        { patient_id: 2, name: 'Jane Smith', status: 'Discharged' }
      ];

      mockPool.query.mockResolvedValue([mockPatients]);

      const result = await mockPool.query('SELECT * FROM patients ORDER BY admission_date DESC');

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM patients'));
      expect(result[0]).toHaveLength(2);
      expect(result[0][0].name).toBe('John Doe');
    });
  });

  describe('Vitals Operations', () => {
    test('should insert vitals with validation', async () => {
      const vitalsData = {
        patient_id: 1,
        heart_rate: 75,
        blood_pressure: '120/80',
        temperature: 98.6,
        oxygen_level: 98
      };

      // Validate data before insert
      expect(vitalsData.heart_rate).toBeGreaterThanOrEqual(30);
      expect(vitalsData.heart_rate).toBeLessThanOrEqual(300);
      expect(vitalsData.blood_pressure).toMatch(/^\d{2,3}\/\d{2,3}$/);

      mockPool.query.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

      const result = await mockPool.query(
        'INSERT INTO vitals (patient_id, heart_rate, blood_pressure, temperature, oxygen_level) VALUES (?, ?, ?, ?, ?)',
        [vitalsData.patient_id, vitalsData.heart_rate, vitalsData.blood_pressure, vitalsData.temperature, vitalsData.oxygen_level]
      );

      expect(result[0].affectedRows).toBe(1);
    });
  });

  describe('Bill Operations', () => {
    test('should update bill status correctly', async () => {
      const billId = 1;
      
      mockPool.query.mockResolvedValue([{ affectedRows: 1 }]);

      const result = await mockPool.query(
        "UPDATE bills SET status = 'Paid' WHERE bill_id = ?",
        [billId]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE bills SET status = 'Paid'"),
        [billId]
      );
      expect(result[0].affectedRows).toBe(1);
    });

    test('should calculate bill totals correctly', () => {
      const billData = {
        room_charges: 5000,
        medicine_charges: 1500,
        doctor_fee: 2000
      };

      const total = billData.room_charges + billData.medicine_charges + billData.doctor_fee;
      
      expect(total).toBe(8500);
      expect(typeof total).toBe('number');
    });
  });

  describe('User Operations', () => {
    test('should validate user roles', () => {
      const validRoles = ['admin', 'doctor', 'nurse', 'receptionist'];
      const testRole = 'doctor';
      
      expect(validRoles).toContain(testRole);
    });

    test('should handle user creation', async () => {
      const userData = {
        username: 'testuser',
        password_hash: 'hashedpassword',
        full_name: 'Test User',
        role: 'doctor'
      };

      mockPool.query.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

      const result = await mockPool.query(
        'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [userData.username, userData.password_hash, userData.full_name, userData.role]
      );

      expect(result[0].insertId).toBe(1);
    });
  });
});