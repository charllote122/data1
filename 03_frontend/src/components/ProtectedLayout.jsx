// src/components/ProtectedLayout.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import { ROUTES } from '../constants/routes';

export function ProtectedLayout() {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Render layout with outlet for protected routes
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}