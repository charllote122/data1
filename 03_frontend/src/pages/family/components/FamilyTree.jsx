// src/pages/family/components/FamilyTree.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UsersIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    UserIcon,
    HeartIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

const FamilyTree = ({
    members = [],
    onSelectMember,
    onEditMember,
    onDeleteMember,
    onAddMember,
    selectedMembers = [],
    onToggleSelect
}) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'

    // Organize members into a tree structure
    const buildFamilyTree = () => {
        const tree = {
            id: 'root',
            name: 'Family Tree',
            type: 'root',
            children: []
        };

        // Group by generation/relationship
        const generations = {
            grandparents: members.filter(m => ['grandparent'].includes(m.relationship)),
            parents: members.filter(m => ['parent', 'aunt', 'uncle'].includes(m.relationship)),
            siblings: members.filter(m => ['sibling', 'cousin'].includes(m.relationship)),
            children: members.filter(m => ['child'].includes(m.relationship))
        };

        // Build tree structure
        if (generations.grandparents.length > 0) {
            tree.children.push({
                id: 'grandparents',
                name: 'Grandparents',
                type: 'generation',
                members: generations.grandparents,
                icon: '👴'
            });
        }

        if (generations.parents.length > 0) {
            tree.children.push({
                id: 'parents',
                name: 'Parents & Aunts/Uncles',
                type: 'generation',
                members: generations.parents,
                icon: '👪'
            });
        }

        // Self node (always present)
        tree.children.push({
            id: 'self',
            name: 'You',
            type: 'self',
            members: [],
            icon: '👤',
            isSelf: true
        });

        if (generations.siblings.length > 0) {
            tree.children.push({
                id: 'siblings',
                name: 'Siblings & Cousins',
                type: 'generation',
                members: generations.siblings,
                icon: '🤝'
            });
        }

        if (generations.children.length > 0) {
            tree.children.push({
                id: 'children',
                name: 'Children',
                type: 'generation',
                members: generations.children,
                icon: '👶'
            });
        }

        return tree;
    };

    const familyTree = buildFamilyTree();

    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const handleMemberClick = (member) => {
        setSelectedMember(member);
        onSelectMember?.(member);
    };

    const getConditionIcon = (condition) => {
        const icons = {
            diabetes_t1: '🩸',
            diabetes_t2: '🩸',
            gestational: '🤰',
            heart_disease: '❤️',
            hypertension: '💓',
            stroke: '🧠',
            obesity: '⚖️',
            kidney_disease: '🫀'
        };
        return icons[condition] || '🏥';
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const filterMembers = (membersList) => {
        if (!searchTerm) return membersList;
        return membersList.filter(m =>
            m.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.condition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const renderTreeNode = (node) => {
        const isExpanded = expandedNodes.has(node.id);
        const hasMembers = node.members?.length > 0;
        const filteredMembers = filterMembers(node.members || []);

        return (
            <div key={node.id} className="select-none">
                <div
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
                        ${node.type === 'self' ? 'bg-indigo-50 border-2 border-indigo-200' : 'hover:bg-gray-50'}
                        ${selectedMember?.id === node.id ? 'bg-indigo-100' : ''}
                    `}
                    onClick={() => node.type === 'self' ? null : toggleNode(node.id)}
                >
                    <span className="text-2xl">{node.icon}</span>
                    <span className={`flex-1 font-medium ${node.type === 'self' ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {node.name}
                        {hasMembers && <span className="ml-2 text-xs text-gray-500">({node.members.length})</span>}
                    </span>
                    {hasMembers && (
                        <button className="p-1 hover:bg-gray-200 rounded-full transition">
                            {isExpanded ?
                                <ChevronDownIcon className="w-4 h-4 text-gray-500" /> :
                                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            }
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && hasMembers && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-8 mt-2 space-y-2"
                        >
                            {filteredMembers.map((member, index) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-3 rounded-lg border-2 transition-all
                                        ${selectedMember?.id === member.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-xl">
                                            {getConditionIcon(member.condition)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-medium text-gray-900 capitalize">
                                                    {member.relationship}
                                                </h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(member.risk)}`}>
                                                    {member.risk}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {member.condition_label || member.condition}
                                                {member.age_at_diagnosis && ` • Age ${member.age_at_diagnosis}`}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditMember?.(member);
                                                    }}
                                                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition flex items-center gap-1"
                                                >
                                                    <PencilIcon className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteMember?.(member);
                                                    }}
                                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                    Delete
                                                </button>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.id)}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        onToggleSelect?.(member.id);
                                                    }}
                                                    className="ml-auto w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredMembers.length === 0 && searchTerm && (
                                <p className="text-sm text-gray-500 italic p-2">No matching members</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const renderListView = () => {
        const allMembers = members.map(m => ({
            ...m,
            generation: m.relationship === 'grandparent' ? 'Grandparents' :
                ['parent', 'aunt', 'uncle'].includes(m.relationship) ? 'Parents Generation' :
                    ['sibling', 'cousin'].includes(m.relationship) ? 'Same Generation' : 'Children'
        }));

        const groupedMembers = allMembers.reduce((acc, member) => {
            if (!acc[member.generation]) acc[member.generation] = [];
            acc[member.generation].push(member);
            return acc;
        }, {});

        return (
            <div className="space-y-6">
                {Object.entries(groupedMembers).map(([generation, genMembers]) => (
                    <div key={generation}>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">{generation}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {genMembers.map(member => (
                                <div
                                    key={member.id}
                                    className="p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-indigo-200 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                            {getConditionIcon(member.condition)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-gray-900 capitalize">
                                                    {member.relationship}
                                                </h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(member.risk)}`}>
                                                    {member.risk}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {member.condition_label || member.condition}
                                            </p>
                                            {member.age_at_diagnosis && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Diagnosed at age {member.age_at_diagnosis}
                                                </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => onEditMember?.(member)}
                                                    className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition flex items-center gap-1"
                                                >
                                                    <PencilIcon className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDeleteMember?.(member)}
                                                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-white" />
                        <h2 className="text-lg font-semibold text-white">Family Tree View</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
                            className="px-3 py-1 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition"
                        >
                            {viewMode === 'tree' ? 'List View' : 'Tree View'}
                        </button>
                        <button
                            onClick={onAddMember}
                            className="px-3 py-1 bg-white text-indigo-600 text-sm rounded-lg font-medium hover:bg-indigo-50 transition"
                        >
                            + Add Member
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search family members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                        />
                    </div>
                    {viewMode === 'tree' && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.1, 1.5))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <span className="text-sm font-medium">+</span>
                            </button>
                            <span className="text-sm text-gray-600 w-12 text-center">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.1, 0.5))}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <span className="text-sm font-medium">-</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tree/List Content */}
            <div
                className="p-6 max-h-[600px] overflow-y-auto"
                style={{ transform: viewMode === 'tree' ? `scale(${zoomLevel})` : 'none', transformOrigin: 'top left' }}
            >
                {members.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UsersIcon className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No family members yet</h3>
                        <p className="text-gray-600 mb-6">Start building your family health tree</p>
                        <button
                            onClick={onAddMember}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        >
                            Add First Family Member
                        </button>
                    </div>
                ) : (
                    viewMode === 'tree' ? (
                        <div className="space-y-3">
                            {renderTreeNode(familyTree)}
                        </div>
                    ) : (
                        renderListView()
                    )
                )}
            </div>

            {/* Info Note */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <InformationCircleIcon className="w-4 h-4" />
                    Click on family members to see details. Use Edit/Delete buttons to manage records.
                </p>
            </div>
        </div>
    );
};

export default FamilyTree;