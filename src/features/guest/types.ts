// Guest feature types
export interface GuestContactInfo {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface GuestSubmission {
  id: string;
  sessionId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  scenarioData: GuestScenarioData;
  createdAt: string;
  updatedAt: string;
}

export interface GuestScenarioData {
  id?: string;
  sessionId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  selectedItems: any[];
  clientConfig: any;
  categories: any[];
  summary: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestSession {
  sessionId: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  contactInfo?: GuestContactInfo;
  scenarioData?: GuestScenarioData;
}

export interface GuestLimits {
  maxSubmissionsPerHour: number;
  maxSubmissionsPerDay: number;
  maxSessionDuration: number; // in minutes
}

export interface GuestValidation {
  email: boolean;
  phone: boolean;
  firstName: boolean;
  lastName: boolean;
  companyName: boolean;
}

export interface GuestFormData {
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface GuestFormErrors {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}
