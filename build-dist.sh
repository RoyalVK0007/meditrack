#!/bin/bash

echo "========================================"
echo "MediTrack Hospital Management System"
echo "Distribution Builder"
echo "========================================"
echo

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "ERROR: Dependencies not installed!"
    echo "Please run './setup-first-time.sh' first"
    exit 1
fi

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
mkdir -p dist

# Build for current platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo
    echo "Building Linux distribution..."
    npm run build-linux
    if [ $? -ne 0 ]; then
        echo "ERROR: Linux build failed"
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo
    echo "Building macOS distribution..."
    npm run build -- --mac
    if [ $? -ne 0 ]; then
        echo "ERROR: macOS build failed"
        exit 1
    fi
fi

# Try to build Windows if wine is available (for cross-compilation)
if command -v wine &> /dev/null; then
    echo
    echo "Building Windows distribution (cross-compile)..."
    npm run build-win
    if [ $? -ne 0 ]; then
        echo "WARNING: Windows cross-compilation failed"
        echo "Run this script on Windows to build Windows distribution"
    fi
fi

echo
echo "========================================"
echo "BUILD COMPLETE!"
echo "========================================"
echo
echo "Distribution files created in 'dist' folder:"
echo
ls -la dist/
echo
echo "Installation packages are ready for distribution!"
echo