import { forwardRef } from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-current'?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      loadingText = 'Loading...',
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-expanded': ariaExpanded,
      'aria-pressed': ariaPressed,
      'aria-current': ariaCurrent,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-current={ariaCurrent}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
