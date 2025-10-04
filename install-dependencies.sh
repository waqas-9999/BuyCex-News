#!/bin/bash

# Install required dependencies for visitor tracking
echo "Installing backend dependencies..."
cd backend
npm install uuid

echo "Installing frontend dependencies..."
cd ../frontend
npm install react-icons

echo "Dependencies installed successfully!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Analytics dashboard will be available at: http://localhost:5173/admin/analytics"
