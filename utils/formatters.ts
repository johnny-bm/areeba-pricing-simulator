export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6 // Allow more precision for small prices
  }).format(price);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatDecimalNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6 // Allow up to 6 decimal places for precision
  }).format(num);
};

export const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/,/g, '')) || 0;
};

export const parseFormattedDecimal = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};