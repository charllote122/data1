import React from 'react';

const GeneticRiskBadge = ({ level }) => {
    const styles = {
        high: 'bg-red-100 text-red-800 border-red-200',
        moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-green-100 text-green-800 border-green-200'
    };

    const labels = {
        high: 'High Genetic Risk',
        moderate: 'Moderate Genetic Risk',
        low: 'Low Genetic Risk'
    };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[level]}`}>
            {labels[level]}
        </span>
    );
};

export default GeneticRiskBadge;