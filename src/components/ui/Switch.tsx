import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked, onChange, className = '', id, disabled, ...props }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={switchId}
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-11 h-6 bg-secondary/30 rounded-full peer peer-checked:bg-accent transition-colors duration-200" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-surface rounded-full transition-transform duration-200 peer-checked:translate-x-5 shadow-md" />
        </div>
        {label && <span className="text-sm font-semibold text-primary">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, className = '', id, disabled, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 rounded border-secondary/40 text-primary accent-primary focus:ring-accent cursor-pointer"
          {...props}
        />
        {label && <span className="text-sm font-semibold text-primary">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
