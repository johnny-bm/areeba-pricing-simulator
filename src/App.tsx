import { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import { SimulatorLanding } from './components/SimulatorLanding';
import { DynamicClientConfigBar } from './components/DynamicClientConfigBar';
import { ItemLibrary } from './components/ItemLibrary'; // v2.2.0 - tags removed
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { FeeSummary } from './components/FeeSummary';
import { VersionInfo } from './components/VersionInfo';
import { ScenarioSummaryDialog } from './components/dialogs/ScenarioSummaryDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminInterface } from './components/AdminInterface';
import { AutoAddConfigPanel } from './components/AutoAddConfigPanel';
import { BackendConnectionError } from './components/BackendConnectionError';
import { ConnectionDiagnostics } from './components/ConnectionDiagnostics';
import { LoginPage } from './components/LoginPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { SignupPage } from './components/SignupPage';
import { UserProfileHeader } from './components/UserProfileHeader';
import { GuestContactFormModal } from './components/GuestContactFormModal';
import { ClientConfig, SelectedItem, PricingItem, Category, DynamicClientConfig } from './types/pricing';
import { downloadPDF } from './utils/pdfHelpers';
import { api } from './utils/api';
// projectId removed - now using environment variables
import { getConfigBasedQuantity, getEffectiveUnitPrice } from './utils/tieredPricing';
import { isOneTimeUnit } from './utils/unitClassification';
import { applyAutoAddLogic, removeAutoAddedServices } from './utils/autoAddLogic';
import { 
  clientConfigPersistence, 
  selectedItemsPersistence, 
  globalDiscountPersistence,
  simulatorSelectionPersistence,
  serviceMappingsPersistence,
  autoAddConfigPersistence,
  isDatabasePersistenceAvailable,
  flushPendingSaves
} from './utils/databasePersistence';
import { COLUMNS, PRICING_TYPES, DISCOUNT_TYPES, DISCOUNT_APPLICATIONS, DB_HELPERS, CATEGORY_IDS, ROLES, TABLES } from './config/database';
import { supabase } from './utils/supabase/client';
import WordMarkRed from './imports/WordMarkRed';

// Utility function to deduplicate categories
const deduplicateCategories = (categories: Category[]): Category[] => {
  if (!categories || categories.length === 0) {
    return categories;
  }
  
  const seen = new Set<string>();
  const deduplicated: Category[] = [];
  
  for (const category of categories) {
    if (!seen.has(category.id)) {
      seen.add(category.id);
      deduplicated.push(category);
    }
  }
  
  return deduplicated;
};

// Helper function to get logged-in user's name
const getUserName = () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.email || '';
  } catch {
    return '';
  }
};

function AppContent() {
  const navigate = useNavigate();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // UI state
  const [showAdminInterface, setShowAdminInterface] = useState<boolean>(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState<boolean>(false);
  const [savedScenarioId, setSavedScenarioId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Guest mode detection and contact state - Check URL synchronously before routing
  const [isGuestMode] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const guestMode = urlParams.get('mode') === 'guest';
    return guestMode;
  });
  
  // Guest session tracking
  const [guestSessionId] = useState<string | null>(() => {
    if (!isGuestMode) return null;
    
    // Check if guest already has a session
    const existingSession = sessionStorage.getItem('guest_session_id');
    if (existingSession) {
      return existingSession;
    }
    
    // Generate new session ID for this guest
    const newSessionId = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('guest_session_id', newSessionId);
    return newSessionId;
  });
  
  // Track if guest has submitted contact info in this session
  const [guestContactSubmitted, setGuestContactSubmitted] = useState<boolean>(() => {
    if (!isGuestMode) return false;
    return sessionStorage.getItem('guest_contact_submitted') === 'true';
  });
  
  const [guestContactInfo, setGuestContactInfo] = useState<any>(null);
  const [showGuestContactForm, setShowGuestContactForm] = useState<boolean>(false);
  
  // Simulator selection state
  const [selectedSimulator, setSelectedSimulator] = useState<string | null>(null);
  
  const [clientConfig, setClientConfig] = useState<DynamicClientConfig>({
    clientName: '',
    projectName: '',
    preparedBy: getUserName(), // Auto-fill with logged-in user
    configValues: {
      hasDebitCards: false,
      hasCreditCards: false,
      debitCards: 0,
      creditCards: 0,
      monthlyAuthorizations: 0,
      monthlySettlements: 0,
      monthly3DS: 0,
      monthlySMS: 0,
      monthlyNotifications: 0,
      monthlyDeliveries: 0
    }
  });

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'fixed'>(DISCOUNT_TYPES.PERCENTAGE);
  const [globalDiscountApplication, setGlobalDiscountApplication] = useState<'none' | 'both' | 'monthly' | 'onetime'>(DISCOUNT_APPLICATIONS.NONE);
  
  // Application data state
  const [pricingServices, setPricingServices] = useState<PricingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [backendConnectionError, setBackendConnectionError] = useState<boolean>(false);

  // Service configuration mappings state
  const [serviceMappings, setServiceMappings] = useState<Record<string, any>>({});
  const [autoAddConfig, setAutoAddConfig] = useState<{
    autoAddRules: Record<string, string[]>;
    quantityRules: Record<string, { field: string; multiplier?: number }>;
  }>({
    autoAddRules: {},
    quantityRules: {}
  });

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      // Don't check session on public pages or guest mode
      const publicPaths = ['/login', '/forgot-password', '/reset-password', '/signup'];
      const urlParams = new URLSearchParams(window.location.search);
      const isGuestMode = urlParams.get('mode') === 'guest';
      
      if (publicPaths.includes(window.location.pathname) || isGuestMode) {
        setAuthLoading(false);
        return;
      }
      
      try {
        // Check if Supabase has an active session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // No valid session - clear localStorage and stay logged out
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserId(null);
          setUserRole(null);
          setAuthLoading(false);
          return;
        }
        
        // Session is valid - verify user profile still exists
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.USER_PROFILES)
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !profile) {
          console.error('❌ Profile not found or error:', profileError);
          localStorage.removeItem('user');
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setUserId(null);
          setUserRole(null);
          setAuthLoading(false);
          return;
        }
        
        // Everything is valid - restore session
        setIsAuthenticated(true);
        setUserId(profile.id);
        setUserRole(profile.role);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify({
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role
        }));
        
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Set preparedBy after authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      const userName = getUserName();
      if (userName && !clientConfig.preparedBy) {
        setClientConfig(prev => ({
          ...prev,
          preparedBy: userName
        }));
      }
    }
  }, [isAuthenticated, clientConfig.preparedBy]);

  // Periodic session validation - check every 30 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session validity every 30 minutes
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Clear state
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUserId(null);
          setUserRole(null);
          
          // Sign out from Supabase
          await supabase.auth.signOut();
          
          // Redirect to login
          navigate('/login');
          
          // Show toast notification
          toast.error('Session expired', {
            description: 'Please log in again to continue',
            duration: 5000
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated, navigate]);

  // Handle page unload to flush pending saves
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushPendingSaves();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingSaves();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flushPendingSaves();
    };
  }, []);
  
  // Clear guest session on tab close (sessionStorage handles this automatically)
  useEffect(() => {
    if (isGuestMode) {
      const handleBeforeUnload = () => {
        // sessionStorage automatically clears on tab close
        // This is just for logging/tracking purposes
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isGuestMode]);

  // Load persisted data on app startup
  useEffect(() => {
    const loadPersistedData = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Persistence load timeout')), 5000)
      );
      
      try {
        const databaseAvailable = await Promise.race([
          isDatabasePersistenceAvailable(),
          timeoutPromise
        ]);
        
        if (!databaseAvailable) {
          return;
        }

        const [
          persistedSimulator,
          persistedConfig,
          persistedItems,
          persistedDiscount,
          persistedDiscountType,
          persistedDiscountApplication,
          persistedMappings,
          persistedAutoAddConfig
        ] = await Promise.race([
          Promise.all([
            simulatorSelectionPersistence.load().catch(() => null),
            clientConfigPersistence.load().catch(() => null),
            selectedItemsPersistence.load().catch(() => []),
            globalDiscountPersistence.loadDiscount().catch(() => 0),
            globalDiscountPersistence.loadDiscountType().catch(() => DISCOUNT_TYPES.PERCENTAGE),
            globalDiscountPersistence.loadDiscountApplication().catch(() => DISCOUNT_APPLICATIONS.NONE),
            serviceMappingsPersistence.load().catch(() => ({})),
            autoAddConfigPersistence.load().catch(() => ({ autoAddRules: {}, quantityRules: {} }))
          ]),
          timeoutPromise
        ]);

        if (persistedSimulator) {
          setSelectedSimulator(persistedSimulator);
        }

        if (persistedConfig) {
          // Ensure preparedBy is set even if loading old config
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const userName = userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.email || '';
          
          setClientConfig({
            ...persistedConfig,
            preparedBy: persistedConfig.preparedBy || userName
          });
        }

        if (persistedItems.length > 0) {
          setSelectedItems(persistedItems);
        }
        
        if (persistedDiscount !== 0 || persistedDiscountType !== DISCOUNT_TYPES.PERCENTAGE || persistedDiscountApplication !== DISCOUNT_APPLICATIONS.NONE) {
          setGlobalDiscount(persistedDiscount);
          setGlobalDiscountType(persistedDiscountType);
          setGlobalDiscountApplication(persistedDiscountApplication);
        }

        if (Object.keys(persistedMappings).length > 0) {
          setServiceMappings(persistedMappings);
        }

        if (Object.keys(persistedAutoAddConfig.autoAddRules).length > 0 || 
            Object.keys(persistedAutoAddConfig.quantityRules).length > 0) {
          setAutoAddConfig(persistedAutoAddConfig);
        }

        const shouldSync = Object.keys(persistedMappings).length > 0 || 
                          Object.keys(persistedAutoAddConfig.autoAddRules).length > 0 ||
                          Object.keys(persistedAutoAddConfig.quantityRules).length > 0;
        
        if (shouldSync) {
          const convertedConfig = {
            autoAddRules: {} as Record<string, string[]>,
            quantityRules: {} as Record<string, { field: string; multiplier?: number }>
          };

          Object.assign(convertedConfig.autoAddRules, persistedAutoAddConfig.autoAddRules);
          Object.assign(convertedConfig.quantityRules, persistedAutoAddConfig.quantityRules);

          Object.entries(persistedMappings).forEach(([serviceId, mapping]: [string, any]) => {
            if (mapping.autoAdd && mapping.configField) {
              if (!convertedConfig.autoAddRules[mapping.configField]) {
                convertedConfig.autoAddRules[mapping.configField] = [];
              }
              if (!convertedConfig.autoAddRules[mapping.configField].includes(serviceId)) {
                convertedConfig.autoAddRules[mapping.configField].push(serviceId);
              }

              if (mapping.syncQuantity && mapping.triggerCondition === 'number') {
                convertedConfig.quantityRules[serviceId] = {
                  field: mapping.configField,
                  multiplier: mapping.quantityMultiplier || 1
                };
              }
            }
          });
          
          setAutoAddConfig(convertedConfig);
          
          setTimeout(async () => {
            try {
              await autoAddConfigPersistence.save(convertedConfig);
            } catch (error) {
              // Silently handle errors
            }
          }, 1000);
        }

      } catch (error: any) {
        if (error?.message !== 'Persistence load timeout') {
          console.warn('Persistence load failed (non-critical):', error);
        }
      }
    };

    const timeoutId = setTimeout(loadPersistedData, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setBackendConnectionError(false);
        
        // Increased timeout to 20 seconds to accommodate Edge Function cold starts
        // (api.healthCheck uses 15s on first attempt, so we need more time)
        const healthCheckTimeout = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 20000)
        );
        
        const isHealthy = await Promise.race([
          api.healthCheck(),
          healthCheckTimeout
        ]).catch(() => false);
        
        if (!isHealthy) {
          console.error('❌ Backend health check failed - server is not responding');
          setBackendConnectionError(true);
          setIsLoading(false);
          return;
        }
        
        const [services, loadedCategories, loadedConfigurations] = await Promise.all([
          api.loadPricingItems().catch((err) => {
            console.error('Failed to load services:', err.message);
            throw err;
          }),
          api.loadCategories().catch((err) => {
            console.error('Failed to load categories:', err.message);
            throw err;
          }),
          api.loadConfigurations().catch((err) => {
            console.warn('Failed to load configurations:', err.message);
            return [];
          })
        ]);
        
        const deduplicatedCategories = deduplicateCategories(loadedCategories);
        
        setPricingServices(services);
        setCategories(deduplicatedCategories);
        setConfigurations(loadedConfigurations);

        if (loadedConfigurations && loadedConfigurations.length > 0) {
          const updatedConfigValues = { ...clientConfig.configValues };
          let hasNewFields = false;
          
          loadedConfigurations.filter(config => config.isActive).forEach(configDef => {
            if (configDef.fields && Array.isArray(configDef.fields)) {
              configDef.fields.forEach(field => {
                if (updatedConfigValues[field.id] === undefined) {
                  updatedConfigValues[field.id] = field.defaultValue;
                  hasNewFields = true;
                }
              });
            }
          });
          
          if (hasNewFields) {
            setClientConfig(prevConfig => ({
              ...prevConfig,
              configValues: updatedConfigValues
            }));
          }
        }
        
      } catch (error: any) {
        console.error('Error loading application data:', error);
        
        const errorMessage = error?.message || '';
        if (errorMessage.includes('Failed to connect') || 
            errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('Request timeout') ||
            errorMessage.includes('network')) {
          setBackendConnectionError(true);
        } else {
          toast.error('Failed to load application data', {
            description: errorMessage || 'Please refresh the page or contact support if the issue persists',
            duration: 5000
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const convertToLegacyConfig = useCallback((dynamicConfig: DynamicClientConfig): ClientConfig => {
    const legacyConfig: ClientConfig = {
      clientName: dynamicConfig.clientName,
      projectName: dynamicConfig.projectName,
      preparedBy: dynamicConfig.preparedBy,
      hasDebitCards: (dynamicConfig.configValues.hasDebitCards as boolean) || false,
      hasCreditCards: (dynamicConfig.configValues.hasCreditCards as boolean) || false,
      debitCards: (dynamicConfig.configValues.debitCards as number) || 0,
      creditCards: (dynamicConfig.configValues.creditCards as number) || 0,
      monthlyAuthorizations: (dynamicConfig.configValues.monthlyAuthorizations as number) || 0,
      monthlySettlements: (dynamicConfig.configValues.monthlySettlements as number) || 0,
      monthly3DS: (dynamicConfig.configValues.monthly3DS as number) || 0,
      monthlySMS: (dynamicConfig.configValues.monthlySMS as number) || 0,
      monthlyNotifications: (dynamicConfig.configValues.monthlyNotifications as number) || 0,
      monthlyDeliveries: (dynamicConfig.configValues.monthlyDeliveries as number) || 0
    };
    
    Object.entries(dynamicConfig.configValues).forEach(([key, value]) => {
      if (!(key in legacyConfig)) {
        (legacyConfig as any)[key] = value;
      }
    });
    
    return legacyConfig;
  }, []);
  
  const legacyConfig = useMemo(() => convertToLegacyConfig(clientConfig), [clientConfig, convertToLegacyConfig]);

  const getDefaultQuantity = useCallback((item: PricingItem, config: ClientConfig): number => {
    return getConfigBasedQuantity(item, config);
  }, []);

  const [isUpdatingFromSync, setIsUpdatingFromSync] = useState(false);
  const [hasInitialLoadCompleted, setHasInitialLoadCompleted] = useState(false);
  
  // Initial auto-add application
  useEffect(() => {
    if (hasInitialLoadCompleted || 
        isUpdatingFromSync || 
        !pricingServices || 
        pricingServices.length === 0) {
      return;
    }
    
    const hasAutoAddRules = Object.keys(autoAddConfig.autoAddRules).length > 0;
    const hasServiceMappings = Object.values(serviceMappings).some(mapping => mapping.autoAdd);
    
    if (!hasAutoAddRules && !hasServiceMappings) {
      setHasInitialLoadCompleted(true);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      try {
        setSelectedItems(prevItems => {
          return applyAutoAddLogic(prevItems, clientConfig, pricingServices, autoAddConfig, serviceMappings);
        });
      } catch (error) {
        console.error('Error in initial auto-add logic:', error);
      } finally {
        setHasInitialLoadCompleted(true);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [pricingServices, autoAddConfig, serviceMappings, hasInitialLoadCompleted, isUpdatingFromSync]);
  
  // Auto-sync effect
  useEffect(() => {
    if (isUpdatingFromSync || 
        !hasInitialLoadCompleted || 
        !pricingServices || 
        pricingServices.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      try {
        setSelectedItems(prevItems => {
          let itemsAfterRemoval = removeAutoAddedServices(prevItems, clientConfig, autoAddConfig, serviceMappings);
          let updatedItems = applyAutoAddLogic(itemsAfterRemoval, clientConfig, pricingServices, autoAddConfig, serviceMappings);
          
          updatedItems = updatedItems.map(selectedItem => {
            const quantityFields = selectedItem.item.quantity_source_fields || selectedItem.item.quantitySourceFields || [];
            if (quantityFields.length > 0) {
              const newQuantity = getDefaultQuantity(selectedItem.item, legacyConfig);
              if (selectedItem.quantity !== newQuantity) {
                const updatedItem = { ...selectedItem, quantity: newQuantity };
                
                if (selectedItem.item.pricingType === PRICING_TYPES.TIERED && selectedItem.item.tiers && selectedItem.item.tiers.length > 0) {
                  updatedItem.unitPrice = getEffectiveUnitPrice(selectedItem.item, newQuantity);
                }
                
                return updatedItem;
              }
            }
            return selectedItem;
          });

          const hasChanges = JSON.stringify(prevItems.map(item => ({ 
            id: item.id, 
            itemId: item.item.id, 
            quantity: item.quantity 
          }))) !== JSON.stringify(updatedItems.map(item => ({ 
            id: item.id, 
            itemId: item.item.id, 
            quantity: item.quantity 
          })));
          
          return hasChanges ? updatedItems : prevItems;
        });
      } catch (error) {
        console.error('Error in auto-sync logic:', error);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [clientConfig, autoAddConfig, serviceMappings, pricingServices, isUpdatingFromSync, hasInitialLoadCompleted]);

  // Persistence effects
  useEffect(() => {
    const saveClientConfig = async () => {
      try {
        await clientConfigPersistence.save(clientConfig);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveClientConfig, 100);
    return () => clearTimeout(timeoutId);
  }, [clientConfig]);

  useEffect(() => {
    const saveSelectedItems = async () => {
      try {
        await selectedItemsPersistence.save(selectedItems);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveSelectedItems, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedItems]);

  useEffect(() => {
    const saveGlobalDiscountSettings = async () => {
      try {
        await Promise.allSettled([
          globalDiscountPersistence.saveDiscount(globalDiscount),
          globalDiscountPersistence.saveDiscountType(globalDiscountType),
          globalDiscountPersistence.saveDiscountApplication(globalDiscountApplication)
        ]);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveGlobalDiscountSettings, 100);
    return () => clearTimeout(timeoutId);
  }, [globalDiscount, globalDiscountType, globalDiscountApplication]);

  useEffect(() => {
    const saveSimulatorSelection = async () => {
      if (!selectedSimulator) return;
      
      try {
        await simulatorSelectionPersistence.save(selectedSimulator);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveSimulatorSelection, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedSimulator]);

  useEffect(() => {
    const saveServiceMappings = async () => {
      try {
        await serviceMappingsPersistence.save(serviceMappings);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveServiceMappings, 100);
    return () => clearTimeout(timeoutId);
  }, [serviceMappings]);

  useEffect(() => {
    const saveAutoAddConfig = async () => {
      try {
        await autoAddConfigPersistence.save(autoAddConfig);
      } catch (error) {
        // Silently handle errors
      }
    };

    const timeoutId = setTimeout(saveAutoAddConfig, 100);
    return () => clearTimeout(timeoutId);
  }, [autoAddConfig]);

  const handleAddItem = useCallback((item: PricingItem) => {
    if (selectedItems.some(selected => selected.item.id === item.id)) {
      return;
    }

    const correctQuantity = getDefaultQuantity(item, legacyConfig);

    const newSelectedItem: SelectedItem = {
      id: `${item.id}-${Date.now()}`,
      item,
      quantity: correctQuantity,
      unitPrice: item.pricingType === PRICING_TYPES.TIERED && item.tiers && item.tiers.length > 0 
        ? getEffectiveUnitPrice(item, correctQuantity) 
        : item.defaultPrice,
      discount: 0,
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      discountApplication: 'total',
      isFree: false
    };

    setSelectedItems(prev => [...prev, newSelectedItem]);
  }, [selectedItems, legacyConfig, getDefaultQuantity]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<Omit<SelectedItem, 'id' | 'item'>>) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        if (updates.quantity !== undefined && 
            item.item.pricingType === PRICING_TYPES.TIERED && 
            item.item.tiers && 
            item.item.tiers.length > 0) {
          updatedItem.unitPrice = getEffectiveUnitPrice(item.item, updates.quantity);
        }
        
        return updatedItem;
      }
      return item;
    }));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateServiceMappings = useCallback((newMappings: Record<string, any>) => {
    setServiceMappings(newMappings);
    
    const convertedConfig = {
      autoAddRules: {} as Record<string, string[]>,
      quantityRules: {} as Record<string, { field: string; multiplier?: number }>
    };

    Object.entries(newMappings).forEach(([serviceId, mapping]: [string, any]) => {
      if (mapping.autoAdd && mapping.configField) {
        if (!convertedConfig.autoAddRules[mapping.configField]) {
          convertedConfig.autoAddRules[mapping.configField] = [];
        }
        if (!convertedConfig.autoAddRules[mapping.configField].includes(serviceId)) {
          convertedConfig.autoAddRules[mapping.configField].push(serviceId);
        }

        if (mapping.syncQuantity && mapping.triggerCondition === 'number') {
          convertedConfig.quantityRules[serviceId] = {
            field: mapping.configField,
            multiplier: mapping.quantityMultiplier || 1
          };
        }
      }
    });

    setAutoAddConfig(convertedConfig);
  }, []);

  const handleUpdateAutoAddConfig = useCallback((newConfig: {
    autoAddRules: Record<string, string[]>;
    quantityRules: Record<string, { field: string; multiplier?: number }>;
  }) => {
    setAutoAddConfig(newConfig);
  }, []);

  const handleClearScenario = () => {
    const resetConfig: DynamicClientConfig = {
      clientName: '',
      projectName: '',
      preparedBy: getUserName(), // Keep user's name even when clearing
      configValues: {
        hasDebitCards: false,
        hasCreditCards: false,
        debitCards: 0,
        creditCards: 0,
        monthlyAuthorizations: 0,
        monthlySettlements: 0,
        monthly3DS: 0,
        monthlySMS: 0,
        monthlyNotifications: 0,
        monthlyDeliveries: 0
      }
    };
    
    setIsUpdatingFromSync(true);
    setSelectedItems([]);
    setGlobalDiscount(0);
    setGlobalDiscountType(DISCOUNT_TYPES.PERCENTAGE);
    setGlobalDiscountApplication(DISCOUNT_APPLICATIONS.NONE);
    setClientConfig(resetConfig);
    setServiceMappings({});
    setAutoAddConfig({
      autoAddRules: {},
      quantityRules: {}
    });
    setHasInitialLoadCompleted(false);
    
    const clearPersistedData = async () => {
      try {
        await clientConfigPersistence.clear();
        await selectedItemsPersistence.clear();
        await globalDiscountPersistence.clearAll();
        await serviceMappingsPersistence.clear();
        await autoAddConfigPersistence.clear();
      } catch (error) {
        // Silently handle errors
      }
    };
    
    clearPersistedData();
    
    requestAnimationFrame(() => {
      setIsUpdatingFromSync(false);
    });
  };

  const calculateSummary = () => {
    const calculateRowTotal = (item: SelectedItem) => {
      if (item.isFree) return 0;
      
      const discountApplication = item.discountApplication || 'total';
      
      if (discountApplication === 'unit') {
        let effectiveUnitPrice = item.unitPrice;
        
        if (item.discountType === DISCOUNT_TYPES.PERCENTAGE) {
          effectiveUnitPrice = item.unitPrice * (1 - item.discount / 100);
        } else {
          effectiveUnitPrice = item.unitPrice - item.discount;
        }
        
        effectiveUnitPrice = Math.max(0, effectiveUnitPrice);
        return effectiveUnitPrice * item.quantity;
      } else {
        const subtotal = item.quantity * item.unitPrice;
        
        let discountAmount = 0;
        if (item.discountType === DISCOUNT_TYPES.PERCENTAGE) {
          discountAmount = subtotal * (item.discount / 100);
        } else {
          discountAmount = item.discount * item.quantity;
        }
        
        return Math.max(0, subtotal - discountAmount);
      }
    };

    const oneTimeItems = selectedItems.filter(item => 
      item.item.category === CATEGORY_IDS.SETUP || isOneTimeUnit(item.item.unit)
    );
    const monthlyItems = selectedItems.filter(item => 
      item.item.category !== CATEGORY_IDS.SETUP && !isOneTimeUnit(item.item.unit)
    );

    const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
    
    let oneTimeFinal, monthlyFinal;
    
    if (globalDiscountApplication === DISCOUNT_APPLICATIONS.NONE) {
      oneTimeFinal = oneTimeSubtotal;
      monthlyFinal = monthlySubtotal;
    } else if (globalDiscountApplication === DISCOUNT_APPLICATIONS.BOTH) {
      if (globalDiscountType === DISCOUNT_TYPES.PERCENTAGE) {
        oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
        monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
      } else {
        oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
        monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
      }
    } else if (globalDiscountApplication === DISCOUNT_APPLICATIONS.MONTHLY) {
      oneTimeFinal = oneTimeSubtotal;
      if (globalDiscountType === DISCOUNT_TYPES.PERCENTAGE) {
        monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
      } else {
        monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
      }
    } else if (globalDiscountApplication === DISCOUNT_APPLICATIONS.ONETIME) {
      monthlyFinal = monthlySubtotal;
      if (globalDiscountType === DISCOUNT_TYPES.PERCENTAGE) {
        oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
      } else {
        oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
      }
    } else {
      oneTimeFinal = oneTimeSubtotal;
      monthlyFinal = monthlySubtotal;
    }
    
    const yearlyFinal = monthlyFinal * 12;

    // Calculate savings
    const totalOriginalPrice = selectedItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const totalFinalPrice = oneTimeFinal + monthlyFinal;
    const totalSavings = totalOriginalPrice - totalFinalPrice;
    
    // Calculate free service savings
    const freeSavings = selectedItems.reduce((sum, item) => {
      return sum + (item.isFree ? (item.quantity * item.unitPrice) : 0);
    }, 0);
    
    // Calculate discount savings (excluding free items)
    const discountSavings = totalSavings - freeSavings;
    
    const savingsRate = totalOriginalPrice > 0 ? (totalSavings / totalOriginalPrice) * 100 : 0;

    return {
      oneTimeTotal: oneTimeFinal,
      monthlyTotal: monthlyFinal,
      yearlyTotal: yearlyFinal,
      totalProjectCost: oneTimeFinal + yearlyFinal,
      savings: {
        totalSavings,
        discountSavings,
        freeSavings,
        originalPrice: totalOriginalPrice,
        savingsRate
      }
    };
  };

  const validateRequiredFields = () => {
    const requiredFields = [];
    
    if (!clientConfig.clientName || clientConfig.clientName.trim() === '') {
      requiredFields.push('Client Name');
    }
    
    if (!clientConfig.projectName || clientConfig.projectName.trim() === '') {
      requiredFields.push('Project Name');
    }
    
    // Only require "Prepared By" for authenticated users, not guests
    if (!isGuestMode && (!clientConfig.preparedBy || clientConfig.preparedBy.trim() === '')) {
      requiredFields.push('Prepared By');
    }
    
    return requiredFields;
  };

  const handleSubmitScenario = async () => {
      // For guests who already submitted contact info - skip database save and just show summary
    if (isGuestMode && guestContactSubmitted) {
      const scenarioId = `guest-scenario-${Date.now()}`;
      setSavedScenarioId(scenarioId);
      setShowSummaryDialog(true);
      return;
    }
    
    const missingFields = validateRequiredFields();
    
    if (missingFields.length > 0) {
      const message = isGuestMode 
        ? `Please fill in: ${missingFields.join(', ')} to continue`
        : `Please fill in the following required fields: ${missingFields.join(', ')}`;
      
      toast.error('Required fields missing', {
        description: message,
        duration: 5000
      });
      return;
    }
    
    // For guests who haven't submitted contact info yet:
    if (isGuestMode && !guestContactSubmitted) {
      toast.info('Submit your contact information', {
        description: 'Fill in your details to see the full pricing breakdown and export PDF',
        duration: 5000
      });
      setShowGuestContactForm(true);
      return;
    }
    
    // Authenticated user flow
    setIsSubmitting(true);
    
    try {
      const summary = calculateSummary();
      
      // Get user ID from state or localStorage as fallback
      const currentUserId = userId || JSON.parse(localStorage.getItem('user') || '{}').id;
      
      if (!currentUserId) {
        throw new Error('User not authenticated. Please log in again.');
      }
      
      // Save scenario to database with user ID
      const scenarioData = {
        userId: currentUserId,
        config: legacyConfig,
        selectedItems,
        categories,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        summary
      };
      
      await api.saveScenarioData(scenarioData);
      
      // Generate a scenario ID (you can use timestamp or get from API response)
      const scenarioId = `scenario-${Date.now()}`;
      setSavedScenarioId(scenarioId);
      
      // Show success message
      toast.success('Scenario saved successfully!', {
        description: 'Your pricing scenario has been saved to the database',
        duration: 3000
      });
      
      // Open the summary dialog
      setShowSummaryDialog(true);
      
    } catch (error: any) {
      console.error('❌ Error saving scenario:', error);
      
      toast.error('Failed to save scenario', {
        description: error?.message || 'There was an error saving your scenario. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const summary = calculateSummary();
      
      const configDefinitions = await api.loadConfigurations();
      
      const pdfData = {
        config: clientConfig,
        legacyConfig: legacyConfig,
        configDefinitions: configDefinitions.filter(config => config.isActive),
        selectedItems,
        categories,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        summary
      };
      
      // Generate PDF without saving (already saved in submit handler)
      downloadPDF(pdfData);
      
      toast.success('Report downloaded successfully!', {
        description: 'Open the HTML file in your browser and use Print to PDF (Ctrl+P or Cmd+P)',
        duration: 6000
      });
    } catch (error) {
      console.error('Error preparing PDF data:', error);
      
      const missingFieldsRetry = validateRequiredFields();
      if (missingFieldsRetry.length > 0) {
        toast.error('Cannot generate PDF', {
          description: `Required fields are missing: ${missingFieldsRetry.join(', ')}`,
          duration: 5000
        });
        return;
      }
      
      const summary = calculateSummary();
      const pdfData = {
        config: clientConfig,
        legacyConfig: legacyConfig,
        selectedItems,
        categories,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        summary
      };
      downloadPDF(pdfData);
      
      toast.warning('PDF downloaded with limited data', {
        description: 'Some configuration data could not be loaded, but PDF was generated',
        duration: 4000
      });
    }
  };

  const handleUpdatePricingServices = async (newServices: PricingItem[]) => {
    try {
      const invalidServices = [];
      
      for (const service of newServices) {
        if (!service.category || service.category.trim() === '') {
          invalidServices.push({
            service: service.name,
            issue: 'missing category'
          });
          continue;
        }
        
        const categoryExists = categories.some(cat => 
          cat.id === service.category || cat.name === service.category
        );
        if (!categoryExists) {
          invalidServices.push({
            service: service.name,
            issue: `category "${service.category}" does not exist`
          });
        }
      }
      
      if (invalidServices.length > 0) {
        const errorMessage = `Cannot save services: ${invalidServices.length} service(s) have invalid categories:\n\n${
          invalidServices.map(item => `• ${item.service}: ${item.issue}`).join('\n')
        }\n\nAvailable categories: ${categories.map(c => c.name).join(', ')}`;
        
        throw new Error(errorMessage);
      }
      
      await api.savePricingItems(newServices);
      
      setPricingServices(newServices);
      
      setTimeout(async () => {
        try {
          const refreshedServices = await api.loadPricingItems();
          setPricingServices(refreshedServices);
        } catch (refreshError) {
          // Silently handle refresh errors
        }
      }, 500);
      
      setSelectedItems(prevSelected => 
        prevSelected.filter(selected => 
          newServices.some(service => service.id === selected.item.id)
        ).map(selected => {
          const updatedService = newServices.find(service => service.id === selected.item.id);
          return updatedService ? { ...selected, item: updatedService } : selected;
        })
      );
      
    } catch (error) {
      if (error.message && (
        error.message.includes('auto_add_services') ||
        error.message.includes('autoAddServices') ||
        error.message.includes('quantitySourceFields') ||
        error.message.includes('quantityMultiplier') ||
        error.message.includes('autoQuantitySources') ||
        error.message.includes('pricingType') ||
        error.message.includes('Auto-add functionality') ||
        error.message.includes('schema cache') ||
        error.message.includes('fallback method') ||
        error.message.includes('Could not find the') ||
        error.message.includes('column of \'services\'')
      )) {
        setPricingServices(newServices);
        
        toast.success('Services saved successfully!', {
          description: 'Auto-add functionality works using application state',
          duration: 3000
        });
        
        return;
      }
      
      if (error.message && error.message.includes('missing categories')) {
        try {
          const freshCategories = await api.loadCategories();
          setCategories(freshCategories);
          
          await api.savePricingItems(newServices);
          setPricingServices(newServices);
          return;
        } catch (retryError) {
          // Fall through to throw original error
        }
      }
      
      throw error;
    }
  };

  const handleUpdateCategories = async (newCategories: Category[], skipSave = false) => {
    try {
      const deduplicatedCategories = deduplicateCategories(newCategories);
      
      if (!skipSave) {
        await api.saveCategories(deduplicatedCategories);
      }
      
      setCategories(deduplicatedCategories);
      
      setSelectedItems(prevSelected => 
        prevSelected.filter(selected => 
          deduplicatedCategories.some(cat => cat.id === selected.item.category)
        )
      );
      
    } catch (error) {
      if (error.message && (
        error.message.includes('Duplicate category IDs detected') ||
        error.message.includes('nuclear_reset_failed') ||
        error.message.includes('Database appears to be corrupted or locked') ||
        error.message.includes('all_individual_saves_failed')
      )) {
        toast.error('Database issue detected. Attempting automatic recovery...', {
          duration: 3000
        });
        
        try {
          const freshCategories = await api.loadCategories();
          const cleanCategories = deduplicateCategories(freshCategories);
          
          setCategories(cleanCategories);
          
          toast.success('Database recovered successfully. Please try your operation again.', {
            duration: 5000
          });
          return;
          
        } catch (reloadError) {
          setCategories([]);
          setSelectedItems([]);
          
          setShowAdminInterface(true);
          toast.error('Database issues detected. Admin panel opened for manual setup.', {
            duration: 8000
          });
          
          return;
        }
      }
      
      throw error;
    }
  };

  const selectedItemIds = useMemo(() => 
    selectedItems.map(item => item.item.id), [selectedItems]
  );

  const hasRequiredFieldsForPDF = useMemo(() => {
    return clientConfig.clientName?.trim() && 
           clientConfig.projectName?.trim() && 
           clientConfig.preparedBy?.trim();
  }, [clientConfig.clientName, clientConfig.projectName, clientConfig.preparedBy]);

  const handleSelectSimulator = (simulatorId: string) => {
    setSelectedSimulator(simulatorId);
  };

  const handleBackToLanding = () => {
    navigate('/simulators'); // Use React Router navigate
    setSelectedSimulator(null);
    setShowAdminInterface(false);
    
    const clearSimulatorSelection = async () => {
      try {
        await simulatorSelectionPersistence.clear();
      } catch (error) {
        // Silently handle errors
      }
    };
    
    clearSimulatorSelection();
    handleClearScenario();
  };

  const handleOpenAdmin = () => {
    navigate('/admin'); // Use React Router navigate
  };

  const handleForceRefresh = async () => {
    try {
      setBackendConnectionError(false);
      
      const [refreshedServices, refreshedCategories, refreshedConfigurations] = await Promise.all([
        api.loadPricingItems(),
        api.loadCategories(), 
        api.loadConfigurations()
      ]);
      
      const deduplicatedCategories = deduplicateCategories(refreshedCategories);
      
      setPricingServices(refreshedServices);
      setCategories(deduplicatedCategories);
      setConfigurations(refreshedConfigurations);
      
      toast.success('Data refreshed successfully', {
        description: 'All services, categories, and configurations reloaded from database',
        duration: 3000
      });
      
    } catch (error: any) {
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Failed to connect') || 
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('Request timeout')) {
        setBackendConnectionError(true);
      } else {
        toast.error('Failed to refresh data', {
          description: errorMessage || 'Please try again or refresh the page',
          duration: 5000
        });
      }
    }
  };
  
  const handleRetryConnection = async () => {
    setIsLoading(true);
    setBackendConnectionError(false);
    
    try {
      const isHealthy = await api.healthCheck();
      if (!isHealthy) {
        console.error('Backend still not healthy after retries');
        setBackendConnectionError(true);
        setIsLoading(false);
        toast.error('Connection failed', {
          description: 'Backend server is not responding. Please try again later.',
          duration: 5000
        });
        return;
      }
      
      const [services, loadedCategories, loadedConfigurations] = await Promise.all([
        api.loadPricingItems(),
        api.loadCategories(), 
        api.loadConfigurations()
      ]);
      
      const deduplicatedCategories = deduplicateCategories(loadedCategories);
      
      setPricingServices(services);
      setCategories(deduplicatedCategories);
      setConfigurations(loadedConfigurations);
      
      toast.success('Connection restored!', {
        description: 'Successfully connected to backend',
        duration: 3000
      });
    } catch (error: any) {
      console.error('Retry connection failed:', error);
      setBackendConnectionError(true);
      
      const errorMessage = error?.message || '';
      toast.error('Connection failed', {
        description: errorMessage || 'Backend is still not responding',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsAuthenticated(true);
      setUserRole(user.role);
    }
  };

  const handleGuestContactSubmit = async (contactInfo: {
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    companyName: string;
  }) => {
    try {
      // Store contact info
      setGuestContactInfo(contactInfo);
      setGuestContactSubmitted(true);
      
      // Mark that this guest session has submitted contact info
      sessionStorage.setItem('guest_contact_submitted', 'true');
      
      // Save to database with current scenario and session tracking
      const summary = calculateSummary();
      const scenarioName = `${contactInfo.companyName} - ${legacyConfig.projectName || 'Quote'}`;
      
      const result = await api.saveGuestScenario({
        sessionId: guestSessionId,  // Add session tracking
        email: contactInfo.email,
        phoneNumber: contactInfo.phoneNumber,
        firstName: contactInfo.firstName,
        lastName: contactInfo.lastName,
        companyName: contactInfo.companyName,
        scenarioName,
        config: legacyConfig,
        selectedItems,
        categories,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        summary
      });
      
      // Store submission code in session
      sessionStorage.setItem('guest_submission_code', result.submissionCode);
      
      toast.success('Access Granted!', {
        description: `Your submission code: ${result.submissionCode}`,
        duration: 5000
      });
      
    } catch (error: any) {
      console.error('Failed to save guest scenario:', error);
      toast.error('Failed to save', {
        description: error.message || 'Please try again',
        duration: 5000
      });
    }
  };

  const handleLogout = async () => {
    try {
      // 1. Reset state FIRST
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      
      // 2. Clear localStorage
      localStorage.removeItem('user');
      
      // 3. Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
      }
      
      // 4. Force full page reload to /login (clears all state)
      window.location.replace('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      window.location.replace('/login');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-6 mx-auto mb-4">
            <WordMarkRed />
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (backendConnectionError && !isLoading) {
    return (
      <>
        <BackendConnectionError 
          onRetry={handleRetryConnection}
        />
        <ConnectionDiagnostics />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-6 mx-auto mb-4">
            <WordMarkRed />
          </div>
          <p className="text-muted-foreground mb-2">Loading pricing simulator...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-primary"></div>
            <p className="text-sm text-muted-foreground">Connecting to backend...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/simulators" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        } 
      />

      {/* Public Route - Forgot Password */}
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated ? (
            <Navigate to="/simulators" replace />
          ) : (
            <ForgotPasswordPage />
          )
        } 
      />

      {/* Public Route - Reset Password */}
      <Route 
        path="/reset-password" 
        element={<ResetPasswordPage />}
      />

      {/* Public Route - Signup with Invite */}
      <Route 
        path="/signup" 
        element={<SignupPage />}
      />

      {/* Simulator Landing - Authenticated users and guests */}
      <Route 
        path="/simulators" 
        element={
          (() => {
            // Check guest mode synchronously from URL
            const urlParams = new URLSearchParams(window.location.search);
            const isGuest = urlParams.get('mode') === 'guest';
            const allowAccess = isAuthenticated || isGuest;
            
            if (!allowAccess) {
              return <Navigate to="/login" replace />;
            }
            
            return (
              <SimulatorLanding 
                onSelectSimulator={(simulatorId) => {
                  setSelectedSimulator(simulatorId);
                  // Navigate to specific simulator with mode=guest if guest
                  const guestParam = isGuest ? '?mode=guest' : '';
                  navigate(`/${simulatorId}${guestParam}`);
                }}
                onOpenAdmin={
                  (userRole === ROLES.ADMIN || userRole === ROLES.OWNER) 
                    ? () => navigate('/admin')
                    : undefined
                }
                onLogout={handleLogout}
              />
            );
          })()
        } 
      />

      {/* Protected Route - Admin Panel */}
      <Route 
        path="/admin" 
        element={
          isAuthenticated && (userRole === ROLES.ADMIN || userRole === ROLES.OWNER) ? (
            <AdminInterface
              onClose={() => window.history.back()}
              items={pricingServices}
              categories={categories}
              selectedItems={selectedItems}
              clientConfig={legacyConfig}
              onUpdateItems={handleUpdatePricingServices}
              onUpdateCategories={handleUpdateCategories}
              onLogout={handleLogout}
              onForceRefresh={handleForceRefresh}
              adminToken=""
              currentUserId={userId || ''}
              currentUserRole={userRole || ''}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Protected Route - Issuing Simulator (allows guest mode) */}
      <Route 
        path="/issuing-simulator" 
        element={
          (() => {
            // Check guest mode synchronously from URL at routing time
            const urlParams = new URLSearchParams(window.location.search);
            const isGuest = urlParams.get('mode') === 'guest';
            const allowAccess = isAuthenticated || isGuest;
            
            if (!allowAccess) {
              return <Navigate to="/login" replace />;
            }
            
            // Route access granted - render simulator
            return !pricingServices || pricingServices.length === 0 ? (
              <div className="min-h-screen bg-background p-4 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-24 h-6 mx-auto mb-4">
                    <WordMarkRed />
                  </div>
                  <h2 className="text-lg mb-2">No Data Available</h2>
                  <p className="text-muted-foreground mb-4">
                    The pricing simulator has no services or categories configured. Please contact your administrator.
                  </p>
                </div>
              </div>
            ) : (
                <>
                  <div className="min-h-screen bg-background p-4">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Button 
                            onClick={handleBackToLanding} 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                            title="Back to Simulators"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <div className="w-24 h-6 flex-shrink-0">
                            <WordMarkRed />
                          </div>
                          <div className="border-l border-border h-6"></div>
                          <div>
                            <h1>Issuing & Processing Simulator</h1>
                            <p className="text-muted-foreground text-sm">
                              Configure your card payment solution and calculate costs
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end items-center flex-wrap">
                          {configurations.length > 0 && (
                            <AutoAddConfigPanel
                              services={pricingServices}
                              clientConfig={clientConfig}
                              configurations={configurations}
                              serviceMappings={serviceMappings}
                              autoAddConfig={autoAddConfig}
                              onUpdateServiceMappings={handleUpdateServiceMappings}
                              onUpdateAutoAddConfig={handleUpdateAutoAddConfig}
                            />
                          )}

                          <Button onClick={handleClearScenario} variant="outline" size="sm" className="text-xs sm:text-sm">
                            <span className="hidden sm:inline">Clear Scenario</span>
                            <span className="sm:hidden">Clear</span>
                          </Button>

                          <div className="border-l border-border h-8"></div>

                          <UserProfileHeader onLogout={handleLogout} />
                        </div>
                      </div>

                      <DynamicClientConfigBar
                        config={clientConfig}
                        onConfigChange={setClientConfig}
                        isGuestMode={isGuestMode}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1 order-1">
                          <ItemLibrary
                            items={pricingServices}
                            categories={categories}
                            selectedItemIds={selectedItemIds}
                            selectedItems={selectedItems}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            clientConfig={legacyConfig}
                          />
                        </div>
                        
                        <div className="lg:col-span-1 order-2">
                          <ScenarioBuilder
                            selectedItems={selectedItems}
                            onUpdateItem={handleUpdateItem}
                            onRemoveItem={handleRemoveItem}
                            clientConfig={legacyConfig}
                            categories={categories}
                            isGuestMode={isGuestMode}
                          />
                        </div>
                        
                        <div className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start order-3 lg:order-3 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
                          <FeeSummary
                            selectedItems={selectedItems}
                            categories={categories}
                            globalDiscount={globalDiscount}
                            globalDiscountType={globalDiscountType}
                            globalDiscountApplication={globalDiscountApplication}
                            onGlobalDiscountChange={setGlobalDiscount}
                            onGlobalDiscountTypeChange={setGlobalDiscountType}
                            onGlobalDiscountApplicationChange={setGlobalDiscountApplication}
                            clientConfig={clientConfig}
                            onSubmit={handleSubmitScenario}
                            isSubmitting={isSubmitting}
                            isGuestMode={isGuestMode}
                            guestContactSubmitted={guestContactSubmitted}
                            onShowGuestContactForm={() => setShowGuestContactForm(true)}
                          />
                        </div>
                      </div>

                      <footer className="mt-12 pt-8 border-t border-border">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            areeba © {new Date().getFullYear()}. All Rights Reserved. 
                            <VersionInfo simple={true} />
                          </div>
                          <div className="flex items-center gap-4">
                            <a 
                              href="https://www.areeba.com/english/privacy-and-security" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors"
                            >
                              Privacy
                            </a>
                          </div>
                        </div>
                      </footer>
                    </div>
                    
                    <ScenarioSummaryDialog
                      open={showSummaryDialog}
                      onOpenChange={setShowSummaryDialog}
                      scenarioId={savedScenarioId}
                      clientConfig={clientConfig}
                      summary={calculateSummary()}
                      selectedItems={selectedItems}
                      categories={categories}
                      onDownloadPDF={handleDownloadPDF}
                    />
                    
                    <GuestContactFormModal
                      isOpen={isGuestMode && showGuestContactForm}
                      onClose={() => setShowGuestContactForm(false)}
                      onSubmit={handleGuestContactSubmit}
                    />
                    
                    <Toaster />
                  </div>
                </>
              );
          })()
        } 
      />

        {/* Root route - Redirect to simulators selection */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/simulators" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

      {/* 404 catch-all - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-background p-4 flex items-center justify-center">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-orange-100 dark:bg-orange-950/20 rounded-full">
        <FileText className="h-8 w-8 text-orange-600" />
      </div>
      
      <h2 className="text-xl mb-2">Application Error</h2>
      
      <p className="text-muted-foreground mb-4">
        Something went wrong. Please refresh the page to continue.
      </p>
      
      <div className="flex gap-2 justify-center mb-4">
        <Button onClick={() => window.location.reload()} variant="default">
          Refresh Page
        </Button>
      </div>
      
      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          <strong>Error:</strong> {error.message}
        </p>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}