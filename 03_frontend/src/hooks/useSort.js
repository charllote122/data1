// src/hooks/useSort.js
import { useState, useMemo } from 'react';

const useSort = (items, defaultField = null, defaultDirection = 'asc') => {
    const [sortField, setSortField] = useState(defaultField);
    const [sortDirection, setSortDirection] = useState(defaultDirection);

    const sortedItems = useMemo(() => {
        if (!sortField) return items;

        return [...items].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [items, sortField, sortDirection]);

    const toggleSort = (field) => {
        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    return {
        sortField,
        sortDirection,
        toggleSort,
        sortedItems
    };
};

export default useSort;