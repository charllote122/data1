// src/hooks/useForm.js
import { useState } from 'react';

export const useForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = (onSubmit) => (e) => {
        e.preventDefault();
        onSubmit(values);
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    const setFieldValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const setFieldError = (name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError
    };
};

export default useForm;