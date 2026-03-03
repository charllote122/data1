 
import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab, onChange }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (onChange) {
            onChange(tabId);
        }
    };

    return (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.icon && <tab.icon className="w-5 h-5 inline mr-2" />}
                        {tab.name}
                        {tab.count !== undefined && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                    ? 'bg-primary-100 text-primary-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Tabs;