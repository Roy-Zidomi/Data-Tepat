import { forwardRef } from 'react';

/**
 * Reusable Select dropdown component.
 */
const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Pilih...',
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
      <select
        ref={ref}
        className={`
          w-full rounded-lg border bg-surface-50 dark:bg-surface-800
          text-surface-800 dark:text-surface-100
          focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800
          transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          px-3.5 py-2 text-sm appearance-none
          ${error
            ? 'border-red-400 dark:border-red-500'
            : 'border-surface-200 dark:border-surface-700'
          }
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
