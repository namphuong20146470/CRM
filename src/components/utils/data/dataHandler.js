import { message } from 'antd';

export const handleGenericImport = (data, importedData, getKey = (d) => d.stt) => {
    const lastSTT = data.length > 0 ? getKey(data[data.length - 1]) : 0;
    return importedData.map((item, index) => ({
        ...item,
        stt: lastSTT + index + 1,
    }));
};

export const handleGenericExport = (data, exportFunc) => {
    try {
        exportFunc(data);
        message.success('Xuất file thành công!');
    } catch (err) {
        message.error('Xuất file thất bại!');
        console.error(err);
    }
};
