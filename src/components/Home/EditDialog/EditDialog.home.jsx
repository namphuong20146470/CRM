import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
} from "@mui/material";

function EditDialog({
  editDialogOpen,
  handleEditClose,
  editFormData,
  setEditFormData,
  handleSave,
  handleInputChange,
  isMobile,
}) {
  return (
    <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        Chỉnh sửa thông tin bảo trì
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ py: 2 }}>
          {[
            "id_bao_tri:ID Bảo Trì", // Read-only field
            "id_thiet_bi:ID Thiết Bị",
            "id_seri:ID Serial", // Thêm trường id_seri vào form
            "loai_thiet_bi:Loại Thiết Bị",
            "khach_hang:Khách Hàng",
            "vi_tri_lap_dat:Vị Trí Lắp Đặt",
            "ngay_bat_dau:Ngày Bắt Đầu:date",
            "ngay_hoan_thanh:Ngày Hoàn Thành:date",
            "loai_bao_tri:Loại Bảo Trì",
            "nguoi_phu_trach:Người Phụ Trách",
            "mo_ta_cong_viec:Mô Tả Công Việc::3",
            "nguyen_nhan_hu_hong:Nguyên Nhân Hư Hỏng::3",
            "ket_qua:Kết Quả::3",
            "lich_tiep_theo:Lịch Tiếp Theo:date",
            "trang_thai:Trạng Thái",
            "hinh_anh:Hình Ảnh::3",
          ].map((field) => {
            const [name, label, type, rows] = field.split(":");
            return (
              <Grid item xs={12} sm={6} key={name}>
                <TextField
                  name={name}
                  label={label}
                  type={type || "text"}
                  value={editFormData[name] || ""}
                  onChange={handleInputChange}
                  fullWidth
                  multiline={!!rows}
                  rows={rows ? parseInt(rows) : undefined}
                  InputLabelProps={type === "date" ? { shrink: true } : undefined}
                  sx={{
                    "& .MuiInputBase-root": { fontSize: { xs: "0.875rem", sm: "1rem" } },
                  }}
                  // Làm cho id_bao_tri không thể chỉnh sửa (read-only)
                  InputProps={
                    name === "id_bao_tri"
                      ? { readOnly: true }
                      : undefined
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleEditClose}
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditDialog;