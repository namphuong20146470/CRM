import { normalizeString } from '../../../utils/format/search';

export function filterHopDong(data, { searchTerm, yearFilter, contract_typeFilter, accountFilter, statusFilter }) {
    const normalizedSearch = normalizeString(searchTerm || '');
    
    return data.filter(item => {
      const matchesSearch =
        !searchTerm ||
        normalizeString(item.so_hop_dong).includes(normalizedSearch) ||
        normalizeString(item.doi_tac_lien_quan).includes(normalizedSearch);
  
      const matchesYear =
        yearFilter === 'all' ||
        new Date(item.ngay_ky_hop_dong).getFullYear().toString() === yearFilter;

      const matchesContractType =
        contract_typeFilter === 'all' || item.contract_type?.ten_loai_hop_dong === contract_typeFilter;
  
      const matchesAccount =
        accountFilter === 'all' || item.accounts?.ho_va_ten === accountFilter;
  
      const matchesStatus =
        statusFilter === 'all' || item.trang_thai_hop_dong === statusFilter;
  
      return matchesSearch && matchesYear && matchesContractType && matchesAccount && matchesStatus;
    });
  }
  