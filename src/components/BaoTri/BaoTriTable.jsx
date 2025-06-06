import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Space, message, Modal, Form, Select } from "antd";
import { customStyles } from "../../styles/baoTriStyles";
import { TABLE_COLUMNS } from "../../constants/baoTriConstants";
import { 
  fetchMaintenanceTypes, 
  addMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  importFromExcel
} from "../../services/baoTriService";
import { exportToExcel, parseExcelFile } from "../../utils/excel/excelUtils";
import MaintenanceTypeForm from "./MaintenanceTypeForm";
import ActionButtonGroup from "./ActionButtonGroup";

const { Option } = Select;

const BaoTriTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from API
  const loadData = async () => {
    const result = await fetchMaintenanceTypes();
    if (result.success) {
      setData(result.data);
      setFilteredData(result.data);
    } else {
      message.error("Lỗi khi lấy dữ liệu: " + result.message);
    }
  };

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    if (value === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.ma_loai_bao_tri
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      ma_loai_bao_tri: record.ma_loai_bao_tri,
      loai_bao_tri: record.loai_bao_tri,
      trang_thai: record.trang_thai,
      nguoi_cap_nhat: record.nguoi_cap_nhat,
      ngay_cap_nhat: record.ngay_cap_nhat,
      mo_ta: record.mo_ta,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (values) => {
    const result = await updateMaintenanceType(currentRecord.id, values);
    
    if (result.success) {
      message.success("Chỉnh sửa thành công!");
      setIsEditModalOpen(false);
      loadData();
    } else {
      message.error("Lỗi: " + result.message);
    }
  };

  // Handle delete functionality
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      const result = await deleteMaintenanceType(id);
      
      if (result.success) {
        message.success("Xóa thành công!");
        loadData();
      } else {
        message.error("Lỗi: " + result.message);
      }
    }
  };

  // Handle add button click
  const handleAddNew = () => {
    setIsAddModalOpen(true);
    form.resetFields();
  };

  // Handle add form submission
  const handleAddSubmit = async (values) => {
    const result = await addMaintenanceType(values);
    
    if (result.success) {
      message.success("Thêm mới thành công!");
      setIsAddModalOpen(false);
      loadData();
    } else {
      message.error("Lỗi: " + result.message);
    }
  };

  // Handle export to Excel
  const handleExport = () => {
    if (exportToExcel(filteredData)) {
      message.success("Xuất file Excel thành công!");
    } else {
      message.error("Xuất file không thành công!");
    }
  };

  // Handle import from Excel
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importData = await parseExcelFile(file);
      const result = await importFromExcel(importData);
      
      if (result.success) {
        message.success(result.message || "Nhập dữ liệu thành công!");
        loadData();
      } else {
        message.error("Lỗi khi import: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi import file:", error);
      message.error("Lỗi khi import file Excel!");
    } finally {
      fileInputRef.current.value = null;
    }
  };

  // Add action column to table columns
  const columnsWithActions = [
    ...TABLE_COLUMNS,
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px"
    }}>
      {/* Add custom styles */}
      <style>{customStyles}</style>

      {/* Action buttons and search */}
      <ActionButtonGroup
        searchText={searchText}
        onSearch={handleSearch}
        onImportClick={handleImport}
        onExportClick={handleExport}
        onAddClick={handleAddNew}
        fileInputRef={fileInputRef}
      />

      {/* Table header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 16px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: "8px 8px 0 0",
        marginTop: "20px"
      }}>
        <h2 style={{ 
          fontSize: "1.2rem",
          fontWeight: "500",
          margin: "0", 
          color: "#000000",
          textAlign: "left"
        }}>
          Danh sách bảo trì thiết bị
        </h2>
        <Select
          placeholder="Chọn năm"
          style={{ width: 120 }}
          allowClear
        >
          <Option value="">Tất cả</Option>
          <Option value="2023">2023</Option>
          <Option value="2024">2024</Option>
          <Option value="2025">2025</Option>
          <Option value="2026">2026</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columnsWithActions}
        rowKey="id"
        pagination={{ pageSize: 10, position: ["bottomCenter"] }}
        bordered
        style={{ 
          borderRadius: "0 0 8px 8px",
          overflow: "hidden" 
        }}
      />

      {/* Add modal */}
      <Modal
        title="Thêm mới loại bảo trì"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <MaintenanceTypeForm
          form={form}
          onFinish={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          submitButtonText="Thêm mới"
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Chỉnh sửa loại bảo trì"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <MaintenanceTypeForm
          form={form}
          onFinish={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          submitButtonText="Cập nhật"
        />
      </Modal>
    </div>
  );
};

export default BaoTriTable; 
import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Space, message, Modal, Form, Select } from "antd";
import { customStyles } from "../../styles/baoTriStyles";
import { TABLE_COLUMNS } from "../../constants/baoTriConstants";
import { 
  fetchMaintenanceTypes, 
  addMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  importFromExcel
} from "../../services/baoTriService";
import { exportToExcel, parseExcelFile } from "../../utils/excel/excelUtils";
import MaintenanceTypeForm from "./MaintenanceTypeForm";
import ActionButtonGroup from "./ActionButtonGroup";

const { Option } = Select;

const BaoTriTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data from API
  const loadData = async () => {
    const result = await fetchMaintenanceTypes();
    if (result.success) {
      setData(result.data);
      setFilteredData(result.data);
    } else {
      message.error("Lỗi khi lấy dữ liệu: " + result.message);
    }
  };

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchText(value);
    if (value === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) =>
        item.ma_loai_bao_tri
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  // Handle edit button click
  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      ma_loai_bao_tri: record.ma_loai_bao_tri,
      loai_bao_tri: record.loai_bao_tri,
      trang_thai: record.trang_thai,
      nguoi_cap_nhat: record.nguoi_cap_nhat,
      ngay_cap_nhat: record.ngay_cap_nhat,
      mo_ta: record.mo_ta,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (values) => {
    const result = await updateMaintenanceType(currentRecord.id, values);
    
    if (result.success) {
      message.success("Chỉnh sửa thành công!");
      setIsEditModalOpen(false);
      loadData();
    } else {
      message.error("Lỗi: " + result.message);
    }
  };

  // Handle delete functionality
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      const result = await deleteMaintenanceType(id);
      
      if (result.success) {
        message.success("Xóa thành công!");
        loadData();
      } else {
        message.error("Lỗi: " + result.message);
      }
    }
  };

  // Handle add button click
  const handleAddNew = () => {
    setIsAddModalOpen(true);
    form.resetFields();
  };

  // Handle add form submission
  const handleAddSubmit = async (values) => {
    const result = await addMaintenanceType(values);
    
    if (result.success) {
      message.success("Thêm mới thành công!");
      setIsAddModalOpen(false);
      loadData();
    } else {
      message.error("Lỗi: " + result.message);
    }
  };

  // Handle export to Excel
  const handleExport = () => {
    if (exportToExcel(filteredData)) {
      message.success("Xuất file Excel thành công!");
    } else {
      message.error("Xuất file không thành công!");
    }
  };

  // Handle import from Excel
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importData = await parseExcelFile(file);
      const result = await importFromExcel(importData);
      
      if (result.success) {
        message.success(result.message || "Nhập dữ liệu thành công!");
        loadData();
      } else {
        message.error("Lỗi khi import: " + result.message);
      }
    } catch (error) {
      console.error("Lỗi khi import file:", error);
      message.error("Lỗi khi import file Excel!");
    } finally {
      fileInputRef.current.value = null;
    }
  };

  // Add action column to table columns
  const columnsWithActions = [
    ...TABLE_COLUMNS,
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      backgroundColor: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px"
    }}>
      {/* Add custom styles */}
      <style>{customStyles}</style>

      {/* Action buttons and search */}
      <ActionButtonGroup
        searchText={searchText}
        onSearch={handleSearch}
        onImportClick={handleImport}
        onExportClick={handleExport}
        onAddClick={handleAddNew}
        fileInputRef={fileInputRef}
      />

      {/* Table header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 16px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f0f0f0",
        borderRadius: "8px 8px 0 0",
        marginTop: "20px"
      }}>
        <h2 style={{ 
          fontSize: "1.2rem",
          fontWeight: "500",
          margin: "0", 
          color: "#000000",
          textAlign: "left"
        }}>
          Danh sách bảo trì thiết bị
        </h2>
        <Select
          placeholder="Chọn năm"
          style={{ width: 120 }}
          allowClear
        >
          <Option value="">Tất cả</Option>
          <Option value="2023">2023</Option>
          <Option value="2024">2024</Option>
          <Option value="2025">2025</Option>
          <Option value="2026">2026</Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columnsWithActions}
        rowKey="id"
        pagination={{ pageSize: 10, position: ["bottomCenter"] }}
        bordered
        style={{ 
          borderRadius: "0 0 8px 8px",
          overflow: "hidden" 
        }}
      />

      {/* Add modal */}
      <Modal
        title="Thêm mới loại bảo trì"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <MaintenanceTypeForm
          form={form}
          onFinish={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          submitButtonText="Thêm mới"
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        title="Chỉnh sửa loại bảo trì"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <MaintenanceTypeForm
          form={form}
          onFinish={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          submitButtonText="Cập nhật"
        />
      </Modal>
    </div>
  );
};

export default BaoTriTable; 