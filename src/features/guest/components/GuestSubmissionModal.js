import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { GuestContactForm } from './GuestContactForm';
import { useGuestSession } from '../hooks/useGuestSession';
import { useGuestValidation } from '../hooks/useGuestValidation';
import { GUEST_MESSAGES } from '../constants';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
export function GuestSubmissionModal({ isOpen, onClose, onSubmit, isSubmitting = false, submissionError, }) {
    const { session, sessionStatus, isExpired, isBlocked } = useGuestSession();
    const { validateContactInfo } = useGuestValidation();
    const [step, setStep] = useState('form');
    const [contactInfo, setContactInfo] = useState(null);
    const handleContactSubmit = async (formData) => {
        if (!validateContactInfo(formData)) {
            return;
        }
        setContactInfo(formData);
        try {
            await onSubmit(formData);
            setStep('success');
        }
        catch (error) {
            setStep('error');
        }
    };
    const handleClose = () => {
        setStep('form');
        setContactInfo(null);
        onClose();
    };
    const getStatusMessage = () => {
        if (isExpired) {
            return {
                type: 'error',
                title: 'Session Expired',
                message: 'Your session has expired. Please start over.',
                icon: _jsx(AlertCircle, { className: "h-5 w-5" }),
            };
        }
        if (isBlocked) {
            return {
                type: 'error',
                title: 'Submission Limit Reached',
                message: 'You have reached the maximum number of submissions. Please try again later.',
                icon: _jsx(AlertCircle, { className: "h-5 w-5" }),
            };
        }
        return null;
    };
    const statusMessage = getStatusMessage();
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Get Your Quote" }), _jsx(DialogDescription, { children: "Provide your contact information to receive your personalized pricing quote." })] }), statusMessage && (_jsxs(Alert, { variant: statusMessage.type, children: [statusMessage.icon, _jsxs(AlertDescription, { children: [_jsx("div", { className: "font-medium", children: statusMessage.title }), _jsx("div", { children: statusMessage.message })] })] })), step === 'form' && !statusMessage && (_jsx(GuestContactForm, { onSubmit: handleContactSubmit, isLoading: isSubmitting, error: submissionError })), step === 'success' && (_jsxs("div", { className: "text-center py-6", children: [_jsx(CheckCircle, { className: "h-12 w-12 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "Quote Submitted Successfully!" }), _jsx("p", { className: "text-muted-foreground mb-4", children: GUEST_MESSAGES.SUBMISSION_SUCCESS }), _jsx(Button, { onClick: handleClose, className: "w-full", children: "Close" })] })), step === 'error' && (_jsxs("div", { className: "text-center py-6", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-600 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: "Submission Failed" }), _jsx("p", { className: "text-muted-foreground mb-4", children: GUEST_MESSAGES.SUBMISSION_ERROR }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => setStep('form'), className: "flex-1", children: "Try Again" }), _jsx(Button, { onClick: handleClose, className: "flex-1", children: "Close" })] })] })), isSubmitting && (_jsxs("div", { className: "flex items-center justify-center py-6", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin mr-2" }), _jsx("span", { children: "Submitting your quote..." })] }))] }) }));
}
