import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { useGuestValidation } from '../hooks/useGuestValidation';
import { GUEST_MESSAGES } from '../constants';
import { User, Mail, Phone, Building } from 'lucide-react';
export function GuestContactForm({ onSubmit, isLoading = false, error }) {
    const { errors, validateContactInfo, clearError } = useGuestValidation();
    const [formData, setFormData] = useState({
        email: '',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        companyName: '',
    });
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearError(field);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateContactInfo(formData)) {
            onSubmit(formData);
        }
    };
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx(CardTitle, { className: "text-xl", children: "Contact Information" }), _jsx("p", { className: "text-sm text-muted-foreground", children: GUEST_MESSAGES.CONTACT_REQUIRED })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "firstName", type: "text", placeholder: "John", value: formData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), className: "pl-10", disabled: isLoading, required: true })] }), errors.firstName && (_jsx("p", { className: "text-sm text-red-600", children: errors.firstName }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "lastName", type: "text", placeholder: "Doe", value: formData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), className: "pl-10", disabled: isLoading, required: true })] }), errors.lastName && (_jsx("p", { className: "text-sm text-red-600", children: errors.lastName }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "email", type: "email", placeholder: "john.doe@company.com", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), className: "pl-10", disabled: isLoading, required: true })] }), errors.email && (_jsx("p", { className: "text-sm text-red-600", children: errors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phoneNumber", children: "Phone Number" }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "phoneNumber", type: "tel", placeholder: "+1 (555) 123-4567", value: formData.phoneNumber, onChange: (e) => handleInputChange('phoneNumber', e.target.value), className: "pl-10", disabled: isLoading, required: true })] }), errors.phoneNumber && (_jsx("p", { className: "text-sm text-red-600", children: errors.phoneNumber }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "companyName", children: "Company Name" }), _jsxs("div", { className: "relative", children: [_jsx(Building, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { id: "companyName", type: "text", placeholder: "Acme Corporation", value: formData.companyName, onChange: (e) => handleInputChange('companyName', e.target.value), className: "pl-10", disabled: isLoading, required: true })] }), errors.companyName && (_jsx("p", { className: "text-sm text-red-600", children: errors.companyName }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Submitting...' : 'Get My Quote' })] }) })] }));
}
