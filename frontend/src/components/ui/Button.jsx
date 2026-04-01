import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component with variants, sizes, and loading state.
 */
const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
  secondary: 'bg-surface-100 hover:bg-surface-200 text-surface-700 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-surface-200 focus:ring-surface-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
  ghost: 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400 focus:ring-surface-400',
  outline: 'border border-surface-300 dark:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300 focus:ring-primary-500',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        dark:focus:ring-offset-surface-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
