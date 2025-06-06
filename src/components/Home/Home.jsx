import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import SearchBar from './SearchBar/SearchBar.home';
import FilterDialog from './FilterDialog/FilterDialog.home';
import ImportDialog from './ImportDialog/ImportDialog.home';
import TableSection from './TableSection/TableSection.home';
import EditDialog from './EditDialog/EditDialog.home';
import AddColumnSection from './AddColumnSection/AddColumnSection.home';

const ITEMS_PER_PAGE = 10;

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const [searchId, setSearchId] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const [newField, setNewField] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const [selectedIds, setSelectedIds] = useState([]);

  const fileInputRef = React.useRef(null);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    loai_bao_tri: [],
    nguyen_nhan_hu_hong: [],
    ket_qua: [],
    startDate: '',
    endDate: '',
    mo_ta_cong_viec: [],
  });

  const [loaiBaoTriOptions, setLoaiBaoTriOptions] = useState([]);
  const [moTaOptions, setMoTaOptions] = useState([]);
  const [ketQuaOptions, setKetQuaOptions] = useState([]);
  const [nguyenNhanHuHongOptions, setNguyenNhanHuHongOptions] = useState([]);

  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?all_data');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data);
        const uniqueLoaiBaoTri = [...new Set(result.data.map((item) => item.loai_bao_tri).filter(Boolean))];
        const uniqueMoTa = [...new Set(result.data.map((item) => item.mo_ta_cong_viec).filter(Boolean))];
        const uniqueKetQua = [...new Set(result.data.map((item) => item.ket_qua).filter(Boolean))];
        const uniqueNguyenNhanHuHong = [
          ...new Set(result.data.map((item) => item.nguyen_nhan_hu_hong).filter(Boolean)),
        ];
        setLoaiBaoTriOptions(uniqueLoaiBaoTri);
        setMoTaOptions(uniqueMoTa);
        setKetQuaOptions(uniqueKetQua);
        setNguyenNhanHuHongOptions(uniqueNguyenNhanHuHong);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterByYear = (year) => {
    setSelectedYear(year);
    let filtered = [...data];

    if (year) {
      filtered = filtered.filter((row) => {
        const startYear = new Date(row.ngay_bat_dau).getFullYear();
        const endYear = new Date(row.ngay_hoan_thanh).getFullYear();
        return startYear === parseInt(year) || endYear === parseInt(year);
      });
    }

    if (searchId) {
      filtered = filtered.filter((row) =>
        String(row.id_thiet_bi).toLowerCase().includes(searchId.toLowerCase())
      );
    }
    if (Array.isArray(filterCriteria.loai_bao_tri) && filterCriteria.loai_bao_tri.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.loai_bao_tri.includes(row.loai_bao_tri));
    }
    if (Array.isArray(filterCriteria.mo_ta_cong_viec) && filterCriteria.mo_ta_cong_viec.length > 0) {
      filtered = filtered.filter((row) =>
        filterCriteria.mo_ta_cong_viec.includes(row.mo_ta_cong_viec)
      );
    }
    if (Array.isArray(filterCriteria.ket_qua) && filterCriteria.ket_qua.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.ket_qua.includes(row.ket_qua));
    }
    if (filterCriteria.startDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_bat_dau) >= new Date(filterCriteria.startDate)
      );
    }
    if (filterCriteria.endDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_hoan_thanh) <= new Date(filterCriteria.endDate)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  };

  const handleAddColumn = async () => {
    const dataToSend = {
      id_thiet_bi: 'TB111',
      ngay_bat_dau: '2025-02-17',
      ngay_hoan_thanh: '2025-02-17',
      loai_bao_tri: 'Định kỳ',
      nguoi_phu_trach: 'TNP',
      mo_ta_cong_viec: 'Kiểm tra máy bơm',
      nguyen_nhan_hu_hong: 'Không có',
      ket_qua: 'Hoạt động ko tốt',
      lich_tiep_theo: '2025-03-17',
      trang_thai: 'Hoàn thành',
      khach_hang: 'TNP',
      vi_tri_lap_dat: 'TPHCM',
      hinh_anh: '',
      [newField]: '',
    };
    try {
      const res = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?add_extended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      const result = await res.json();
      if (result.success) {
        setColumns([...columns, newField]);
        setNewField('');
        fetchData();
      } else {
        console.error('Failed to add column:', result.message);
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleCheckboxChange = (idOrIds) => {
    if (Array.isArray(idOrIds)) {
      setSelectedIds(idOrIds);
    } else {
      setSelectedIds((prev) =>
        prev.includes(idOrIds)
          ? prev.filter((id) => id !== idOrIds)
          : [...prev, idOrIds]
      );
    }
  };

  const handleEditClick = (row) => {
    setEditFormData(row);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditFormData({});
  };

  const handleInputChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
        handleEditClose();
      } else {
        console.error('Update failed:', result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleImportClick = () => setImportDialogOpen(true);
  const handleImportClose = () => {
    setImportDialogOpen(false);
    setSelectedFile(null);
    setImportStatus({ loading: false, error: null, success: false });
  };

  const handleImport = async () => {
    if (!selectedFile)
      return setImportStatus({ loading: false, error: 'Vui lòng chọn file CSV', success: false });
    setImportStatus({ loading: true, error: null, success: false });
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const dataRows = lines.slice(1).filter((line) => line.trim());
      for (const row of dataRows) {
        const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const rowData = Object.fromEntries(
          headers.map((h, i) => [h.trim(), values[i]?.trim().replace(/^"|"$/g, '') || ''])
        );
        const mappedData = {
          id_bao_tri: rowData['ID Bảo Trì'] || '0',
          id_thiet_bi: rowData['ID Thiết Bị'] || '0',
          loai_thiet_bi: rowData['Loại Thiết Bị'] || '',
          khach_hang: rowData['Khách Hàng'] || '',
          vi_tri_lap_dat: rowData['Vị Trí Lắp Đặt'] || '',
          ngay_bat_dau: rowData['Ngày Bắt Đầu'] || '',
          ngay_hoan_thanh: rowData['Ngày Hoàn Thành'] || '',
          loai_bao_tri: rowData['Loại Bảo Trì'] || '',
          nguoi_phu_trach: rowData['Người Phụ Trách'] || '',
          mo_ta_cong_viec: rowData['Mô Tả Công Việc'] || '',
          nguyen_nhan_hu_hong: rowData['Nguyên Nhân Hư Hỏng'] || '',
          ket_qua: rowData['Kết Quả'] || '',
          lich_tiep_theo: rowData['Lịch Tiếp Theo'] || '',
          trang_thai: rowData['Trạng Thái'] || '',
          hinh_anh: rowData['Hình Ảnh'] || '',
          ...Object.fromEntries(columns.map((col) => [col, rowData[col] || ''])),
        };
        const res = await fetch('https://ebaotri.hoangphucthanh.vn/index.php?add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedData),
        });
        const responseData = await res.json();
        if (!responseData.success) throw new Error('Import failed: ' + responseData.message);
      }
      setImportStatus({ loading: false, error: null, success: true });
      fetchData();
      setTimeout(handleImportClose, 2000);
    } catch (error) {
      setImportStatus({ loading: false, error: error.message, success: false });
    }
  };

  useEffect(() => {
    let filtered = [...data];
    if (searchId) {
      filtered = filtered.filter((row) =>
        String(row.id_thiet_bi).toLowerCase().includes(searchId.toLowerCase())
      );
    }
    if (Array.isArray(filterCriteria.loai_bao_tri) && filterCriteria.loai_bao_tri.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.loai_bao_tri.includes(row.loai_bao_tri));
    }
    if (Array.isArray(filterCriteria.mo_ta_cong_viec) && filterCriteria.mo_ta_cong_viec.length > 0) {
      filtered = filtered.filter((row) =>
        filterCriteria.mo_ta_cong_viec.includes(row.mo_ta_cong_viec)
      );
    }
    if (Array.isArray(filterCriteria.ket_qua) && filterCriteria.ket_qua.length > 0) {
      filtered = filtered.filter((row) => filterCriteria.ket_qua.includes(row.ket_qua));
    }
    if (filterCriteria.startDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_bat_dau) >= new Date(filterCriteria.startDate)
      );
    }
    if (filterCriteria.endDate) {
      filtered = filtered.filter(
        (row) => new Date(row.ngay_hoan_thanh) <= new Date(filterCriteria.endDate)
      );
    }
    if (selectedYear) {
      filtered = filtered.filter((row) => {
        const startYear = new Date(row.ngay_bat_dau).getFullYear();
        const endYear = new Date(row.ngay_hoan_thanh).getFullYear();
        return startYear === parseInt(selectedYear) || endYear === parseInt(selectedYear);
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [searchId, filterCriteria, data, selectedYear]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage]);

  const handleFilterClick = () => setFilterDialogOpen(true);
  const handleFilterClose = () => setFilterDialogOpen(false);
  const handleFilterApply = () => setFilterDialogOpen(false);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (Array.isArray(filterCriteria[name])) {
      const newValue = typeof value === 'string' ? value.split(',') : value;
      setFilterCriteria((prev) => ({ ...prev, [name]: newValue }));
    } else {
      setFilterCriteria((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleFilterClear = () => {
    setFilterCriteria({
      loai_bao_tri: [],
      nguyen_nhan_hu_hong: [],
      ket_qua: [],
      startDate: '',
      endDate: '',
      mo_ta_cong_viec: [],
    });
    setSearchId('');
    setSelectedYear('');
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <SearchBar
        searchId={searchId}
        setSearchId={setSearchId}
        handleFilterClick={handleFilterClick}
        isMobile={isMobile}
      />
      <FilterDialog
        filterDialogOpen={filterDialogOpen}
        handleFilterClose={handleFilterClose}
        filterCriteria={filterCriteria}
        handleFilterChange={handleFilterChange}
        handleFilterApply={handleFilterApply}
        handleFilterClear={handleFilterClear}
        loaiBaoTriOptions={loaiBaoTriOptions}
        moTaOptions={moTaOptions}
        ketQuaOptions={ketQuaOptions}
        nguyenNhanHuHongOptions={nguyenNhanHuHongOptions}
        isMobile={isMobile}
      />
      <ImportDialog
        importDialogOpen={importDialogOpen}
        handleImportClose={handleImportClose}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        importStatus={importStatus}
        setImportStatus={setImportStatus}
        handleFileChange={handleFileChange}
        handleImport={handleImport}
        fileInputRef={fileInputRef}
        filteredData={filteredData}
        columns={columns}
        isMobile={isMobile}
        handleImportClick={handleImportClick}
        selectedIds={selectedIds}
      />
      <TableSection
        paginatedData={paginatedData}
        filteredData={filteredData} // Truyền filteredData vào TableSection
        columns={columns}
        handleEditClick={handleEditClick}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobile={isMobile}
        selectedIds={selectedIds}
        handleCheckboxChange={handleCheckboxChange}
        filterByYear={filterByYear}
      />
      <EditDialog
        editDialogOpen={editDialogOpen}
        handleEditClose={handleEditClose}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleSave={handleSave}
        handleInputChange={handleInputChange}
        isMobile={isMobile}
      />
      <AddColumnSection
        newField={newField}
        setNewField={setNewField}
        handleAddColumn={handleAddColumn}
        isMobile={isMobile}
      />
    </Box>
  );
}

export default Home;