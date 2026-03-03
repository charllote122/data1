// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback, useRef } from 'react';

const useInfiniteScroll = (loadMore, hasMore) => {
    const [loading, setLoading] = useState(false);
    const observerRef = useRef();
    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observerRef.current) observerRef.current.disconnect();
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setLoading(true);
                    loadMore().finally(() => setLoading(false));
                }
            });
            if (node) observerRef.current.observe(node);
        },
        [loading, hasMore, loadMore]
    );

    return { lastElementRef, loading };
};

export default useInfiniteScroll;