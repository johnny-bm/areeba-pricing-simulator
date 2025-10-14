import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { ArrowLeft, LogOut, Settings, Package, Tags, History, CreditCard, Calculator, Zap, Users, Plus, ChevronLeft, ChevronRight, Pencil, Copy, RefreshCw, Download, UserCheck, ChevronDown, ChevronRight as ChevronRightIcon, BarChart3, FileText, Building, Image, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PricingItem, Category, ScenarioSummary, ClientConfig, ConfigurationDefinition, SelectedItem } from '../types/domain';
// Lazy load heavy components
const SimpleServiceManager = lazy(() => import('./SimpleServiceManager').then(m => ({ default: m.SimpleServiceManager })));
const ScenarioHistoryTab = lazy(() => import('./ScenarioHistoryTab').then(m => ({ default: m.ScenarioHistoryTab })));
import { ConfigurationDialog } from './dialogs/ConfigurationDialog';
import { ScenarioDialog } from './dialogs/ScenarioDialog';
import { GuestSubmissionDetailDialog } from './dialogs/GuestSubmissionDetailDialog';
import { UnifiedHeader } from './layout/UnifiedHeader';
import type { BreadcrumbItem } from './layout/Header';
import { DataTable } from '../shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { CategoryManager } from './CategoryManager';
import { TagManager } from './TagManager';
import { ClientFieldsManager } from './ClientFieldsManager';
import { Skeleton } from './ui/skeleton';
import { UserManagement as UserManagementComponent } from './UserManagement';

// Custom skeleton component with smoother animation
function SmoothSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md bg-muted/50 ${className}`}
      style={{
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        background: 'linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite'
      }}
      {...props}
    />
  );
}

// Content-only skeleton loading component
function AdminContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <SmoothSkeleton className="h-8 w-48" />
        <SmoothSkeleton className="h-4 w-96" />
      </div>

      {/* Content Cards */}
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SmoothSkeleton className="h-6 w-32" />
              <SmoothSkeleton className="h-9 w-24" />
            </div>
            <div className="space-y-3">
              <SmoothSkeleton className="h-4 w-full" />
              <SmoothSkeleton className="h-4 w-3/4" />
              <SmoothSkeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <SmoothSkeleton className="h-6 w-40" />
            <div className="space-y-3">
              <SmoothSkeleton className="h-4 w-full" />
              <SmoothSkeleton className="h-4 w-5/6" />
              <SmoothSkeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-4">
            <SmoothSkeleton className="h-6 w-36" />
            <div className="grid grid-cols-3 gap-4">
              <SmoothSkeleton className="h-20 w-full" />
              <SmoothSkeleton className="h-20 w-full" />
              <SmoothSkeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to fix TypeScript issues
const UserManagementWrapper = (props: { currentUserId: string; currentUserRole: string }) => {
  const Component = UserManagementComponent as any;
  return <Component {...props} />;
};
import { SimulatorManager } from './SimulatorManager';
import { SimulatorInfoPage } from './SimulatorInfoPage';
import { SimulatorDashboard } from './SimulatorDashboard';
import { ThemeToggle } from './ThemeToggle';
const PdfBuilderAdmin = lazy(() => import('../features/pdfBuilder/components/PdfBuilderAdmin').then(m => ({ default: m.PdfBuilderAdmin })));
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
import { SIMULATOR_ICON_MAP_SMALL } from '../utils/icons';
// Import pricing configuration components
import { UnitsConfiguration } from '../features/configuration/components/pricing/UnitsConfiguration';
import { PricingTypesConfiguration } from '../features/configuration/components/pricing/PricingTypesConfiguration';
import { BillingCyclesConfiguration } from '../features/configuration/components/pricing/BillingCyclesConfiguration';
import { TieredTemplatesConfiguration } from '../features/configuration/components/pricing/TieredTemplatesConfiguration';

interface AdminInterfaceProps {
  onClose: () => void;
  items: PricingItem[];
  categories: Category[];
  configurations?: ConfigurationDefinition[];
  tags?: any[];
  selectedItems?: SelectedItem[];
  clientConfig?: ClientConfig;
  onUpdateItems: (items: PricingItem[]) => Promise<void>;
  onUpdateCategories: (categories: Category[], skipSave?: boolean) => Promise<void>;
  onLogout?: () => void;
  onForceRefresh?: () => void;
  adminToken?: string | null;
  currentUserId: string;
  currentUserRole: string;
  isLoading?: boolean;
}


export function AdminInterface({ 
  onClose, 
  items, 
  categories, 
  configurations = [],
  tags = [],
  selectedItems, 
  clientConfig, 
  onUpdateItems, 
  onUpdateCategories, 
  onLogout, 
  onForceRefresh,
  adminToken,
  currentUserId,
  currentUserRole,
  isLoading = false
}: AdminInterfaceProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get current simulator and tab from URL
  const getCurrentSimulatorAndTab = () => {
    const path = location.pathname;
    
    // Check pricing configuration routes FIRST (before generic simulator routes)
    if (path === '/admin/configuration/pricing/units') {
      return { simulator: null, section: 'pricing-units' };
    }
    if (path === '/admin/configuration/pricing/types') {
      return { simulator: null, section: 'pricing-types' };
    }
    if (path === '/admin/configuration/pricing/billing-cycles') {
      return { simulator: null, section: 'pricing-billing-cycles' };
    }
    if (path === '/admin/configuration/pricing/tiered-templates') {
      return { simulator: null, section: 'pricing-tiered-templates' };
    }
    
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
      
      // Handle configuration routes
      if (section.startsWith('configuration/')) {
        return { simulator, section: 'configuration' };
      }
      
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

  // Column definitions for History table
  const historyColumns: ColumnDef<any>[] = [
    {
      accessorKey: "scenarioId",
      header: "Submission Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("scenarioId")}</div>
      ),
    },
    {
      accessorKey: "clientName",
      header: "Client & Project",
      cell: ({ row }) => {
        const scenario = row.original;
        return (
          <div>
            <div className="font-medium">{scenario.clientName}</div>
            <div className="text-sm text-muted-foreground">{scenario.projectName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "preparedBy",
      header: "Prepared By",
    },
    {
      accessorKey: "createdAt",
      header: "Date Created",
      cell: ({ row }) => (
        <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: "selectedItems",
      header: "Items",
      cell: ({ row }) => {
        const scenario = row.original;
        return <div>{scenario.selectedItems?.length || 0}</div>;
      },
    },
    {
      accessorKey: "summary.oneTimeCost",
      header: "One-time Cost",
      cell: ({ row }) => {
        const scenario = row.original;
        return <div>{formatPrice(scenario.summary?.oneTimeCost || 0)}</div>;
      },
    },
    {
      accessorKey: "summary.monthlyCost",
      header: "Monthly Cost",
      cell: ({ row }) => {
        const scenario = row.original;
        return <div>{formatPrice(scenario.summary?.monthlyCost || 0)}</div>;
      },
    },
    {
      accessorKey: "summary.globalDiscount",
      header: "Discount",
      cell: ({ row }) => {
        const scenario = row.original;
        return (
          <div>
            {scenario.summary?.globalDiscount > 0 ? `${scenario.summary.globalDiscount}%` : 'None'}
          </div>
        );
      },
    },
    {
      accessorKey: "summary.totalProjectCost",
      header: "Total Project Cost",
      cell: ({ row }) => {
        const scenario = row.original;
        return (
          <div className="font-medium">
            {formatPrice(scenario.summary?.totalProjectCost || 0)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const scenario = row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedScenario(scenario);
                setShowScenarioDialog(true);
              }}
            >
              <Pencil className="h-4 w-4" />
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
        );
      },
    },
  ];

  // Column definitions for Guest Submissions table
  const guestSubmissionsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Submission Code",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "contactName",
      header: "Contact Name",
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
      cell: ({ row }) => (
        <div className="font-medium">{formatPrice(row.getValue("totalPrice"))}</div>
      ),
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => {
        const submission = row.original;
        return <div>{submission.services?.length || 0}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant={status === 'submitted' ? 'default' : 'secondary'}
            className={status === 'submitted' ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div>{new Date(row.getValue("createdAt")).toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
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
          </div>
        );
      },
    },
  ];

  // Column definitions for Configurations table
  const configurationsColumns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="text-sm text-muted-foreground max-w-xs truncate">
            {description || 'No description'}
          </div>
        );
      },
    },
    {
      accessorKey: "fields",
      header: "Fields",
      cell: ({ row }) => {
        const config = row.original;
        return (
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
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const config = row.original;
        return (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
        );
      },
    },
  ];
  


  // Load simulators on component mount
  useEffect(() => {
    const loadSimulators = async () => {
      try {
        const loadedSimulators = await SimulatorApi.loadSimulators();
        setSimulators(loadedSimulators);
      } catch (error) {
        // // // console.error('Failed to load simulators:', error);
      }
    };
    
    loadSimulators();
  }, []);

  // Clear navigation loading state when location changes or component mounts
  useEffect(() => {
    setNavigatingTo(null);
  }, [location.pathname]);

  const loadScenarios = async () => {
    setScenariosLoading(true);
    try {
      const loadedScenarios = await api.loadScenarios();
      setScenarios(loadedScenarios);
    } catch (error) {
      // // // console.error('Failed to load scenarios:', error);
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
      // // // console.error('Failed to load guest submissions:', error);
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
      // If the clicked dropdown is already open, close it
      if (prev.has(simulatorId)) {
        return new Set();
      }
      // Otherwise, close all others and open only this one
      return new Set([simulatorId]);
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
      // // // console.error('Failed to save configuration:', error);
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
      // // // console.error('Failed to delete configuration:', error);
      throw error;
    }
  };

  const handleDuplicateConfiguration = async (config: any) => {
    try {
      const duplicatedConfig = {
        ...config,
        id: `${config.id}-copy-${Date.now()}`,
        name: `${config.name} (Copy)`,
        is_active: false
      };
      await api.saveConfiguration(duplicatedConfig);
      const updatedConfigs = await api.loadConfigurations();
      setConfigurations(updatedConfigs);
    } catch (error) {
      // // // console.error('Failed to duplicate configuration:', error);
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
      // // // console.error('Failed to duplicate scenario:', error);
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
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Simulators
          </button>
        </SidebarHeader>

        <SidebarContent className="p-3">
          {/* Simulators Section */}
          <div className="space-y-1 mt-6">
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
                          isActive={isCurrentSimulator || isExpanded}
                          size="sm"
                        >
                          {SIMULATOR_ICON_MAP_SMALL[simulator.iconName] || <CreditCard className="h-3.5 w-3.5" />}
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
                
                {/* All Simulators Menu Item */}
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate(ROUTES.ADMIN_SIMULATORS)}
                      isActive={currentSection === 'simulators' && !currentSimulator}
                      size="sm"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>All Simulators</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
            </div>
          </div>
            
            <SidebarSeparator className="mt-6 mb-3 -mx-3" />
            
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
                      isActive={currentSection === 'pdf-builder' || expandedSimulators.has('pdf-builder')}
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
            
                {/* Pricing Dropdown */}
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => toggleSimulatorDropdown('pricing')}
                      isActive={currentSection === 'pricing' || expandedSimulators.has('pricing')}
                      size="sm"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>Pricing</span>
                      {expandedSimulators.has('pricing') ? (
                        <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                      ) : (
                        <ChevronRightIcon className="h-3.5 w-3.5 ml-auto" />
                      )}
                    </SidebarMenuButton>
                    
                    {/* Pricing Sub-items */}
                    {expandedSimulators.has('pricing') && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/configuration/pricing/units')}
                            isActive={currentSection === 'pricing-units'}
                            size="sm"
                          >
                            <Package className="h-3.5 w-3.5" />
                            <span>Available Units</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/configuration/pricing/types')}
                            isActive={currentSection === 'pricing-types'}
                            size="sm"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Pricing Types</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/configuration/pricing/billing-cycles')}
                            isActive={currentSection === 'pricing-billing-cycles'}
                            size="sm"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Billing Cycles</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => navigate('/admin/configuration/pricing/tiered-templates')}
                            isActive={currentSection === 'pricing-tiered-templates'}
                            size="sm"
                          >
                            <Calculator className="h-3.5 w-3.5" />
                            <span>Tiered Pricing Templates</span>
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
        
        <SidebarFooter className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">
            v{import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA ? 
              `1.${import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}` :
              import.meta.env.VITE_BUILD_HASH || 
              `1.${Math.floor(Date.now() / 1000000)}.0`}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset className="md:ml-[calc(var(--sidebar-width)+0.5rem)]">
        <UnifiedHeader
          pageType="admin"
          breadcrumbs={getBreadcrumbs()}
          showUserMenu={true}
          onLogout={onLogout}
          showThemeToggle={true}
          theme={theme}
          setTheme={handleThemeChange}
          className="pl-6"
        />
        <div className="flex flex-1 flex-col gap-4 p-4">

          {/* Content */}
          <div>
            <>
              {/* Show skeleton loading when actually loading */}
              {isLoading && (
                <AdminContentSkeleton />
              )}
              
              {/* Show actual content when not loading */}
              {!isLoading && (
                <>
                {/* Simulator-specific sections */}
            {currentSimulator && currentSection === 'dashboard' && (
              <SimulatorDashboard simulatorId={currentSimulator} />
            )}
            
            {currentSimulator && currentSection === 'info' && (
              <SimulatorInfoPage simulatorId={currentSimulator} />
            )}
            
            {currentSimulator && currentSection === 'client-fields' && (
              <ClientFieldsManager
                configurations={configurations}
                onUpdateConfigurations={async (updatedConfigurations) => {
                  setConfigurations(updatedConfigurations);
                  // Optionally save to backend here
                }}
                simulatorId={currentSimulator}
              />
            )}
            
            {currentSimulator && currentSection === 'categories' && (
              <CategoryManager
                categories={categories}
                services={items}
                onUpdateCategories={onUpdateCategories}
              />
            )}
            
            {currentSimulator && currentSection === 'services' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <SimpleServiceManager
                  services={items}
                  categories={categories}
                  onUpdateServices={onUpdateItems}
                />
              </Suspense>
            )}
            
            {currentSimulator && currentSection === 'tags' && (
              <TagManager
                services={items}
                onUpdateServices={onUpdateItems}
              />
            )}
            
            {/* Pricing Configuration Pages */}
            {!currentSimulator && currentSection === 'pricing-units' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <UnitsConfiguration />
              </Suspense>
            )}
            
            {!currentSimulator && currentSection === 'pricing-types' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <PricingTypesConfiguration />
              </Suspense>
            )}
            
            {!currentSimulator && currentSection === 'pricing-billing-cycles' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <BillingCyclesConfiguration />
              </Suspense>
            )}
            
            {!currentSimulator && currentSection === 'pricing-tiered-templates' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <TieredTemplatesConfiguration />
              </Suspense>
            )}
            
            {/* PDF Builder sections */}
            {currentSimulatorSlug === 'pdf-builder' && (
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <PdfBuilderAdmin 
                  userRole={currentUserRole} 
                  userId={currentUserId} 
                  section={currentSection}
                />
              </Suspense>
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
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <UserManagementWrapper
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                />
              </Suspense>
            )}
            
            {!currentSimulator && currentSection === 'scenarios' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">History</h2>
                      <p className="text-muted-foreground">Pricing scenario submissions and history</p>
                    </div>
                    <Button onClick={loadScenarios} disabled={scenariosLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${scenariosLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {scenariosLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <DataTable 
                      columns={historyColumns} 
                      data={scenarios}
                      searchKey="scenarioId"
                      searchPlaceholder="Search by submission code..."
                      onRowClick={(scenario) => {
                        setSelectedScenario(scenario);
                        setShowScenarioDialog(true);
                      }}
                    />
                  )}
                </div>
                
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Guest Submissions</h2>
                      <p className="text-muted-foreground">Guest user pricing submissions and contact information</p>
                    </div>
                    <Button onClick={loadGuestSubmissions} disabled={guestSubmissionsLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${guestSubmissionsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {guestSubmissionsLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <DataTable 
                      columns={guestSubmissionsColumns} 
                      data={guestSubmissions}
                      searchKey="contactName"
                      searchPlaceholder="Search by contact name..."
                      onRowClick={(submission) => {
                        setSelectedGuestSubmission(submission);
                        setShowGuestSubmissionDialog(true);
                      }}
                    />
                  )}
                </div>
                
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Client Fields</h2>
                      <p className="text-muted-foreground">Configuration fields for client data collection</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setEditingConfig(null);
                        setShowConfigDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Configuration
                    </Button>
                  </div>
                  
                  <DataTable 
                    columns={configurationsColumns} 
                    data={configurations}
                    searchKey="name"
                    searchPlaceholder="Search configurations..."
                    onRowClick={(config) => {
                      setEditingConfig(config);
                      setShowConfigDialog(true);
                    }}
                  />
                </div>

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
                    simulator_id={currentSimulator || ''}
                  />
                )}
              </>
            )}
          </>
        )}
        </>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
