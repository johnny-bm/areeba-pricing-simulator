import { api } from '../../../utils/api';
import { GuestContactInfo, GuestSubmission, GuestScenarioData, GuestSession, GuestLimits } from '../types';
import { GUEST_ERRORS, GUEST_LIMITS, GUEST_STORAGE_KEYS } from '../constants';

export class GuestService {
  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current guest session
   */
  static getCurrentSession(): GuestSession | null {
    try {
      const sessionId = localStorage.getItem(GUEST_STORAGE_KEYS.SESSION_ID);
      if (!sessionId) return null;

      const contactInfo = localStorage.getItem(GUEST_STORAGE_KEYS.CONTACT_INFO);
      const scenarioData = localStorage.getItem(GUEST_STORAGE_KEYS.SCENARIO_DATA);

      return {
        sessionId,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        contactInfo: contactInfo ? JSON.parse(contactInfo) : undefined,
        scenarioData: scenarioData ? JSON.parse(scenarioData) : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create new guest session
   */
  static createSession(): GuestSession {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();

    const session: GuestSession = {
      sessionId,
      isActive: true,
      createdAt: now,
      lastActivity: now,
    };

    localStorage.setItem(GUEST_STORAGE_KEYS.SESSION_ID, sessionId);
    return session;
  }

  /**
   * Update guest session
   */
  static updateSession(updates: Partial<GuestSession>): void {
    const session = this.getCurrentSession();
    if (!session) return;

    const updatedSession = { ...session, ...updates, lastActivity: new Date().toISOString() };
    
    if (updates.contactInfo) {
      localStorage.setItem(GUEST_STORAGE_KEYS.CONTACT_INFO, JSON.stringify(updates.contactInfo));
    }
    
    if (updates.scenarioData) {
      localStorage.setItem(GUEST_STORAGE_KEYS.SCENARIO_DATA, JSON.stringify(updates.scenarioData));
    }
  }

  /**
   * Clear guest session
   */
  static clearSession(): void {
    localStorage.removeItem(GUEST_STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(GUEST_STORAGE_KEYS.CONTACT_INFO);
    localStorage.removeItem(GUEST_STORAGE_KEYS.SCENARIO_DATA);
    localStorage.removeItem(GUEST_STORAGE_KEYS.SUBMISSION_COUNT);
    localStorage.removeItem(GUEST_STORAGE_KEYS.LAST_SUBMISSION);
  }

  /**
   * Check submission limits
   */
  static checkSubmissionLimits(): { canSubmit: boolean; reason?: string } {
    const submissionCount = parseInt(localStorage.getItem(GUEST_STORAGE_KEYS.SUBMISSION_COUNT) || '0');
    const lastSubmission = localStorage.getItem(GUEST_STORAGE_KEYS.LAST_SUBMISSION);
    
    if (submissionCount >= GUEST_LIMITS.MAX_SUBMISSIONS_PER_DAY) {
      return { canSubmit: false, reason: 'Daily submission limit exceeded' };
    }

    if (lastSubmission) {
      const lastSubmissionTime = new Date(lastSubmission).getTime();
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastSubmissionTime > oneHourAgo && submissionCount >= GUEST_LIMITS.MAX_SUBMISSIONS_PER_HOUR) {
        return { canSubmit: false, reason: 'Hourly submission limit exceeded' };
      }
    }

    return { canSubmit: true };
  }

  /**
   * Submit guest scenario
   */
  static async submitScenario(
    contactInfo: GuestContactInfo,
    scenarioData: GuestScenarioData
  ): Promise<GuestSubmission> {
    const limitsCheck = this.checkSubmissionLimits();
    if (!limitsCheck.canSubmit) {
      throw new Error(limitsCheck.reason || GUEST_ERRORS.SUBMISSION_LIMIT_EXCEEDED);
    }

    try {
      // TODO(types): Implement guest scenario submission
      const response = await api.saveGuestScenario({
        sessionId: scenarioData.sessionId,
        email: contactInfo.email,
        phoneNumber: contactInfo.phoneNumber,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        companyName: contactInfo.companyName,
        scenarioName: scenarioData.summary?.projectName || 'Untitled Scenario',
        config: scenarioData.clientConfig,
        selectedItems: scenarioData.selectedItems,
        categories: scenarioData.categories,
        globalDiscount: 0, // TODO(types): Add global discount to GuestScenarioData
        globalDiscountType: 'percentage', // TODO(types): Add global discount type to GuestScenarioData
        globalDiscountApplication: 'none', // TODO(types): Add global discount application to GuestScenarioData
        summary: scenarioData.summary
      });

      // Update submission count
      const currentCount = parseInt(localStorage.getItem(GUEST_STORAGE_KEYS.SUBMISSION_COUNT) || '0');
      localStorage.setItem(GUEST_STORAGE_KEYS.SUBMISSION_COUNT, (currentCount + 1).toString());
      localStorage.setItem(GUEST_STORAGE_KEYS.LAST_SUBMISSION, new Date().toISOString());

      return {
        id: response.scenarioId,
        sessionId: response.scenarioId,
        email: contactInfo.email,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        company: contactInfo.companyName,
        phone: contactInfo.phoneNumber,
        scenarioData: scenarioData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to submit scenario: ${(error as Error).message}`);
    }
  }

  /**
   * Get guest submissions (admin only)
   */
  static async getGuestSubmissions(): Promise<GuestSubmission[]> {
    try {
      const response = await api.loadGuestSubmissions();
      return response || [];
    } catch (error) {
      throw new Error(`Failed to fetch guest submissions: ${(error as Error).message}`);
    }
  }

  /**
   * Get guest submission by ID (admin only)
   */
  static async getGuestSubmission(id: string): Promise<GuestSubmission | null> {
    try {
      const response = await api.getGuestScenarioData(id);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Delete guest submission (admin only)
   */
  static async deleteGuestSubmission(id: string): Promise<void> {
    try {
      // TODO(types): Implement guest submission deletion
      throw new Error('Guest submission deletion not implemented yet');
    } catch (error) {
      throw new Error(`Failed to delete guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Validate contact information
   */
  static validateContactInfo(contactInfo: GuestContactInfo): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!contactInfo.email || !contactInfo.email.trim()) {
      errors.email = GUEST_ERRORS.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
      errors.email = GUEST_ERRORS.EMAIL_INVALID;
    }

    if (!contactInfo.phoneNumber || !contactInfo.phoneNumber.trim()) {
      errors.phoneNumber = GUEST_ERRORS.PHONE_REQUIRED;
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(contactInfo.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = GUEST_ERRORS.PHONE_INVALID;
    }

    if (!contactInfo.firstName || !contactInfo.firstName.trim()) {
      errors.firstName = GUEST_ERRORS.FIRST_NAME_REQUIRED;
    }

    if (!contactInfo.lastName || !contactInfo.lastName.trim()) {
      errors.lastName = GUEST_ERRORS.LAST_NAME_REQUIRED;
    }

    if (!contactInfo.companyName || !contactInfo.companyName.trim()) {
      errors.companyName = GUEST_ERRORS.COMPANY_REQUIRED;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(session: GuestSession): boolean {
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const maxAge = GUEST_LIMITS.MAX_SESSION_DURATION * 60 * 1000; // Convert to milliseconds
    return sessionAge > maxAge;
  }

  /**
   * Get session status
   */
  static getSessionStatus(session: GuestSession): 'active' | 'expired' | 'submitted' | 'blocked' {
    if (this.isSessionExpired(session)) {
      return 'expired';
    }

    const limitsCheck = this.checkSubmissionLimits();
    if (!limitsCheck.canSubmit) {
      return 'blocked';
    }

    if (session.contactInfo && session.scenarioData) {
      return 'submitted';
    }

    return 'active';
  }
}
