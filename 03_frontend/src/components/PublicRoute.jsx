// src/components/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ROUTES } from '../constants/routes';

const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    // If user is authenticated, redirect to dashboard
    if (user) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
};

export default PublicRoute;