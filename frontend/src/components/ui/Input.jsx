import { forwardRef } from 'react';

/**
 * Reusable Input component with label, error state, and icon support.
 */
const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-surface-400" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg border bg-surface-50 dark:bg-surface-800
            text-surface-800 dark:text-surface-100
            placeholder:text-surface-400 dark:placeholder:text-surface-500
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800
            transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2 text-sm
            ${error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500/40'
              : 'border-surface-200 dark:border-surface-700'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
