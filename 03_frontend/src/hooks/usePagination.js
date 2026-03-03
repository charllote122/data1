// src/hooks/usePagination.js
import { useState, useMemo } from 'react';

const usePagination = (items, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
    };
};

export default usePagination;