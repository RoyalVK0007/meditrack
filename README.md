# MediTrack Hospital Management System v1.0 Beta

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)

## 🏥 Project Overview

MediTrack is a comprehensive, offline-first hospital management system designed for healthcare facilities to manage patient records, vitals tracking, medications, billing, and administrative operations. Built with Node.js, MySQL, and modern web technologies, it provides a secure, fast, and intuitive interface for medical staff.

**Perfect for hospitals with limited internet connectivity or strict data privacy requirements.**

## 🚀 V1.0 Beta Features

### 👥 **Patient Management**
- ✅ Complete patient registration and profiles
- ✅ Advanced search and filtering
- ✅ Sortable patient lists (ID, Name, Status)
- ✅ Patient details view with comprehensive information
- ✅ Edit/Update patient information
- ✅ Delete patients with confirmation
- ✅ Data validation and error handling
- ✅ Audit logging for all patient operations

### 💓 **Vitals Tracking**
- ✅ Record patient vitals (Heart Rate, BP, Temperature, Oxygen)
- ✅ Interactive Chart.js visualizations
- ✅ Historical vitals trends
- ✅ Real-time vitals monitoring
- ✅ Dashboard vitals overview

### 💊 **Medication Management**
- ✅ Medicine inventory tracking
- ✅ Prescription management
- ✅ Stock level monitoring
- ✅ Dosage and frequency tracking

### 💰 **Billing System**
- ✅ Professional PDF invoice generation
- ✅ Itemized billing (Room, Medicine, Doctor fees)
- ✅ Payment status tracking
- ✅ Search and sort billing records
- ✅ Audit logging for billing operations
- ✅ Indian Rupee (₹) currency support

### 📊 **Dashboard & Analytics**
- ✅ Real-time hospital statistics
- ✅ Interactive vitals trend charts
- ✅ Hospital information display
- ✅ Emergency contacts with one-click dialing
- ✅ Fire alarm system integration

### ⚙️ **Administration**
- ✅ Seed demo data functionality
- ✅ Clear all data with confirmation
- ✅ User management interface
- ✅ System statistics and monitoring

### 📋 **Reports & Documentation**
- ✅ Daily reports generation
- ✅ Excel export functionality
- ✅ PDF bill generation with hospital branding
- ✅ Comprehensive system documentation

### 🔒 **Security & Audit**
- ✅ HTTPS encryption with SSL certificates
- ✅ Comprehensive audit logging
- ✅ Data validation and sanitization
- ✅ Secure local data storage
- ✅ Role-based access control framework

### 🎨 **User Experience**
- ✅ Modern, responsive web interface
- ✅ Smooth animations and transitions
- ✅ Mobile-friendly design
- ✅ Intuitive navigation
- ✅ Professional medical theme
- ✅ Real-time notifications and alerts

## 🛠️ Technology Stack

### **Frontend**
- **HTML5, CSS3, JavaScript** - Core web technologies
- **Chart.js** - Interactive data visualizations
- **Responsive Design** - Mobile-first approach
- **Modern CSS Grid/Flexbox** - Professional layouts

### **Backend**
- **Node.js 18+** - Server runtime
- **MySQL2** - Database connectivity
- **PDFKit** - PDF generation
- **XLSX** - Excel file handling
- **HTTPS** - Secure communication

### **Database**
- **MySQL 8.0+** - Relational database
- **Comprehensive Schema** - Patients, vitals, billing, audit logs
- **Foreign Key Constraints** - Data integrity
- **Optimized Queries** - Fast performance

### **Security**
- **Self-signed SSL Certificates** - HTTPS encryption
- **Data Validation** - Input sanitization
- **Audit Logging** - Complete operation tracking
- **Local Storage** - No external dependencies

## 📁 Project Structure

```
meditrack-hospital/
├── frontend/
│   ├── *.html         # Web pages (dashboard, patients, billing, etc.)
│   ├── *.js           # Client-side JavaScript
│   ├── style.css      # Unified styling
│   └── assets/        # Images and resources
├── backend/
│   ├── server.js      # HTTPS server
│   ├── routes.js      # API endpoints
│   ├── db.js          # Database connection
│   └── certs/         # SSL certificates
├── sql/
│   └── schema.sql     # Database schema
├── reports/           # Generated PDFs and exports
├── package.json       # Dependencies
├── setup.bat          # Windows setup script
└── README.md          # Documentation
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))
- Git (for cloning)

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/meditrack-hospital.git
   cd meditrack-hospital
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up database:**
   ```bash
   # Update backend/db.js with your MySQL credentials
   mysql -u root -p < sql/schema.sql
   ```

4. **Start the server:**
   ```bash
   npm start
   # or
   node backend/server.js
   ```

5. **Access the application:**
   ```
   https://localhost:3000
   ```
   *Accept the SSL certificate warning (self-signed)*

### **Demo Data**
Use the "Seed Demo Data" button in Admin panel to populate with sample data.

## 🎯 Use Cases

- **Small to Medium Hospitals** - Complete patient management
- **Clinics** - Patient records and billing
- **Emergency Centers** - Quick patient tracking
- **Rural Healthcare** - Offline-first operation
- **Training Institutes** - Medical software education
- **Healthcare Startups** - MVP development base

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/meditrack-hospital/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/meditrack-hospital/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/meditrack-hospital/wiki)

## ⚠️ Disclaimer

This software is for educational and development purposes. For production use in healthcare environments, ensure compliance with local healthcare regulations (HIPAA, GDPR, etc.) and conduct proper security audits.

---

**Made with ❤️ for the healthcare community**

*Star ⭐ this repository if you find it helpful!*