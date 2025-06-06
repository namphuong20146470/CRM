import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

/**
 * Component xử lý việc xóa nhà cung cấp
 * @param {Object} props - Props của component
 * @param {string} props.supplierId - Mã nhà cung cấp cần xóa
 * @param {string} props.supplierName - Tên nhà cung cấp cần xóa
 * @param {Function} props.onSuccess - Callback được gọi khi xóa thành công
 * @param {Function} props.onCancel - Callback được gọi khi hủy xóa
 */
const RemoveSupplier = ({ supplierId, supplierName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  /**
   * Hiển thị hộp thoại xác nhận xóa
   */
  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa nhà cung cấp',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplierName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  /**
   * Xử lý việc xóa nhà cung cấp
   */
  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Nếu cần token xác thực, thêm vào đây
          // 'Authorization': `Bearer <your-token>`,
        },
      });

      if (!response.ok) {
        // Lấy thông tin lỗi từ phản hồi nếu có
        const contentType = response.headers.get('content-type');
        let errorMessage = `Server responded with status: ${response.status}`;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log('Server response:', responseData);
      }

      message.success('Xóa nhà cung cấp thành công!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error(`Không thể xóa nhà cung cấp: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Automatically show the confirmation dialog when the component is mounted
  useEffect(() => {
    if (supplierId && supplierName) {
      showDeleteConfirm();
    }
  }, [supplierId, supplierName]);

  return null; // Component này không render gì cả, chỉ cung cấp chức năng
};

export default RemoveSupplier;