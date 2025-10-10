import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

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
  const hasActions = primaryAction || secondaryActions.length > 0 || destructiveActions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} max-h-[90vh] flex flex-col p-0`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {children}
        </div>

        {hasActions && (
          <DialogFooter className="p-6 pt-4">
            <div className="flex items-center justify-between w-full">
              {/* Left side - Destructive actions */}
              <div className="flex gap-2">
                {destructiveActions.length > 0 ? (
                  destructiveActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="destructive"
                      onClick={action.onClick}
                      disabled={action.loading || action.disabled}
                    >
                      {action.loading ? (
                        <>
                          <Spinner size="sm" variant="primary" className="mr-2" />
                          {action.label}
                        </>
                      ) : (
                        <>
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </>
                      )}
                    </Button>
                  ))
                ) : (
                  <div />
                )}
              </div>

              {/* Right side - Secondary and Primary actions */}
              <div className="flex gap-2">
                {secondaryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    onClick={action.onClick}
                    disabled={action.loading || action.disabled}
                  >
                    {action.loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        {action.label}
                      </>
                    ) : (
                      <>
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </>
                    )}
                  </Button>
                ))}

                {primaryAction && (
                  <Button
                    variant={primaryAction.variant || 'default'}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.loading || primaryAction.disabled}
                  >
                    {primaryAction.loading ? (
                      <>
                        <Spinner size="sm" variant="primary" className="mr-2" />
                        {primaryAction.label}
                      </>
                    ) : (
                      <>
                        {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                        {primaryAction.label}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};