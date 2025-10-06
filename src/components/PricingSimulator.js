import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { BackendConnectionError } from './BackendConnectionError';
import { UserProfileHeader } from './UserProfileHeader';
import { GuestContactFormModal } from './GuestContactFormModal';
import { api } from '../utils/api';
import { getEffectiveUnitPrice } from '../utils/tieredPricing';
import { isOneTimeUnit } from '../utils/unitClassification';
import { clientConfigPersistence, selectedItemsPersistence, globalDiscountPersistence, simulatorSelectionPersistence, serviceMappingsPersistence, autoAddConfigPersistence, isDatabasePersistenceAvailable } from '../utils/databasePersistence';
import { DISCOUNT_TYPES, DISCOUNT_APPLICATIONS } from '../config/database';
import { EXTERNAL_URLS } from '../config/api';
import { supabase } from '../utils/supabase/client';
import WordMarkRed from '../imports/WordMarkRed';
export function PricingSimulator({ isGuestMode = false }) {
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    // UI state
    const [showAdminInterface, setShowAdminInterface] = useState(false);
    const [showSummaryDialog, setShowSummaryDialog] = useState(false);
    const [savedScenarioId, setSavedScenarioId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Guest mode detection and contact state
    const [showGuestContactForm, setShowGuestContactForm] = useState(false);
    const [guestContactSubmitted, setGuestContactSubmitted] = useState(false);
    // Simulator selection state
    const [selectedSimulator, setSelectedSimulator] = useState(null);
    const [clientConfig, setClientConfig] = useState({
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
    const [selectedItems, setSelectedItems] = useState([]);
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [globalDiscountType, setGlobalDiscountType] = useState(DISCOUNT_TYPES.PERCENTAGE);
    const [globalDiscountApplication, setGlobalDiscountApplication] = useState(DISCOUNT_APPLICATIONS.NONE);
    // Application data state
    const [pricingServices, setPricingServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [configurations, setConfigurations] = useState([]);
    const [backendConnectionError, setBackendConnectionError] = useState(false);
    // Service configuration mappings state
    const [serviceMappings, setServiceMappings] = useState({});
    const [autoAddConfig, setAutoAddConfig] = useState({
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
            }
            catch (error) {
                console.error('Auth check failed:', error);
            }
            finally {
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
                const servicesResponse = await api.loadPricingItems();
                setPricingServices(servicesResponse || []);
                // Load categories
                const categoriesResponse = await api.loadCategories();
                setCategories(deduplicateCategories(categoriesResponse || []));
                // Load configurations
                const configResponse = await api.loadConfigurations();
                setConfigurations(configResponse || []);
                // Load persisted data
                await loadPersistedData();
            }
            catch (error) {
                console.error('Failed to load initial data:', error);
                setBackendConnectionError(true);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);
    // Load persisted data from database
    const loadPersistedData = async () => {
        try {
            const isDbAvailable = await isDatabasePersistenceAvailable();
            if (!isDbAvailable)
                return;
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
        }
        catch (error) {
            console.error('Failed to load persisted data:', error);
        }
    };
    // Save data to database
    const saveData = useCallback(async () => {
        try {
            const isDbAvailable = await isDatabasePersistenceAvailable();
            if (!isDbAvailable)
                return;
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    };
    // Handle guest contact form submission
    const handleGuestContactSubmit = async (contactData) => {
        try {
            setIsSubmitting(true);
            // Submit guest scenario
            const response = await api.saveGuestScenario({
                contactInfo: contactData,
                scenarioData: {
                    selectedItems,
                    clientConfig,
                    categories,
                    summary: calculateSummary()
                }
            });
            setGuestContactSubmitted(true);
            toast.success('Quote submitted successfully!');
        }
        catch (error) {
            console.error('Guest submission failed:', error);
            toast.error('Failed to submit quote. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Calculate summary
    const calculateSummary = () => {
        const oneTimeItems = selectedItems.filter(item => item.item.category === 'setup' || isOneTimeUnit(item.item.unit));
        const monthlyItems = selectedItems.filter(item => item.item.category !== 'setup' && !isOneTimeUnit(item.item.unit));
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
        return (_jsx(SimulatorLanding, { onSimulatorSelect: setSelectedSimulator, isAuthenticated: isAuthenticated, userRole: userRole, onShowAdmin: () => setShowAdminInterface(true) }));
    }
    // Show admin interface
    if (showAdminInterface) {
        return (_jsx(AdminInterface, { onClose: () => setShowAdminInterface(false), items: pricingServices, categories: categories, selectedItems: selectedItems, clientConfig: clientConfig, onUpdateItems: setPricingServices, onUpdateCategories: setCategories, onLogout: handleLogout, currentUserId: userId || '', currentUserRole: userRole || '' }));
    }
    // Show backend connection error
    if (backendConnectionError) {
        return (_jsx(BackendConnectionError, { onRetry: () => window.location.reload() }));
    }
    // Show loading state
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "border-b bg-card", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedSimulator(null), className: "gap-2", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), "Back to Simulators"] }), _jsx("div", { className: "h-6 w-px bg-border" }), _jsx(WordMarkRed, { className: "h-6" })] }), isAuthenticated && (_jsx(UserProfileHeader, { onLogout: handleLogout }))] }) }) }), _jsx("div", { className: "container mx-auto px-4 py-6", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsx(DynamicClientConfigBar, { config: clientConfig, onConfigChange: setClientConfig, isGuestMode: isGuestMode }), _jsx(ItemLibrary, { items: pricingServices, categories: categories, selectedItems: selectedItems, onAddItem: (item, quantity) => {
                                        const newItem = {
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
                                    }, onRemoveItem: (itemId) => {
                                        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
                                    }, onUpdateItem: (itemId, updates) => {
                                        setSelectedItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
                                    } })] }), _jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsx(ScenarioBuilder, { selectedItems: selectedItems, onUpdateItem: (itemId, updates) => {
                                        setSelectedItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updates } : item));
                                    }, onRemoveItem: (itemId) => {
                                        setSelectedItems(prev => prev.filter(item => item.id !== itemId));
                                    }, clientConfig: clientConfig, categories: categories, isGuestMode: isGuestMode }), _jsx(FeeSummary, { selectedItems: selectedItems, categories: categories, globalDiscount: globalDiscount, globalDiscountType: globalDiscountType, globalDiscountApplication: globalDiscountApplication, onGlobalDiscountChange: setGlobalDiscount, onGlobalDiscountTypeChange: setGlobalDiscountType, onGlobalDiscountApplicationChange: setGlobalDiscountApplication, clientConfig: clientConfig, onSubmit: async () => {
                                        if (isGuestMode) {
                                            setShowGuestContactForm(true);
                                        }
                                        else {
                                            setShowSummaryDialog(true);
                                        }
                                    }, isSubmitting: isSubmitting, isGuestMode: isGuestMode, guestContactSubmitted: guestContactSubmitted, onShowGuestContactForm: () => setShowGuestContactForm(true) })] })] }) }), _jsx("footer", { className: "border-t bg-card mt-12", children: _jsx("div", { className: "container mx-auto px-4 py-6", children: _jsxs("div", { className: "flex items-center justify-between text-sm text-muted-foreground", children: [_jsxs("div", { children: ["areeba \u00A9 ", new Date().getFullYear(), ". All Rights Reserved.", _jsx(VersionInfo, { simple: true })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("a", { href: EXTERNAL_URLS.AREEBA_PRIVACY, target: "_blank", rel: "noopener noreferrer", className: "hover:text-foreground transition-colors", children: "Privacy" }) })] }) }) }), showSummaryDialog && (_jsx(ScenarioSummaryDialog, { isOpen: showSummaryDialog, onClose: () => setShowSummaryDialog(false), scenarioData: {
                    selectedItems,
                    clientConfig,
                    categories,
                    summary: calculateSummary()
                }, onSave: async (scenarioData) => {
                    try {
                        await api.saveScenarioData(scenarioData);
                        setSavedScenarioId('scenario-saved');
                        toast.success('Scenario saved successfully!');
                    }
                    catch (error) {
                        console.error('Failed to save scenario:', error);
                        toast.error('Failed to save scenario');
                    }
                } })), showGuestContactForm && (_jsx(GuestContactFormModal, { isOpen: showGuestContactForm, onClose: () => setShowGuestContactForm(false), onSubmit: handleGuestContactSubmit }))] }));
}
// Helper function to get logged-in user's name
const getUserName = () => {
    try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        return userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.email || '';
    }
    catch {
        return '';
    }
};
// Utility function to deduplicate categories
const deduplicateCategories = (categories) => {
    if (!categories || categories.length === 0) {
        return categories;
    }
    const seen = new Set();
    const deduplicated = [];
    for (const category of categories) {
        if (!seen.has(category.id)) {
            seen.add(category.id);
            deduplicated.push(category);
        }
    }
    return deduplicated;
};
