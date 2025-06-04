import React from "react";
import { Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { buttonStyle, searchInputStyle } from "./styles";

// Component for action buttons and search
const ActionButtonGroup = ({ 
  searchText, 
  onSearch, 
  onImportClick, 
  onExportClick, 
  onAddClick, 
  fileInputRef 
}) => {
  return (
    <Space style={{ marginBottom: "20px" }}>
      <Input
        placeholder="Tìm kiếm theo Mã loại bảo trì"
        value={searchText}
        onChange={(e) => onSearch(e.target.value)}
        prefix={<SearchOutlined />}
        allowClear
        className="custom-search"
        style={searchInputStyle}
      />
      
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={onImportClick}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      
      <Button
        style={buttonStyle}
        onClick={() => fileInputRef.current.click()}
      >
        Nhập File
      </Button>
      
      <Button
        style={buttonStyle}
        onClick={onExportClick}
      >
        Xuất File
      </Button>
      
      <Button
        style={buttonStyle}
        onClick={onAddClick}
      >
        Thêm mới
      </Button>
    </Space>
  );
};

export default ActionButtonGroup; 