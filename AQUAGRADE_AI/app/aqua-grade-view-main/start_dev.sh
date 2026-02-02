#!/usr/bin/env bash
set -e

echo "🐟 Starting AquaGrade AI React App..."
echo "🌐 Modern React/TypeScript with Vite"
echo "✨ Beautiful UI with Tailwind CSS and shadcn/ui"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo ""

# Start the development server
npm run dev
