/**
 * Reusable Badge component for displaying statuses.
 */
const Badge = ({ children, className = '', variant = 'neutral' }) => {
  const variantMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  return (
    <span className={`badge ${variantMap[variant] || className || 'badge-neutral'}`}>
      {children}
    </span>
  );
};

/**
 * StatusBadge renders a badge from a status map (constants.js).
 * Example: <StatusBadge statusMap={HOUSEHOLD_STATUS} value="verified" />
 */
export const StatusBadge = ({ statusMap, value }) => {
  const config = statusMap?.[value];
  if (!config) return <span className="badge badge-neutral">{value || '-'}</span>;
  return <span className={`badge ${config.color}`}>{config.label}</span>;
};

export default Badge;
