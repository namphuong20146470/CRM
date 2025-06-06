import { fetchDataList } from '../api/requestHelpers';

export const getStockByMaHang = async (maHang) => {
  const stockInData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in');
  const stockOutData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out');

  const totalIn = stockInData
    .filter(item => item.ma_hang === maHang)
    .reduce((sum, item) => sum + (item.so_luong_nhap || 0), 0);

  const totalOut = stockOutData
    .filter(item => item.ma_hang === maHang)
    .reduce((sum, item) => sum + (item.so_luong_xuat || 0), 0);

  return totalIn - totalOut;
};