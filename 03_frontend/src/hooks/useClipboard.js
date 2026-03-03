// src/hooks/useClipboard.js
import { useState } from 'react';

const useClipboard = () => {
    const [copied, setCopied] = useState(false);

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    };

    return { copy, copied };
};

export default useClipboard;