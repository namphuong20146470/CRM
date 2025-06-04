import React from "react";
import { Form, Button, Input as AntdInput } from "antd";
import { formItemStyle, inputStyle, primaryButtonStyle, cancelButtonStyle } from "./styles";

// Reusable form component for both Add and Edit operations
const MaintenanceTypeForm = ({ form, initialValues, onFinish, onCancel, submitButtonText }) => {
  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      initialValues={initialValues}
      {...formItemStyle}
    >
      <Form.Item
        name="ma_loai_bao_tri"
        label="Mã loại bảo trì"
        rules={[{ required: true, message: "Vui lòng nhập mã loại bảo trì!" }]}
      >
        <AntdInput className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item
        name="loai_bao_tri"
        label="Loại bảo trì"
        rules={[{ required: true, message: "Vui lòng nhập loại bảo trì!" }]}
      >
        <AntdInput className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item
        name="trang_thai"
        label="Trạng thái"
        initialValue="Hoạt động"
      >
        <AntdInput className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item
        name="nguoi_cap_nhat"
        label="Người cập nhật"
        rules={[{ required: true, message: "Vui lòng nhập người cập nhật!" }]}
      >
        <AntdInput className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item
        name="ngay_cap_nhat"
        label="Ngày cập nhật"
        initialValue={new Date().toISOString().split("T")[0]}
      >
        <AntdInput type="date" className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item
        name="mo_ta"
        label="Mô tả"
      >
        <AntdInput.TextArea className="custom-input" style={inputStyle} />
      </Form.Item>
      
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={primaryButtonStyle}
        >
          {submitButtonText || "Lưu"}
        </Button>
        <Button
          style={cancelButtonStyle}
          onClick={onCancel}
        >
          Hủy
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MaintenanceTypeForm; 