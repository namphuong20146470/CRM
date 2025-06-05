import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { confirm } = Modal;

const RemoveNhomKH = ({ nhomKHId, nhomKHName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await crmInstance.delete(`/customer-groups/${nhomKHId}`);
      message.success('Xóa nhóm khách hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa nhóm khách hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa nhóm khách hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa nhóm khách hàng "${nhomKHName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (nhomKHId && nhomKHName) {
      showDeleteConfirm();
    }
  }, [nhomKHId, nhomKHName]);

  return null;
};

export default RemoveNhomKH;