// src/hooks/useAsync.js
import { useState, useCallback, useEffect } from 'react';

const useAsync = (asyncFunction, immediate = true) => {
    const [status, setStatus] = useState('idle');
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(() => {
        setStatus('pending');
        setValue(null);
        setError(null);

        return asyncFunction()
            .then(response => {
                setValue(response);
                setStatus('success');
                return response;
            })
            .catch(error => {
                setError(error);
                setStatus('error');
                return error;
            });
    }, [asyncFunction]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { execute, status, value, error };
};

export default useAsync;