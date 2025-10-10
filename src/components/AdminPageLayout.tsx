import React from 'react';
import { Button } from './ui/button';
import { Plus, RefreshCw, Download, Settings } from 'lucide-react';

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
    };
    secondary?: Array<{
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
      variant?: 'default' | 'outline' | 'ghost';
    }>;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AdminPageLayout({
  title,
  description,
  children,
  actions,
  isLoading = false,
  onRefresh
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          
          {actions?.secondary?.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          
          {actions?.primary && (
            <Button onClick={actions.primary.onClick}>
              {actions.primary.icon && <span className="mr-2">{actions.primary.icon}</span>}
              {actions.primary.label}
            </Button>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Standard action button presets
export const AdminPageActions = {
  addNew: (onClick: () => void, label: string = 'Add New') => ({
    primary: {
      label,
      onClick,
      icon: <Plus className="h-4 w-4" />
    }
  }),
  
  withRefresh: (onRefresh: () => void, primaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode }) => ({
    primary: primaryAction,
    secondary: [
      {
        label: 'Refresh',
        onClick: onRefresh,
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline' as const
      }
    ]
  }),
  
  export: (onExport: () => void) => ({
    secondary: [
      {
        label: 'Export',
        onClick: onExport,
        icon: <Download className="h-4 w-4" />,
        variant: 'outline' as const
      }
    ]
  }),
  
  settings: (onSettings: () => void) => ({
    secondary: [
      {
        label: 'Settings',
        onClick: onSettings,
        icon: <Settings className="h-4 w-4" />,
        variant: 'outline' as const
      }
    ]
  })
};
