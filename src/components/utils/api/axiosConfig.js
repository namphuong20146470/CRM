import axios from 'axios';

// Instance for warehouse endpoints
const warehouseInstance = axios.create({
  baseURL: 'https://dx.hoangphucthanh.vn:3000/warehouse',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance for CRM endpoints
const crmInstance = axios.create({
  baseURL: 'https://dx.hoangphucthanh.vn:3000/crm',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For backward compatibility
const instance = warehouseInstance;

export { warehouseInstance, crmInstance };
export default instance; // Default is warehouse for backward compatibility