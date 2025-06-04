import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../../utils/api/requestHelpers';

const { confirm } = Modal;

const RemoveOrderDetail = ({ order_detailId, customerName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/order-details/${order_detailId}`);
      message.success('Xóa chi tiết đơn hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa chi tiết đơn hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa chi tiết đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa chi tiết đơn hàng "${order_detailId}" của khách hàng "${customerName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (order_detailId && customerName) {
      showDeleteConfirm();
    }
  }, [order_detailId, customerName]);

  return null;
};

export default RemoveOrderDetail;
