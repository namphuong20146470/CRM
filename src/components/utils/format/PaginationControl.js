import React, { useEffect } from 'react';
import { Pagination } from 'antd';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import '../css/PaginationControl.css';

const PaginationControl = ({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onSizeChange,
}) => {
  const itemRender = (_, type, originalElement) => {
    if (type === 'prev') return <LeftOutlined />;
    if (type === 'next') return <RightOutlined />;
    if (type === 'jump-prev') return <DoubleLeftOutlined />;
    if (type === 'jump-next') return <DoubleRightOutlined />;
    return originalElement;
  };

  // ✅ Replace "/ page" thành "/ trang"
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // ✅ Đổi phần hiển thị đã chọn (ô dropdown đã sửa trước)
      const selectedItems = document.querySelectorAll('.ant-select-selection-item');
      selectedItems.forEach((item) => {
        if (item.innerText.includes('/ page')) {
          const newText = item.innerText.replace('/ page', '/ trang');
          item.innerText = newText;
          item.setAttribute('title', newText);
        }
      });
  
      // ✅ Đổi các mục trong danh sách dropdown
      const dropdownItems = document.querySelectorAll('.ant-select-item-option-content');
      dropdownItems.forEach((item) => {
        if (item.innerText.includes('/ page')) {
          const newText = item.innerText.replace('/ page', '/ trang');
          item.innerText = newText;
        }
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pagination-container">
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={onPageChange}
        onShowSizeChange={onSizeChange}
        showSizeChanger
        pageSizeOptions={['10', '20', '50', '100', '500', '1000']}
        showTotal={(total) => `Tổng ${total} dòng`}
        itemRender={itemRender}
      />
    </div>
  );
};

export default PaginationControl;
