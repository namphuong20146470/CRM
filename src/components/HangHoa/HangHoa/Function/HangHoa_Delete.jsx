import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../../utils/api/requestHelpers';
import moment from 'moment';

const { confirm } = Modal;

const RemoveProduct = ({ productId, updatedAt, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Sử dụng cả productId và updatedAt trong URL
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/products/${productId}/${updatedAt}`);
      message.success('Xóa hàng hóa thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa hàng hóa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa hàng hóa',
      icon: <ExclamationCircleOutlined />,
      // Cập nhật câu thông báo để hiển thị cả ngày cập nhật
      content: `Bạn có chắc chắn muốn xóa hàng hóa "${productId}" với ngày cập nhật "${moment(updatedAt).format('DD/MM/YYYY')}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (productId && updatedAt) {
      showDeleteConfirm();
    }
  }, [productId, updatedAt]);

  return null;
};

export default RemoveProduct;