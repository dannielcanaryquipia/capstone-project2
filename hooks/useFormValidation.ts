import { useCallback, useMemo, useState } from 'react';
import { ValidationErrors, ValidationRules, validateForm } from '../utils/validation';

interface UseFormValidationOptions {
  rules: ValidationRules;
  debounceMs?: number;
}

export const useFormValidation = <T extends Record<string, string>>(
  initialData: T,
  options: UseFormValidationOptions
) => {
  const { rules, debounceMs = 300 } = options;
  const [formData, setFormData] = useState<T>(initialData);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation function
  const debouncedValidate = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (data: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsValidating(true);
        const errors = validateForm(data, rules);
        setFormErrors(errors);
        setIsValidating(false);
      }, debounceMs);
    };
  }, [rules, debounceMs]);

  // Update form data and trigger validation
  const updateField = useCallback((field: keyof T, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error for this field immediately
    if (formErrors[field as string]) {
      setFormErrors(prev => ({ ...prev, [field as string]: '' }));
    }
    
    // Trigger debounced validation
    debouncedValidate(newData);
  }, [formData, formErrors, debouncedValidate]);

  // Validate entire form immediately
  const validateFormData = useCallback(() => {
    const errors = validateForm(formData, rules);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, rules]);

  // Reset form
  const resetForm = useCallback((newData?: T) => {
    setFormData(newData || initialData);
    setFormErrors({});
  }, [initialData]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return Object.keys(formErrors).length === 0 && !isValidating;
  }, [formErrors, isValidating]);

  return {
    formData,
    formErrors,
    isValidating,
    updateField,
    validateFormData,
    resetForm,
    isFormValid,
  };
};
