import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../../utils/api/requestHelpers';

const { confirm } = Modal;

const RemoveProductType = ({ product_typeId, product_typeName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/product-types/${product_typeId}`);
      message.success('Xóa loại hàng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa loại hàng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa loại hàng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa loại hàng "${product_typeName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (product_typeId && product_typeName) {
      showDeleteConfirm();
    }
  }, [product_typeId, product_typeName]);

  return null;
};

export default RemoveProductType;
