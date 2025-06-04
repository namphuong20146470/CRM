export const getUnitName = (code) => {
  if (code === 'ST') return 'Cái';
  if (code === 'PAK') return 'Gói';
  return code;
};