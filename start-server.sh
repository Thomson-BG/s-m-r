#!/bin/bash

# Simple development server for Scotty Mason's Revenge
# Starts a local Python HTTP server to serve the game

echo "🎮 Starting Scotty Mason's Revenge Development Server..."
echo "📁 Serving from: $(pwd)"
echo "🌐 Game will be available at: http://localhost:8000"
echo "🔥 Press Ctrl+C to stop the server"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 Using Python 2..."
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python not found! Please install Python to run the development server."
    echo "   Alternatively, you can use any other HTTP server to serve these files."
    echo ""
    echo "Other options:"
    echo "  - Node.js: npx http-server"
    echo "  - PHP: php -S localhost:8000"
    echo "  - Any web server pointing to this directory"
    exit 1
fi