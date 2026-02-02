#!/usr/bin/env bash
set -e

cd app


# Define ASSETS_DIR, defaulting to ./assets if not set
ASSETS_DIR="${ASSETS_DIR:-./assets}"

# Check if assets directory exists
[ -d "$ASSETS_DIR" ] || { echo "Assets not found: $ASSETS_DIR"; exit 1; }

# Export ASSETS_DIR for the application
export ASSETS_DIR

# Set model path if using local models
export MODEL_PATH="${ASSETS_DIR}/models/best_real_only_model.pth"

echo "🐟 Starting AquaGrade AI..."
echo "🚀 Launching application..."

# Check if we have the React app or Streamlit app
if [ -d "aqua-grade-view-main" ] && [ -f "working_api_server.py" ]; then
    echo "🌐 Starting React app with API server..."
    
    # Check if node_modules exists, if not install dependencies
    if [ ! -d "aqua-grade-view-main/node_modules" ]; then
        echo "📦 Installing Node.js dependencies..."
        cd aqua-grade-view-main
        npm install
        cd ..
    fi
    
    # Start API server in background
    python3 working_api_server.py &
    API_PID=$!
    
    # Wait for API server to start
    sleep 3
    
    # Start React app
    cd aqua-grade-view-main
    npm run dev &
    REACT_PID=$!
    
    echo "✅ AquaGrade AI is running!"
    echo "📊 API Server: http://localhost:5001"
    echo "🌐 React App: http://localhost:8080"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait $API_PID $REACT_PID
    
elif [ -f "app_website.py" ]; then
    echo "🌐 Starting Streamlit app..."
    exec streamlit run app_website.py --server.headless true --server.port ${PORT:-8501}
else
    echo "❌ No application found to launch"
    exit 1
fi