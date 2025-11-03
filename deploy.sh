#!/bin/bash

echo "Building frontend..."
cd frontend
npm run build

echo "Copying build to backend..."
cp -r dist/* ../backend/dist/

echo "Starting backend server..."
cd ../backend
python3 main.py
