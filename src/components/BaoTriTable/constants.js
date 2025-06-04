// Constants used in the BaoTriTable component

// API endpoints
export const API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?loai_bao_tri";
export const IMPORT_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?import_bao_tri";
export const EDIT_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?edit_bao_tri";
export const DELETE_API_URL = "https://ebaotri.hoangphucthanh.vn/index.php?delete_bao_tri";

// Column configuration for the table
export const TABLE_COLUMNS = [
  { title: "STT", dataIndex: "STT", key: "STT" },
  { title: "Mã loại bảo trì", dataIndex: "ma_loai_bao_tri", key: "ma_loai_bao_tri" },
  { title: "Loại bảo trì", dataIndex: "loai_bao_tri", key: "loai_bao_tri" },
  { title: "Trạng thái", dataIndex: "trang_thai", key: "trang_thai" },
  { title: "Người cập nhật", dataIndex: "nguoi_cap_nhat", key: "nguoi_cap_nhat" },
  { title: "Ngày cập nhật", dataIndex: "ngay_cap_nhat", key: "ngay_cap_nhat" },
  { title: "Mô tả", dataIndex: "mo_ta", key: "mo_ta" },
];

// Field names for Excel export/import mapping
export const EXPORT_FIELD_MAPPING = {
  STT: "STT",
  ma_loai_bao_tri: "Mã loại bảo trì",
  loai_bao_tri: "Loại bảo trì",
  trang_thai: "Trạng thái",
  nguoi_cap_nhat: "Người cập nhật",
  ngay_cap_nhat: "Ngày cập nhật",
  mo_ta: "Mô tả",
}; 