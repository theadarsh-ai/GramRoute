#!/bin/bash
set -e

echo "Building frontend..."
npx vite build 2>&1

echo "Starting FastAPI server on port 5000..."
python -m uvicorn server_py.main:app --host 0.0.0.0 --port 5000 --reload
