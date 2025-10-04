import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface DialogAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface StandardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  description?: string;
  children: React.ReactNode;
  
  // Actions
  primaryAction?: DialogAction;
  secondaryActions?: DialogAction[];
  destructiveActions?: DialogAction[];
  
  // Layout options
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl'
};

export const StandardDialog: React.FC<StandardDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryActions = [],
  destructiveActions = [],
  size = 'md',
  hideCloseButton = false
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const hasActions = primaryAction || secondaryActions.length > 0 || destructiveActions.length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className={`bg-background rounded-lg shadow-xl ${sizeClasses[size]} w-full flex flex-col max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 ml-4"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Fixed Footer */}
        {hasActions && (
          <div className="flex items-center justify-between p-6 border-t shrink-0">
            
            {/* Left side - Destructive actions */}
            <div className="flex gap-2">
              {destructiveActions.length > 0 ? (
                destructiveActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="destructive"
                    onClick={action.onClick}
                    disabled={action.loading || action.disabled}
                    className="w-auto"
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.loading ? 'Processing...' : action.label}
                  </Button>
                ))
              ) : (
                <div></div>
              )}
            </div>

            {/* Right side - Non-destructive actions */}
            <div className="flex gap-2">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  disabled={action.loading || action.disabled}
                  className="w-auto"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.loading ? 'Processing...' : action.label}
                </Button>
              ))}
              
              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'default'}
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.loading || primaryAction.disabled}
                  className="w-auto"
                >
                  {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                  {primaryAction.loading ? 'Processing...' : primaryAction.label}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
