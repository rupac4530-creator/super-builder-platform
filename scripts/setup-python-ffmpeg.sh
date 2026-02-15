#!/usr/bin/env bash
# Future Enhancement Setup Script for Engine Alto
# This script sets up Python and FFmpeg on Linux/macOS when they are not properly installed
# Usage: chmod +x scripts/setup-python-ffmpeg.sh && ./scripts/setup-python-ffmpeg.sh

set -euo pipefail

echo "========================================"
echo "  Engine Alto — Python & FFmpeg Setup"
echo "========================================"

# Function to check if a command is available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check current status
echo ""
echo "Checking current installations..."

python_installed=false
ffmpeg_installed=false

# Check Python
if command_exists python3; then
    python_version=$(python3 --version 2>&1)
    echo "Python found: $python_version"
    python_installed=true
elif command_exists python; then
    python_version=$(python --version 2>&1)
    echo "Python found: $python_version"
    python_installed=true
else
    echo "Python NOT found"
fi

# Check FFmpeg
if command_exists ffmpeg; then
    ffmpeg_version=$(ffmpeg -version 2>&1 | head -1)
    echo "FFmpeg found: $ffmpeg_version"
    ffmpeg_installed=true
else
    echo "FFmpeg NOT found"
fi

# Install Python if needed
if [ "$python_installed" = false ]; then
    echo ""
    echo "Installing Python..."
    
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y python3 python3-pip
    elif command_exists yum; then
        sudo yum install -y python3 python3-pip
    elif command_exists brew; then
        brew install python
    else
        echo "Error: No package manager found. Please install Python manually."
        exit 1
    fi
    
    echo "Python installation completed"
fi

# Install FFmpeg if needed
if [ "$ffmpeg_installed" = false ]; then
    echo ""
    echo "Installing FFmpeg..."
    
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    elif command_exists yum; then
        sudo yum install -y ffmpeg
    elif command_exists brew; then
        brew install ffmpeg
    else
        echo "Error: No package manager found. Please install FFmpeg manually."
        exit 1
    fi
    
    echo "FFmpeg installation completed"
fi

# Verify installations
echo ""
echo "Verifying installations..."

verification_passed=true

if command_exists python3; then
    python_version=$(python3 --version 2>&1)
    echo "✓ Python verified: $python_version"
elif command_exists python; then
    python_version=$(python --version 2>&1)
    echo "✓ Python verified: $python_version"
else
    echo "✗ Python still not found"
    verification_passed=false
fi

if command_exists ffmpeg; then
    ffmpeg_version=$(ffmpeg -version 2>&1 | head -1)
    echo "✓ FFmpeg verified: $ffmpeg_version"
else
    echo "✗ FFmpeg still not found"
    verification_passed=false
fi

# Install Hugging Face CLI if Python is available
if [ "$verification_passed" = true ]; then
    echo ""
    echo "Installing Hugging Face CLI..."
    
    if command_exists python3; then
        python3 -m pip install --user huggingface-hub[cli]
    elif command_exists python; then
        python -m pip install --user huggingface-hub[cli]
    fi
    
    echo "✓ Hugging Face CLI installed successfully"
fi

# Final status
echo ""
echo "========================================"
if [ "$verification_passed" = true ]; then
    echo "  Setup completed successfully!"
    echo "  Run './scripts/verify-host.sh' to verify all tools are working."
else
    echo "  Setup completed with issues."
    echo "  Please check the error messages above and try again."
fi
echo "========================================"

# Exit with appropriate code
if [ "$verification_passed" = true ]; then
    exit 0
else
    exit 1
fi