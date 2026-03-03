// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/users';
import {
    UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, HeartIcon,
    // RulerIcon doesn't exist, using ArrowsUpDownIcon for height
    ArrowsUpDownIcon,
    ScaleIcon,
    PencilIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await userService.getProfile();
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone_number: data.phone_number || '',
                date_of_birth: data.date_of_birth || '',
                height: data.height || '',
                weight: data.weight || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.phone_number && !/^\+?1?\d{9,15}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Invalid phone number format';
        }

        if (formData.height && (formData.height < 50 || formData.height > 300)) {
            newErrors.height = 'Height must be between 50cm and 300cm';
        }

        if (formData.weight && (formData.weight < 20 || formData.weight > 500)) {
            newErrors.weight = 'Weight must be between 20kg and 500kg';
        }

        if (formData.date_of_birth) {
            const dob = new Date(formData.date_of_birth);
            const today = new Date();
            if (dob > today) {
                newErrors.date_of_birth = 'Date of birth cannot be in the future';
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess('');

        try {
            const updatedUser = await userService.updateProfile({
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone_number: formData.phone_number || null,
                date_of_birth: formData.date_of_birth || null,
                height: formData.height ? parseFloat(formData.height) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null
            });

            updateUser(updatedUser);
            setSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: error.message || 'Update failed' });
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateBMI = () => {
        if (formData.height && formData.weight) {
            const heightInMeters = formData.height / 100;
            const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
            return bmi;
        }
        return null;
    };

    const calculateAge = () => {
        if (formData.date_of_birth) {
            const today = new Date();
            const birthDate = new Date(formData.date_of_birth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
        return null;
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal weight';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    };

    const getBMIColor = (bmi) => {
        if (!bmi) return 'text-gray-600';
        if (bmi < 18.5) return 'text-blue-600';
        if (bmi < 25) return 'text-green-600';
        if (bmi < 30) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your personal information and health data
                        </p>
                    </div>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            <PencilIcon className="w-5 h-5" />
                            Edit Profile
                        </button>
                    )}
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5" />
                        {errors.general}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                    {/* Profile Summary */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {user?.full_name || user?.username}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!editing || loading}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                                        ${!editing ? 'bg-gray-50' : 'bg-white'}
                                        ${errors.first_name ? 'border-red-500' : 'border-gray-300'}
                                        focus:ring-primary-200`}
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={!editing || loading}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2
                                        ${!editing ? 'bg-gray-50' : 'bg-white'}
                                        ${errors.last_name ? 'border-red-500' : 'border-gray-300'}
                                        focus:ring-primary-200`}
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                                            ${!editing ? 'bg-gray-50' : 'bg-white'}
                                            ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}
                                            focus:ring-primary-200`}
                                        placeholder="+1234567890"
                                    />
                                </div>
                                {errors.phone_number && (
                                    <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                                            ${!editing ? 'bg-gray-50' : 'bg-white'}
                                            ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}
                                            focus:ring-primary-200`}
                                    />
                                </div>
                                {errors.date_of_birth && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                                )}
                            </div>

                            {/* Height - Using ArrowsUpDownIcon instead of RulerIcon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height (cm)
                                </label>
                                <div className="relative">
                                    <ArrowsUpDownIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                                            ${!editing ? 'bg-gray-50' : 'bg-white'}
                                            ${errors.height ? 'border-red-500' : 'border-gray-300'}
                                            focus:ring-primary-200`}
                                        placeholder="170"
                                        step="0.1"
                                    />
                                </div>
                                {errors.height && (
                                    <p className="mt-1 text-sm text-red-600">{errors.height}</p>
                                )}
                            </div>

                            {/* Weight */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight (kg)
                                </label>
                                <div className="relative">
                                    <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2
                                            ${!editing ? 'bg-gray-50' : 'bg-white'}
                                            ${errors.weight ? 'border-red-500' : 'border-gray-300'}
                                            focus:ring-primary-200`}
                                        placeholder="70"
                                        step="0.1"
                                    />
                                </div>
                                {errors.weight && (
                                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                                )}
                            </div>
                        </div>

                        {/* BMI Display */}
                        {calculateBMI() && (
                            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <HeartIcon className="w-8 h-8 text-primary-600" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Your BMI: {calculateBMI()}
                                        </h3>
                                        <p className={`text-sm ${getBMIColor(calculateBMI())}`}>
                                            {getBMICategory(calculateBMI())}
                                            {calculateAge() && ` • ${calculateAge()} years old`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {editing && (
                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        loadProfile();
                                        setErrors({});
                                    }}
                                    disabled={loading}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Account Status */}
                <div className="mt-6 bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Email Verification</span>
                            {user?.is_verified ? (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-yellow-600">
                                    <XCircleIcon className="w-5 h-5" />
                                    Not Verified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Account Type</span>
                            <span className="font-medium text-gray-900">Free</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Last Login</span>
                            <span className="text-gray-900">
                                {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;