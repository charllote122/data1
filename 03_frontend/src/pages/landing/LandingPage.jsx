
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
    UserGroupIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    ClockIcon,
    BoltIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: '10,000+',
        predictions: '50,000+',
        accuracy: '95%',
        countries: '50+'
    });
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPublicStats();
        loadFeatures();
    }, []);

    const loadPublicStats = async () => {
        try {
            const data = await api.getPublicDashboard();
            if (data?.total_predictions) {
                setStats(prev => ({
                    ...prev,
                    predictions: `${Math.round(data.total_predictions / 1000)}K+`
                }));
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadFeatures = async () => {
        try {
            const data = await api.getFeatureInfo();
            setFeatures(data.features?.slice(0, 6) || []);
        } catch (error) {
            console.error('Failed to load features:', error);
        }
    };

    const handleGetStarted = () => {
        navigate(ROUTES.PREDICTIONS.NEW);
    };

    const handleTryAssessment = () => {
        navigate(ROUTES.PREDICTIONS.NEW);
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            showNotification('success', 'Thanks for subscribing! Check your email for updates.');
            setEmail('');
            setShowEmailModal(false);
            setLoading(false);
        }, 1000);
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
                        <div className="flex items-center gap-2">
                            <BeakerIcon className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">Diabetes Predictor</span>
                        </div>

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
                            <button
                                onClick={() => scrollToSection('testimonials')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                Testimonials
                            </button>
                            <button
                                onClick={() => scrollToSection('faq')}
                                className="text-gray-600 hover:text-gray-900 transition"
                            >
                                FAQ
                            </button>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
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

                            {/* Social Proof */}
                            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-200">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">{stats.totalUsers}+</span> users already using
                                </p>
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

                            {/* Floating Stats */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Accuracy Rate</div>
                                        <div className="text-xl font-bold text-gray-900">{stats.accuracy}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { label: 'Active Users', value: stats.totalUsers, icon: UserGroupIcon },
                            { label: 'Predictions Made', value: stats.predictions, icon: ChartBarIcon },
                            { label: 'Accuracy Rate', value: stats.accuracy, icon: ShieldCheckIcon },
                            { label: 'Countries', value: stats.countries, icon: HeartIcon }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="inline-flex p-3 bg-blue-50 rounded-xl mb-3">
                                    <stat.icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
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

            {/* Testimonials Section */}
            <section id="testimonials" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            What Our Users Say
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Join thousands of users who have taken control of their health
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Sarah Johnson',
                                role: 'Pre-diabetic',
                                content: 'This tool helped me understand my risk factors and make lifestyle changes. My blood sugar has improved significantly!',
                                rating: 5
                            },
                            {
                                name: 'Michael Chen',
                                role: 'Health-conscious',
                                content: 'The personalized recommendations are spot-on. I appreciate how it explains which factors contribute most to my risk.',
                                rating: 5
                            },
                            {
                                name: 'Emily Rodriguez',
                                role: 'Healthcare Provider',
                                content: 'I recommend this tool to my patients. It\'s accurate, easy to use, and the educational resources are excellent.',
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i} className="text-yellow-400">★</span>
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-600">
                            Got questions? We've got answers
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'Is this tool really free?',
                                a: 'Yes! Our basic risk assessment is completely free. We offer premium features for users who want to track their health over time.'
                            },
                            {
                                q: 'How accurate is the prediction?',
                                a: 'Our model achieves 95% accuracy on test data and is trained on CDC health records from over 70,000 patients.'
                            },
                            {
                                q: 'Do I need to create an account?',
                                a: 'No, you can try a free assessment without an account. Creating an account lets you save your history and track progress.'
                            },
                            {
                                q: 'Is my health data private?',
                                a: 'Absolutely. We encrypt all data and never share your personal information with third parties.'
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="border border-gray-200 rounded-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
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
                            Join thousands of users who are proactively managing their diabetes risk
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
                            <div className="flex items-center gap-2 mb-4">
                                <BeakerIcon className="w-6 h-6 text-blue-400" />
                                <span className="text-lg font-bold">Diabetes Predictor</span>
                            </div>
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
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
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
                        <p>&copy; 2026 Diabetes Predictor. All rights reserved.</p>
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