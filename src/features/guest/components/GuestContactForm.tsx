import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { useGuestValidation } from '../hooks/useGuestValidation';
import { GuestContactInfo } from '../types';
import { GUEST_MESSAGES } from '../constants';
import { User, Mail, Phone, Building } from 'lucide-react';

interface GuestContactFormProps {
  onSubmit: (contactInfo: GuestContactInfo) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function GuestContactForm({ onSubmit, isLoading = false, error }: GuestContactFormProps) {
  const { errors, validateContactInfo, clearError } = useGuestValidation();
  const [formData, setFormData] = useState<GuestContactInfo>({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });

  const handleInputChange = (field: keyof GuestContactInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateContactInfo(formData)) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Contact Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          {GUEST_MESSAGES.CONTACT_REQUIRED}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                placeholder="Acme Corporation"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Get My Quote'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
