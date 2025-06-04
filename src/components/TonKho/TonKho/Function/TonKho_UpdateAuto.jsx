import React, { useEffect, useState } from 'react';
import { Modal, Select, Button, message } from 'antd';
import dayjs from 'dayjs';
import { fetchDataList, createItem, deleteItemById } from '../../../utils/api/requestHelpers';

const { Option } = Select;

const TonKho_UpdateAuto = ({ visible, onClose, onRefresh, disabled }) => {
    const [yearOptions, setYearOptions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const stockInData = await fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in');
                const years = [...new Set(stockInData.map(item => dayjs(item.ngay_nhap_hang).year()))];
                setYearOptions(years.sort((a, b) => b - a));
            } catch (error) {
                message.error('Không thể lấy danh sách năm.');
            }
        };
        if (visible) fetchYears();
    }, [visible]);

    const handleUpdateInventory = async () => {
        if (yearOptions.length === 0) return message.warning('Không có năm nào để xử lý');
        setLoading(true);
        try {
            // Lấy dữ liệu ban đầu từ API
            const [stockInData, stockOutData, inventoryData] = await Promise.all([
                fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-in'),
                fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/stock-out'),
                fetchDataList('https://dx.hoangphucthanh.vn:3000/warehouse/inventory'),
            ]);

            // === Lưu lại mapping tồn kho tối thiểu cũ cho từng mã hàng ===
            // Ưu tiên lấy tồn kho tối thiểu của năm mới nhất (nếu có nhiều năm)
            const mucTonToiThieuMap = {};
            inventoryData.forEach(item => {
                if (
                    !mucTonToiThieuMap[item.ma_hang] ||
                    (item.nam > mucTonToiThieuMap[item.ma_hang].nam)
                ) {
                    mucTonToiThieuMap[item.ma_hang] = {
                        muc_ton_toi_thieu: item.muc_ton_toi_thieu,
                        nam: item.nam
                    };
                }
            });

            for (const year of yearOptions) {
                // Bước 1: Xóa các bản ghi tồn kho cũ của năm
                const inventoryToDelete = inventoryData.filter(item => item.nam === year);
                if (inventoryToDelete.length > 0) {
                    await Promise.all(
                        inventoryToDelete.map(item =>
                            deleteItemById(`https://dx.hoangphucthanh.vn:3000/warehouse/inventory/${item.ma_inventory}`)
                        )
                    );
                    console.log(`Đã xóa ${inventoryToDelete.length} bản ghi tồn kho của năm ${year}.`);
                } else {
                    console.log(`Không có bản ghi nào để xóa trong năm ${year}.`);
                }

                // Bước 2: Tạo danh sách mã hàng duy nhất từ stock-in
                const productMap = {};
                stockInData.forEach(item => {
                    if (!productMap[item.ma_hang]) {
                        productMap[item.ma_hang] = {
                            ma_hang: item.ma_hang,
                            ten_kho: item.ten_kho,
                            tong_nhap: 0,
                            tong_xuat: 0,
                            tong_nhap_truoc: 0,
                            tong_xuat_truoc: 0
                        };
                    }
                });

                // Bước 3: Tính tổng nhập – xuất từng mã hàng theo từng năm
                for (const item of stockInData) {
                    const y = dayjs(item.ngay_nhap_hang).year();
                    if (productMap[item.ma_hang]) {
                        if (y === year) productMap[item.ma_hang].tong_nhap += item.so_luong_nhap;
                        else if (y < year) productMap[item.ma_hang].tong_nhap_truoc += item.so_luong_nhap;
                    }
                }

                for (const item of stockOutData) {
                    const y = dayjs(item.ngay_xuat_hang).year();
                    if (productMap[item.ma_hang]) {
                        if (y === year) productMap[item.ma_hang].tong_xuat += item.so_luong_xuat;
                        else if (y < year) productMap[item.ma_hang].tong_xuat_truoc += item.so_luong_xuat;
                    }
                }

                // Bước 5: Ghi tồn kho mới
                let stt = 1;
                for (const ma_hang in productMap) {
                    const p = productMap[ma_hang];
                    const ton_truoc_do = p.tong_nhap_truoc - p.tong_xuat_truoc;
                    const ton_hien_tai = ton_truoc_do + p.tong_nhap - p.tong_xuat;

                    // === Lấy tồn kho tối thiểu cũ nếu có, nếu không thì mặc định 2 ===
                    const muc_ton_toi_thieu =
                        mucTonToiThieuMap[ma_hang]?.muc_ton_toi_thieu !== undefined
                            ? mucTonToiThieuMap[ma_hang].muc_ton_toi_thieu
                            : 0;

                    const newItem = {
                        nam: year,
                        stt: stt,
                        ma_inventory: `TK${year}${String(stt).padStart(3, '0')}`,
                        ma_hang,
                        ten_kho: p.ten_kho,
                        ton_truoc_do,
                        tong_nhap: p.tong_nhap,
                        tong_xuat: p.tong_xuat,
                        ton_hien_tai,
                        muc_ton_toi_thieu
                    };

                    try {
                        await createItem('https://dx.hoangphucthanh.vn:3000/warehouse/inventory', newItem);
                    } catch (error) {
                        console.error('Lỗi khi thêm mới bản ghi:', error.response?.data || error.message);
                        throw new Error(`Lỗi thêm mới: ${error.response?.data?.message || error.message}`);
                    }

                    stt++;
                }

                console.log(`Cập nhật tồn kho cho năm ${year} thành công.`);
            }

            message.success('Cập nhật tồn kho cho tất cả các năm thành công!');
            onClose();
            onRefresh();
        } catch (error) {
            console.error('Lỗi khi cập nhật tồn kho:', error);
            message.error(`Lỗi cập nhật tồn kho: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Lấy dữ liệu tồn kho theo năm"
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Button type="primary" loading={loading} onClick={handleUpdateInventory} disabled={disabled}>
                Bắt đầu lấy dữ liệu
            </Button>
        </Modal>
    );
};

export default TonKho_UpdateAuto;