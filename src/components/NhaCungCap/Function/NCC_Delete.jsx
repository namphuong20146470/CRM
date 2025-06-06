import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../utils/api/requestHelpers';

const { confirm } = Modal;

const RemoveSupplier = ({ supplierId, supplierName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/suppliers/${supplierId}`);
      message.success('Xóa nhà cung cấp thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa nhà cung cấp: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (supplierId && supplierName) {
      showDeleteConfirm();
    }
  }, [supplierId, supplierName]);

  return null;
};

export default RemoveSupplier;
