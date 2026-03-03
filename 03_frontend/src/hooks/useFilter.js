// src/hooks/useFilter.js
import { useState, useMemo } from 'react';

const useFilter = (items, filterFields) => {
    const [filters, setFilters] = useState({});

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value || value === 'all') return true;
                return item[key] === value;
            });
        });
    }, [items, filters]);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({});
    };

    return {
        filters,
        setFilter,
        resetFilters,
        filteredItems
    };
};

export default useFilter;