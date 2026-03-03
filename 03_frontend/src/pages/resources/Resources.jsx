import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    BookOpenIcon,
    DocumentTextIcon,
    VideoCameraIcon,
    LinkIcon,
    ArrowTopRightOnSquareIcon,
    HeartIcon,
    BeakerIcon,
    UserGroupIcon,
    NewspaperIcon,
} from '@heroicons/react/24/outline';

const Resources = () => {
    const [selectedType, setSelectedType] = useState('all');

    const resourceTypes = [
        { id: 'all', name: 'All Resources', icon: BookOpenIcon },
        { id: 'article', name: 'Articles', icon: DocumentTextIcon },
        { id: 'video', name: 'Videos', icon: VideoCameraIcon },
        { id: 'link', name: 'External Links', icon: LinkIcon },
        { id: 'support', name: 'Support Groups', icon: UserGroupIcon },
    ];

    const resources = [
        {
            id: 1,
            type: 'article',
            title: 'Understanding Diabetes: A Complete Guide',
            description: 'Comprehensive guide to understanding diabetes types, symptoms, and management.',
            source: 'American Diabetes Association',
            url: '#',
            icon: DocumentTextIcon,
            category: 'education',
        },
        {
            id: 2,
            type: 'video',
            title: 'Healthy Eating for Diabetes',
            description: 'Video series on nutrition and meal planning for diabetes management.',
            source: 'Diabetes UK',
            url: '#',
            icon: VideoCameraIcon,
            category: 'nutrition',
        },
        {
            id: 3,
            type: 'link',
            title: 'CDC Diabetes Prevention Program',
            description: 'Official CDC resource for diabetes prevention and management.',
            source: 'Centers for Disease Control',
            url: '#',
            icon: LinkIcon,
            category: 'government',
        },
        {
            id: 4,
            type: 'support',
            title: 'Local Diabetes Support Groups',
            description: 'Find and connect with diabetes support groups in your area.',
            source: 'Diabetes Community',
            url: '#',
            icon: UserGroupIcon,
            category: 'community',
        },
        {
            id: 5,
            type: 'article',
            title: 'Exercise Guidelines for Diabetes',
            description: 'Expert recommendations for physical activity with diabetes.',
            source: 'Mayo Clinic',
            url: '#',
            icon: DocumentTextIcon,
            category: 'exercise',
        },
        {
            id: 6,
            type: 'video',
            title: 'Blood Sugar Monitoring Tutorial',
            description: 'Step-by-step guide to monitoring your blood sugar levels.',
            source: 'Healthline',
            url: '#',
            icon: VideoCameraIcon,
            category: 'education',
        },
        {
            id: 7,
            type: 'link',
            title: 'JDRF Research Updates',
            description: 'Latest research and breakthroughs in diabetes treatment.',
            source: 'JDRF',
            url: '#',
            icon: LinkIcon,
            category: 'research',
        },
        {
            id: 8,
            type: 'support',
            title: 'Online Diabetes Community',
            description: 'Connect with others managing diabetes in our online forums.',
            source: 'Diabetes Daily',
            url: '#',
            icon: UserGroupIcon,
            category: 'community',
        },
    ];

    const categories = [
        { id: 'education', name: 'Education', color: 'bg-blue-100 text-blue-800' },
        { id: 'nutrition', name: 'Nutrition', color: 'bg-green-100 text-green-800' },
        { id: 'exercise', name: 'Exercise', color: 'bg-orange-100 text-orange-800' },
        { id: 'research', name: 'Research', color: 'bg-purple-100 text-purple-800' },
        { id: 'community', name: 'Community', color: 'bg-pink-100 text-pink-800' },
        { id: 'government', name: 'Government', color: 'bg-indigo-100 text-indigo-800' },
    ];

    const filteredResources = selectedType === 'all'
        ? resources
        : resources.filter(r => r.type === selectedType);

    const getCategoryColor = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.color : 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl font-bold text-gray-900">Health Resources</h1>
                <p className="text-gray-600 mt-2">Curated resources to help you manage your health</p>
            </motion.div>

            {/* Resource Types */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3"
            >
                {resourceTypes.map(type => (
                    <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${selectedType === type.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <type.icon className="w-4 h-4" />
                        <span>{type.name}</span>
                    </button>
                ))}
            </motion.div>

            {/* Resources Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredResources.map((resource, index) => (
                    <motion.a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-soft border border-gray-100 p-6 hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${resource.type === 'article' ? 'bg-blue-100' :
                                    resource.type === 'video' ? 'bg-red-100' :
                                        resource.type === 'link' ? 'bg-green-100' :
                                            'bg-purple-100'
                                }`}>
                                <resource.icon className={`w-6 h-6 ${resource.type === 'article' ? 'text-blue-600' :
                                        resource.type === 'video' ? 'text-red-600' :
                                            resource.type === 'link' ? 'text-green-600' :
                                                'text-purple-600'
                                    }`} />
                            </div>
                            <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>

                        <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(resource.category)}`}>
                                {resource.category}
                            </span>
                            <span className="text-sm text-gray-500">{resource.source}</span>
                        </div>
                    </motion.a>
                ))}
            </motion.div>

            {/* Featured Organizations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8"
            >
                <h2 className="text-xl font-semibold text-primary-800 mb-6 text-center">Trusted Organizations</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { name: 'American Diabetes Association', icon: HeartIcon },
                        { name: 'JDRF', icon: BeakerIcon },
                        { name: 'Diabetes UK', icon: HeartIcon },
                        { name: 'CDC Diabetes', icon: NewspaperIcon },
                    ].map((org, index) => (
                        <div key={index} className="text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                                <org.icon className="w-8 h-8 text-primary-600" />
                            </div>
                            <p className="text-sm font-medium text-primary-800">{org.name}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Newsletter Signup */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-soft p-8 border border-gray-100 text-center"
            >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Stay Updated</h2>
                <p className="text-gray-600 mb-6">Subscribe to our newsletter for the latest health resources and tips</p>
                <div className="max-w-md mx-auto flex gap-3">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="input-field flex-1"
                    />
                    <button className="btn-primary whitespace-nowrap">
                        Subscribe
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Resources;