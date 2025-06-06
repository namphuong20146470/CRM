import moment from 'moment';

/**
 * Chuyển đổi các trường ngày trong object sang định dạng 'YYYY-MM-DD'
 * @param {Object} item - object dữ liệu
 * @param {Array<string>} dateFields - danh sách tên trường ngày
 * @returns {Object} object mới với các trường ngày đã chuyển đổi
 */
export const convertDateFields = (item, dateFields = []) => {
  const result = { ...item };
  dateFields.forEach(field => {
    if (item[field]) {
      const input = item[field].toString().trim();
      // Chỉ chấp nhận đúng định dạng dd.mm.yyyy hoặc dd/mm/yyyy hoặc yyyy-mm-dd hoặc yyyy/mm/dd
      let m = null;
      let valid = false;

      // Kiểm tra định dạng dd.mm.yyyy hoặc dd/mm/yyyy
      let regex = /^(\d{2})[./](\d{2})[./](\d{4})$/;
      let match = input.match(regex);
      if (match) {
        const [, dd, mm, yyyy] = match;
        if (parseInt(dd, 10) >= 1 && parseInt(dd, 10) <= 31 && parseInt(mm, 10) >= 1 && parseInt(mm, 10) <= 12) {
          m = moment(input, ['DD.MM.YYYY', 'DD/MM/YYYY'], true);
          valid = m.isValid();
        }
      } else {
        // Kiểm tra định dạng yyyy-mm-dd hoặc yyyy/mm/dd
        regex = /^(\d{4})[-/](\d{2})[-/](\d{2})$/;
        match = input.match(regex);
        if (match) {
          const [, yyyy, mm, dd] = match;
          if (parseInt(dd, 10) >= 1 && parseInt(dd, 10) <= 31 && parseInt(mm, 10) >= 1 && parseInt(mm, 10) <= 12) {
            m = moment(input, ['YYYY-MM-DD', 'YYYY/MM/DD'], true);
            valid = m.isValid();
          }
        }
      }

      if (valid && m) {
        result[field] = m.format('YYYY-MM-DD');
      } else {
        result[field] = null;
        result[`invalid${field.charAt(0).toUpperCase() + field.slice(1)}`] = true;
      }
    }
  });
  return result;
};