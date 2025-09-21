export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ur-PK').format(num);
};