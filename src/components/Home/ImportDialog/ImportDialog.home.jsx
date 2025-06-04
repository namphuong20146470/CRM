import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

function ImportDialog({
  importDialogOpen,
  handleImportClose,
  selectedFile,
  setSelectedFile,
  importStatus,
  setImportStatus,
  handleFileChange,
  handleImport,
  fileInputRef,
  filteredData,
  columns,
  isMobile,
  handleImportClick,
  selectedIds, // Quay lại sử dụng selectedIds
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", sm: "flex-end" },
        gap: 2,
        mb: 3,
        flexWrap: "wrap",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleImportClick}
        sx={{
          minWidth: { xs: 90, sm: 100 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          px: 2,
          py: 1,
          backgroundColor: "#1976d2",
          "&:hover": { backgroundColor: "#1565c0" },
        }}
      >
        Import
      </Button>
      <Dialog open={importDialogOpen} onClose={handleImportClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Import CSV File
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <input
              accept=".csv"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
              id="contained-button-file"
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                component="span"
                fullWidth
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, py: 1 }}
              >
                Select CSV File
              </Button>
            </label>
            {selectedFile && (
              <Typography sx={{ mt: 2, fontSize: { xs: "0.75rem", sm: "1rem" } }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
            {importStatus.loading && (
              <Typography
                sx={{ mt: 2, color: "text.secondary", fontSize: { xs: "0.75rem", sm: "1rem" } }}
              >
                Importing...
              </Typography>
            )}
            {importStatus.error && (
              <Typography
                sx={{ mt: 2, color: "error.main", fontSize: { xs: "0.75rem", sm: "1rem" } }}
              >
                {importStatus.error}
              </Typography>
            )}
            {importStatus.success && (
              <Typography
                sx={{ mt: 2, color: "success.main", fontSize: { xs: "0.75rem", sm: "1rem" } }}
              >
                Import completed!
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleImportClose}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            color="primary"
            disabled={!selectedFile || importStatus.loading}
            size={isMobile ? "small" : "medium"}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {importStatus.loading ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          if (!selectedIds || selectedIds.length === 0) {
            alert("Please select at least one device to export.");
            return;
          }

          const headers = [
            "STT",
            "ID Bảo Trì",
            "ID Thiết Bị",
            "ID Số Seri",
            "Loại Thiết Bị",
            "Khách Hàng",
            "Vị Trí Lắp Đặt",
            "Ngày Bắt Đầu",
            "Ngày Hoàn Thành",
            "Loại Bảo Trì",
            "Người Phụ Trách",
            "Mô Tả Công Việc",
            "Nguyên Nhân Hư Hỏng",
            "Kết Quả",
            "Lịch Tiếp Theo",
            "Trạng Thái",
            "Hình Ảnh",
            ...columns,
          ];
          const csvContent = [
            headers.join(","),
            ...filteredData
              .filter((row) => selectedIds.includes(row.id_thiet_bi)) // Lọc các bản ghi dựa trên selectedIds
              .map((row) =>
                [
                  row.STT || "",
                  row.id_bao_tri || "",
                  row.id_thiet_bi || "",
                  row.id_seri || "",
                  row.loai_thiet_bi || "",
                  row.khach_hang || "",
                  row.vi_tri_lap_dat || "",
                  row.ngay_bat_dau || "",
                  row.ngay_hoan_thanh || "",
                  row.loai_bao_tri || "",
                  row.nguoi_phu_trach || "",
                  `"${(row.mo_ta_cong_viec || "").replace(/"/g, '""')}"`,
                  `"${(row.nguyen_nhan_hu_hong || "").replace(/"/g, '""')}"`,
                  `"${(row.ket_qua || "").replace(/"/g, '""')}"`,
                  row.lich_tiep_theo || "",
                  row.trang_thai || "",
                  row.hinh_anh || "",
                  ...columns.map((col) => `"${(row[col] || "").replace(/"/g, '""')}"`),
                ].join(",")
              ),
          ].join("\n");
          const link = document.createElement("a");
          link.href = encodeURI("data:text/csv;charset=utf-8," + csvContent);
          link.download = `bao-tri-thiet-bi-${new Date().toISOString().slice(0, 10)}.csv`;
          link.click();
        }}
        sx={{
          minWidth: { xs: 90, sm: 100 },
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          px: 2,
          py: 1,
          backgroundColor: "#ab47bc",
          "&:hover": { backgroundColor: "#9c27b0" },
        }}
      >
        Export
      </Button>
    </Box>
  );
}

export default ImportDialog;