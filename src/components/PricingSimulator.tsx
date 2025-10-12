import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { toast } from "sonner";
import { SimulatorLanding } from './SimulatorLanding';
import { DynamicClientConfigBar } from './DynamicClientConfigBar';
import { ItemLibrary } from './ItemLibrary';
import { ScenarioBuilder } from './ScenarioBuilder';
import { FeeSummary } from './FeeSummary';
import { ScenarioSummaryDialog } from './dialogs/ScenarioSummaryDialog';
import { AdminInterface } from './AdminInterface';
import { AutoAddConfigPanel } from './AutoAddConfigPanel';
import { BackendConnectionError } from './BackendConnectionError';
import { ConnectionDiagnostics } from './ConnectionDiagnostics';
import { GuestContactFormModal } from './GuestContactFormModal';
import { Header, Footer } from './layout';
import { ClientConfig, SelectedItem, PricingItem, Category, DynamicClientConfig } from '../types/pricing';
import { api } from '../utils/api';
import { SimulatorApi } from '../utils/simulatorApi';
import { getConfigBasedQuantity, getEffectiveUnitPrice, calculateTieredPrice } from '../utils/tieredPricing';
import { isOneTimeUnit } from '../utils/unitClassification';
import { applyAutoAddLogic, removeAutoAddedServices } from '../utils/autoAddLogic';
import { 
  clientConfigPersistence, 
  selectedItemsPersistence, 
  globalDiscountPersistence,
  simulatorSelectionPersistence,
  serviceMappingsPersistence,
  autoAddConfigPersistence,
  isDatabasePersistenceAvailable,
  flushPendingSaves
} from '../utils/databasePersistence';
import { COLUMNS, PRICING_TYPES, DISCOUNT_TYPES, DISCOUNT_APPLICATIONS, DB_HELPERS, CATEGORY_IDS, ROLES, TABLES } from '../config/database';
import { EXTERNAL_URLS } from '../config/api';
import { supabase } from '../utils/supabase/client';
import WordMarkRed from '../imports/WordMarkRed';

interface PricingSimulatorProps {
  isGuestMode?: boolean;
}

export function PricingSimulator({ isGuestMode = false }: PricingSimulatorProps) {
  // Get simulator type from URL parameters
  const { simulatorType } = useParams<{ simulatorType?: string }>();
  
  console.log('🎯 PricingSimulator loaded with simulatorType:', simulatorType);
  
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
  
  // Guest mode detection and contact state
  const [showGuestContactForm, setShowGuestContactForm] = useState<boolean>(false);
  const [guestContactSubmitted, setGuestContactSubmitted] = useState<boolean>(false);
  
  // Simulator selection state
  const [selectedSimulator, setSelectedSimulator] = useState<any | null>(null);
  
  const [clientConfig, setClientConfig] = useState<DynamicClientConfig>({
    clientName: '',
    projectName: '',
    preparedBy: getUserName(),
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
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setIsAuthenticated(true);
          setUserId(userData.id);
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);


  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load pricing services
        try {
          const servicesResponse = await api.loadPricingItems();
          setPricingServices(servicesResponse || []);
        } catch (error) {
          console.error('Failed to load services:', error);
        }
        
        // Load categories
        try {
          const categoriesResponse = await api.loadCategories();
          setCategories(deduplicateCategories(categoriesResponse || []));
        } catch (error) {
          console.error('Failed to load categories:', error);
        }
        
        // Load configurations
        const configResponse = await api.loadConfigurations();
        setConfigurations(configResponse || []);
        
        // Load persisted data
        await loadPersistedData();
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setBackendConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load persisted data from database
  const loadPersistedData = async () => {
    try {
      const isDbAvailable = await isDatabasePersistenceAvailable();
      if (!isDbAvailable) return;

      // Load client config
      const clientConfigData = await clientConfigPersistence.load();
      if (clientConfigData) {
        setClientConfig(clientConfigData);
      }

      // Load selected items
      const selectedItemsData = await selectedItemsPersistence.load();
      if (selectedItemsData) {
        setSelectedItems(selectedItemsData);
      }

      // Load global discount
      try {
        const discount = await globalDiscountPersistence.loadDiscount();
        const type = await globalDiscountPersistence.loadDiscountType();
        const application = await globalDiscountPersistence.loadDiscountApplication();
        
        setGlobalDiscount(discount);
        setGlobalDiscountType(type);
        setGlobalDiscountApplication(application);
      } catch (error) {
        console.error('Failed to load global discount:', error);
      }

      // Load simulator selection
      const simulatorData = await simulatorSelectionPersistence.load();
      if (simulatorData) {
        setSelectedSimulator(simulatorData);
      } else if (simulatorType) {
        // If no persisted simulator but URL has simulator type, try to load by slug
        console.log('🔍 Loading simulator by slug:', simulatorType);
        try {
          const simulator = await SimulatorApi.loadSimulatorBySlug(simulatorType);
          console.log('📋 Simulator found:', simulator);
          if (simulator) {
            setSelectedSimulator(simulator);
            console.log('✅ Set simulator ID:', simulator.id);
            // Save it to persistence
            simulatorSelectionPersistence.save(simulator.id);
          } else {
            console.log('❌ Simulator not found, using slug as fallback');
            // Fallback to using the slug directly if simulator not found
            setSelectedSimulator(simulatorType);
            simulatorSelectionPersistence.save(simulatorType);
          }
        } catch (error) {
          console.error('❌ Failed to load simulator by slug:', error);
          // Fallback to using the slug directly
          setSelectedSimulator(simulatorType);
          simulatorSelectionPersistence.save(simulatorType);
        }
      }

      // Load service mappings
      const serviceMappingsData = await serviceMappingsPersistence.load();
      if (serviceMappingsData) {
        setServiceMappings(serviceMappingsData);
      }

      // Load auto-add config
      const autoAddData = await autoAddConfigPersistence.load();
      if (autoAddData) {
        setAutoAddConfig(autoAddData);
      }

    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  };

  // Save data to database
  const saveData = useCallback(async () => {
    try {
      const isDbAvailable = await isDatabasePersistenceAvailable();
      if (!isDbAvailable) return;

      // Save client config
      await clientConfigPersistence.save(clientConfig);

      // Save selected items
      await selectedItemsPersistence.save(selectedItems);

      // Save global discount
      try {
        globalDiscountPersistence.saveDiscount(globalDiscount);
        globalDiscountPersistence.saveDiscountType(globalDiscountType);
        globalDiscountPersistence.saveDiscountApplication(globalDiscountApplication);
      } catch (error) {
        console.error('Failed to save global discount:', error);
      }

      // Save simulator selection
      if (selectedSimulator) {
        simulatorSelectionPersistence.save(selectedSimulator);
      }

      // Save service mappings
      await serviceMappingsPersistence.save(serviceMappings);

      // Save auto-add config
      await autoAddConfigPersistence.save(autoAddConfig);

    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [clientConfig, selectedItems, globalDiscount, globalDiscountType, globalDiscountApplication, selectedSimulator, serviceMappings, autoAddConfig]);

  // Auto-save data when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveData();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [saveData]);

  // Auto-add logic: Apply auto-add rules when client configuration changes
  useEffect(() => {
    if (pricingServices.length === 0 || !clientConfig) return;

    try {
      // Apply auto-add logic
      const updatedItems = applyAutoAddLogic(
        selectedItems,
        clientConfig,
        pricingServices,
        autoAddConfig,
        serviceMappings
      );

      // Only update if there are changes
      if (updatedItems.length !== selectedItems.length || 
          updatedItems.some((item, index) => 
            !selectedItems[index] || 
            item.quantity !== selectedItems[index].quantity ||
            item.id !== selectedItems[index].id
          )) {
        setSelectedItems(updatedItems);
      }
    } catch (error) {
      console.error('Auto-add logic failed:', error);
    }
  }, [clientConfig, pricingServices, autoAddConfig, serviceMappings]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  // Handle guest contact form submission
  const handleGuestContactSubmit = async (contactData: any) => {
    try {
      setIsSubmitting(true);
      
      // Submit guest scenario
      const response = await api.saveGuestScenario({
        sessionId: null,
        email: contactData.email,
        phoneNumber: contactData.phoneNumber,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        companyName: contactData.companyName,
        scenarioName: contactData.scenarioName || 'Guest Scenario',
        config: clientConfig,
        selectedItems,
        categories,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        summary: calculateSummary()
      });

      setGuestContactSubmitted(true);
      toast.success('Quote submitted successfully!');
    } catch (error) {
      console.error('Guest submission failed:', error);
      toast.error('Failed to submit quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate summary
  const calculateSummary = () => {
    const oneTimeItems = selectedItems.filter(item => 
      item.item.category === 'setup' || isOneTimeUnit(item.item.unit)
    );
    const monthlyItems = selectedItems.filter(item => 
      item.item.category !== 'setup' && !isOneTimeUnit(item.item.unit)
    );

    // Use proper tiered pricing calculations
    const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => {
      if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
        const tieredResult = calculateTieredPrice(item.item, item.quantity);
        return sum + tieredResult.totalPrice;
      } else {
        return sum + (item.quantity * item.unitPrice);
      }
    }, 0);
    
    const monthlySubtotal = monthlyItems.reduce((sum, item) => {
      if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
        const tieredResult = calculateTieredPrice(item.item, item.quantity);
        return sum + tieredResult.totalPrice;
      } else {
        return sum + (item.quantity * item.unitPrice);
      }
    }, 0);
    
    const yearlySubtotal = monthlySubtotal * 12;

    return {
      oneTimeTotal: oneTimeSubtotal,
      monthlyTotal: monthlySubtotal,
      yearlyTotal: yearlySubtotal,
      totalProjectCost: oneTimeSubtotal + yearlySubtotal,
      itemCount: selectedItems.length
    };
  };

  // Show landing page if no simulator selected
  if (!selectedSimulator && !isGuestMode) {
    return (
      <SimulatorLanding 
        onSelectSimulator={setSelectedSimulator}
        onOpenAdmin={() => setShowAdminInterface(true)}
        onLogout={() => {}}
      />
    );
  }

  // Show admin interface
  if (showAdminInterface) {
    return (
      <AdminInterface
        onClose={() => setShowAdminInterface(false)}
        items={pricingServices}
        categories={categories}
        selectedItems={selectedItems}
        clientConfig={clientConfig as any}
        onUpdateItems={async (items) => setPricingServices(items)}
        onUpdateCategories={async (categories) => setCategories(categories)}
        onLogout={handleLogout}
        currentUserId={userId || ''}
        currentUserRole={userRole || ''}
      />
    );
  }

  // Show backend connection error
  if (backendConnectionError) {
    return (
      <BackendConnectionError 
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        showBackButton={true}
        backButtonText="Back to Simulators"
        onBackClick={() => setSelectedSimulator(null)}
        showUserMenu={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Client Configuration Section */}
        <div className="mb-8">
          <DynamicClientConfigBar
            config={clientConfig}
            onConfigChange={setClientConfig}
            isGuestMode={isGuestMode}
          />
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Service Library */}
          <div className="space-y-6">
            <ItemLibrary
              items={pricingServices}
              categories={categories}
              selectedItemIds={selectedItems.map(item => item.item.id)}
              selectedItems={selectedItems}
              onAddItem={(item) => {
                const newItem: SelectedItem = {
                  id: `${item.id}_${Date.now()}`,
                  item,
                  quantity: 1,
                  unitPrice: getEffectiveUnitPrice(item, 1),
                  discount: 0,
                  discountType: 'percentage',
                  discountApplication: 'total',
                  isFree: false
                };
                setSelectedItems(prev => [...prev, newItem]);
              }}
              onRemoveItem={(itemId) => {
                setSelectedItems(prev => prev.filter(item => item.id !== itemId));
              }}
              clientConfig={clientConfig as any}
            />
          </div>

          {/* Middle Column - Selected Services */}
          <div className="space-y-6">
            <ScenarioBuilder
              selectedItems={selectedItems}
              onUpdateItem={(itemId, updates) => {
                setSelectedItems(prev => prev.map(item => {
                  if (item.id === itemId) {
                    const updatedItem = { ...item, ...updates };
                    
                    // If quantity is being updated and this is a tiered pricing item, recalculate unit price
                    if (updates.quantity !== undefined && item.item.pricingType === 'tiered') {
                      updatedItem.unitPrice = getEffectiveUnitPrice(item.item, updates.quantity);
                    }
                    
                    return updatedItem;
                  }
                  return item;
                }));
              }}
              onRemoveItem={(itemId) => {
                setSelectedItems(prev => prev.filter(item => item.id !== itemId));
              }}
              clientConfig={clientConfig as any}
              categories={categories}
              isGuestMode={isGuestMode}
            />
          </div>

          {/* Right Column - Fee Summary */}
          <div className="space-y-6">
            <FeeSummary
              selectedItems={selectedItems}
              categories={categories}
              globalDiscount={globalDiscount}
              globalDiscountType={globalDiscountType}
              globalDiscountApplication={globalDiscountApplication}
              onGlobalDiscountChange={setGlobalDiscount}
              onGlobalDiscountTypeChange={setGlobalDiscountType}
              onGlobalDiscountApplicationChange={setGlobalDiscountApplication}
              clientConfig={clientConfig as any}
              onSubmit={async () => {
                if (isGuestMode) {
                  setShowGuestContactForm(true);
                } else {
                  setShowSummaryDialog(true);
                }
              }}
              isSubmitting={isSubmitting}
              isGuestMode={isGuestMode}
              guestContactSubmitted={guestContactSubmitted}
              onShowGuestContactForm={() => setShowGuestContactForm(true)}
            />
          </div>
        </div>
      </div>

      <Footer />

      {/* Modals */}
      {showSummaryDialog && (
        <ScenarioSummaryDialog
          open={showSummaryDialog}
          onOpenChange={() => setShowSummaryDialog(false)}
          scenarioId="current-scenario"
          simulatorType={selectedSimulator?.id || simulatorType || 'unknown'}
          selectedItems={selectedItems}
          clientConfig={clientConfig}
          categories={categories}
          globalDiscount={globalDiscount}
          globalDiscountType={globalDiscountType}
          globalDiscountApplication={globalDiscountApplication}
          summary={calculateSummary()}
        />
      )}

      {showGuestContactForm && (
        <GuestContactFormModal
          isOpen={showGuestContactForm}
          onClose={() => setShowGuestContactForm(false)}
          onSubmit={handleGuestContactSubmit}
        />
      )}
    </div>
  );
}

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
