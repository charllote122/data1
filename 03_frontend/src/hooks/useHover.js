// src/hooks/useHover.js
import { useState, useRef, useEffect } from 'react';

const useHover = () => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        const node = ref.current;
        if (node) {
            node.addEventListener('mouseenter', handleMouseEnter);
            node.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                node.removeEventListener('mouseenter', handleMouseEnter);
                node.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, [ref.current]);

    return [ref, isHovered];
};

export default useHover;