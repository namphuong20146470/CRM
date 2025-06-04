import { message } from 'antd';
import { fetchDataList } from './requestHelpers';

export const fetchAndSetList = async (endpoint, setState, errorMsg) => {
  try {
    const data = await fetchDataList(endpoint);
    setState(data);
  } catch (error) {
    console.error(errorMsg, error);
    message.error(errorMsg);
  }
};
