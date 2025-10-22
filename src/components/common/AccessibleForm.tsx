import { forwardRef, ReactNode } from 'react';
import { cn } from '../ui/utils';

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  novalidate?: boolean;
}

export const AccessibleForm = forwardRef<HTMLFormElement, AccessibleFormProps>(
  (
    {
      children,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      novalidate = false,
      ...props
    },
    ref
  ) => {
    return (
      <form
        ref={ref}
        className={cn(className)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        noValidate={novalidate}
        {...props}
      >
        {children}
      </form>
    );
  }
);

AccessibleForm.displayName = 'AccessibleForm';

interface AccessibleFieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  children: ReactNode;
  legend?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const AccessibleFieldset = forwardRef<HTMLFieldSetElement, AccessibleFieldsetProps>(
  (
    {
      children,
      className,
      legend,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset
        ref={ref}
        className={cn(className)}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        {...props}
      >
        {legend && (
          <legend className="text-sm font-medium text-foreground mb-2">
            {legend}
          </legend>
        )}
        {children}
      </fieldset>
    );
  }
);

AccessibleFieldset.displayName = 'AccessibleFieldset';
