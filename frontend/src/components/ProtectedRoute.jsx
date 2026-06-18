import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ adminOnly = false }) {
  const token = localStorage.getItem('flashmind_token');
  let user = null;

  try {
    const userStr = localStorage.getItem('flashmind_user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error parsing user data:', e);
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
