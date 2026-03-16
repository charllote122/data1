// src/pages/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/users';
import {
    UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, HeartIcon,
    ArrowsUpDownIcon,
    ScaleIcon,
    PencilIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon,
    TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon, CameraIcon,
    DocumentArrowDownIcon, BellIcon, ShieldCheckIcon,
    ComputerDesktopIcon, DevicePhoneMobileIcon,
    ClockIcon, MapPinIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [showSessions, setShowSessions] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        height: '',
        weight: '',
        bio: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        blood_type: '',
        allergies: '',
        medical_conditions: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Load profile on component mount and when user changes
    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await userService.getProfile();

            // Merge with existing user data to ensure nothing is lost
            setFormData({
                first_name: data.first_name ?? user?.first_name ?? '',
                last_name: data.last_name ?? user?.last_name ?? '',
                phone_number: data.phone_number ?? '',
                date_of_birth: data.date_of_birth ?? '',
                height: data.height?.toString() ?? '',
                weight: data.weight?.toString() ?? '',
                bio: data.bio ?? '',
                address: data.address ?? '',
                emergency_contact: data.emergency_contact ?? '',
                emergency_phone: data.emergency_phone ?? '',
                blood_type: data.blood_type ?? '',
                allergies: data.allergies ?? '',
                medical_conditions: data.medical_conditions ?? ''
            });

            if (data.profile_image) {
                setImagePreview(data.profile_image);
            }

            // Load active sessions
            await loadActiveSessions();

        } catch (error) {
            console.error('Failed to load profile:', error);
            setErrors({ load: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const loadActiveSessions = async () => {
        try {
            const sessions = await userService.getActiveSessions();
            setActiveSessions(sessions ?? []);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ image: 'Image size must be less than 5MB' });
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors({ image: 'File must be an image' });
                return;
            }
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!profileImage) return null;

        const formData = new FormData();
        formData.append('profile_image', profileImage);

        try {
            const result = await userService.uploadProfileImage(formData);
            if (result.user) {
                updateUser(result.user);
            }
            setSuccess('Profile image updated successfully!');
            setProfileImage(null);
            return result;
        } catch (error) {
            setErrors({ image: error.message ?? 'Failed to upload image' });
            throw error;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (formData.phone_number && !/^\+?[1-9]\d{1,14}$/.test(formData.phone_number.replace(/[\s()-]/g, ''))) {
            newErrors.phone_number = 'Invalid phone number format';
        }

        if (formData.emergency_phone && !/^\+?[1-9]\d{1,14}$/.test(formData.emergency_phone.replace(/[\s()-]/g, ''))) {
            newErrors.emergency_phone = 'Invalid emergency phone format';
        }

        if (formData.height && (Number(formData.height) < 50 || Number(formData.height) > 300)) {
            newErrors.height = 'Height must be between 50cm and 300cm';
        }

        if (formData.weight && (Number(formData.weight) < 20 || Number(formData.weight) > 500)) {
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
            // Prepare data for update - only send fields that have values
            const updateData = {};

            // Only include fields that have been modified
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    if (key === 'height' || key === 'weight') {
                        updateData[key] = formData[key] ? parseFloat(formData[key]) : null;
                    } else {
                        updateData[key] = formData[key] || null;
                    }
                }
            });

            // Update profile
            const updatedUser = await userService.updateProfile(updateData);

            // Upload image if selected
            if (profileImage) {
                await uploadImage();
            }

            // Update auth context with new user data
            if (updatedUser) {
                updateUser(updatedUser);
            }

            setSuccess('Profile updated successfully!');
            setEditing(false);
            setProfileImage(null);

            // Reload profile to ensure we have latest data
            await loadProfile();

        } catch (error) {
            console.error('Update failed:', error);
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setErrors({ general: error.message ?? 'Update failed' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            setErrors({ confirm_password: 'Passwords do not match' });
            return;
        }

        if (passwordData.new_password.length < 8) {
            setErrors({ new_password: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        setErrors({});
        setSuccess('');

        try {
            await userService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            setSuccess('Password changed successfully!');
            setChangingPassword(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            setErrors({ password: error.message ?? 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        try {
            await userService.deleteAccount();
            await logout();
            window.location.href = '/';
        } catch (error) {
            setErrors({ delete: error.message ?? 'Failed to delete account' });
            setShowDeleteConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async (format = 'json') => {
        try {
            const data = await userService.exportData(format);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `health_data_${new Date().toISOString().split('T')[0]}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSuccess('Data exported successfully!');
        } catch (error) {
            setErrors({ export: 'Failed to export data' });
        }
    };

    const handleTerminateSession = async (sessionId) => {
        try {
            await userService.terminateSession(sessionId);
            setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
            setSuccess('Session terminated successfully');
        } catch (error) {
            setErrors({ session: 'Failed to terminate session' });
        }
    };

    const calculateBMI = () => {
        const height = Number(formData.height);
        const weight = Number(formData.weight);
        if (height && weight) {
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
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
        const bmiNum = Number(bmi);
        if (bmiNum < 18.5) return 'Underweight';
        if (bmiNum < 25) return 'Normal weight';
        if (bmiNum < 30) return 'Overweight';
        return 'Obese';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your personal information and health data
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {!editing && !changingPassword && (
                            <>
                                <button
                                    onClick={() => setChangingPassword(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <KeyIcon className="w-5 h-5" />
                                    Change Password
                                </button>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                    Edit Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
                        >
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-green-700">{success}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error Message */}
                {errors.general && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-red-700">{errors.general}</span>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-6 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Profile Image */}
                            <div className="relative">
                                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-primary-600" />
                                    )}
                                </div>
                                {editing && (
                                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors border-2 border-white">
                                        <CameraIcon className="w-4 h-4 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {errors.image && (
                                    <p className="absolute -bottom-6 left-0 text-xs text-red-600 whitespace-nowrap">
                                        {errors.image}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {formData.first_name || formData.last_name
                                        ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim()
                                        : user?.username || 'User'}
                                </h2>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                    <p className="text-gray-600 flex items-center gap-1">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        {user?.email || ''}
                                    </p>
                                    {formData.phone_number && (
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <PhoneIcon className="w-4 h-4" />
                                            {formData.phone_number}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Member since {user?.date_joined
                                        ? new Date(user.date_joined).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {changingPassword ? (
                        // Password Change Form
                        <form onSubmit={handlePasswordSubmit} className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>

                            {errors.password && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    {errors.password}
                                </div>
                            )}

                            <div className="space-y-4 max-w-md">
                                {/* Current Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? 'text' : 'password'}
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${errors.current_password ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword.current ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.current_password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                            className={`w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${errors.new_password ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword.new ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.new_password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                    />
                                    {errors.confirm_password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                    {loading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordData({
                                            current_password: '',
                                            new_password: '',
                                            confirm_password: ''
                                        });
                                        setErrors({});
                                    }}
                                    disabled={loading}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Profile Form
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info Section */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                </div>

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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
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
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                </div>

                                {/* Bio */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        rows="3"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>

                                {/* Contact Info Section */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
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
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-not-allowed"
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
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                                ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    {errors.phone_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            disabled={!editing || loading}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                                ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Street address, City, State, ZIP"
                                        />
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Contact
                                    </label>
                                    <input
                                        type="text"
                                        name="emergency_contact"
                                        value={formData.emergency_contact}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.emergency_contact ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Contact name"
                                    />
                                </div>

                                {/* Emergency Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Emergency Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="emergency_phone"
                                        value={formData.emergency_phone}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.emergency_phone ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Emergency contact number"
                                    />
                                    {errors.emergency_phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.emergency_phone}</p>
                                    )}
                                </div>

                                {/* Health Info Section */}
                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Information</h3>
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
                                            max={new Date().toISOString().split('T')[0]}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                                ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                    </div>
                                    {errors.date_of_birth && (
                                        <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                                    )}
                                </div>

                                {/* Blood Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Blood Type
                                    </label>
                                    <select
                                        name="blood_type"
                                        value={formData.blood_type}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.blood_type ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Select blood type</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                    {errors.blood_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>
                                    )}
                                </div>

                                {/* Height */}
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
                                            min="50"
                                            max="300"
                                            step="0.1"
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                                ${errors.height ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="170"
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
                                            min="20"
                                            max="500"
                                            step="0.1"
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                                ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                                ${errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="70"
                                        />
                                    </div>
                                    {errors.weight && (
                                        <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                                    )}
                                </div>

                                {/* Allergies */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Allergies
                                    </label>
                                    <textarea
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        rows="2"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.allergies ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="List any allergies (e.g., penicillin, peanuts, latex)"
                                    />
                                </div>

                                {/* Medical Conditions */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Medical Conditions
                                    </label>
                                    <textarea
                                        name="medical_conditions"
                                        value={formData.medical_conditions}
                                        onChange={handleChange}
                                        disabled={!editing || loading}
                                        rows="2"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-200 outline-none transition
                                            ${!editing ? 'bg-gray-50' : 'bg-white hover:border-gray-400'}
                                            ${errors.medical_conditions ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="List any medical conditions (e.g., diabetes, hypertension)"
                                    />
                                </div>
                            </div>

                            {/* BMI Display */}
                            {calculateBMI() && (
                                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                                    <div className="flex items-center gap-4">
                                        <HeartIcon className="w-8 h-8 text-primary-600 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Your BMI: {calculateBMI()}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {getBMICategory(calculateBMI())}
                                                {calculateAge() && ` • ${calculateAge()} years old`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Body Mass Index (BMI) is a screening tool, not a diagnostic tool.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Edit Mode Buttons */}
                            {editing && (
                                <div className="mt-6 flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
                                            setProfileImage(null);
                                        }}
                                        disabled={loading}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ComputerDesktopIcon className="w-5 h-5 text-primary-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
                            </div>
                            <button
                                onClick={() => setShowSessions(!showSessions)}
                                className="text-sm text-primary-600 hover:text-primary-700"
                            >
                                {showSessions ? 'Hide' : 'Show'} ({activeSessions.length})
                            </button>
                        </div>

                        <AnimatePresence>
                            {showSessions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3 overflow-hidden"
                                >
                                    {activeSessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                {session.device_type === 'mobile' ? (
                                                    <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400 mt-1" />
                                                ) : (
                                                    <ComputerDesktopIcon className="w-5 h-5 text-gray-400 mt-1" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {session.device || 'Unknown device'} • {session.browser || 'Unknown browser'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        IP: {session.ip || 'Unknown'} • Last active: {session.last_active ? new Date(session.last_active).toLocaleString() : 'Unknown'}
                                                    </p>
                                                </div>
                                                {session.is_current && (
                                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            {!session.is_current && (
                                                <button
                                                    onClick={() => handleTerminateSession(session.id)}
                                                    className="text-sm text-red-600 hover:text-red-700"
                                                >
                                                    Terminate
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Account Management */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>

                    <div className="space-y-4">
                        {/* Export Data */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-gray-100 gap-3">
                            <div>
                                <p className="font-medium text-gray-900">Export Data</p>
                                <p className="text-sm text-gray-600">Download your personal data</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExportData('json')}
                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    JSON
                                </button>
                                <button
                                    onClick={() => handleExportData('csv')}
                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    CSV
                                </button>
                            </div>
                        </div>
                        {errors.export && (
                            <p className="text-sm text-red-600">{errors.export}</p>
                        )}

                        {/* Delete Account */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-3">
                            <div>
                                <p className="font-medium text-red-600">Delete Account</p>
                                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                            </div>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Delete
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={loading}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-1 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {errors.delete && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {errors.delete}
                            </div>
                        )}
                    </div>
                </div>

                {/* Last Login Info */}
                {user?.last_login && (
                    <div className="mt-4 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Last login: {new Date(user.last_login).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Profile;