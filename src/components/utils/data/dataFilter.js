// Trả về danh sách giá trị duy nhất từ data
export const getUniqueValues = (data, accessor) => {
    return [...new Set(data.map(accessor).filter(Boolean))];
  };
  
  // Hàm lọc chung có thể tùy biến theo điều kiện
  export const applyFilters = (data, filters, customFilterLogic) => {
    return data.filter((item) => {
      if (!item) return false;
      return customFilterLogic(item, filters);
    });
  };
  