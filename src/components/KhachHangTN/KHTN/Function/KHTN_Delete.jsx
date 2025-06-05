import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { crmInstance } from '../../../utils/api/axiosConfig';

const { confirm } = Modal;

const RemoveKhachHangTN = ({ khachHangId, khachHangName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await crmInstance.delete(`/potential-customers/${khachHangId}`);
      message.success('Xóa khách hàng tiềm năng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa khách hàng tiềm năng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa khách hàng tiềm năng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa khách hàng "${khachHangName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (khachHangId) {
      showDeleteConfirm();
    }
  }, [khachHangId]);

  return null;
};

export default RemoveKhachHangTN;