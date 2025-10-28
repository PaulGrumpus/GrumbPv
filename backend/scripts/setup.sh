#!/bin/bash

# Complete setup script for the backend

set -e

echo "🚀 Setting up BSC Escrow Backend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Determine script directory and backend root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Install dependencies
echo "📦 Installing dependencies..."
cd "$BACKEND_DIR"
npm install
echo ""

# Copy ABIs
echo "📋 Copying contract ABIs..."
cd "$SCRIPT_DIR"
bash ./copy-abis.sh
cd "$BACKEND_DIR"
echo ""

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$BACKEND_DIR/logs"
echo ""

# Copy .env.example if .env doesn't exist
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo "⚠️  Please edit .env file with your configuration!"
else
    echo "✅ .env file already exists"
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:5000/health to check if API is running"

