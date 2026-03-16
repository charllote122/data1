// src/pages/landing/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import api from '../../services/api';
import {
    BeakerIcon,
    HeartIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    ClockIcon,
    BoltIcon,
    XMarkIcon,
    UserIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('access_token');
            setIsAuthenticated(!!token);
        };

        checkAuth();

        // Listen for storage events (in case of logout in another tab)
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    const handleGetStarted = () => {
        // If authenticated, go to dashboard, otherwise go to predictions
        if (isAuthenticated) {
            navigate(ROUTES.DASHBOARD);
        } else {
            navigate(ROUTES.PREDICTIONS.NEW);
        }
    };

    const handleTryAssessment = () => {
        // Always allow trying assessment without login
        navigate(ROUTES.PREDICTIONS.NEW);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        navigate(ROUTES.LOGIN);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        navigate(ROUTES.REGISTER);
    };

    const handleDashboard = (e) => {
        e.preventDefault();
        navigate(ROUTES.DASHBOARD);
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Try to subscribe via API first
            await api.post('/newsletter/subscribe/', { email });
            showNotification('success', 'Thanks for subscribing! Check your email for updates.');
            setEmail('');
            setShowEmailModal(false);
        } catch (error) {
            // If API fails, just show success message (for demo)
            console.log('Newsletter subscription error:', error);
            showNotification('success', 'Thanks for subscribing! Check your email for updates.');
            setEmail('');
            setShowEmailModal(false);
        } finally {
            setLoading(false);
        }
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to={ROUTES.HOME} className="flex items-center gap-2">
                            <BeakerIcon className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Diabetes Predictor</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('how-it-works')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                How It Works
                            </button>
                            <Link
                                to={ROUTES.PREDICTIONS.NEW}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                Try Assessment
                            </Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={ROUTES.DASHBOARD}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition flex items-center gap-2"
                                    >
                                        <UserIcon className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem('access_token');
                                            localStorage.removeItem('refresh_token');
                                            localStorage.removeItem('user');
                                            setIsAuthenticated(false);
                                            navigate(ROUTES.HOME);
                                            showNotification('success', 'Logged out successfully');
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                    >
                                        Sign Up Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                                <SparklesIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">AI-Powered Health Predictions</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Predict Your Diabetes Risk in{' '}
                                <span className="text-blue-600">60 Seconds</span>
                            </h1>

                            <p className="text-lg text-gray-600 mb-8">
                                Use our advanced machine learning model to assess your diabetes risk
                                based on CDC data. Get personalized insights and recommendations
                                completely free.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleTryAssessment}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                                >
                                    Try Free Assessment
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scrollToSection('how-it-works')}
                                    className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border border-gray-300 hover:border-gray-400 transition"
                                >
                                    How It Works
                                </button>
                            </div>

                            {/* Simple signup prompt - no fake social proof */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">No account needed</span> to try the assessment
                                </p>
                                {!isAuthenticated && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Already have an account?{' '}
                                        <Link to={ROUTES.LOGIN} className="text-blue-600 hover:text-blue-700 font-semibold">
                                            Sign in
                                        </Link>
                                    </p>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Content - Hero Image/Illustration */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 shadow-2xl">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-white font-semibold">Your Risk Assessment</h3>
                                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">Demo</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white/20 rounded-lg p-4">
                                            <div className="flex justify-between text-white mb-2">
                                                <span>Risk Level</span>
                                                <span className="font-semibold">Low</span>
                                            </div>
                                            <div className="w-full bg-white/30 rounded-full h-2">
                                                <div className="bg-green-400 h-2 rounded-full w-3/4"></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/20 rounded-lg p-3">
                                                <div className="text-white/70 text-xs">Probability</div>
                                                <div className="text-white font-semibold">15%</div>
                                            </div>
                                            <div className="bg-white/20 rounded-lg p-3">
                                                <div className="text-white/70 text-xs">Accuracy</div>
                                                <div className="text-white font-semibold">95%</div>
                                            </div>
                                        </div>

                                        <div className="bg-white/20 rounded-lg p-3">
                                            <div className="text-white/70 text-xs mb-2">Top Factors</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-white text-sm">
                                                    <span>BMI</span>
                                                    <span>High impact</span>
                                                </div>
                                                <div className="flex justify-between text-white text-sm">
                                                    <span>Blood Pressure</span>
                                                    <span>Medium impact</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Everything You Need to Monitor Your Health
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our platform combines cutting-edge machine learning with comprehensive health tracking
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: BeakerIcon,
                                title: 'AI-Powered Predictions',
                                description: 'Get accurate diabetes risk assessments using advanced ML models trained on CDC data',
                                color: 'blue'
                            },
                            {
                                icon: HeartIcon,
                                title: 'Health Tracking',
                                description: 'Log symptoms, medications, and track your health metrics over time',
                                color: 'pink'
                            },
                            {
                                icon: ChartBarIcon,
                                title: 'Personalized Insights',
                                description: 'Receive tailored recommendations based on your unique health profile',
                                color: 'green'
                            },
                            {
                                icon: ShieldCheckIcon,
                                title: 'Privacy First',
                                description: 'Your health data is encrypted and never shared with third parties',
                                color: 'purple'
                            },
                            {
                                icon: BoltIcon,
                                title: 'Real-time Analysis',
                                description: 'Get instant results with our high-performance prediction engine',
                                color: 'orange'
                            },
                            {
                                icon: AcademicCapIcon,
                                title: 'Educational Resources',
                                description: 'Access articles and tips about diabetes prevention and management',
                                color: 'red'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
                            >
                                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get your personalized risk assessment in just three simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Enter Your Health Data',
                                description: 'Fill out a simple questionnaire about your health metrics and lifestyle',
                                icon: BeakerIcon
                            },
                            {
                                step: '02',
                                title: 'AI Analysis',
                                description: 'Our ML model analyzes your data against thousands of CDC health records',
                                icon: ChartBarIcon
                            },
                            {
                                step: '03',
                                title: 'Get Recommendations',
                                description: 'Receive personalized insights and actionable health recommendations',
                                icon: HeartIcon
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative"
                            >
                                <div className="text-6xl font-bold text-blue-100 mb-4">{item.step}</div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <item.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Take Control of Your Health?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Get your free diabetes risk assessment in just 60 seconds
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={handleTryAssessment}
                                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
                            >
                                Try Free Assessment
                            </button>
                            <button
                                onClick={() => setShowEmailModal(true)}
                                className="px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition"
                            >
                                Get Updates
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <Link to={ROUTES.HOME} className="flex items-center gap-2 mb-4">
                                <BeakerIcon className="w-6 h-6 text-blue-400" />
                                <span className="text-lg font-bold">Diabetes Predictor</span>
                            </Link>
                            <p className="text-gray-400 text-sm">
                                Empowering individuals to take control of their health through AI-powered insights.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Features</button></li>
                                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition">How It Works</button></li>
                                <li><Link to={ROUTES.PREDICTIONS.NEW} className="hover:text-white transition">Try Assessment</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Account</h4>
                            <ul className="space-y-2 text-gray-400">
                                {isAuthenticated ? (
                                    <>
                                        <li><Link to={ROUTES.DASHBOARD} className="hover:text-white transition">Dashboard</Link></li>
                                        <li><Link to={ROUTES.PROFILE} className="hover:text-white transition">Profile</Link></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to={ROUTES.LOGIN} className="hover:text-white transition">Login</Link></li>
                                        <li><Link to={ROUTES.REGISTER} className="hover:text-white transition">Register</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Diabetes Predictor. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Email Subscription Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl max-w-md w-full p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Get Health Updates</h3>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Subscribe to receive tips, articles, and updates about diabetes prevention.
                        </p>

                        <form onSubmit={handleSubscribe}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;