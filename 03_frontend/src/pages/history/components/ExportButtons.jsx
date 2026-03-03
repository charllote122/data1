// src/pages/history/components/ExportButtons.jsx
import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExportButtons = ({ predictions }) => {
    const exportToCSV = () => {
        try {
            // Create CSV content
            const headers = ['Date', 'Risk Level', 'Risk Score', 'Top Factors'];
            const rows = predictions.map(p => [
                new Date(p.created_at || p.prediction_date || p.date).toLocaleDateString(),
                p.risk_level || p.result || 'Unknown',
                p.risk_score || (p.probability * 100).toFixed(1) || 'N/A',
                p.top_factors && p.top_factors.length > 0
                    ? (p.top_factors[0].feature || p.top_factors[0].name)
                    : 'None'
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `predictions_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Predictions exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export predictions');
        }
    };

    return (
        <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export CSV
        </button>
    );
};

export default ExportButtons;