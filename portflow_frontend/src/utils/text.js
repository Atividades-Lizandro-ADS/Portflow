export const truncateText = (value, limit = 20) => {
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
};
