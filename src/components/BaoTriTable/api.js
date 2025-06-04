// API services for BaoTriTable component
import { API_URL, IMPORT_API_URL, EDIT_API_URL, DELETE_API_URL } from './constants';

// Fetch all maintenance types data
export const fetchMaintenanceTypes = async () => {
  try {
    const response = await fetch(API_URL);
    const result = await response.json();
    
    if (result.success) {
      // Add sequential numbers to the data
      const dataWithSTT = result.data.map((item, index) => ({
        ...item,
        STT: index + 1,
      }));
      return { success: true, data: dataWithSTT };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return { 
      success: false, 
      message: "Lỗi khi lấy dữ liệu từ server!" 
    };
  }
};

// Add a new maintenance type
export const addMaintenanceType = async (values) => {
  try {
    const response = await fetch(IMPORT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding new record:", error);
    return { 
      success: false, 
      message: "Lỗi khi thêm mới!" 
    };
  }
};

// Update an existing maintenance type
export const updateMaintenanceType = async (id, values) => {
  try {
    const updatedData = {
      id,
      ...values,
    };
    
    const response = await fetch(EDIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error updating record:", error);
    return { 
      success: false, 
      message: "Lỗi khi chỉnh sửa!" 
    };
  }
};

// Delete a maintenance type
export const deleteMaintenanceType = async (id) => {
  try {
    const response = await fetch(DELETE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error deleting record:", error);
    return { 
      success: false, 
      message: "Lỗi khi xóa!" 
    };
  }
};

// Import data from Excel file
export const importFromExcel = async (importData) => {
  try {
    const response = await fetch(IMPORT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(importData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error importing data:", error);
    return { 
      success: false, 
      message: "Lỗi khi import dữ liệu!" 
    };
  }
}; 