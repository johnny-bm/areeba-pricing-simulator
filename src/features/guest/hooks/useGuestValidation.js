import { useState, useCallback } from 'react';
import { GUEST_ERRORS, GUEST_VALIDATION } from '../constants';
export function useGuestValidation() {
    const [errors, setErrors] = useState({});
    const validateEmail = useCallback((email) => {
        if (!email || !email.trim()) {
            setErrors(prev => ({ ...prev, email: GUEST_ERRORS.EMAIL_REQUIRED }));
            return false;
        }
        if (!GUEST_VALIDATION.EMAIL_REGEX.test(email)) {
            setErrors(prev => ({ ...prev, email: GUEST_ERRORS.EMAIL_INVALID }));
            return false;
        }
        setErrors(prev => ({ ...prev, email: undefined }));
        return true;
    }, []);
    const validatePhone = useCallback((phone) => {
        if (!phone || !phone.trim()) {
            setErrors(prev => ({ ...prev, phoneNumber: GUEST_ERRORS.PHONE_REQUIRED }));
            return false;
        }
        const cleanPhone = phone.replace(/\s/g, '');
        if (!GUEST_VALIDATION.PHONE_REGEX.test(cleanPhone)) {
            setErrors(prev => ({ ...prev, phoneNumber: GUEST_ERRORS.PHONE_INVALID }));
            return false;
        }
        setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        return true;
    }, []);
    const validateName = useCallback((name, field) => {
        if (!name || !name.trim()) {
            const errorKey = field === 'firstName' ? 'firstName' : 'lastName';
            const errorMessage = field === 'firstName' ? GUEST_ERRORS.FIRST_NAME_REQUIRED : GUEST_ERRORS.LAST_NAME_REQUIRED;
            setErrors(prev => ({ ...prev, [errorKey]: errorMessage }));
            return false;
        }
        if (name.length < GUEST_VALIDATION.MIN_NAME_LENGTH || name.length > GUEST_VALIDATION.MAX_NAME_LENGTH) {
            const errorKey = field === 'firstName' ? 'firstName' : 'lastName';
            setErrors(prev => ({ ...prev, [errorKey]: `Name must be between ${GUEST_VALIDATION.MIN_NAME_LENGTH} and ${GUEST_VALIDATION.MAX_NAME_LENGTH} characters` }));
            return false;
        }
        setErrors(prev => ({ ...prev, [field]: undefined }));
        return true;
    }, []);
    const validateCompany = useCallback((company) => {
        if (!company || !company.trim()) {
            setErrors(prev => ({ ...prev, companyName: GUEST_ERRORS.COMPANY_REQUIRED }));
            return false;
        }
        if (company.length < GUEST_VALIDATION.MIN_COMPANY_LENGTH || company.length > GUEST_VALIDATION.MAX_COMPANY_LENGTH) {
            setErrors(prev => ({ ...prev, companyName: `Company name must be between ${GUEST_VALIDATION.MIN_COMPANY_LENGTH} and ${GUEST_VALIDATION.MAX_COMPANY_LENGTH} characters` }));
            return false;
        }
        setErrors(prev => ({ ...prev, companyName: undefined }));
        return true;
    }, []);
    const validateContactInfo = useCallback((contactInfo) => {
        const emailValid = validateEmail(contactInfo.email);
        const phoneValid = validatePhone(contactInfo.phoneNumber);
        const firstNameValid = validateName(contactInfo.firstName, 'firstName');
        const lastNameValid = validateName(contactInfo.lastName, 'lastName');
        const companyValid = validateCompany(contactInfo.companyName);
        return emailValid && phoneValid && firstNameValid && lastNameValid && companyValid;
    }, [validateEmail, validatePhone, validateName, validateCompany]);
    const clearError = useCallback((field) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    }, []);
    const clearAllErrors = useCallback(() => {
        setErrors({});
    }, []);
    return {
        errors,
        validateEmail,
        validatePhone,
        validateName,
        validateCompany,
        validateContactInfo,
        clearError,
        clearAllErrors,
    };
}
