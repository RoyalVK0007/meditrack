# MediTrack Hospital Management System - Setup Guide

## 🚀 First Time Setup

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

### Quick Setup

#### Windows
```bash
# Run the automated setup script
setup-first-time.bat
```

#### Linux/macOS
```bash
# Make script executable and run
chmod +x setup-first-time.sh
./setup-first-time.sh
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Directories**
   ```bash
   mkdir reports dist backend/certs
   ```

3. **Setup Database**
   ```bash
   mysql -u root -p < sql/schema.sql
   ```

4. **Generate SSL Certificates** (Optional)
   ```bash
   cd backend/certs
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```

## 🖥️ Running the Application

### Web Application
```bash
npm start
# Access at https://localhost:3000
```

### Desktop Application (Electron)
```bash
npm run electron
```

### Development Mode
```bash
npm run electron-dev
```

## 📦 Building Distribution Packages

### Automated Build

#### Windows
```bash
build-dist.bat
```

#### Linux/macOS
```bash
chmod +x build-dist.sh
./build-dist.sh
```

### Manual Build Commands

#### Build All Platforms
```bash
npm run build-all
```

#### Build Windows Only
```bash
npm run build-win
```

#### Build Linux Only
```bash
npm run build-linux
```

## 📁 Distribution Files

After building, find packages in `dist/` folder:

### Windows
- **Installer**: `MediTrack Hospital Management Setup *.exe`
- **Portable**: `MediTrack Hospital Management *.exe`

### Linux
- **AppImage**: `MediTrack Hospital Management-*.AppImage`
- **DEB Package**: `meditrack-hospital_*_amd64.deb`

## 🔧 Development Scripts

```bash
npm start           # Start web server
npm run electron    # Start desktop app
npm run electron-dev # Development mode
npm run build       # Build for current platform
npm run dist        # Build all platforms
npm test            # Run tests
npm run test:watch  # Watch mode tests
```

## 🐛 Troubleshooting

### SSL Certificate Issues
- Accept self-signed certificate warning in browser
- Or generate new certificates with OpenSSL

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in `backend/db.js`
- Verify database schema is created

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `node_modules` and reinstall if needed

### Electron Issues
- Try `npm run electron-dev` for debugging
- Check console for errors
- Ensure backend server starts successfully