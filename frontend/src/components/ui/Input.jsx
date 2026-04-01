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
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
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
            w-full rounded-xl border bg-white dark:bg-surface-800
            text-surface-900 dark:text-surface-100
            placeholder:text-surface-400 dark:placeholder:text-surface-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm
            ${error
              ? 'border-red-400 dark:border-red-500 focus:ring-red-500'
              : 'border-surface-300 dark:border-surface-600'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
