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

            // === Tạo tập hợp tất cả các cặp (ma_hang, ten_kho, nam) xuất hiện ở stock-in hoặc stock-out ===
            const allKeysSet = new Set();
            // Từ stock-in
            stockInData.forEach(item => {
                const year = dayjs(item.ngay_nhap_hang).year();
                allKeysSet.add(`${item.ma_hang}|||${item.ten_kho}|||${year}`);
            });
            // Từ stock-out
            stockOutData.forEach(item => {
                const year = dayjs(item.ngay_xuat_hang).year();
                allKeysSet.add(`${item.ma_hang}|||${item.ten_kho}|||${year}`);
            });

            // Gom lại thành mảng các object
            const allKeys = Array.from(allKeysSet).map(key => {
                const [ma_hang, ten_kho, nam] = key.split('|||');
                return { ma_hang, ten_kho, nam: Number(nam) };
            });

            // Xử lý từng năm
            for (const year of yearOptions) {
                // Xóa inventory cũ của năm này
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

                // Lọc ra các cặp (ma_hang, ten_kho) có phát sinh trong năm này
                const keysForYear = allKeys.filter(k => k.nam === year);

                let stt = 1;
                for (const { ma_hang, ten_kho } of keysForYear) {
                    // Tính tổng nhập, xuất, nhập trước, xuất trước cho từng cặp mã hàng - kho
                    let tong_nhap = 0, tong_xuat = 0, tong_nhap_truoc = 0, tong_xuat_truoc = 0;

                    stockInData.forEach(item => {
                        if (item.ma_hang === ma_hang && item.ten_kho === ten_kho) {
                            const y = dayjs(item.ngay_nhap_hang).year();
                            if (y === year) tong_nhap += item.so_luong_nhap;
                            else if (y < year) tong_nhap_truoc += item.so_luong_nhap;
                        }
                    });

                    stockOutData.forEach(item => {
                        if (item.ma_hang === ma_hang && item.ten_kho === ten_kho) {
                            const y = dayjs(item.ngay_xuat_hang).year();
                            if (y === year) tong_xuat += item.so_luong_xuat;
                            else if (y < year) tong_xuat_truoc += item.so_luong_xuat;
                        }
                    });

                    const ton_truoc_do = tong_nhap_truoc - tong_xuat_truoc;
                    const ton_hien_tai = ton_truoc_do + tong_nhap - tong_xuat;

                    const muc_ton_toi_thieu =
                        mucTonToiThieuMap[ma_hang]?.muc_ton_toi_thieu !== undefined
                            ? mucTonToiThieuMap[ma_hang].muc_ton_toi_thieu
                            : 0;

                    const newItem = {
                        nam: year,
                        stt: stt,
                        ma_inventory: `TK${year}${String(stt).padStart(3, '0')}`,
                        ma_hang,
                        ten_kho,
                        ton_truoc_do,
                        tong_nhap,
                        tong_xuat,
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