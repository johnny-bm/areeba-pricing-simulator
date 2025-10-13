/**
 * PricingSimulator Component - Clean Architecture Version
 * 
 * Updated to use new Clean Architecture patterns:
 * - Custom hooks for use cases
 * - Zustand store for state management
 * - Feature flags for gradual migration
 */

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
import { ClientConfig, SelectedItem, PricingItem, Category, DynamicClientConfig } from '../types/domain';
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

// NEW: Clean Architecture imports
import { usePricingOperations } from '@/presentation/features/pricing/hooks/usePricingOperations';
import { usePricing } from '@/state/store';
import { FEATURES } from '@/config/features';
import { PricingAdapter } from '@/presentation/adapters/PricingAdapter';

interface PricingSimulatorProps {
  isGuestMode?: boolean;
}

export function PricingSimulator({ isGuestMode = false }: PricingSimulatorProps) {
  // Get simulator type from URL parameters
  const { simulatorType } = useParams<{ simulatorType?: string }>();
  
  console.log('🎯 PricingSimulator loaded with simulatorType:', simulatorType);
  
  // NEW: Clean Architecture hooks
  const useNewArchitecture = FEATURES.USE_NEW_PRICING;
  const { 
    calculatePricing: calculateNew, 
    getPricingItems: getItemsNew, 
    isLoading: loadingNew, 
    error: errorNew 
  } = useNewArchitecture ? usePricingOperations() : {};
  
  const { 
    selectedItems, 
    calculationResult, 
    isCalculating, 
    addItem, 
    removeItem, 
    calculatePricing: calculateStore,
    clearItems,
    setError
  } = usePricing();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Legacy state (to be removed after migration)
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedItemsLegacy, setSelectedItemsLegacy] = useState<SelectedItem[]>([]);
  const [clientConfig, setClientConfig] = useState<ClientConfig | null>(null);
  const [dynamicClientConfig, setDynamicClientConfig] = useState<DynamicClientConfig | null>(null);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<string>('percentage');
  const [discountApplication, setDiscountApplication] = useState<string>('total');
  const [calculationResultLegacy, setCalculationResultLegacy] = useState<any>(null);
  const [isCalculatingLegacy, setIsCalculatingLegacy] = useState<boolean>(false);
  const [error, setErrorLegacy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [showConnectionDiagnostics, setShowConnectionDiagnostics] = useState<boolean>(false);
  const [showGuestContactForm, setShowGuestContactForm] = useState<boolean>(false);
  const [showScenarioSummary, setShowScenarioSummary] = useState<boolean>(false);
  const [scenarioSummary, setScenarioSummary] = useState<any>(null);
  const [autoAddConfig, setAutoAddConfig] = useState<any>(null);
  const [serviceMappings, setServiceMappings] = useState<any>(null);
  const [simulatorSelection, setSimulatorSelection] = useState<any>(null);
  const [showAdminInterface, setShowAdminInterface] = useState<boolean>(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [showAutoAddConfig, setShowAutoAddConfig] = useState<boolean>(false);
  const [autoAddConfigData, setAutoAddConfigData] = useState<any>(null);
  const [showBackendConnectionError, setShowBackendConnectionError] = useState<boolean>(false);
  const [backendConnectionError, setBackendConnectionError] = useState<string | null>(null);
  const [showConnectionDiagnosticsLegacy, setShowConnectionDiagnosticsLegacy] = useState<boolean>(false);
  const [showGuestContactFormLegacy, setShowGuestContactFormLegacy] = useState<boolean>(false);
  const [showScenarioSummaryLegacy, setShowScenarioSummaryLegacy] = useState<boolean>(false);
  const [scenarioSummaryLegacy, setScenarioSummaryLegacy] = useState<any>(null);
  const [autoAddConfigLegacy, setAutoAddConfigLegacy] = useState<any>(null);
  const [serviceMappingsLegacy, setServiceMappingsLegacy] = useState<any>(null);
  const [simulatorSelectionLegacy, setSimulatorSelectionLegacy] = useState<any>(null);
  const [showAdminInterfaceLegacy, setShowAdminInterfaceLegacy] = useState<boolean>(false);
  const [adminStatsLegacy, setAdminStatsLegacy] = useState<any>(null);
  const [showAutoAddConfigLegacy, setShowAutoAddConfigLegacy] = useState<boolean>(false);
  const [autoAddConfigDataLegacy, setAutoAddConfigDataLegacy] = useState<any>(null);
  const [showBackendConnectionErrorLegacy, setShowBackendConnectionErrorLegacy] = useState<boolean>(false);
  const [backendConnectionErrorLegacy, setBackendConnectionErrorLegacy] = useState<string | null>(null);

  // Load pricing items using new architecture
  const loadPricingItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorLegacy(null);
      
      if (useNewArchitecture) {
        // NEW: Use Clean Architecture
        const items = await getItemsNew?.() || [];
        setPricingItems(items);
        
        // Extract categories from items
        const uniqueCategories = items.reduce((acc: Category[], item) => {
          if (!acc.find(cat => cat.id === item.category.id)) {
            acc.push(item.category);
          }
          return acc;
        }, []);
        setCategories(uniqueCategories);
      } else {
        // LEGACY: Use old API
        const items = await PricingAdapter.getPricingItems();
        setPricingItems(items);
        
        // Extract categories from items
        const uniqueCategories = items.reduce((acc: Category[], item) => {
          if (!acc.find(cat => cat.id === item.category.id)) {
            acc.push(item.category);
          }
          return acc;
        }, []);
        setCategories(uniqueCategories);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing items';
      setErrorLegacy(errorMessage);
      toast.error(`Error loading pricing items: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [useNewArchitecture, getItemsNew]);

  // Calculate pricing using new architecture
  const handleCalculatePricing = useCallback(async () => {
    try {
      if (useNewArchitecture) {
        // NEW: Use Clean Architecture
        await calculateStore();
      } else {
        // LEGACY: Use old calculation
        setIsCalculatingLegacy(true);
        setErrorLegacy(null);
        
        const result = await PricingAdapter.calculatePricing({
          itemIds: selectedItemsLegacy.map(item => item.id),
          quantities: selectedItemsLegacy.reduce((acc, item) => ({
            ...acc,
            [item.id]: item.quantity || 1,
          }), {}),
          discountCode: globalDiscount > 0 ? `DISCOUNT_${globalDiscount}` : undefined,
          taxRate: 0, // Add tax rate logic if needed
        });
        
        setCalculationResultLegacy(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setErrorLegacy(errorMessage);
      toast.error(`Error calculating pricing: ${errorMessage}`);
    } finally {
      setIsCalculatingLegacy(false);
    }
  }, [useNewArchitecture, calculateStore, selectedItemsLegacy, globalDiscount]);

  // Add item to selection
  const handleAddItem = useCallback((item: PricingItem, quantity: number = 1) => {
    if (useNewArchitecture) {
      // NEW: Use Zustand store
      addItem({ ...item, quantity });
    } else {
      // LEGACY: Use local state
      setSelectedItemsLegacy(prev => {
        const existingItem = prev.find(i => i.id === item.id);
        if (existingItem) {
          return prev.map(i =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          return [...prev, { ...item, quantity }];
        }
      });
    }
  }, [useNewArchitecture, addItem]);

  // Remove item from selection
  const handleRemoveItem = useCallback((itemId: string) => {
    if (useNewArchitecture) {
      // NEW: Use Zustand store
      removeItem(itemId);
    } else {
      // LEGACY: Use local state
      setSelectedItemsLegacy(prev => prev.filter(item => item.id !== itemId));
    }
  }, [useNewArchitecture, removeItem]);

  // Clear all items
  const handleClearItems = useCallback(() => {
    if (useNewArchitecture) {
      // NEW: Use Zustand store
      clearItems();
    } else {
      // LEGACY: Use local state
      setSelectedItemsLegacy([]);
      setCalculationResultLegacy(null);
    }
  }, [useNewArchitecture, clearItems]);

  // Load data on component mount
  useEffect(() => {
    loadPricingItems();
  }, [loadPricingItems]);

  // Handle errors from new architecture
  useEffect(() => {
    if (errorNew) {
      setErrorLegacy(errorNew);
      toast.error(`Error: ${errorNew}`);
    }
  }, [errorNew]);

  // Get current state based on architecture
  const currentSelectedItems = useNewArchitecture ? selectedItems : selectedItemsLegacy;
  const currentCalculationResult = useNewArchitecture ? calculationResult : calculationResultLegacy;
  const currentIsCalculating = useNewArchitecture ? isCalculating : isCalculatingLegacy;
  const currentError = useNewArchitecture ? errorNew : error;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pricing items...</p>
            </div>
          </div>
        ) : connectionError ? (
          <BackendConnectionError 
            onRetry={() => {
              setConnectionError(false);
              loadPricingItems();
            }}
            onShowDiagnostics={() => setShowConnectionDiagnostics(true)}
          />
        ) : (
          <div className="space-y-8">
            {/* Simulator Landing */}
            <SimulatorLanding 
              simulatorType={simulatorType}
              onStartSimulation={() => {
                // Handle simulation start
              }}
            />
            
            {/* Dynamic Client Config Bar */}
            <DynamicClientConfigBar 
              clientConfig={clientConfig}
              onConfigChange={setClientConfig}
            />
            
            {/* Item Library */}
            <ItemLibrary 
              items={pricingItems}
              categories={categories}
              selectedItems={currentSelectedItems}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              isLoading={isLoading}
            />
            
            {/* Scenario Builder */}
            <ScenarioBuilder 
              selectedItems={currentSelectedItems}
              onUpdateItems={setSelectedItemsLegacy}
              onCalculate={handleCalculatePricing}
              isCalculating={currentIsCalculating}
              error={currentError}
            />
            
            {/* Fee Summary */}
            {currentCalculationResult && (
              <FeeSummary 
                result={currentCalculationResult}
                onClear={handleClearItems}
                onSaveScenario={() => setShowScenarioSummary(true)}
              />
            )}
            
            {/* Admin Interface */}
            {isAuthenticated && (
              <AdminInterface 
                isVisible={showAdminInterface}
                onToggle={() => setShowAdminInterface(!showAdminInterface)}
                stats={adminStats}
              />
            )}
            
            {/* Auto Add Config Panel */}
            <AutoAddConfigPanel 
              isVisible={showAutoAddConfig}
              onToggle={() => setShowAutoAddConfig(!showAutoAddConfig)}
              config={autoAddConfigData}
            />
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Modals */}
      {showScenarioSummary && (
        <ScenarioSummaryDialog 
          isOpen={showScenarioSummary}
          onClose={() => setShowScenarioSummary(false)}
          scenario={scenarioSummary}
        />
      )}
      
      {showGuestContactForm && (
        <GuestContactFormModal 
          isOpen={showGuestContactForm}
          onClose={() => setShowGuestContactForm(false)}
          onSubmit={(data) => {
            // Handle guest contact form submission
            console.log('Guest contact form submitted:', data);
            setShowGuestContactForm(false);
          }}
        />
      )}
      
      {showConnectionDiagnostics && (
        <ConnectionDiagnostics 
          isOpen={showConnectionDiagnostics}
          onClose={() => setShowConnectionDiagnostics(false)}
        />
      )}
    </div>
  );
}
