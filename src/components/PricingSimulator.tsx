import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from "sonner";
import { SimulatorLanding } from './SimulatorLanding';
import { DynamicClientConfigBar } from './DynamicClientConfigBar';
import { ItemLibrary } from './ItemLibrary';
import { ScenarioBuilder } from './ScenarioBuilder';
import { FeeSummary } from './FeeSummary';
import { VersionInfo } from './VersionInfo';
import { ScenarioSummaryDialog } from './dialogs/ScenarioSummaryDialog';
import { AdminInterface } from './AdminInterface';
import { AutoAddConfigPanel } from './AutoAddConfigPanel';
import { BackendConnectionError } from './BackendConnectionError';
import { ConnectionDiagnostics } from './ConnectionDiagnostics';
import { UserProfileHeader } from './UserProfileHeader';
import { GuestContactFormModal } from './GuestContactFormModal';
import { ClientConfig, SelectedItem, PricingItem, Category, DynamicClientConfig } from '../types/pricing';
import { downloadPDF } from '../utils/pdfHelpers';
import { api } from '../utils/api';
import { getConfigBasedQuantity, getEffectiveUnitPrice } from '../utils/tieredPricing';
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
  const [selectedSimulator, setSelectedSimulator] = useState<string | null>(null);
  
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
        const servicesResponse = await api.getPricingItems();
        if (servicesResponse.success) {
          setPricingServices(servicesResponse.data || []);
        }
        
        // Load categories
        const categoriesResponse = await api.getCategories();
        if (categoriesResponse.success) {
          setCategories(deduplicateCategories(categoriesResponse.data || []));
        }
        
        // Load configurations
        const configResponse = await api.getConfigurations();
        if (configResponse.success) {
          setConfigurations(configResponse.data || []);
        }
        
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
      const globalDiscountData = await globalDiscountPersistence.load();
      if (globalDiscountData) {
        setGlobalDiscount(globalDiscountData.discount || 0);
        setGlobalDiscountType(globalDiscountData.type || DISCOUNT_TYPES.PERCENTAGE);
        setGlobalDiscountApplication(globalDiscountData.application || DISCOUNT_APPLICATIONS.NONE);
      }

      // Load simulator selection
      const simulatorData = await simulatorSelectionPersistence.load();
      if (simulatorData) {
        setSelectedSimulator(simulatorData.simulator);
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
      await globalDiscountPersistence.save({
        discount: globalDiscount,
        type: globalDiscountType,
        application: globalDiscountApplication
      });

      // Save simulator selection
      if (selectedSimulator) {
        await simulatorSelectionPersistence.save({ simulator: selectedSimulator });
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
      const response = await api.submitGuestScenario({
        contactInfo: contactData,
        scenarioData: {
          selectedItems,
          clientConfig,
          categories,
          summary: calculateSummary()
        }
      });

      if (response.success) {
        setGuestContactSubmitted(true);
        toast.success('Quote submitted successfully!');
      } else {
        throw new Error(response.error || 'Failed to submit quote');
      }
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
      item.item.categoryId === 'setup' || isOneTimeUnit(item.item.unit)
    );
    const monthlyItems = selectedItems.filter(item => 
      item.item.categoryId !== 'setup' && !isOneTimeUnit(item.item.unit)
    );

    const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
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
        onSimulatorSelect={setSelectedSimulator}
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onShowAdmin={() => setShowAdminInterface(true)}
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
        clientConfig={clientConfig}
        onUpdateItems={setPricingServices}
        onUpdateCategories={setCategories}
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
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSimulator(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Simulators
              </Button>
              <div className="h-6 w-px bg-border" />
              <WordMarkRed className="h-6" />
            </div>
            
            {isAuthenticated && (
              <UserProfileHeader onLogout={handleLogout} />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <DynamicClientConfigBar
              config={clientConfig}
              onConfigChange={setClientConfig}
              isGuestMode={isGuestMode}
            />
            
            <ItemLibrary
              items={pricingServices}
              categories={categories}
              selectedItems={selectedItems}
              onAddItem={(item, quantity) => {
                const newItem: SelectedItem = {
                  id: `${item.id}_${Date.now()}`,
                  item,
                  quantity,
                  unitPrice: getEffectiveUnitPrice(item, quantity),
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
              onUpdateItem={(itemId, updates) => {
                setSelectedItems(prev => prev.map(item => 
                  item.id === itemId ? { ...item, ...updates } : item
                ));
              }}
            />
          </div>

          {/* Right Column - Scenario Builder & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <ScenarioBuilder
              selectedItems={selectedItems}
              onUpdateItem={(itemId, updates) => {
                setSelectedItems(prev => prev.map(item => 
                  item.id === itemId ? { ...item, ...updates } : item
                ));
              }}
              onRemoveItem={(itemId) => {
                setSelectedItems(prev => prev.filter(item => item.id !== itemId));
              }}
              clientConfig={clientConfig}
              categories={categories}
              isGuestMode={isGuestMode}
            />
            
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

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              areeba © {new Date().getFullYear()}. All Rights Reserved. 
              <VersionInfo simple={true} />
            </div>
            <div className="flex items-center gap-4">
              <a 
                href={EXTERNAL_URLS.AREEBA_PRIVACY} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showSummaryDialog && (
        <ScenarioSummaryDialog
          isOpen={showSummaryDialog}
          onClose={() => setShowSummaryDialog(false)}
          scenarioData={{
            selectedItems,
            clientConfig,
            categories,
            summary: calculateSummary()
          }}
          onSave={async (scenarioData) => {
            try {
              const response = await api.saveScenario(scenarioData);
              if (response.success) {
                setSavedScenarioId(response.data.id);
                toast.success('Scenario saved successfully!');
              }
            } catch (error) {
              console.error('Failed to save scenario:', error);
              toast.error('Failed to save scenario');
            }
          }}
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
