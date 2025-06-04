import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Pagination,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import QRCode from 'react-qr-code';

function TableSection({
  paginatedData,
  filteredData, // Thêm prop filteredData
  columns,
  handleEditClick,
  totalPages,
  currentPage,
  setCurrentPage,
  isMobile,
  selectedIds,
  handleCheckboxChange,
  filterByYear,
}) {
  // Tạo danh sách các năm (từ 2020 đến năm hiện tại + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2020 + i); // Ví dụ: [2020, 2021, ..., 2025]

  // Trạng thái để lưu năm được chọn
  const [selectedYear, setSelectedYear] = useState('');

  // Xử lý khi người dùng chọn năm
  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);

    if (year) {
      // Lọc các bản ghi KHÔNG thuộc năm được chọn từ filteredData
      const recordsNotInYear = filteredData.filter((row) => {
        const startYear = new Date(row.ngay_bat_dau).getFullYear();
        const endYear = new Date(row.ngay_hoan_thanh).getFullYear();
        return startYear !== parseInt(year) && endYear !== parseInt(year);
      });

      // Lấy danh sách id_thiet_bi của các bản ghi không thuộc năm đó
      const idsNotInYear = recordsNotInYear.map((row) => row.id_thiet_bi);

      // Cập nhật selectedIds để tự động chọn các bản ghi không thuộc năm đó
      handleCheckboxChange(idsNotInYear);
    } else {
      // Nếu chọn "Tất cả", bỏ chọn tất cả
      handleCheckboxChange([]);
    }

    // Gọi hàm filterByYear để lọc dữ liệu hiển thị
    filterByYear(year);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            sx={{
              boxShadow: { xs: 'none', sm: '0 4px 6px rgba(0,0,0,0.1)' },
              borderRadius: { xs: 0, sm: 2 },
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                height: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: 4,
              },
            }}
          >
            {/* Tiêu đề và dropdown chọn năm */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 3,
                px: 2,
                borderBottom: '1px solid #e0e0e0',
              }}
            >
<Typography
  variant="h5"
  sx={{
    fontSize: { xs: '1.25rem', sm: '1.5rem' },
    textAlign: 'right', // Center the text
  }}
>
  Danh sách bảo trì thiết bị
</Typography>
              <FormControl sx={{ minWidth: 120 }} size={isMobile ? 'small' : 'medium'}>
                <InputLabel id="year-select-label">Chọn năm</InputLabel>
                <Select
                  labelId="year-select-label"
                  id="year-select"
                  value={selectedYear}
                  label="Chọn năm"
                  onChange={handleYearChange}
                >
                  <MenuItem value="">
                    <em>Tất cả</em>
                  </MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    {[
                      'Chọn',
                      'ID Bảo Trì',
                      'ID Thiết Bị',
                      'ID SERIAL',
                      'Loại Thiết Bị',
                      'Khách Hàng',
                      'Vị Trí Lắp Đặt',
                      'Ngày Bắt Đầu',
                      'Ngày Hoàn Thành',
                      'Loại Bảo Trì',
                      'Người Phụ Trách',
                      'Mô Tả Công Việc',
                      'Nguyên Nhân Hư Hỏng',
                      'Kết Quả',
                      'Lịch Tiếp Theo',
                      'Trạng Thái',
                      'Hình Ảnh',
                      'Chỉnh Sửa',
                      ...columns,
                      'QR Code',
                    ].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          padding: { xs: '8px 12px', sm: '16px 24px' },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong>{col}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length ? (
                    paginatedData.map((row) => (
                      <TableRow
                        key={row.STT}
                        hover
                        sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                      >
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Checkbox
                            checked={selectedIds.includes(row.id_thiet_bi)}
                            onChange={() => handleCheckboxChange(row.id_thiet_bi)}
                            color="primary"
                            size={isMobile ? 'small' : 'medium'}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.id_bao_tri}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.id_thiet_bi}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.id_seri || 'N/A'}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.loai_thiet_bi}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.khach_hang}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.vi_tri_lap_dat}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.ngay_bat_dau}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.ngay_hoan_thanh}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.loai_bao_tri}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.nguoi_phu_trach}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.mo_ta_cong_viec}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.nguyen_nhan_hu_hong}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.ket_qua}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.lich_tiep_theo}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.trang_thai}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.hinh_anh || 'N/A'}
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditClick(row)}
                            sx={{
                              minWidth: { xs: 70, sm: 100 },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              px: { xs: 1, sm: 2 },
                            }}
                          >
                            Chỉnh sửa
                          </Button>
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell
                            key={col}
                            sx={{
                              padding: { xs: '8px 12px', sm: '16px 24px' },
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row[col] || 'N/A'}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            padding: { xs: '8px 12px', sm: '16px 24px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <QRCode
                            value={`https://ebaotri.hoangphucthanh.vn/index.php?id=${row.id_thiet_bi}/${encodeURIComponent(
                              row.vi_tri_lap_dat || ''
                            )}/id_seri=${row.id_seri || ''}`}
                            size={isMobile ? 48 : 64}
                            level="L"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={18 + columns.length}
                        align="center"
                        sx={{
                          padding: { xs: '8px 12px', sm: '16px 24px' },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        }}
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
        }}
      >
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(e, v) => {
            setCurrentPage(v);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          color="primary"
          size={isMobile ? 'small' : 'medium'}
        />
      </Box>
    </>
  );
}

export default TableSection;