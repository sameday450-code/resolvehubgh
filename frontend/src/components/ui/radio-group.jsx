import * as React from 'react';
import { cn } from '@/lib/utils';

const RadioGroupContext = React.createContext();

const RadioGroup = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn('grid gap-2', className)} role="radiogroup" {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = 'RadioGroup';

const RadioGroupItem = React.forwardRef(({ className, id, value, disabled, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context?.value === value;

  const handleChange = (e) => {
    if (context?.onValueChange && e.target.checked) {
      context.onValueChange(value);
    }
  };

  return (
    <input
      ref={ref}
      type="radio"
      name={`radio-group-${id}`}
      value={value}
      id={id}
      checked={isChecked}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        'h-4 w-4 rounded-full border-2 border-primary text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };

