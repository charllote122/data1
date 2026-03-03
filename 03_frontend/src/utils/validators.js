import * as yup from 'yup';
import { VALIDATION_RULES } from './constants';

// ==================== Authentication Validators ====================

export const usernameSchema = yup
    .string()
    .required('Username is required')
    .min(VALIDATION_RULES.USERNAME_MIN_LENGTH, `Username must be at least ${VALIDATION_RULES.USERNAME_MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.USERNAME_MAX_LENGTH, `Username must be at most ${VALIDATION_RULES.USERNAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const emailSchema = yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, `Email must be at most ${VALIDATION_RULES.EMAIL_MAX_LENGTH} characters`);

export const passwordSchema = yup
    .string()
    .required('Password is required')
    .min(VALIDATION_RULES.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, `Password must be at most ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} characters`)
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character');

export const confirmPasswordSchema = yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match');

export const loginSchema = yup.object().shape({
    username: usernameSchema,
    password: passwordSchema,
});

export const registerSchema = yup.object().shape({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
});

export const forgotPasswordSchema = yup.object().shape({
    email: emailSchema,
});

export const resetPasswordSchema = yup.object().shape({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
});

// ==================== Profile Validators ====================

export const nameSchema = yup
    .string()
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, `Name must be at most ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z\s]*$/, 'Name can only contain letters and spaces');

export const phoneSchema = yup
    .string()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid phone number');

export const bioSchema = yup
    .string()
    .max(VALIDATION_RULES.BIO_MAX_LENGTH, `Bio must be at most ${VALIDATION_RULES.BIO_MAX_LENGTH} characters`);

export const profileSchema = yup.object().shape({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    location: yup.string(),
    dateOfBirth: yup.date().nullable(),
    bio: bioSchema,
});

// ==================== Health Data Validators ====================

export const ageSchema = yup
    .number()
    .required('Age is required')
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age')
    .integer('Age must be a whole number');

export const bmiSchema = yup
    .number()
    .required('BMI is required')
    .min(10, 'BMI must be at least 10')
    .max(60, 'BMI must be at most 60');

export const healthDaysSchema = yup
    .number()
    .required('Number of days is required')
    .min(0, 'Days cannot be negative')
    .max(30, 'Days cannot exceed 30')
    .integer('Days must be a whole number');

export const predictionSchema = yup.object().shape({
    age: ageSchema,
    sex: yup.number().required('Sex is required').oneOf([0, 1], 'Invalid selection'),
    bmi: bmiSchema,
    highBP: yup.boolean(),
    highChol: yup.boolean(),
    stroke: yup.boolean(),
    heartDisease: yup.boolean(),
    physActivity: yup.boolean(),
    fruits: yup.boolean(),
    veggies: yup.boolean(),
    smoker: yup.boolean(),
    heavyAlcohol: yup.boolean(),
    genHealth: yup.number().required('General health is required').min(1).max(5),
    physHealthDays: healthDaysSchema,
    mentalHealthDays: healthDaysSchema,
    diffWalk: yup.boolean(),
});

// ==================== Goal Validators ====================

export const goalSchema = yup.object().shape({
    goalType: yup.string().required('Goal type is required'),
    title: yup.string().required('Title is required').max(100, 'Title too long'),
    description: yup.string().max(500, 'Description too long'),
    targetValue: yup.number().required('Target value is required').positive('Target value must be positive'),
    currentValue: yup.number().min(0, 'Current value cannot be negative'),
    unit: yup.string().required('Unit is required'),
    targetDate: yup.date().required('Target date is required').min(new Date(), 'Target date must be in the future'),
});

// ==================== Medication Validators ====================

export const medicationSchema = yup.object().shape({
    name: yup.string().required('Medication name is required').max(100, 'Name too long'),
    dosage: yup.string().required('Dosage is required').max(50, 'Dosage too long'),
    frequency: yup.string().required('Frequency is required'),
    times: yup.array().of(yup.string().required('Time is required')).min(1, 'At least one time is required'),
    startDate: yup.date().required('Start date is required'),
    endDate: yup.date().nullable().min(yup.ref('startDate'), 'End date must be after start date'),
    reminders: yup.boolean(),
    notes: yup.string().max(500, 'Notes too long'),
});

// ==================== Symptom Validators ====================

export const symptomSchema = yup.object().shape({
    type: yup.string().required('Symptom type is required'),
    severity: yup.number().required('Severity is required').min(1).max(10),
    timestamp: yup.date().required('Date and time is required'),
    notes: yup.string().max(500, 'Notes too long'),
});

// ==================== Family History Validators ====================

export const familyHistorySchema = yup.object().shape({
    relationship: yup.string().required('Relationship is required'),
    condition: yup.string().required('Condition is required'),
    ageAtDiagnosis: yup.number().nullable().min(0).max(120),
    notes: yup.string().max(500, 'Notes too long'),
});

// ==================== Challenge Validators ====================

export const challengeSchema = yup.object().shape({
    name: yup.string().required('Challenge name is required').max(100, 'Name too long'),
    description: yup.string().max(500, 'Description too long'),
    challengeType: yup.string().required('Challenge type is required'),
    targetValue: yup.number().required('Target value is required').positive('Target value must be positive'),
    unit: yup.string().required('Unit is required'),
    startDate: yup.date().required('Start date is required'),
    endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
});

// ==================== General Validators ====================

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
    return emailSchema.isValidSync(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
    return phoneSchema.isValidSync(phone);
};

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate, endDate) => {
    return new Date(startDate) <= new Date(endDate);
};

/**
 * Validate numeric range
 */
export const isValidRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
};

// ==================== Form Validation Helpers ====================

/**
 * Get validation errors for a form
 */
export const getFormErrors = (values, schema) => {
    try {
        schema.validateSync(values, { abortEarly: false });
        return {};
    } catch (err) {
        const errors = {};
        err.inner.forEach((error) => {
            errors[error.path] = error.message;
        });
        return errors;
    }
};

/**
 * Check if form is valid
 */
export const isFormValid = (values, schema) => {
    return schema.isValidSync(values);
};

/**
 * Validate field on blur
 */
export const validateField = (name, value, schema) => {
    try {
        const fieldSchema = yup.reach(schema, name);
        fieldSchema.validateSync(value);
        return { valid: true, error: null };
    } catch (err) {
        return { valid: false, error: err.message };
    }
};