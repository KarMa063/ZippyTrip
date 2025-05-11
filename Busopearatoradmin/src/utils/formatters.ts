// ... existing code ...

/**
 * Format a number as Nepali Rupees
 * @param amount The amount to format
 * @param options Formatting options
 * @returns Formatted currency string
 */
export const formatNepaliRupees = (
  amount: number | string,
  options: {
    decimals?: number;
    showSymbol?: boolean;
  } = {}
): string => {
  const { decimals = 2, showSymbol = true } = options;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return showSymbol ? 'रू 0' : '0';
  }
  
  // Format with thousand separators and decimal places
  const formatted = numAmount.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  });
  
  return showSymbol ? `रू ${formatted}` : formatted;
};

// Add an alias for backward compatibility
export const formatNPR = formatNepaliRupees;
// ... existing code ...