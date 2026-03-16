// src/hooks/useMedications.js
import { useMedications as useContextMedications } from '../context/MedicationsContext';

export const useMedications = () => {
    return useContextMedications();
};

export default useMedications;