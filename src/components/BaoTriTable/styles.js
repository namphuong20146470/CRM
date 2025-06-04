// Styles for BaoTriTable component

// Tùy chỉnh style cho form
export const formItemStyle = {
  labelCol: { style: { color: "#000 !important" } }, // Màu chữ của label là đen
};

export const inputStyle = {
  color: "#000 !important", // Màu chữ trong ô input là đen
  backgroundColor: "#fff !important", // Nền trắng
  borderColor: "#d9d9d9 !important", // Viền xám nhạt
  "-webkit-text-fill-color": "#000 !important", // Đảm bảo cho trình duyệt Webkit
};

export const searchInputStyle = {
  color: "#000 !important", // Màu chữ trong ô tìm kiếm là đen
  backgroundColor: "#fff !important", // Nền trắng
  borderColor: "#d9d9d9 !important",
  "-webkit-text-fill-color": "#000 !important", // Đảm bảo cho trình duyệt Webkit
};

export const buttonStyle = {
  backgroundColor: "#28a745", 
  borderColor: "#28a745", 
  color: "#000"
};

export const primaryButtonStyle = {
  backgroundColor: "#1890ff", 
  borderColor: "#1890ff", 
  color: "#000"
};

export const cancelButtonStyle = {
  marginLeft: 8, 
  backgroundColor: "#f0f0f0", 
  borderColor: "#d9d9d9", 
  color: "#000"
};

// CSS tùy chỉnh để đảm bảo màu chữ là đen
export const customStyles = `
  .custom-input,
  .custom-input input,
  .custom-input textarea,
  .custom-input input[type="date"],
  .custom-search input,
  .custom-input input::placeholder,
  .custom-input textarea::placeholder,
  .custom-search input::placeholder {
    color: #000 !important;
    background-color: #fff !important;
    -webkit-text-fill-color: #000 !important; /* Đảm bảo cho trình duyệt Webkit */
    opacity: 1 !important; /* Đảm bảo không bị mờ */
  }
  .ant-form-item-label > label {
    color: #000 !important; /* Đảm bảo màu chữ của label là đen */
  }
  .ant-table-thead th {
    color: #000 !important; /* Màu chữ tiêu đề bảng là đen */
  }
  .ant-table-cell {
    color: #000 !important; /* Màu chữ trong ô bảng là đen */
  }
  .ant-modal-title {
    color: #000 !important; /* Màu chữ tiêu đề modal là đen */
  }
  .ant-btn-default,
  .ant-btn-primary {
    color: #000 !important; /* Màu chữ của nút là đen */
  }
  .ant-input,
  .ant-input-affix-wrapper {
    color: #000 !important;
    background-color: #fff !important;
    -webkit-text-fill-color: #000 !important;
  }
  .ant-input::placeholder {
    color: #000 !important;
    -webkit-text-fill-color: #000 !important;
  }
`; 