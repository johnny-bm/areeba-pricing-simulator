import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { StandardDialog } from './StandardDialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
export const GuestContactFormModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        companyName: ''
    });
    const [errors, setErrors] = useState({});
    if (!isOpen)
        return null;
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            onClose();
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: "Get Your Pricing Details", description: "Enter your details to unlock the full pricing breakdown and export options", size: "sm", primaryAction: {
            label: 'View Full Pricing',
            onClick: handleSubmit
        }, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "firstName", children: "First Name *" }), _jsx(Input, { id: "firstName", value: formData.firstName, onChange: (e) => handleChange('firstName', e.target.value), className: errors.firstName ? 'border-destructive' : '' }), errors.firstName && (_jsx("p", { className: "text-destructive text-sm mt-1", children: errors.firstName }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name *" }), _jsx(Input, { id: "lastName", value: formData.lastName, onChange: (e) => handleChange('lastName', e.target.value), className: errors.lastName ? 'border-destructive' : '' }), errors.lastName && (_jsx("p", { className: "text-destructive text-sm mt-1", children: errors.lastName }))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email Address *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleChange('email', e.target.value), className: errors.email ? 'border-destructive' : '' }), errors.email && (_jsx("p", { className: "text-destructive text-sm mt-1", children: errors.email }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number *" }), _jsx(PhoneInput, { international: true, defaultCountry: "LB", value: formData.phoneNumber, onChange: (value) => handleChange('phoneNumber', value || ''), className: `phone-input ${errors.phoneNumber ? 'phone-input-error' : ''}`, placeholder: "Enter phone number" }), errors.phoneNumber && (_jsx("p", { className: "text-destructive text-sm mt-1", children: errors.phoneNumber }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "companyName", children: "Company Name *" }), _jsx(Input, { id: "companyName", value: formData.companyName, onChange: (e) => handleChange('companyName', e.target.value), className: errors.companyName ? 'border-destructive' : '' }), errors.companyName && (_jsx("p", { className: "text-destructive text-sm mt-1", children: errors.companyName }))] })] }) }));
};
