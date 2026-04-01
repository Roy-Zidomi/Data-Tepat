/**
 * Reusable Card component with optional header and footer.
 */
const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700
        shadow-card transition-all duration-200
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-surface-900 dark:text-surface-100 ${className}`}>
    {children}
  </h3>
);

Card.Header = CardHeader;
Card.Title = CardTitle;

export default Card;
