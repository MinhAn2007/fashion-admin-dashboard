/**
 * Format a number as Vietnamese Dong (VND)
 * @param {number|string} price - The price to format
 * @returns {string} - The formatted price in VND
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(Number(price));
  };
