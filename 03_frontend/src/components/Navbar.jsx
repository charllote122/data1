// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon, ChartBarIcon, UserIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="text-xl font-bold text-primary-600">Health Predictor</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-700 hover:text-primary-600">
                            <HomeIcon className="w-5 h-5" />
                        </Link>

                        {user ? (
                            <>
                                <Link to="/history" className="text-gray-700 hover:text-primary-600">
                                    <ChartBarIcon className="w-5 h-5" />
                                </Link>
                                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                                    <UserIcon className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-primary-600"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-primary-600 hover:text-primary-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;