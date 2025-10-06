import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
export const GuestContactForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        companyName: ''
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
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
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-2", children: "Get Your Custom Pricing" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Enter your details to see the full pricing breakdown and export options" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "firstName", children: "First Name *" }), _jsx(Input, { id: "firstName", value: formData.firstName, onChange: (e) => handleChange('firstName', e.target.value), className: errors.firstName ? 'border-red-500' : '' }), errors.firstName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.firstName }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name *" }), _jsx(Input, { id: "lastName", value: formData.lastName, onChange: (e) => handleChange('lastName', e.target.value), className: errors.lastName ? 'border-red-500' : '' }), errors.lastName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.lastName }))] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email Address *" }), _jsx(Input, { id: "email", type: "email", value: formData.email, onChange: (e) => handleChange('email', e.target.value), className: errors.email ? 'border-red-500' : '' }), errors.email && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.email }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number *" }), _jsx(Input, { id: "phoneNumber", type: "tel", value: formData.phoneNumber, onChange: (e) => handleChange('phoneNumber', e.target.value), className: errors.phoneNumber ? 'border-red-500' : '' }), errors.phoneNumber && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.phoneNumber }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "companyName", children: "Company Name *" }), _jsx(Input, { id: "companyName", value: formData.companyName, onChange: (e) => handleChange('companyName', e.target.value), className: errors.companyName ? 'border-red-500' : '' }), errors.companyName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: errors.companyName }))] }), _jsx(Button, { type: "submit", className: "w-full", children: "View Pricing Details" })] })] }) }));
};
