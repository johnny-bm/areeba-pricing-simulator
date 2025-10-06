import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, LogOut, Settings, Package, Tags, History, CreditCard, Calculator, Zap, Users, Plus, Edit, Copy, RefreshCw, Download, User, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TableCell } from './ui/table';
import { SimpleServiceManager } from './SimpleServiceManager';
import { ConfigurationDialog } from './dialogs/ConfigurationDialog';
import { ScenarioDialog } from './dialogs/ScenarioDialog';
import { GuestSubmissionDetailDialog } from './dialogs/GuestSubmissionDetailDialog';
import { DataTable } from './DataTable';
import { CategoryManager } from './CategoryManager';
import { TagManager } from './TagManager';
import { UserManagement } from './UserManagement';
import { formatPrice } from '../utils/formatters';
import { downloadPDF } from '../utils/pdfHelpers';
import { api } from '../utils/api';
import WordMarkRed from '../imports/WordMarkRed';
const simulators = [
    {
        id: 'issuing-processing',
        name: 'Issuing & Processing',
        icon: _jsx(CreditCard, { className: "h-4 w-4" }),
        available: true
    },
    {
        id: 'acquiring',
        name: 'Acquiring Solutions',
        icon: _jsx(Calculator, { className: "h-4 w-4" }),
        available: false
    },
    {
        id: 'digital-banking',
        name: 'Digital Banking',
        icon: _jsx(Zap, { className: "h-4 w-4" }),
        available: false
    }
];
const navigationItems = [
    {
        id: 'configurations',
        name: 'Configuration',
        icon: _jsx(Settings, { className: "h-4 w-4" })
    },
    {
        id: 'categories',
        name: 'Categories',
        icon: _jsx(Package, { className: "h-4 w-4" })
    },
    {
        id: 'services',
        name: 'Services',
        icon: _jsx(Package, { className: "h-4 w-4" })
    },
    {
        id: 'tags',
        name: 'Tags',
        icon: _jsx(Tags, { className: "h-4 w-4" })
    },
    {
        id: 'users',
        name: 'Users',
        icon: _jsx(Users, { className: "h-4 w-4" })
    },
    {
        id: 'scenarios',
        name: 'History',
        icon: _jsx(History, { className: "h-4 w-4" })
    },
    {
        id: 'guest-submissions',
        name: 'Guest Submissions',
        icon: _jsx(UserCheck, { className: "h-4 w-4" })
    }
];
export function AdminInterface({ onClose, items, categories, selectedItems, clientConfig, onUpdateItems, onUpdateCategories, onLogout, onForceRefresh, adminToken, currentUserId, currentUserRole }) {
    const [selectedSimulator, setSelectedSimulator] = useState('issuing-processing');
    const [activeTab, setActiveTab] = useState('configurations');
    const [configurations, setConfigurations] = useState([]);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    const [scenariosLoading, setScenariosLoading] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [showScenarioDialog, setShowScenarioDialog] = useState(false);
    const [guestSubmissions, setGuestSubmissions] = useState([]);
    const [guestSubmissionsLoading, setGuestSubmissionsLoading] = useState(false);
    const [selectedGuestSubmission, setSelectedGuestSubmission] = useState(null);
    const [showGuestSubmissionDialog, setShowGuestSubmissionDialog] = useState(false);
    // Load configurations and scenarios on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const loadedConfigs = await api.loadConfigurations();
                setConfigurations(loadedConfigs);
            }
            catch (error) {
                console.error('Failed to load configurations:', error);
            }
        };
        loadData();
    }, []);
    const loadScenarios = async () => {
        setScenariosLoading(true);
        try {
            const loadedScenarios = await api.loadScenarios();
            setScenarios(loadedScenarios);
        }
        catch (error) {
            console.error('Failed to load scenarios:', error);
            setScenarios([]);
        }
        finally {
            setScenariosLoading(false);
        }
    };
    const loadGuestSubmissions = async () => {
        setGuestSubmissionsLoading(true);
        try {
            const loadedSubmissions = await api.loadGuestSubmissions();
            setGuestSubmissions(loadedSubmissions);
        }
        catch (error) {
            console.error('Failed to load guest submissions:', error);
            setGuestSubmissions([]);
        }
        finally {
            setGuestSubmissionsLoading(false);
        }
    };
    // Load scenarios when the scenarios tab is activated
    useEffect(() => {
        if (activeTab === 'scenarios') {
            loadScenarios();
        }
    }, [activeTab]);
    // Load guest submissions when the guest-submissions tab is activated
    useEffect(() => {
        if (activeTab === 'guest-submissions') {
            loadGuestSubmissions();
        }
    }, [activeTab]);
    const handleClose = () => {
        onClose();
    };
    const handleSaveConfiguration = async (config) => {
        try {
            await api.saveConfiguration(config);
            const updatedConfigs = await api.loadConfigurations();
            setConfigurations(updatedConfigs);
            setShowConfigDialog(false);
            setEditingConfig(null);
            if (onForceRefresh) {
                onForceRefresh();
            }
        }
        catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    };
    const handleDeleteConfiguration = async (config) => {
        try {
            await api.deleteConfiguration(config.id);
            const updatedConfigs = await api.loadConfigurations();
            setConfigurations(updatedConfigs);
            setShowConfigDialog(false);
            setEditingConfig(null);
        }
        catch (error) {
            console.error('Failed to delete configuration:', error);
            throw error;
        }
    };
    const handleDuplicateConfiguration = async (config) => {
        try {
            const duplicatedConfig = {
                ...config,
                id: `${config.id}-copy-${Date.now()}`,
                name: `${config.name} (Copy)`,
                isActive: false
            };
            await api.saveConfiguration(duplicatedConfig);
            const updatedConfigs = await api.loadConfigurations();
            setConfigurations(updatedConfigs);
        }
        catch (error) {
            console.error('Failed to duplicate configuration:', error);
            throw error;
        }
    };
    const handleReorderConfigurations = async (reorderedConfigs) => {
        setConfigurations(reorderedConfigs);
        // You could optionally save the new order to the backend here
    };
    const handleDuplicateScenario = async (scenario) => {
        const confirmed = window.confirm(`Duplicate scenario for "${scenario.clientName}" - "${scenario.projectName}"?\n\nThis will create a copy with a new timestamp.`);
        if (!confirmed)
            return;
        try {
            // Load the full scenario data
            const scenarioData = await api.getScenarioData(scenario.scenarioId);
            if (!scenarioData) {
                alert('Scenario data not found. Cannot duplicate.');
                return;
            }
            // Create a new scenario with updated metadata
            const duplicatedScenarioData = {
                ...scenarioData,
                config: {
                    ...scenarioData.config,
                    projectName: `${scenarioData.config.projectName} (Copy)`
                }
            };
            // Save the duplicated scenario
            await api.saveScenarioData(duplicatedScenarioData);
            // Reload scenarios
            await loadScenarios();
            alert('Scenario duplicated successfully!');
        }
        catch (error) {
            console.error('Failed to duplicate scenario:', error);
            alert('Failed to duplicate scenario. Please try again.');
        }
    };
    return (_jsxs("div", { className: "h-screen bg-background flex overflow-hidden", children: [_jsxs("div", { className: "w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col", children: [_jsxs("div", { className: "p-4 border-b border-sidebar-border", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-20 h-5 flex-shrink-0", children: _jsx(WordMarkRed, {}) }), _jsx("div", { className: "text-sidebar-foreground", children: _jsx("div", { className: "text-sm font-medium", children: "Admin Panel" }) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-xs text-sidebar-foreground/70 uppercase tracking-wide", children: "Simulator" }), _jsxs(Select, { value: selectedSimulator, onValueChange: setSelectedSimulator, children: [_jsx(SelectTrigger, { className: "w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: simulators.map((simulator) => (_jsx(SelectItem, { value: simulator.id, disabled: !simulator.available, children: _jsxs("div", { className: "flex items-center gap-2", children: [simulator.icon, _jsx("span", { children: simulator.name }), !simulator.available && (_jsx(Badge, { variant: "secondary", className: "text-xs ml-1", children: "Soon" }))] }) }, simulator.id))) })] })] })] }), _jsx("div", { className: "flex-1 p-4", children: _jsx("nav", { className: "space-y-1", children: navigationItems.map((item) => (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === item.id
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'}`, children: [item.icon, _jsx("span", { children: item.name }), item.badge && (_jsx(Badge, { variant: "secondary", className: "ml-auto text-xs", children: item.badge }))] }, item.id))) }) }), _jsxs("div", { className: "p-4 border-t border-sidebar-border", children: [_jsx("div", { className: "mb-3 p-3 bg-muted/50 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: _jsx(User, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: (() => {
                                                        const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                                        const displayName = userData.first_name || userData.last_name
                                                            ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                                                            : userData.email || 'User';
                                                        return displayName;
                                                    })() }), _jsx("p", { className: "text-xs text-muted-foreground truncate", children: (() => {
                                                        const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                                        return userData.email || '';
                                                    })() }), _jsx("div", { className: "flex items-center gap-1 mt-1", children: _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${(() => {
                                                            const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                                            const role = userData.role;
                                                            return role === 'owner'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                                                : role === 'admin'
                                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                                                        })()}`, children: (() => {
                                                            const userData = JSON.parse(localStorage.getItem('user') || '{}');
                                                            const role = userData.role || 'user';
                                                            return role.charAt(0).toUpperCase() + role.slice(1);
                                                        })() }) })] })] }) }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Button, { onClick: handleClose, variant: "ghost", size: "sm", className: "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Simulators"] }), onLogout && (_jsxs(Button, { onClick: onLogout, variant: "ghost", size: "sm", className: "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Logout"] }))] })] })] }), _jsx("div", { className: "flex-1 h-full overflow-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx("div", { className: "flex items-center gap-2", children: _jsx("h1", { className: "text-2xl font-medium", children: navigationItems.find(item => item.id === activeTab)?.name }) }) }), _jsxs("p", { className: "text-muted-foreground", children: [activeTab === 'configurations' && 'Create configuration fields that appear in the client configuration bar', activeTab === 'categories' && 'Organize pricing services into logical categories for better organization', activeTab === 'services' && 'Create and manage pricing services with auto-add and quantity mapping features', activeTab === 'tags' && 'Manage tags for better service organization and filtering', activeTab === 'users' && 'Manage system users, roles, and access permissions for the pricing simulator', activeTab === 'scenarios' && 'View saved pricing scenarios from PDF downloads and client sessions'] })] }), _jsxs("div", { children: [activeTab === 'configurations' && (_jsxs(_Fragment, { children: [_jsx(DataTable, { title: "Configuration Management", description: "Create and manage configuration fields that appear in the client configuration bar", headers: ['Name', 'Status', 'Description', 'Fields', 'Actions'], items: configurations, getItemKey: (config) => config.id, onReorder: handleReorderConfigurations, onRowClick: (config) => {
                                                setEditingConfig(config);
                                                setShowConfigDialog(true);
                                            }, searchFields: ['name', 'description'], searchPlaceholder: "Search configurations...", filterOptions: [
                                                {
                                                    key: 'isActive',
                                                    label: 'Status',
                                                    options: [
                                                        { value: 'true', label: 'Active', count: configurations.filter(c => c.isActive).length },
                                                        { value: 'false', label: 'Inactive', count: configurations.filter(c => !c.isActive).length }
                                                    ]
                                                }
                                            ], actionButton: _jsxs(Button, { onClick: () => {
                                                    setEditingConfig(null);
                                                    setShowConfigDialog(true);
                                                }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Configuration"] }), emptyStateTitle: "No Configurations", emptyStateDescription: "Create your first configuration to define client fields that will appear in the simulator.", emptyStateIcon: _jsx(Settings, { className: "h-12 w-12 text-muted-foreground" }), emptyStateAction: _jsx(Button, { onClick: () => {
                                                    setEditingConfig(null);
                                                    setShowConfigDialog(true);
                                                }, variant: "outline", children: "Create Configuration" }), renderRow: (config) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: config.name }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: config.isActive ? "default" : "secondary", children: config.isActive ? 'Active' : 'Inactive' }) }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm text-muted-foreground max-w-xs truncate", children: config.description || 'No description' }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-wrap gap-1 max-w-xs", children: [config.fields?.slice(0, 3).map((field) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: field.label }, field.id))), config.fields && config.fields.length > 3 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: ["+", config.fields.length - 3, " more"] })), (!config.fields || config.fields.length === 0) && (_jsx("span", { className: "text-xs text-muted-foreground", children: "No fields" }))] }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                                                        setEditingConfig(config);
                                                                        setShowConfigDialog(true);
                                                                    }, children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDuplicateConfiguration(config), children: _jsx(Copy, { className: "h-3 w-3" }) })] }) })] })) }), showConfigDialog && (_jsx(ConfigurationDialog, { isOpen: showConfigDialog, onClose: () => {
                                                setShowConfigDialog(false);
                                                setEditingConfig(null);
                                            }, onSave: handleSaveConfiguration, onDelete: handleDeleteConfiguration, onDuplicate: handleDuplicateConfiguration, configuration: editingConfig, configurations: configurations, isCreating: !editingConfig }))] })), activeTab === 'categories' && (_jsx(CategoryManager, { categories: categories, services: items, onUpdateCategories: onUpdateCategories })), activeTab === 'services' && (_jsx(SimpleServiceManager, { services: items, categories: categories, onUpdateServices: onUpdateItems })), activeTab === 'tags' && (_jsx(TagManager, { services: items, onUpdateServices: onUpdateItems })), activeTab === 'users' && (_jsx(UserManagement, { currentUserId: currentUserId, currentUserRole: currentUserRole })), activeTab === 'scenarios' && (_jsxs(_Fragment, { children: [_jsx(DataTable, { title: "Scenario History", description: "View and manage saved pricing scenarios from client sessions", headers: ['Submission Code', 'Client & Project', 'Prepared By', 'Date Created', 'Items', 'One-time Cost', 'Monthly Cost', 'Discount', 'Total Project Cost', 'Actions'], items: scenarios, getItemKey: (scenario) => scenario.scenarioId, onRowClick: (scenario) => {
                                                setSelectedScenario(scenario);
                                                setShowScenarioDialog(true);
                                            }, searchFields: ['submissionCode', 'clientName', 'projectName', 'preparedBy'], searchPlaceholder: "Search scenarios by code, client, project, or preparer...", filterOptions: [], actionButton: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { onClick: () => {
                                                            const message = "New scenarios are created when clients download PDFs from the pricing simulator. To create a new scenario:\n\n1. Go back to the pricing simulator\n2. Configure client settings\n3. Add services to the scenario\n4. Download the PDF\n\nThe scenario will then appear in this history.";
                                                            alert(message);
                                                        }, variant: "outline", size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "How to Add"] }), _jsxs(Button, { onClick: loadScenarios, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] })] }), emptyStateTitle: "No scenarios saved yet", emptyStateDescription: "Scenario data will appear here when users download PDFs from the pricing simulator.", emptyStateIcon: _jsx(History, { className: "h-12 w-12 text-muted-foreground" }), emptyStateAction: _jsx(Button, { onClick: handleClose, variant: "outline", children: "Go to Simulator" }), isLoading: scenariosLoading, renderRow: (scenario) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx(Badge, { variant: "secondary", className: "font-mono text-xs", children: scenario.submissionCode || 'N/A' }) }), _jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-medium", children: scenario.clientName || 'Unknown Client' }), _jsx("div", { className: "text-sm text-muted-foreground", children: scenario.projectName || 'Untitled Project' })] }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: scenario.preparedBy || 'Unknown' }) }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm", children: new Date(scenario.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                }) }), _jsx("div", { className: "text-xs text-muted-foreground", children: new Date(scenario.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) })] }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "outline", children: [scenario.itemCount, " items"] }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: formatPrice(scenario.oneTimeTotal) }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: formatPrice(scenario.monthlyTotal) }) }), _jsx(TableCell, { children: scenario.globalDiscount && scenario.globalDiscount > 0 && scenario.globalDiscountApplication !== 'none' ? (_jsxs("div", { className: "space-y-0.5", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", children: scenario.globalDiscountType === 'percentage'
                                                                        ? `${scenario.globalDiscount}%`
                                                                        : formatPrice(scenario.globalDiscount) }), _jsx("div", { className: "text-xs text-muted-foreground", children: scenario.globalDiscountApplication === 'both' ? 'Both' :
                                                                        scenario.globalDiscountApplication === 'monthly' ? 'Monthly' :
                                                                            scenario.globalDiscountApplication === 'onetime' ? 'One-time' :
                                                                                'None' })] })) : (_jsx("span", { className: "text-sm text-muted-foreground", children: "None" })) }), _jsx(TableCell, { children: _jsx("div", { className: "font-semibold text-primary", children: formatPrice(scenario.totalProjectCost) }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsx(Button, { size: "sm", variant: "ghost", onClick: async () => {
                                                                try {
                                                                    const scenarioData = await api.getScenarioData(scenario.scenarioId);
                                                                    if (!scenarioData) {
                                                                        alert('Scenario data not found. Cannot generate PDF.');
                                                                        return;
                                                                    }
                                                                    const configDefinitions = await api.loadConfigurations();
                                                                    const pdfData = {
                                                                        config: scenarioData.config,
                                                                        legacyConfig: scenarioData.config,
                                                                        configDefinitions: configDefinitions.filter(config => config.isActive),
                                                                        selectedItems: scenarioData.selectedItems,
                                                                        categories: scenarioData.categories,
                                                                        globalDiscount: scenarioData.globalDiscount,
                                                                        globalDiscountType: scenarioData.globalDiscountType,
                                                                        globalDiscountApplication: scenarioData.globalDiscountApplication,
                                                                        summary: scenarioData.summary
                                                                    };
                                                                    downloadPDF(pdfData);
                                                                }
                                                                catch (error) {
                                                                    console.error('Failed to download PDF for scenario:', scenario.scenarioId, error);
                                                                    alert('Failed to download PDF. Please try again.');
                                                                }
                                                            }, title: "Download PDF", children: _jsx(Download, { className: "h-3 w-3" }) }) })] })) }), selectedScenario && (_jsx(ScenarioDialog, { isOpen: showScenarioDialog, onClose: () => {
                                                setShowScenarioDialog(false);
                                                setSelectedScenario(null);
                                            }, scenario: selectedScenario }))] })), activeTab === 'guest-submissions' && (_jsxs(_Fragment, { children: [_jsx(DataTable, { title: "Guest Submissions", description: "View and manage guest user submissions from the pricing simulator", headers: ['Submission Code', 'Contact Name', 'Company', 'Email', 'Total Price', 'Services', 'Status', 'Date', 'Actions'], items: guestSubmissions, getItemKey: (submission) => submission.id, onRowClick: (submission) => {
                                                setSelectedGuestSubmission(submission);
                                                setShowGuestSubmissionDialog(true);
                                            }, searchFields: ['submissionCode', 'firstName', 'lastName', 'email', 'companyName'], searchPlaceholder: "Search by code, name, email, or company...", filterOptions: [], actionButton: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { onClick: async () => {
                                                            try {
                                                                // Enhanced CSV Export with all data
                                                                const headers = [
                                                                    'Submission Code',
                                                                    'First Name',
                                                                    'Last Name',
                                                                    'Email',
                                                                    'Phone Number',
                                                                    'Company Name',
                                                                    'Scenario Name',
                                                                    'Total Price',
                                                                    'Services Count',
                                                                    'Client Name',
                                                                    'Project Name',
                                                                    'Debit Cards',
                                                                    'Credit Cards',
                                                                    'Monthly Authorizations',
                                                                    'Monthly Settlements',
                                                                    'Status',
                                                                    'Created Date'
                                                                ];
                                                                const rows = await Promise.all(guestSubmissions.map(async (sub) => {
                                                                    // Try to get full data, fall back to basic data
                                                                    let scenarioData = sub.scenarioData;
                                                                    if (!scenarioData) {
                                                                        try {
                                                                            const fullData = await api.getGuestScenarioData(sub.id);
                                                                            scenarioData = fullData?.scenarioData;
                                                                        }
                                                                        catch (error) {
                                                                            console.warn('Could not load full data for CSV export:', sub.id);
                                                                        }
                                                                    }
                                                                    const config = scenarioData?.config || {};
                                                                    return [
                                                                        sub.submissionCode || '',
                                                                        sub.firstName || '',
                                                                        sub.lastName || '',
                                                                        sub.email || '',
                                                                        sub.phoneNumber || '',
                                                                        sub.companyName || '',
                                                                        sub.scenarioName || '',
                                                                        sub.totalPrice || 0,
                                                                        sub.servicesCount || 0,
                                                                        config.clientName || '',
                                                                        config.projectName || '',
                                                                        config.debitCards || 0,
                                                                        config.creditCards || 0,
                                                                        config.monthlyAuthorizations || 0,
                                                                        config.monthlySettlements || 0,
                                                                        sub.status || 'submitted',
                                                                        new Date(sub.createdAt).toLocaleDateString()
                                                                    ].map(cell => {
                                                                        // Escape commas and quotes in CSV
                                                                        const stringValue = String(cell);
                                                                        if (stringValue.includes(',') || stringValue.includes('"')) {
                                                                            return `"${stringValue.replace(/"/g, '""')}"`;
                                                                        }
                                                                        return stringValue;
                                                                    });
                                                                }));
                                                                const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                                                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                                const url = URL.createObjectURL(blob);
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                link.download = `guest-submissions-${new Date().toISOString().split('T')[0]}.csv`;
                                                                link.click();
                                                                URL.revokeObjectURL(url);
                                                            }
                                                            catch (error) {
                                                                console.error('CSV export error:', error);
                                                                alert('Failed to export CSV. Please try again.');
                                                            }
                                                        }, variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export to CSV"] }), _jsxs(Button, { onClick: loadGuestSubmissions, variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] })] }), emptyStateTitle: "No guest submissions yet", emptyStateDescription: "Guest submissions will appear here when users submit contact information from the pricing simulator.", emptyStateIcon: _jsx(UserCheck, { className: "h-12 w-12 text-muted-foreground" }), renderRow: (submission) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx("div", { className: "font-mono text-sm font-medium text-primary cursor-pointer hover:underline", children: submission.submissionCode }) }), _jsx(TableCell, { children: _jsxs("div", { className: "font-medium", children: [submission.firstName, " ", submission.lastName] }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: submission.companyName }) }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm", children: submission.email }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-semibold text-primary", children: formatPrice(submission.totalPrice) }) }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "outline", children: [submission.servicesCount, " items"] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: submission.status === 'contacted' ? 'default' :
                                                                submission.status === 'converted' ? 'default' :
                                                                    'secondary', children: submission.status }) }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm", children: new Date(submission.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            }) }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsx(Button, { size: "sm", variant: "ghost", onClick: async () => {
                                                                try {
                                                                    const scenarioData = await api.getGuestScenarioData(submission.id);
                                                                    if (!scenarioData) {
                                                                        alert('Scenario data not found. Cannot generate PDF.');
                                                                        return;
                                                                    }
                                                                    const configDefinitions = await api.loadConfigurations();
                                                                    const pdfData = {
                                                                        config: scenarioData.config,
                                                                        legacyConfig: scenarioData.config,
                                                                        configDefinitions: configDefinitions.filter(config => config.isActive),
                                                                        selectedItems: scenarioData.selectedItems,
                                                                        categories: scenarioData.categories,
                                                                        globalDiscount: scenarioData.globalDiscount,
                                                                        globalDiscountType: scenarioData.globalDiscountType,
                                                                        globalDiscountApplication: scenarioData.globalDiscountApplication,
                                                                        summary: scenarioData.summary
                                                                    };
                                                                    downloadPDF(pdfData);
                                                                }
                                                                catch (error) {
                                                                    console.error('Failed to download PDF for guest submission:', submission.id, error);
                                                                    alert('Failed to download PDF. Please try again.');
                                                                }
                                                            }, title: "Download PDF", children: _jsx(Download, { className: "h-3 w-3" }) }) })] })) }), selectedGuestSubmission && (_jsx(GuestSubmissionDetailDialog, { isOpen: showGuestSubmissionDialog, onClose: () => {
                                                setShowGuestSubmissionDialog(false);
                                                setSelectedGuestSubmission(null);
                                            }, submission: selectedGuestSubmission }))] }))] })] }) })] }));
}
