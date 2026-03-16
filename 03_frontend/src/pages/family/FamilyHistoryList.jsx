// src/pages/family/FamilyHistoryList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../hooks/useHealth';
import { useNotification } from '../../context/NotificationContext';
import {
    UsersIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    HeartIcon,
    ClockIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    PencilIcon,
    TrashIcon,
    ChartBarIcon,
    ShareIcon,
    DocumentDuplicateIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    EyeSlashIcon,
    Squares2X2Icon,
    ListBulletIcon,
    AcademicCapIcon,
    BeakerIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import FamilyTree from './components/FamilyTree';
import FamilyMemberCard from './components/FamilyMemberCard';
import GeneticRiskBadge from './components/GeneticRiskBadge';
import { RELATIONSHIP_OPTIONS, CONDITION_OPTIONS } from './constants';

const FamilyHistoryList = () => {
    const navigate = useNavigate();
    const { familyHistory, loading, fetchFamilyHistory, deleteFamilyMember, getGeneticRiskProfile } = useHealth();
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'tree', 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [riskFilter, setRiskFilter] = useState('all');
    const [showGeneticInsights, setShowGeneticInsights] = useState(true);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [geneticProfile, setGeneticProfile] = useState(null);

    // Load data when component mounts
    useEffect(() => {
        loadFamilyHistory();
    }, []);

    useEffect(() => {
        if (familyHistory?.length > 0) {
            loadGeneticProfile();
            console.log('📦 Family History Data:', familyHistory); // Debug log
        }
    }, [familyHistory]);

    const loadFamilyHistory = async () => {
        try {
            await fetchFamilyHistory();
            showNotification('success', 'Family history loaded successfully');
        } catch (error) {
            console.error('Failed to load family history:', error);
            showNotification('error', 'Failed to load family history');
        }
    };

    const loadGeneticProfile = async () => {
        try {
            const profile = await getGeneticRiskProfile();
            setGeneticProfile(profile);
        } catch (error) {
            console.error('Failed to load genetic profile:', error);
        }
    };

    const handleEdit = (member) => {
        console.log('✏️ Editing member:', member);
        navigate(`/family/edit/${member.id}`);
    };

    const handleDelete = async (id) => {
        try {
            console.log('🗑️ Deleting member:', id);
            const result = await deleteFamilyMember(id);
            if (result && result.success) {
                showNotification('success', 'Family member removed successfully');
                loadFamilyHistory(); // Refresh the list
                setSelectedMembers(prev => prev.filter(memberId => memberId !== id));
            } else {
                showNotification('error', 'Failed to delete family member');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('error', 'Failed to delete family member');
        }
        setShowDeleteConfirm(false);
        setSelectedMember(null);
    };

    const handleBulkDelete = async () => {
        if (selectedMembers.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${selectedMembers.length} family members?`)) {
            try {
                // Sequential deletion to avoid overwhelming the server
                let successCount = 0;
                for (const id of selectedMembers) {
                    try {
                        const result = await deleteFamilyMember(id);
                        if (result && result.success) successCount++;
                    } catch (e) {
                        console.error(`Failed to delete member ${id}:`, e);
                    }
                }

                if (successCount > 0) {
                    showNotification('success', `${successCount} members removed successfully`);
                    loadFamilyHistory();
                    setSelectedMembers([]);
                }
            } catch (error) {
                console.error('Bulk delete error:', error);
                showNotification('error', 'Failed to delete some members');
            }
        }
    };

    const handleExport = (format) => {
        let data;
        const membersToExport = selectedMembers.length > 0
            ? familyHistory.filter(m => selectedMembers.includes(m.id))
            : familyHistory;

        switch (format) {
            case 'json':
                data = JSON.stringify(membersToExport, null, 2);
                downloadFile(data, 'family-history.json', 'application/json');
                break;
            case 'csv':
                data = convertToCSV(membersToExport);
                downloadFile(data, 'family-history.csv', 'text/csv');
                break;
            case 'pdf':
                showNotification('info', 'PDF export coming soon');
                break;
        }
        setExportMenuOpen(false);
    };

    const convertToCSV = (members) => {
        const headers = ['Relationship', 'Condition', 'Age at Diagnosis', 'Risk Level', 'Notes', 'Date Added'];
        const rows = members.map(m => [
            m.relationship,
            getConditionLabel(m.condition),
            m.age_at_diagnosis || 'N/A',
            m.risk || 'unknown',
            m.notes || '',
            new Date(m.created_at).toLocaleDateString()
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    };

    const downloadFile = (content, fileName, contentType) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getConditionLabel = (condition) => {
        const conditionObj = CONDITION_OPTIONS.find(c => c.value === condition);
        return conditionObj?.label || condition;
    };

    const getConditionEmoji = (condition) => {
        const conditionObj = CONDITION_OPTIONS.find(c => c.value === condition);
        return conditionObj?.emoji || '🏥';
    };

    const getGeneticRiskScore = () => {
        if (!familyHistory?.length) return null;

        const highRiskConditions = familyHistory.filter(m =>
            ['high'].includes(m.risk)
        ).length;

        const immediateFamily = familyHistory.filter(m =>
            ['parent', 'child', 'sibling'].includes(m.relationship)
        ).length;

        const score = Math.min(100, (highRiskConditions * 15) + (immediateFamily * 10));

        return {
            score,
            level: score >= 70 ? 'high' : score >= 40 ? 'moderate' : 'low',
            highRiskCount: highRiskConditions,
            immediateFamilyCount: immediateFamily
        };
    };

    const filterAndSortMembers = () => {
        let filtered = familyHistory || [];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getConditionLabel(member.condition).toLowerCase().includes(searchTerm.toLowerCase()) ||
                (member.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply relationship filter
        if (filter !== 'all') {
            filtered = filtered.filter(member => member.relationship === filter);
        }

        // Apply risk filter
        if (riskFilter !== 'all') {
            filtered = filtered.filter(member => member.risk === riskFilter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'name':
                    return a.relationship.localeCompare(b.relationship);
                case 'risk':
                    const riskOrder = { 'high': 3, 'moderate': 2, 'low': 1 };
                    return riskOrder[b.risk] - riskOrder[a.risk];
                case 'age':
                    return (b.age_at_diagnosis || 0) - (a.age_at_diagnosis || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredMembers = filterAndSortMembers();
    const riskScore = getGeneticRiskScore();
    const hasSelectedMembers = selectedMembers.length > 0;

    // Get unique relationships for filter
    const relationships = [...new Set(familyHistory?.map(m => m.relationship) || [])];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <UsersIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Family Health History</h1>
                                <p className="text-gray-600 mt-1">Track genetic patterns and health risks</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Refresh Button */}
                            <button
                                onClick={loadFamilyHistory}
                                className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition group"
                                title="Refresh"
                            >
                                <ArrowPathIcon className={`w-5 h-5 text-gray-600 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* View Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
                                        }`}
                                    title="Grid View"
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
                                        }`}
                                    title="List View"
                                >
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('tree')}
                                    className={`p-2 rounded-lg transition ${viewMode === 'tree' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
                                        }`}
                                    title="Tree View"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Export Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                                    className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition group"
                                    title="Export"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                                </button>

                                <AnimatePresence>
                                    {exportMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20"
                                        >
                                            <button
                                                onClick={() => handleExport('json')}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                                Export as JSON
                                            </button>
                                            <button
                                                onClick={() => handleExport('csv')}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 flex items-center gap-2 border-t border-gray-100"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                                Export as CSV
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Add Member Button */}
                            <button
                                onClick={() => navigate('/family/add')}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Add Member
                            </button>
                        </div>
                    </motion.div>

                    {/* Bulk Actions */}
                    <AnimatePresence>
                        {hasSelectedMembers && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mt-4 p-3 bg-indigo-50 rounded-xl flex items-center justify-between"
                            >
                                <span className="text-sm text-indigo-700">
                                    {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedMembers([])}
                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-white rounded-lg transition"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        Delete Selected
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               

                {/* Genetic Risk Summary */}
                {riskScore && showGeneticInsights && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                                        <BeakerIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Genetic Risk Assessment</h2>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-3xl font-bold">{riskScore.score}%</p>
                                                <p className="text-indigo-100 text-sm">Overall Risk Score</p>
                                            </div>
                                            <div className="h-12 w-px bg-white/30"></div>
                                            <div>
                                                <p className="text-lg font-semibold">{riskScore.highRiskCount}</p>
                                                <p className="text-indigo-100 text-sm">High Risk Conditions</p>
                                            </div>
                                            <div className="h-12 w-px bg-white/30"></div>
                                            <div>
                                                <p className="text-lg font-semibold">{riskScore.immediateFamilyCount}</p>
                                                <p className="text-indigo-100 text-sm">Immediate Family</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowGeneticInsights(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <EyeSlashIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                                    <AcademicCapIcon className="w-5 h-5 mb-2" />
                                    <h3 className="font-medium mb-1">Recommendation</h3>
                                    <p className="text-sm text-indigo-100">
                                        {riskScore.score >= 70
                                            ? 'Consult with a genetic counselor'
                                            : riskScore.score >= 40
                                                ? 'Regular screening recommended'
                                                : 'Maintain healthy lifestyle'}
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                                    <HeartIcon className="w-5 h-5 mb-2" />
                                    <h3 className="font-medium mb-1">Key Factors</h3>
                                    <p className="text-sm text-indigo-100">
                                        {riskScore.highRiskCount} high-risk conditions in {riskScore.immediateFamilyCount} immediate family members
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                                    <ClockIcon className="w-5 h-5 mb-2" />
                                    <h3 className="font-medium mb-1">Last Updated</h3>
                                    <p className="text-sm text-indigo-100">
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by relationship, condition, or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-3 border-2 rounded-xl transition flex items-center gap-2
                                    ${showFilters
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                        : 'border-gray-200 bg-white/80 text-gray-600 hover:border-indigo-300'
                                    }`}
                            >
                                <FunnelIcon className="w-5 h-5" />
                                Filters
                            </button>
                            <button
                                onClick={loadFamilyHistory}
                                className="px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition"
                                disabled={loading}
                            >
                                <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-indigo-100 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Relationship
                                        </label>
                                        <select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Relationships</option>
                                            {relationships.map(rel => (
                                                <option key={rel} value={rel} className="capitalize">
                                                    {rel}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Risk Level
                                        </label>
                                        <select
                                            value={riskFilter}
                                            onChange={(e) => setRiskFilter(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="all">All Risk Levels</option>
                                            <option value="high">High Risk</option>
                                            <option value="moderate">Moderate Risk</option>
                                            <option value="low">Low Risk</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sort By
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="date">Date Added (Newest)</option>
                                            <option value="name">Relationship (A-Z)</option>
                                            <option value="risk">Risk Level (High to Low)</option>
                                            <option value="age">Age at Diagnosis</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* View Mode: Tree */}
                        {viewMode === 'tree' && (
                            <FamilyTree
                                members={filteredMembers}
                                onSelectMember={(member) => {
                                    console.log('Selected member:', member);
                                    setSelectedMember(member);
                                }}
                                onEditMember={handleEdit}
                                onDeleteMember={(member) => {
                                    setSelectedMember(member);
                                    setShowDeleteConfirm(true);
                                }}
                                onAddMember={() => navigate('/family/add')}
                                selectedMembers={selectedMembers}
                                onToggleSelect={(memberId) => {
                                    setSelectedMembers(prev =>
                                        prev.includes(memberId)
                                            ? prev.filter(id => id !== memberId)
                                            : [...prev, memberId]
                                    );
                                }}
                            />
                        )}

                        {/* View Mode: Grid */}
                        {viewMode === 'grid' && (
                            <AnimatePresence>
                                {filteredMembers.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {filteredMembers.map((member, index) => (
                                            <FamilyMemberCard
                                                key={member.id}
                                                member={member}
                                                index={index}
                                                isSelected={selectedMembers.includes(member.id)}
                                                onToggleSelect={() => {
                                                    setSelectedMembers(prev =>
                                                        prev.includes(member.id)
                                                            ? prev.filter(id => id !== member.id)
                                                            : [...prev, member.id]
                                                    );
                                                }}
                                                onEdit={() => handleEdit(member)}
                                                onDelete={() => {
                                                    setSelectedMember(member);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300"
                                    >
                                        <UsersIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">No family members found</h3>
                                        <p className="text-gray-600 mb-8">
                                            {searchTerm || filter !== 'all' || riskFilter !== 'all'
                                                ? 'Try adjusting your filters'
                                                : 'Start building your family health history'}
                                        </p>
                                        {searchTerm || filter !== 'all' || riskFilter !== 'all' ? (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilter('all');
                                                    setRiskFilter('all');
                                                }}
                                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                                            >
                                                Clear Filters
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate('/family/add')}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                                            >
                                                <UserPlusIcon className="w-5 h-5" />
                                                Add First Family Member
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}

                        {/* View Mode: List */}
                        {viewMode === 'list' && filteredMembers.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedMembers(filteredMembers.map(m => m.id));
                                                        } else {
                                                            setSelectedMembers([]);
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Relationship
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Condition
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Age at Diagnosis
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Risk Level
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Added
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMembers.includes(member.id)}
                                                        onChange={() => {
                                                            setSelectedMembers(prev =>
                                                                prev.includes(member.id)
                                                                    ? prev.filter(id => id !== member.id)
                                                                    : [...prev, member.id]
                                                            );
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm font-medium text-gray-900 capitalize">
                                                            {member.relationship}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {getConditionLabel(member.condition)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {member.age_at_diagnosis || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <GeneticRiskBadge level={member.risk || 'low'} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(member.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteConfirm && selectedMember && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowDeleteConfirm(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl p-6 max-w-md w-full"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-3 text-red-600 mb-4">
                                    <ExclamationTriangleIcon className="w-6 h-6" />
                                    <h3 className="text-lg font-semibold">Delete Family Member</h3>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete {selectedMember.relationship}'s health record?
                                    This action cannot be undone and will affect genetic risk calculations.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleDelete(selectedMember.id)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Footer */}
                {filteredMembers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex items-center justify-between text-sm text-gray-500"
                    >
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4" />
                            <span>
                                Showing {filteredMembers.length} of {familyHistory?.length || 0} family members
                                {selectedMembers.length > 0 && ` (${selectedMembers.length} selected)`}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>High Risk: {filteredMembers.filter(m => m.risk === 'high').length}</span>
                            <span>Moderate: {filteredMembers.filter(m => m.risk === 'moderate').length}</span>
                            <span>Low: {filteredMembers.filter(m => m.risk === 'low').length}</span>
                        </div>
                    </motion.div>
                )}

                {/* Privacy Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-500">
                        <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                        <span>Your family health data is encrypted and private. We never share this information.</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FamilyHistoryList;