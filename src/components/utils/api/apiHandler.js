import axios from './axiosConfig';
import { message } from 'antd';

/**
 * Hàm fetch dữ liệu chung
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/customers')
 * @param {Function} setData - Hàm setState để cập nhật dữ liệu
 * @param {Function} setLoading - Hàm setState để xử lý loading
 * @param {boolean} addIndex - Có muốn thêm STT hay không
 */
export const fetchData = async ({
  endpoint,
  setData,
  setLoading,
  addIndex = true
}) => {
  setLoading(true);
  try {
    const res = await axios.get(endpoint);
    const dataArray = res?.data?.data || [];
    const processedData = addIndex
      ? dataArray.map((item, index) => ({
          ...item,
          stt: index + 1,
        }))
      : dataArray;

    setData(processedData);
  } catch (error) {
    console.error(`Lỗi khi gọi API ${endpoint}:`, error);
    message.error('Không thể kết nối đến server');
  } finally {
    setLoading(false);
  }
};
