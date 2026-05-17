/**
 * Reusable Card component with optional header and footer.
 */
const Card = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div
      className={`
        bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800
        shadow-card transition-shadow duration-200
        ${noPadding ? '' : 'p-5'}
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
  <h3 className={`text-base font-semibold text-surface-800 dark:text-surface-100 ${className}`}>
    {children}
  </h3>
);

Card.Header = CardHeader;
Card.Title = CardTitle;

export default Card;
