import moment from 'moment';

/**
 * formatDate
 * Hàm định dạng chuỗi ngày (ISO hoặc timestamp) sang định dạng DD/MM/YYYY.
 * Trả về '—' nếu định dạng không hợp lệ hoặc không có giá trị.
 * @param {string|Date} dateString - Chuỗi ngày cần định dạng.
 * @returns {string} - Chuỗi ngày đã định dạng hoặc '—'.
 */
export const formatDate = (dateString) => {
  if (!dateString) return ''; // nếu không có giá trị
  
  const m = moment(dateString);
  return m.isValid() ? m.format('DD.MM.YYYY') : ''; // kiểm tra tính hợp lệ
};
