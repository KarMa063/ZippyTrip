
export const formatNPR = (amount: number): string => {
  return `NPR ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
