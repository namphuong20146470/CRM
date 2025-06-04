export const getStatusName = (code) => {
  if (code === 'O') return 'Đang kinh doanh';
  if (code === 'N') return 'Ngừng kinh doanh';
  return code;
};