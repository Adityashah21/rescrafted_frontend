/**
 * Format paise (integer) to INR currency string (₹)
 * @param {number} paise
 * @returns {string}
 */
export const formatCurrency = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
};

/**
 * Format percentage discount
 */
export const calculateDiscount = (pricePaise, compareAtPricePaise) => {
  if (!compareAtPricePaise || compareAtPricePaise <= pricePaise) return 0;
  return Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100);
};

/**
 * Format date nicely
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Format impact number (e.g. 1250 kg -> 1.25 tonnes)
 */
export const formatImpactWeight = (kg) => {
  if (!kg) return '0 kg';
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes`;
  }
  return `${kg.toFixed(1)} kg`;
};
