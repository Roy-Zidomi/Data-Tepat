import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Alert component for feedback messages.
 */
const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-emerald-50 border-emerald-200/80 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-800/40 dark:text-emerald-300',
  error: 'bg-red-50 border-red-200/80 text-red-800 dark:bg-red-500/5 dark:border-red-800/40 dark:text-red-300',
  warning: 'bg-amber-50 border-amber-200/80 text-amber-800 dark:bg-amber-500/5 dark:border-amber-800/40 dark:text-amber-300',
  info: 'bg-sky-50 border-sky-200/80 text-sky-800 dark:bg-sky-500/5 dark:border-sky-800/40 dark:text-sky-300',
};

const Alert = ({ type = 'info', title, children, className = '' }) => {
  const Icon = iconMap[type];

  return (
    <div className={`flex gap-3 p-3.5 rounded-lg border ${colorMap[type]} ${className}`} role="alert">
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
