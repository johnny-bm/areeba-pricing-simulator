import { useState, useCallback } from 'react';
import { AUTH_VALIDATION, AUTH_ERRORS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function useAuthValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = useCallback((email: string): ValidationResult => {
    if (!email || !email.trim()) {
      return { isValid: false, error: AUTH_ERRORS.EMAIL_REQUIRED };
    }

    if (!AUTH_VALIDATION.EMAIL_REGEX.test(email)) {
      return { isValid: false, error: AUTH_ERRORS.INVALID_EMAIL };
    }

    return { isValid: true, error: null };
  }, []);

  const validatePassword = useCallback((password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, error: AUTH_ERRORS.PASSWORD_REQUIRED };
    }

    if (password.length < AUTH_VALIDATION.MIN_PASSWORD_LENGTH) {
      return { isValid: false, error: AUTH_ERRORS.PASSWORD_TOO_SHORT };
    }

    return { isValid: true, error: null };
  }, []);

  const validatePasswordConfirmation = useCallback((password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
      return { isValid: false, error: AUTH_ERRORS.PASSWORDS_DONT_MATCH };
    }

    return { isValid: true, error: null };
  }, []);

  const validateLoginForm = useCallback((email: string, password: string): boolean => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const newErrors: Record<string, string> = {};
    
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }

    setErrors(newErrors);
    return emailValidation.isValid && passwordValidation.isValid;
  }, [validateEmail, validatePassword]);

  const validateSignupForm = useCallback((
    email: string, 
    password: string, 
    confirmPassword: string,
    firstName?: string,
    lastName?: string
  ): boolean => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const passwordConfirmationValidation = validatePasswordConfirmation(password, confirmPassword);

    const newErrors: Record<string, string> = {};
    
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }

    if (!passwordConfirmationValidation.isValid) {
      newErrors.confirmPassword = passwordConfirmationValidation.error!;
    }

    setErrors(newErrors);
    return emailValidation.isValid && passwordValidation.isValid && passwordConfirmationValidation.isValid;
  }, [validateEmail, validatePassword, validatePasswordConfirmation]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateEmail,
    validatePassword,
    validatePasswordConfirmation,
    validateLoginForm,
    validateSignupForm,
    clearError,
    clearAllErrors,
  };
}
