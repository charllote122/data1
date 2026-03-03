// src/hooks/useSearch.js
import { useState, useMemo } from 'react';

const useSearch = (items, searchFields) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;

        const searchLower = searchTerm.toLowerCase();
        return items.filter((item) =>
            searchFields.some((field) => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchLower);
            })
        );
    }, [items, searchFields, searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems
    };
};

export default useSearch;