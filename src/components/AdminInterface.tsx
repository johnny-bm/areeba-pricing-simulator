import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, LogOut, Settings, Package, Tags, History, CreditCard, Calculator, Zap, Users, Plus, ChevronLeft, ChevronRight, Edit, Copy, RefreshCw, Download, User, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PricingItem, Category, ScenarioSummary, ClientConfig, ConfigurationDefinition, SelectedItem } from '../types/pricing';
import { SimpleServiceManager } from './SimpleServiceManager';
import { ScenarioHistoryTab } from './ScenarioHistoryTab';
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

interface AdminInterfaceProps {
  onClose: () => void;
  items: PricingItem[];
  categories: Category[];
  selectedItems?: SelectedItem[];
  clientConfig?: ClientConfig;
  onUpdateItems: (items: PricingItem[]) => void;
  onUpdateCategories: (categories: Category[], skipSave?: boolean) => void;
  onLogout?: () => void;
  onForceRefresh?: () => void;
  adminToken?: string | null;
  currentUserId: string;
  currentUserRole: string;
}

interface SimulatorOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
}

const simulators: SimulatorOption[] = [
  {
    id: 'issuing-processing',
    name: 'Issuing & Processing',
    icon: <CreditCard className="h-4 w-4" />,
    available: true
  },
  {
    id: 'acquiring',
    name: 'Acquiring Solutions',
    icon: <Calculator className="h-4 w-4" />,
    available: false
  },
  {
    id: 'digital-banking',
    name: 'Digital Banking',
    icon: <Zap className="h-4 w-4" />,
    available: false
  }
];

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'configurations',
    name: 'Configuration',
    icon: <Settings className="h-4 w-4" />
  },
  {
    id: 'categories',
    name: 'Categories',
    icon: <Package className="h-4 w-4" />
  },
  {
    id: 'services',
    name: 'Services',
    icon: <Package className="h-4 w-4" />
  },
  {
    id: 'tags',
    name: 'Tags',
    icon: <Tags className="h-4 w-4" />
  },
  {
    id: 'users',
    name: 'Users',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'scenarios',
    name: 'History',
    icon: <History className="h-4 w-4" />
  },
  {
    id: 'guest-submissions',
    name: 'Guest Submissions',
    icon: <UserCheck className="h-4 w-4" />
  }
];

export function AdminInterface({ 
  onClose, 
  items, 
  categories, 
  selectedItems, 
  clientConfig, 
  onUpdateItems, 
  onUpdateCategories, 
  onLogout, 
  onForceRefresh,
  adminToken,
  currentUserId,
  currentUserRole
}: AdminInterfaceProps) {
  const [selectedSimulator, setSelectedSimulator] = useState('issuing-processing');
  const [activeTab, setActiveTab] = useState<'configurations' | 'categories' | 'services' | 'tags' | 'users' | 'scenarios' | 'guest-submissions'>('configurations');


  const [configurations, setConfigurations] = useState<any[]>([]);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSummary | null>(null);
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [guestSubmissions, setGuestSubmissions] = useState<any[]>([]);
  const [guestSubmissionsLoading, setGuestSubmissionsLoading] = useState(false);
  const [selectedGuestSubmission, setSelectedGuestSubmission] = useState<any | null>(null);
  const [showGuestSubmissionDialog, setShowGuestSubmissionDialog] = useState(false);
  


  // Load configurations and scenarios on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedConfigs = await api.loadConfigurations();
        setConfigurations(loadedConfigs);
      } catch (error) {
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
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
    } finally {
      setScenariosLoading(false);
    }
  };

  const loadGuestSubmissions = async () => {
    setGuestSubmissionsLoading(true);
    try {
      const loadedSubmissions = await api.loadGuestSubmissions();
      setGuestSubmissions(loadedSubmissions);
    } catch (error) {
      console.error('Failed to load guest submissions:', error);
      setGuestSubmissions([]);
    } finally {
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

  const handleSaveConfiguration = async (config: any) => {
    try {
      await api.saveConfiguration(config);
      const updatedConfigs = await api.loadConfigurations();
      setConfigurations(updatedConfigs);
      setShowConfigDialog(false);
      setEditingConfig(null);
      if (onForceRefresh) {
        onForceRefresh();
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  };

  const handleDeleteConfiguration = async (config: any) => {
    try {
      await api.deleteConfiguration(config.id);
      const updatedConfigs = await api.loadConfigurations();
      setConfigurations(updatedConfigs);
      setShowConfigDialog(false);
      setEditingConfig(null);
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      throw error;
    }
  };

  const handleDuplicateConfiguration = async (config: any) => {
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
    } catch (error) {
      console.error('Failed to duplicate configuration:', error);
      throw error;
    }
  };

  const handleReorderConfigurations = async (reorderedConfigs: any[]) => {
    setConfigurations(reorderedConfigs);
    // You could optionally save the new order to the backend here
  };

  const handleDuplicateScenario = async (scenario: any) => {
    const confirmed = window.confirm(
      `Duplicate scenario for "${scenario.clientName}" - "${scenario.projectName}"?\n\nThis will create a copy with a new timestamp.`
    );
    
    if (!confirmed) return;

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
    } catch (error) {
      console.error('Failed to duplicate scenario:', error);
      alert('Failed to duplicate scenario. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-5 flex-shrink-0">
              <WordMarkRed />
            </div>
            <div className="text-sidebar-foreground">
              <div className="text-sm font-medium">Admin Panel</div>
            </div>
          </div>
          
          {/* Simulator Selector */}
          <div className="space-y-2">
            <label className="text-xs text-sidebar-foreground/70 uppercase tracking-wide">
              Simulator
            </label>
            <Select value={selectedSimulator} onValueChange={setSelectedSimulator}>
              <SelectTrigger className="w-full bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {simulators.map((simulator) => (
                  <SelectItem 
                    key={simulator.id} 
                    value={simulator.id}
                    disabled={!simulator.available}
                  >
                    <div className="flex items-center gap-2">
                      {simulator.icon}
                      <span>{simulator.name}</span>
                      {!simulator.available && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          Soon
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          {/* User Profile Section */}
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {(() => {
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    const displayName = userData.first_name || userData.last_name
                      ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
                      : userData.email || 'User';
                    return displayName;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {(() => {
                    const userData = JSON.parse(localStorage.getItem('user') || '{}');
                    return userData.email || '';
                  })()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    (() => {
                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                      const role = userData.role;
                      return role === 'owner' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : role === 'admin'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                    })()
                  }`}>
                    {(() => {
                      const userData = JSON.parse(localStorage.getItem('user') || '{}');
                      const role = userData.role || 'user';
                      return role.charAt(0).toUpperCase() + role.slice(1);
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logout button - prominent placement */}
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-4"
            >
              <LogOut className="h-4 w-4 mr-2" />
              🔥 Sign Out (Updated)
            </Button>
          )}
          
          {/* Back to Simulators - moved under logo */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Simulators
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-auto">
        <div className="p-6">
          {/* Content Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium">
                  {navigationItems.find(item => item.id === activeTab)?.name}
                </h1>
              </div>

            </div>
            <p className="text-muted-foreground">
              {activeTab === 'configurations' && 'Create configuration fields that appear in the client configuration bar'}
              {activeTab === 'categories' && 'Organize pricing services into logical categories for better organization'}
              {activeTab === 'services' && 'Create and manage pricing services with auto-add and quantity mapping features'}
              {activeTab === 'tags' && 'Manage tags for better service organization and filtering'}
              {activeTab === 'users' && 'Manage system users, roles, and access permissions for the pricing simulator'}
              {activeTab === 'scenarios' && 'View saved pricing scenarios from PDF downloads and client sessions'}
            </p>
          </div>

          {/* Content */}
          <div>
            {activeTab === 'configurations' && (
              <>
                <DataTable
                  title="Configuration Management"
                  description="Create and manage configuration fields that appear in the client configuration bar"
                  headers={['Name', 'Status', 'Description', 'Fields', 'Actions']}
                  items={configurations}
                  getItemKey={(config) => config.id}
                  onReorder={handleReorderConfigurations}
                  onRowClick={(config) => {
                    setEditingConfig(config);
                    setShowConfigDialog(true);
                  }}
                  searchFields={['name', 'description']}
                  searchPlaceholder="Search configurations..."
                  filterOptions={[
                    {
                      key: 'isActive',
                      label: 'Status',
                      options: [
                        { value: 'true', label: 'Active', count: configurations.filter(c => c.isActive).length },
                        { value: 'false', label: 'Inactive', count: configurations.filter(c => !c.isActive).length }
                      ]
                    }
                  ]}
                  actionButton={
                    <Button 
                      onClick={() => {
                        setEditingConfig(null);
                        setShowConfigDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Configuration
                    </Button>
                  }
                  emptyStateTitle="No Configurations"
                  emptyStateDescription="Create your first configuration to define client fields that will appear in the simulator."
                  emptyStateIcon={<Settings className="h-12 w-12 text-muted-foreground" />}
                  emptyStateAction={
                    <Button 
                      onClick={() => {
                        setEditingConfig(null);
                        setShowConfigDialog(true);
                      }}
                      variant="outline"
                    >
                      Create Configuration
                    </Button>
                  }
                  renderRow={(config) => (
                    <>
                      <TableCell>
                        <div className="font-medium">{config.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {config.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {config.fields?.slice(0, 3).map((field: any) => (
                            <Badge key={field.id} variant="outline" className="text-xs">
                              {field.label}
                            </Badge>
                          ))}
                          {config.fields && config.fields.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{config.fields.length - 3} more
                            </Badge>
                          )}
                          {(!config.fields || config.fields.length === 0) && (
                            <span className="text-xs text-muted-foreground">No fields</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingConfig(config);
                              setShowConfigDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicateConfiguration(config)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                />

                {showConfigDialog && (
                  <ConfigurationDialog
                    isOpen={showConfigDialog}
                    onClose={() => {
                      setShowConfigDialog(false);
                      setEditingConfig(null);
                    }}
                    onSave={handleSaveConfiguration}
                    onDelete={handleDeleteConfiguration}
                    onDuplicate={handleDuplicateConfiguration}
                    configuration={editingConfig}
                    configurations={configurations}
                    isCreating={!editingConfig}
                  />
                )}
              </>
            )}
            
            {activeTab === 'categories' && (
              <CategoryManager
                categories={categories}
                services={items}
                onUpdateCategories={onUpdateCategories}
              />
            )}
            
            {activeTab === 'services' && (
              <SimpleServiceManager
                services={items}
                categories={categories}
                onUpdateServices={onUpdateItems}
              />
            )}
            
            {activeTab === 'tags' && (
              <TagManager
                services={items}
                onUpdateServices={onUpdateItems}
              />
            )}
            
            {activeTab === 'users' && (
              <UserManagement
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            )}
            
            {activeTab === 'scenarios' && (
              <>
                <DataTable
                  title="Scenario History"
                  description="View and manage saved pricing scenarios from client sessions"
                  headers={['Submission Code', 'Client & Project', 'Prepared By', 'Date Created', 'Items', 'One-time Cost', 'Monthly Cost', 'Discount', 'Total Project Cost', 'Actions']}
                  items={scenarios}
                  getItemKey={(scenario) => scenario.scenarioId}
                  onRowClick={(scenario) => {
                    setSelectedScenario(scenario);
                    setShowScenarioDialog(true);
                  }}
                  searchFields={['submissionCode', 'clientName', 'projectName', 'preparedBy']}
                  searchPlaceholder="Search scenarios by code, client, project, or preparer..."
                  filterOptions={[]}
                  actionButton={
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => {
                          const message = "New scenarios are created when clients download PDFs from the pricing simulator. To create a new scenario:\n\n1. Go back to the pricing simulator\n2. Configure client settings\n3. Add services to the scenario\n4. Download the PDF\n\nThe scenario will then appear in this history.";
                          alert(message);
                        }} 
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        How to Add
                      </Button>
                      <Button onClick={loadScenarios} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  }
                  emptyStateTitle="No scenarios saved yet"
                  emptyStateDescription="Scenario data will appear here when users download PDFs from the pricing simulator."
                  emptyStateIcon={<History className="h-12 w-12 text-muted-foreground" />}
                  emptyStateAction={
                    <Button 
                      onClick={handleClose}
                      variant="outline"
                    >
                      Go to Simulator
                    </Button>
                  }
                  isLoading={scenariosLoading}
                  renderRow={(scenario) => (
                    <>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {scenario.submissionCode || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {scenario.clientName || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {scenario.projectName || 'Untitled Project'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {scenario.preparedBy || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(scenario.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(scenario.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {scenario.itemCount} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(scenario.oneTimeTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(scenario.monthlyTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {scenario.globalDiscount && scenario.globalDiscount > 0 && scenario.globalDiscountApplication !== 'none' ? (
                          <div className="space-y-0.5">
                            <Badge variant="secondary" className="text-xs">
                              {scenario.globalDiscountType === 'percentage' 
                                ? `${scenario.globalDiscount}%` 
                                : formatPrice(scenario.globalDiscount)
                              }
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {scenario.globalDiscountApplication === 'both' ? 'Both' :
                               scenario.globalDiscountApplication === 'monthly' ? 'Monthly' :
                               scenario.globalDiscountApplication === 'onetime' ? 'One-time' :
                               'None'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-primary">
                          {formatPrice(scenario.totalProjectCost)}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
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
                            } catch (error) {
                              console.error('Failed to download PDF for scenario:', scenario.scenarioId, error);
                              alert('Failed to download PDF. Please try again.');
                            }
                          }}
                          title="Download PDF"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                />
                {selectedScenario && (
                  <ScenarioDialog
                    isOpen={showScenarioDialog}
                    onClose={() => {
                      setShowScenarioDialog(false);
                      setSelectedScenario(null);
                    }}
                    scenario={selectedScenario}
                  />
                )}
              </>
            )}
            
            {activeTab === 'guest-submissions' && (
              <>
                <DataTable
                  title="Guest Submissions"
                  description="View and manage guest user submissions from the pricing simulator"
                  headers={['Submission Code', 'Contact Name', 'Company', 'Email', 'Total Price', 'Services', 'Status', 'Date', 'Actions']}
                  items={guestSubmissions}
                  getItemKey={(submission) => submission.id}
                  onRowClick={(submission) => {
                    setSelectedGuestSubmission(submission);
                    setShowGuestSubmissionDialog(true);
                  }}
                  searchFields={['submissionCode', 'firstName', 'lastName', 'email', 'companyName']}
                  searchPlaceholder="Search by code, name, email, or company..."
                  filterOptions={[]}
                  actionButton={
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={async () => {
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
                                } catch (error) {
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
                          } catch (error) {
                            console.error('CSV export error:', error);
                            alert('Failed to export CSV. Please try again.');
                          }
                        }} 
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export to CSV
                      </Button>
                      <Button onClick={loadGuestSubmissions} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  }
                  emptyStateTitle="No guest submissions yet"
                  emptyStateDescription="Guest submissions will appear here when users submit contact information from the pricing simulator."
                  emptyStateIcon={<UserCheck className="h-12 w-12 text-muted-foreground" />}
                  renderRow={(submission) => (
                    <>
                      <TableCell>
                        <div className="font-mono text-sm font-medium text-primary cursor-pointer hover:underline">
                          {submission.submissionCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {submission.firstName} {submission.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {submission.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {submission.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-primary">
                          {formatPrice(submission.totalPrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {submission.servicesCount} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            submission.status === 'contacted' ? 'default' :
                            submission.status === 'converted' ? 'default' :
                            'secondary'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(submission.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
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
                            } catch (error) {
                              console.error('Failed to download PDF for guest submission:', submission.id, error);
                              alert('Failed to download PDF. Please try again.');
                            }
                          }}
                          title="Download PDF"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                />
                {selectedGuestSubmission && (
                  <GuestSubmissionDetailDialog
                    isOpen={showGuestSubmissionDialog}
                    onClose={() => {
                      setShowGuestSubmissionDialog(false);
                      setSelectedGuestSubmission(null);
                    }}
                    submission={selectedGuestSubmission}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}