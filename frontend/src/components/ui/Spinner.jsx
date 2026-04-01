import { Loader2 } from 'lucide-react';

/**
 * Loading spinner component for async operations.
 */
const Spinner = ({ size = 'md', className = '', text = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary-500`} />
      {text && <p className="text-sm text-surface-500 dark:text-surface-400">{text}</p>}
    </div>
  );
};

/** Full page loading state */
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" text="Memuat data..." />
  </div>
);

export default Spinner;
