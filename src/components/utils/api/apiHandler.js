import { warehouseInstance, crmInstance } from './axiosConfig';
import { message } from 'antd';

/**
 * Hàm fetch dữ liệu chung
 * @param {string} endpoint - Đường dẫn API (ví dụ: '/customers')
 * @param {Function} setData - Hàm setState để cập nhật dữ liệu
 * @param {Function} setLoading - Hàm setState để xử lý loading
 * @param {boolean} addIndex - Có muốn thêm STT hay không
 * @param {string} apiType - Loại API ('warehouse' hoặc 'crm')
 */
export const fetchData = async ({
  endpoint,
  setData,
  setLoading,
  addIndex = true,
  apiType = 'warehouse'
}) => {
  setLoading(true);
  try {
    // Chọn API instance dựa trên apiType
    const axiosInstance = apiType === 'crm' ? crmInstance : warehouseInstance;
    
    const res = await axiosInstance.get(endpoint);
    const dataArray = res?.data?.data || [];
    const processedData = addIndex
      ? dataArray.map((item, index) => ({
          ...item,
          stt: index + 1,
        }))
      : dataArray;

    setData(processedData);
  } catch (error) {
    console.error(`Lỗi khi gọi API ${apiType}${endpoint}:`, error);
    message.error('Không thể kết nối đến server');
  } finally {
    setLoading(false);
  }
};