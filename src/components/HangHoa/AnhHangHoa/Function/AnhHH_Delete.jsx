import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { deleteItemById } from '../../../utils/api/requestHelpers';

const { confirm } = Modal;

const RemoveContractType = ({ contract_typeId, contract_typeName, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/contract-types/${contract_typeId}`);
      message.success('Xóa loại hợp đồng thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      message.error(`Không thể xóa loại hợp đồng: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Xác nhận xóa loại hợp đồng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa loại hợp đồng "${contract_typeName}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleDelete,
      onCancel,
    });
  };

  useEffect(() => {
    if (contract_typeId && contract_typeName) {
      showDeleteConfirm();
    }
  }, [contract_typeId, contract_typeName]);

  return null;
};

export default RemoveContractType;
