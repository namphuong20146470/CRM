import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://dx.hoangphucthanh.vn:3000/warehouse',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;