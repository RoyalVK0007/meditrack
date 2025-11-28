#!/bin/bash

echo "========================================"
echo "MediTrack Hospital Management System"
echo "First Time Setup Script (Linux/macOS)"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $(node --version)"

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL command not found in PATH"
    echo "Please ensure MySQL 8.0+ is installed and running"
    echo
fi

# Install dependencies
echo "Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p reports
mkdir -p dist
mkdir -p backend/certs

# Generate SSL certificates
echo "Generating SSL certificates..."
cd backend/certs
if command -v openssl &> /dev/null; then
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=MediTrack/CN=localhost" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "SSL certificates generated successfully"
    else
        echo "WARNING: Failed to generate SSL certificates"
    fi
else
    echo "WARNING: OpenSSL not found. Using default certificates."
fi
cd ../..

# Setup database
echo
echo "========================================"
echo "DATABASE SETUP"
echo "========================================"
echo "Please ensure MySQL is running and you have admin access."
echo

read -p "Enter MySQL username (default: root): " db_user
db_user=${db_user:-root}

read -s -p "Enter MySQL password: " db_pass
echo

echo "Creating database schema..."
mysql -u "$db_user" -p"$db_pass" < sql/schema.sql
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create database schema"
    echo "Please check your MySQL credentials and try again"
    exit 1
fi

echo
echo "========================================"
echo "SETUP COMPLETE!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Run 'npm start' to start the web server"
echo "2. Run 'npm run electron' to start the desktop app"
echo "3. Run 'npm run build-all' to create distribution packages"
echo
echo "Access the application at: https://localhost:3000"
echo "(Accept the SSL certificate warning for self-signed certificate)"
echo