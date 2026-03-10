#!/bin/bash

echo "Starting X.com Scraper API..."
echo ""

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please edit .env to configure your settings"
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Installing dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
else
    echo "Virtual environment exists"
fi

# Activate virtual environment
source venv/bin/activate

# Start the server
echo ""
echo "Starting server at http://localhost:8000"
echo "API documentation: http://localhost:8000/docs"
echo ""
python main.py
