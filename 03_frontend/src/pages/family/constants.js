// src/pages/family/constants.js
export const RELATIONSHIP_OPTIONS = [
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
];

export const CONDITION_OPTIONS = [
    { value: 'diabetes_t1', label: 'Type 1 Diabetes', risk: 'high' },
    { value: 'diabetes_t2', label: 'Type 2 Diabetes', risk: 'high' },
    { value: 'gestational', label: 'Gestational Diabetes', risk: 'moderate' },
    { value: 'heart_disease', label: 'Heart Disease', risk: 'high' },
    { value: 'hypertension', label: 'Hypertension', risk: 'moderate' },
    { value: 'stroke', label: 'Stroke', risk: 'high' },
    { value: 'obesity', label: 'Obesity', risk: 'moderate' },
    { value: 'kidney_disease', label: 'Kidney Disease', risk: 'high' },
];