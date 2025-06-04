import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  TextField,
} from "@mui/material";

function FilterDialog({
  filterDialogOpen,
  handleFilterClose,
  filterCriteria,
  handleFilterChange,
  handleFilterApply,
  handleFilterClear,
  loaiBaoTriOptions,
  moTaOptions,
  ketQuaOptions,
  nguyenNhanHuHongOptions, // New prop for nguyen_nhan_hu_hong options
  isMobile,
}) {
  return (
    <Dialog open={filterDialogOpen} onClose={handleFilterClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        Filter Options
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Loại Bảo Trì
            </InputLabel>
            <Select
              multiple
              name="loai_bao_tri"
              value={
                Array.isArray(filterCriteria.loai_bao_tri)
                  ? filterCriteria.loai_bao_tri
                  : []
              }
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(", ")}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {loaiBaoTriOptions.map((type) => (
                <MenuItem
                  key={type}
                  value={type}
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <Checkbox
                    checked={
                      Array.isArray(filterCriteria.loai_bao_tri) &&
                      filterCriteria.loai_bao_tri.indexOf(type) > -1
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Mô Tả Công Việc
            </InputLabel>
            <Select
              multiple
              name="mo_ta_cong_viec" // Updated field name
              value={
                Array.isArray(filterCriteria.mo_ta_cong_viec)
                  ? filterCriteria.mo_ta_cong_viec
                  : []
              }
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(", ")}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {moTaOptions.map((desc) => (
                <MenuItem
                  key={desc}
                  value={desc}
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <Checkbox
                    checked={
                      Array.isArray(filterCriteria.mo_ta_cong_viec) &&
                      filterCriteria.mo_ta_cong_viec.indexOf(desc) > -1
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                  <ListItemText primary={desc} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Nguyên Nhân Hư Hỏng
            </InputLabel>
            <Select
              multiple
              name="nguyen_nhan_hu_hong" // Added new filter field
              value={
                Array.isArray(filterCriteria.nguyen_nhan_hu_hong)
                  ? filterCriteria.nguyen_nhan_hu_hong
                  : []
              }
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(", ")}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {nguyenNhanHuHongOptions.map((reason) => (
                <MenuItem
                  key={reason}
                  value={reason}
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <Checkbox
                    checked={
                      Array.isArray(filterCriteria.nguyen_nhan_hu_hong) &&
                      filterCriteria.nguyen_nhan_hu_hong.indexOf(reason) > -1
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                  <ListItemText primary={reason} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              Kết Quả Bảo Trì
            </InputLabel>
            <Select
              multiple
              name="ket_qua"
              value={
                Array.isArray(filterCriteria.ket_qua) ? filterCriteria.ket_qua : []
              }
              onChange={handleFilterChange}
              renderValue={(selected) => selected.join(", ")}
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              {ketQuaOptions.map((result) => (
                <MenuItem
                  key={result}
                  value={result}
                  sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                  <Checkbox
                    checked={
                      Array.isArray(filterCriteria.ket_qua) &&
                      filterCriteria.ket_qua.indexOf(result) > -1
                    }
                    size={isMobile ? "small" : "medium"}
                  />
                  <ListItemText primary={result} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Ngày Bắt Đầu"
            type="date"
            name="startDate"
            value={filterCriteria.startDate}
            onChange={handleFilterChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          />
          <TextField
            label="Ngày Hoàn Thành"
            type="date"
            name="endDate"
            value={filterCriteria.endDate}
            onChange={handleFilterChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleFilterClear}
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Xóa bộ lọc
        </Button>
        <Button
          variant="contained"
          onClick={handleFilterApply}
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilterDialog;