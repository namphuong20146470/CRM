const defaultHeaders = { 'Content-Type': 'application/json' };

// Hàm fetch danh sách dữ liệu
export const fetchDataList = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: defaultHeaders,
    });

    if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);

    const data = await response.json();
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Dữ liệu không hợp lệ từ server');
    }

    return data.data;
  } catch (error) {
    console.error('fetchDataList error:', error);
    throw error;
  }
};

// Hàm cập nhật dữ liệu theo ID
export const updateItemById = async (url, values) => {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Lỗi cập nhật: ${response.status}`;

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Chi tiết lỗi cập nhật:', errorData);
      }

      throw new Error(errorMessage);
    }

    return await response.json().catch(() => ({}));
  } catch (error) {
    console.error('updateItemById error:', error);
    throw error;
  }
};

// Hàm tạo mới dữ liệu
export const createItem = async (url, values) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(values),
    });

    console.log('HTTP Status:', response.status);
    console.log('HTTP Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Lỗi thêm mới: ${response.status}`;

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Chi tiết lỗi từ server:', errorData);
      }

      throw new Error(errorMessage);
    }

    return await response.json().catch(() => ({}));
  } catch (error) {
    console.error('createItem error:', error);
    throw error;
  }
};

// Hàm xóa dữ liệu theo ID
export const deleteItemById = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Lỗi xóa: ${response.status}`;

      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Chi tiết lỗi xóa:', errorData);
      }

      throw new Error(errorMessage);
    }

    return await response.json().catch(() => ({}));
  } catch (error) {
    console.error('deleteItemById error:', error);
    throw error;
  }
};
