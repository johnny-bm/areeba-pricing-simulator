import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../shared/components/ui/dialog';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { GuestContactForm } from './GuestContactForm';
import { useGuestSession } from '../hooks/useGuestSession';
import { useGuestValidation } from '../hooks/useGuestValidation';
import { GuestContactInfo } from '../types';
import { GUEST_MESSAGES } from '../constants';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface GuestSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contactInfo: GuestContactInfo) => Promise<void>;
  isSubmitting?: boolean;
  submissionError?: string | null;
}

export function GuestSubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submissionError,
}: GuestSubmissionModalProps) {
  const { session, sessionStatus, isExpired, isBlocked } = useGuestSession();
  const { validateContactInfo } = useGuestValidation();
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [contactInfo, setContactInfo] = useState<GuestContactInfo | null>(null);

  const handleContactSubmit = async (formData: GuestContactInfo) => {
    if (!validateContactInfo(formData)) {
      return;
    }

    setContactInfo(formData);
    
    try {
      await onSubmit(formData);
      setStep('success');
    } catch (error) {
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
        type: 'error' as const,
        title: 'Session Expired',
        message: 'Your session has expired. Please start over.',
        icon: <AlertCircle className="h-5 w-5" />,
      };
    }

    if (isBlocked) {
      return {
        type: 'error' as const,
        title: 'Submission Limit Reached',
        message: 'You have reached the maximum number of submissions. Please try again later.',
        icon: <AlertCircle className="h-5 w-5" />,
      };
    }

    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Your Quote</DialogTitle>
          <DialogDescription>
            Provide your contact information to receive your personalized pricing quote.
          </DialogDescription>
        </DialogHeader>

        {statusMessage && (
          <Alert variant={statusMessage.type}>
            {statusMessage.icon}
            <AlertDescription>
              <div className="font-medium">{statusMessage.title}</div>
              <div>{statusMessage.message}</div>
            </AlertDescription>
          </Alert>
        )}

        {step === 'form' && !statusMessage && (
          <GuestContactForm
            onSubmit={handleContactSubmit}
            isLoading={isSubmitting}
            error={submissionError}
          />
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quote Submitted Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              {GUEST_MESSAGES.SUBMISSION_SUCCESS}
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Submission Failed</h3>
            <p className="text-muted-foreground mb-4">
              {GUEST_MESSAGES.SUBMISSION_ERROR}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}

        {isSubmitting && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Submitting your quote...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
