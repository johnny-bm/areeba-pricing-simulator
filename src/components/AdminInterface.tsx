import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarInset,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarMenuSub, 
  SidebarMenuSubButton, 
  SidebarMenuSubItem, 
  SidebarProvider, 
  SidebarSeparator,
  SidebarTrigger
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ArrowLeft, LogOut, Settings, Package, Tags, History, CreditCard, Calculator, Zap, Users, Plus, ChevronLeft, ChevronRight, Edit, Copy, RefreshCw, Download, UserCheck, ChevronDown, ChevronRight as ChevronRightIcon, BarChart3, FileText, Building, Image } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PricingItem, Category, ScenarioSummary, ClientConfig, ConfigurationDefinition, SelectedItem } from '../types/pricing';
import { SimpleServiceManager } from './SimpleServiceManager';
import { ScenarioHistoryTab } from './ScenarioHistoryTab';
import { ConfigurationDialog } from './dialogs/ConfigurationDialog';
import { ScenarioDialog } from './dialogs/ScenarioDialog';
import { GuestSubmissionDetailDialog } from './dialogs/GuestSubmissionDetailDialog';
import { Header } from './layout/Header';
import type { BreadcrumbItem } from './layout/Header';
import { DataTable } from './DataTable';
import { CategoryManager } from './CategoryManager';
import { TagManager } from './TagManager';
import { UserManagement } from './UserManagement';
import { SimulatorManager } from './SimulatorManager';
import { SimulatorInfoPage } from './SimulatorInfoPage';
import { SimulatorDashboard } from './SimulatorDashboard';
import { ThemeToggle } from './ThemeToggle';
import { PdfBuilderAdmin } from '../features/pdfBuilder/components/PdfBuilderAdmin';
import { Spinner } from './ui/spinner';
import { AdminPageLayout, AdminPageActions } from './AdminPageLayout';
import { UserProfileDropdown } from './UserProfileDropdown';
import { formatPrice } from '../utils/formatters';
import { downloadPDF } from '../utils/pdfHelpers';

import { api } from '../utils/api';
import { getAvatarProps } from '../utils/avatarColors';
import { ROUTES } from '../config/routes';
import { SimulatorApi } from '../utils/simulatorApi';
import { Simulator } from '../types/simulator';
import WordMarkRed from '../imports/WordMarkRed';

interface AdminInterfaceProps {
  onClose: () => void;
  items: PricingItem[];
  categories: Category[];
  selectedItems?: SelectedItem[];
  clientConfig?: ClientConfig;
  onUpdateItems: (items: PricingItem[]) => Promise<void>;
  onUpdateCategories: (categories: Category[], skipSave?: boolean) => Promise<void>;
  onLogout?: () => void;
  onForceRefresh?: () => void;
  adminToken?: string | null;
  currentUserId: string;
  currentUserRole: string;
}


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
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current simulator and tab from URL
  const getCurrentSimulatorAndTab = () => {
    const path = location.pathname;
    
    // Check if we're in a PDF builder route
    if (path.startsWith('/admin/pdf-builder')) {
      if (path === '/admin/pdf-builder') {
        return { simulator: 'pdf-builder', section: 'sections' };
      }
      if (path.startsWith('/admin/pdf-builder/')) {
        const section = path.replace('/admin/pdf-builder/', '');
        return { simulator: 'pdf-builder', section };
      }
    }
    
    // Check if we're in a simulator-specific route
    const simulatorMatch = path.match(/^\/admin\/([^\/]+)\/(.+)$/);
    if (simulatorMatch) {
      const [, simulator, section] = simulatorMatch;
      return { simulator, section };
    }
    
    // Check global routes
    if (path === '/admin/simulators') return { simulator: null, section: 'simulators' };
    if (path === '/admin/history') return { simulator: null, section: 'history' };
    if (path === '/admin/guest-submissions') return { simulator: null, section: 'guest-submissions' };
    if (path === '/admin/users') return { simulator: null, section: 'users' };
    
    // Legacy routes
    if (path.includes('/configuration')) return { simulator: null, section: 'configurations' };
    if (path.includes('/categories')) return { simulator: null, section: 'categories' };
    if (path.includes('/services')) return { simulator: null, section: 'services' };
    if (path.includes('/tags')) return { simulator: null, section: 'tags' };
    if (path.includes('/scenarios')) return { simulator: null, section: 'scenarios' };
    
    return { simulator: null, section: 'simulators' };
  };
  
  const { simulator: currentSimulatorSlug, section: currentSection } = getCurrentSimulatorAndTab();
  


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
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [simulatorsLoading, setSimulatorsLoading] = useState(false);
  const [expandedSimulators, setExpandedSimulators] = useState<Set<string>>(new Set());
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'system');
  
  // Find the actual simulator by slug
  const currentSimulator = currentSimulatorSlug ? simulators.find(s => s.urlSlug === currentSimulatorSlug)?.id : null;
  


  // Load configurations and simulators on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedConfigs, loadedSimulators] = await Promise.all([
          api.loadConfigurations(),
          SimulatorApi.loadSimulators()
        ]);
        setConfigurations(loadedConfigs);
        setSimulators(loadedSimulators);
      } catch (error) {
        console.error('Failed to load data:', error);
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
    if (currentSection === 'scenarios') {
      loadScenarios();
    }
  }, [currentSection]);

  // Load guest submissions when the guest-submissions tab is activated
  useEffect(() => {
    if (currentSection === 'guest-submissions') {
      loadGuestSubmissions();
    }
  }, [currentSection]);

  const handleClose = () => {
    navigate('/simulators');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toggleSimulatorDropdown = (simulatorId: string) => {
    setExpandedSimulators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(simulatorId)) {
        newSet.delete(simulatorId);
      } else {
        newSet.add(simulatorId);
      }
      return newSet;
    });
  };

  const getSimulatorRoute = (simulatorId: string, section: string) => {
    const simulator = simulators.find(s => s.id === simulatorId);
    return `/admin/${simulator?.urlSlug || simulatorId}/${section}`;
  };

  const getGlobalRoute = (section: string) => {
    switch (section) {
      case 'simulators': return ROUTES.ADMIN_SIMULATORS;
      case 'history': return ROUTES.ADMIN_HISTORY;
      case 'guest-submissions': return ROUTES.ADMIN_GUEST_SUBMISSIONS;
      case 'users': return ROUTES.ADMIN_USERS;
      default: return ROUTES.ADMIN_SIMULATORS;
    }
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

  // Helper function to get page title
  const getPageTitle = () => {
    // Handle PDF Builder routes
    if (currentSimulatorSlug === 'pdf-builder') {
      switch (currentSection) {
        case 'sections': return 'PDF Sections';
        case 'templates': return 'PDF Templates';
        case 'archived': return 'Archived Templates';
        default: return 'PDF Builder';
      }
    }

    if (!currentSimulator) {
      switch (currentSection) {
        case 'simulators': return 'Simulators';
        case 'users': return 'User Management';
        case 'pdf-builder': return 'PDF Builder';
        case 'history': return 'History';
        case 'guest-submissions': return 'Guest Submissions';
        default: return 'Admin Panel';
      }
    }

    switch (currentSection) {
      case 'dashboard': return 'Dashboard';
      case 'info': return 'Information';
      case 'items': return 'Items';
      case 'categories': return 'Categories';
      case 'scenarios': return 'Scenarios';
      case 'history': return 'History';
      case 'configurations': return 'Configurations';
      case 'client-fields': return 'Client Fields';
      default: return 'Admin Panel';
    }
  };

  // Helper function to generate breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      {
        label: 'Admin',
        href: '/admin',
        isCurrent: false
      }
    ];

    // Handle PDF Builder routes
    if (currentSimulatorSlug === 'pdf-builder') {
      breadcrumbs.push({
        label: 'PDF Builder',
        href: '/admin/pdf-builder',
        isCurrent: false
      });
    } else if (currentSimulator) {
      const simulator = simulators.find(s => s.id === currentSimulator);
      breadcrumbs.push({
        label: simulator?.name || 'Simulator',
        href: `/admin/${simulator?.urlSlug || currentSimulator}/dashboard`,
        isCurrent: false
      });
    }

    // Add current page
    breadcrumbs.push({
      label: getPageTitle(),
      href: '#',
      isCurrent: true
    });

    return breadcrumbs;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-shrink-0 flex items-center">
              <WordMarkRed className="h-4 w-auto" />
            </div>
            <div className="text-sidebar-foreground">
              <div className="text-xs font-medium">Admin Panel</div>
            </div>
          </div>
          
          {/* Back to Simulators - at the top under logo */}
          <button
            onClick={handleClose}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Simulators
          </button>
        </SidebarHeader>

        <SidebarContent className="p-3">
          {/* Simulators Section */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Simulators
            </h3>
            <div className="space-y-1">
            
                {/* Simulator Dropdowns */}
                {simulators.map((simulator) => {
                  const isExpanded = expandedSimulators.has(simulator.id);
                  const isCurrentSimulator = currentSimulator === simulator.id;
                  
                  return (
                    <SidebarMenu key={simulator.id}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => toggleSimulatorDropdown(simulator.id)}
                          isActive={isCurrentSimulator}
                          size="sm"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>{simulator.title}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                          ) : (
                            <ChevronRightIcon className="h-3.5 w-3.5 ml-auto" />
                          )}
                        </SidebarMenuButton>
                        
                        {/* Simulator Sub-items */}
                        {isExpanded && (
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => {
                                  setNavigatingTo(`${simulator.id}-dashboard`);
                                  navigate(getSimulatorRoute(simulator.id, 'dashboard'));
                                }}
                                isActive={currentSection === 'dashboard' && isCurrentSimulator}
                                size="sm"
                              >
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span>Dashboard</span>
                                {navigatingTo === `${simulator.id}-dashboard` && (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary ml-auto"></div>
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => navigate(getSimulatorRoute(simulator.id, 'info'))}
                                isActive={currentSection === 'info' && isCurrentSimulator}
                                size="sm"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>Info</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => navigate(getSimulatorRoute(simulator.id, 'client-fields'))}
                                isActive={currentSection === 'client-fields' && isCurrentSimulator}
                                size="sm"
                              >
                                <Settings className="h-3.5 w-3.5" />
                                <span>Client Fields</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => navigate(getSimulatorRoute(simulator.id, 'categories'))}
                                isActive={currentSection === 'categories' && isCurrentSimulator}
                                size="sm"
                              >
                                <Package className="h-3.5 w-3.5" />
                                <span>Categories</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => navigate(getSimulatorRoute(simulator.id, 'services'))}
                                isActive={currentSection === 'services' && isCurrentSimulator}
                                size="sm"
                              >
                                <Package className="h-3.5 w-3.5" />
                                <span>Services</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                onClick={() => navigate(getSimulatorRoute(simulator.id, 'tags'))}
                                isActive={currentSection === 'tags' && isCurrentSimulator}
                                size="sm"
                              >
                                <Tags className="h-3.5 w-3.5" />
                                <span>Tags</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    </SidebarMenu>
                  );
                })}
                
                {/* Add New Simulator Button */}
                <SidebarMenuButton
                  onClick={() => navigate(ROUTES.ADMIN_SIMULATORS)}
                  size="sm"
                  className="border border-dashed border-sidebar-border"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add new simulator</span>
                </SidebarMenuButton>
            </div>
          </div>
            
            <SidebarSeparator className="my-3 -mx-3" />
            
            {/* Submissions Section */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                Submissions
              </h3>
              <div className="space-y-1">
            
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate(getGlobalRoute('history'))}
                      isActive={currentSection === 'scenarios' && !currentSimulator}
                      size="sm"
                    >
                      <History className="h-3.5 w-3.5" />
                      <span>History</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate(getGlobalRoute('guest-submissions'))}
                      isActive={currentSection === 'guest-submissions' && !currentSimulator}
                      size="sm"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Guest Submissions</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
            
            <SidebarSeparator className="my-3 -mx-3" />
            
            {/* Configuration Section */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                Configuration
              </h3>
              <div className="space-y-1">
            
                {/* PDF Builder Dropdown */}
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => toggleSimulatorDropdown('pdf-builder')}
                      isActive={currentSection === 'pdf-builder'}
                      size="sm"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>PDF Builder</span>
                      {expandedSimulators.has('pdf-builder') ? (
                        <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                      ) : (
                        <ChevronRightIcon className="h-3.5 w-3.5 ml-auto" />
                      )}
                    </SidebarMenuButton>
                    
                    {/* PDF Builder Sub-items */}
                    {expandedSimulators.has('pdf-builder') && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/pdf-builder/sections')}
                            isActive={currentSection === 'sections' && currentSimulatorSlug === 'pdf-builder'}
                            size="sm"
                          >
                            <Image className="h-3.5 w-3.5" />
                            <span>Sections</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/pdf-builder/templates')}
                            isActive={currentSection === 'templates' && currentSimulatorSlug === 'pdf-builder'}
                            size="sm"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>Templates</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/pdf-builder/archived')}
                            isActive={currentSection === 'archived' && currentSimulatorSlug === 'pdf-builder'}
                            size="sm"
                          >
                            <History className="h-3.5 w-3.5" />
                            <span>Archived</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
            
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate(getGlobalRoute('users'))}
                      isActive={currentSection === 'users' && !currentSimulator}
                      size="sm"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </div>
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="md:ml-[var(--sidebar-width)]">
        <Header
          breadcrumbs={getBreadcrumbs()}
          showUserMenu={true}
          onLogout={onLogout}
          showThemeToggle={true}
          theme={theme}
          setTheme={handleThemeChange}
        />
        <div className="flex flex-1 flex-col gap-4 p-4">

          {/* Content */}
          <div>
            {/* Simulator-specific sections */}
            {currentSimulator && currentSection === 'dashboard' && (
              <SimulatorDashboard simulatorId={currentSimulator} />
            )}
            
            {currentSimulator && currentSection === 'info' && (
              <SimulatorInfoPage simulatorId={currentSimulator} />
            )}
            
            {currentSimulator && currentSection === 'client-fields' && (
              <AdminPageLayout
                title="Client Fields"
                description="Manage client field configurations for this simulator"
                actions={AdminPageActions.addNew(() => {
                  setEditingConfig(null);
                  setShowConfigDialog(true);
                }, 'Add Configuration')}
                onRefresh={onForceRefresh}
              >
                <DataTable
                  title="Client Fields"
                  headers={['Name', 'Status', 'Description', 'Fields', 'Actions']}
                  items={configurations}
                  getItemKey={(config) => config.id}
                  renderRow={(config: any) => (
                    <>
                      <TableCell className="font-medium">{config.name}</TableCell>
                      <TableCell>
                        <Badge variant={config.isActive ? 'default' : 'secondary'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{config.description}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {config.fields ? config.fields.length : 0} fields
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingConfig(config);
                              setShowConfigDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateConfiguration(config)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                  actionButton={
                    <Button onClick={() => setShowConfigDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Client Fields
                    </Button>
                  }
                  onReorder={handleReorderConfigurations}
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
                    configuration={editingConfig}
                    configurations={configurations}
                    isCreating={!editingConfig}
                  />
                )}
              </AdminPageLayout>
            )}
            
            {currentSimulator && currentSection === 'categories' && (
              <CategoryManager
                categories={categories}
                services={items}
                onUpdateCategories={onUpdateCategories}
              />
            )}
            
            {currentSimulator && currentSection === 'services' && (
              <SimpleServiceManager
                services={items}
                categories={categories}
                onUpdateServices={onUpdateItems}
              />
            )}
            
            {currentSimulator && currentSection === 'tags' && (
              <TagManager
                services={items}
                onUpdateServices={onUpdateItems}
              />
            )}
            
            {/* PDF Builder sections */}
            {currentSimulatorSlug === 'pdf-builder' && (
              <PdfBuilderAdmin 
                userRole={currentUserRole} 
                userId={currentUserId} 
                section={currentSection}
              />
            )}
            

            {/* Global sections */}
            {!currentSimulatorSlug && currentSection === 'simulators' && (
              <SimulatorManager />
            )}
            
            {/* Fallback for unrecognized routes */}
            {!currentSimulatorSlug && currentSection !== 'simulators' && currentSection !== 'users' && currentSection !== 'scenarios' && currentSection !== 'guest-submissions' && currentSection !== 'history' && currentSection !== 'configurations' && currentSection !== 'categories' && currentSection !== 'services' && currentSection !== 'tags' && (
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
                <p className="text-muted-foreground">The requested page could not be found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Path: {location.pathname} | Section: {currentSection}
                </p>
              </div>
            )}
            
            {!currentSimulatorSlug && currentSection === 'users' && (
              <UserManagement
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            )}
            
            {!currentSimulator && currentSection === 'scenarios' && (
              <>
                <DataTable
                  title="Scenario History"
                  headers={['Submission Code', 'Client & Project', 'Prepared By', 'Date Created', 'Items', 'One-time Cost', 'Monthly Cost', 'Discount', 'Total Project Cost', 'Actions']}
                  items={scenarios}
                  isLoading={scenariosLoading}
                  getItemKey={(scenario) => scenario.scenarioId}
                  renderRow={(scenario: any) => (
                    <>
                      <TableCell className="font-medium">{scenario.scenarioId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{scenario.clientName}</div>
                          <div className="text-sm text-muted-foreground">{scenario.projectName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{scenario.preparedBy}</TableCell>
                      <TableCell>{new Date(scenario.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{scenario.selectedItems?.length || 0}</TableCell>
                      <TableCell>{formatPrice(scenario.summary?.oneTimeCost || 0)}</TableCell>
                      <TableCell>{formatPrice(scenario.summary?.monthlyCost || 0)}</TableCell>
                      <TableCell>
                        {scenario.summary?.globalDiscount > 0 ? `${scenario.summary.globalDiscount}%` : 'None'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(scenario.summary?.totalProjectCost || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedScenario(scenario);
                              setShowScenarioDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateScenario(scenario)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadPDF(scenario)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                  actionButton={
                    <Button onClick={loadScenarios} disabled={scenariosLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${scenariosLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  }
                />
                
                {showScenarioDialog && selectedScenario && (
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
            
            {!currentSimulator && currentSection === 'guest-submissions' && (
              <>
                <DataTable
                  title="Guest Submissions"
                  headers={['Submission Code', 'Contact Name', 'Company', 'Email', 'Total Price', 'Services', 'Status', 'Date', 'Actions']}
                  items={guestSubmissions}
                  isLoading={guestSubmissionsLoading}
                  getItemKey={(submission) => submission.id}
                  renderRow={(submission: any) => (
                    <>
                      <TableCell className="font-medium">{submission.id}</TableCell>
                      <TableCell>{submission.contactName}</TableCell>
                      <TableCell>{submission.company}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell className="font-medium">{formatPrice(submission.totalPrice)}</TableCell>
                      <TableCell>{submission.services?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={submission.status === 'submitted' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedGuestSubmission(submission);
                            setShowGuestSubmissionDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </>
                  )}
                  actionButton={
                    <Button onClick={loadGuestSubmissions} disabled={guestSubmissionsLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${guestSubmissionsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  }
                />
                
                {showGuestSubmissionDialog && selectedGuestSubmission && (
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
            
            {/* Legacy sections for backward compatibility - removed since we now have simulator-specific sections */}
            {!currentSimulator && currentSection === 'configurations' && (
              <>
                <DataTable
                  title="Client Fields"
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
                      Create Client Fields
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
                            <Badge key={field.id} variant="secondary" className="text-xs">
                              {field.label}
                            </Badge>
                          ))}
                          {config.fields && config.fields.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
