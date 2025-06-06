import axios from 'axios';

// Use the correct base URL for your API
axios.defaults.baseURL = 'https://dx.hoangphucthanh.vn:3000';

// For browser environments, we can't use Node's https module
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: 'https://dx.hoangphucthanh.vn:3000',
  });
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return instance;
};

export default createAxiosInstance();