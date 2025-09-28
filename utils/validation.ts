export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  if (rules.required && (!value || value.trim() === '')) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (value && rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, string>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field] || '';
    const error = validateField(value, rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value.length < 6) {
        return 'Password must be at least 6 characters';
      }
      return null;
    },
  },
  fullName: {
    required: true,
    minLength: 2,
    custom: (value: string) => {
      if (value.trim().length < 2) {
        return 'Full name must be at least 2 characters';
      }
      return null;
    },
  },
  phone: {
    pattern: /^[\+]?[0-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[0-9][\d]{0,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
  },
  confirmPassword: {
    required: true,
    custom: (value: string, originalPassword?: string) => {
      if (originalPassword && value !== originalPassword) {
        return 'Passwords do not match';
      }
      return null;
    },
  },
};
