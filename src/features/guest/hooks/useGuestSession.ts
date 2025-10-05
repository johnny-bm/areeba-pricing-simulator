import { useState, useEffect, useCallback } from 'react';
import { GuestService } from '../api/guestService';
import { GuestSession, GuestContactInfo, GuestScenarioData } from '../types';
import { GUEST_ERRORS } from '../constants';

export function useGuestSession() {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeSession = useCallback(() => {
    try {
      let currentSession = GuestService.getCurrentSession();
      
      if (!currentSession) {
        currentSession = GuestService.createSession();
      } else if (GuestService.isSessionExpired(currentSession)) {
        GuestService.clearSession();
        currentSession = GuestService.createSession();
      }

      setSession(currentSession);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContactInfo = useCallback((contactInfo: GuestContactInfo) => {
    if (!session) return;

    try {
      GuestService.updateSession({ contactInfo });
      setSession(prev => prev ? { ...prev, contactInfo } : null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [session]);

  const updateScenarioData = useCallback((scenarioData: GuestScenarioData) => {
    if (!session) return;

    try {
      GuestService.updateSession({ scenarioData });
      setSession(prev => prev ? { ...prev, scenarioData } : null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [session]);

  const clearSession = useCallback(() => {
    try {
      GuestService.clearSession();
      setSession(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const refreshSession = useCallback(() => {
    setIsLoading(true);
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const sessionStatus = session ? GuestService.getSessionStatus(session) : null;
  const canSubmit = sessionStatus === 'active' || sessionStatus === 'submitted';
  const isExpired = sessionStatus === 'expired';
  const isBlocked = sessionStatus === 'blocked';

  return {
    session,
    sessionStatus,
    isLoading,
    error,
    canSubmit,
    isExpired,
    isBlocked,
    updateContactInfo,
    updateScenarioData,
    clearSession,
    refreshSession,
  };
}
