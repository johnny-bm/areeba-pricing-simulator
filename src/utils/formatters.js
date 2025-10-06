export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6 // Allow more precision for small prices
    }).format(price);
};
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
};
export const formatDecimalNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6 // Allow up to 6 decimal places for precision
    }).format(num);
};
export const parseFormattedNumber = (value) => {
    return parseInt(value.replace(/,/g, '')) || 0;
};
export const parseFormattedDecimal = (value) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
};
