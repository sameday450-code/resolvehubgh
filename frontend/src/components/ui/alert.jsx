import * as React from 'react';
import { cn } from '@/lib/utils';

const Alert = React.forwardRef(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-background text-foreground border border-border',
      destructive: 'border border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10',
      warning: 'border border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200',
      info: 'border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-200',
      success: 'border border-green-200 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-200',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('relative w-full rounded-lg border border-gray-200 p-4', variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 font-medium leading-tight tracking-tight', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
