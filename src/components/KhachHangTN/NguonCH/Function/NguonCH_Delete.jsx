import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { confirm } = Modal;

const RemoveNguonCH = ({ nguonCHId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Use the CRM API endpoint with the correct path
      await crmInstance.delete(`/opportunity-sources/${nguonCHId}`);
      message.success('Xóa Nguồn cơ hội thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa Nguồn cơ hội: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa Nguồn cơ hội',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa Nguồn cơ hội "${nguonCHId}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (nguonCHId) {
      showDeleteConfirm();
    }
  }, [nguonCHId]);

  return null;
};

export default RemoveNguonCH;