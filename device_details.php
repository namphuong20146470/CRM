<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>Chi tiết bảo trì thiết bị</title>
<style>
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 10px;
    background: #f0f2f5;
    color: #333;
}
.container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    box-sizing: border-box;
}
h1 {
    color: #1a73e8;
    text-align: center;
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: 600;
}
.device-info {
    background: #e3f2fd;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #1a73e8;
}
.device-info h2 {
    font-size: 18px;
    margin: 0 0 10px;
    color: #1a73e8;
}
.device-info p {
    margin: 8px 0;
    font-size: 14px;
    word-break: break-word;
}
.history-section {
    margin-top: 20px;
}
.history-section h2 {
    font-size: 18px;
    color: #d32f2f;
    border-bottom: 2px solid #d32f2f;
    padding-bottom: 5px;
    margin-bottom: 15px;
}
.table-container {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 15px;
}
.history-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 600px;
}
.history-table th, .history-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
    word-break: break-word;
}
.history-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #444;
    border-top: 2px solid #d32f2f;
    border-bottom: 2px solid #d32f2f;
    position: sticky;
    top: 0;
    z-index: 1;
}
.history-table td {
    background: #fff;
}
.history-table tr:hover td {
    background: #f5f5f5;
    transition: background 0.3s;
}
.next-maintenance {
    margin-top: 20px;
    padding: 15px;
    background: #e8f5e9;
    border-radius: 8px;
    border-left: 4px solid #2e7d32;
    font-size: 14px;
    font-weight: 500;
    word-break: break-word;
}
.home-button {
    display: block;
    width: 80%;
    max-width: 200px;
    margin: 20px auto 0;
    padding: 12px 0;
    background: #1a73e8;
    color: white;
    text-align: center;
    text-decoration: none;
    font-weight: bold;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: background-color 0.3s;
    font-size: 14px;
}
.home-button:hover {
    background: #0d47a1;
}
.error {
    text-align: center;
    color: #d32f2f;
    padding: 20px;
    background: #fde8e8;
    border-radius: 4px;
    margin-top: 20px;
    font-size: 14px;
}
.image-link {
    color: #1a73e8;
    text-decoration: none;
    font-weight: bold;
}
.image-link:hover {
    text-decoration: underline;
}
@media (max-width: 768px) {
    h1 {
        font-size: 20px;
    }
    .device-info {
        padding: 12px;
    }
    .device-info h2 {
        font-size: 16px;
    }
    .device-info p {
        font-size: 14px;
    }
    .history-section h2 {
        font-size: 16px;
    }
    .history-table th, .history-table td {
        padding: 8px;
        font-size: 13px;
    }
}
@media (max-width: 480px) {
    body {
        padding: 5px;
    }
    .container {
        padding: 10px;
    }
    h1 {
        font-size: 18px;
        margin-bottom: 10px;
    }
    .home-button {
        width: 100%;
        padding: 10px 0;
    }
}
</style>
</head>
<body>
<div class="container">
<?php if (!empty($deviceDetails) || !empty($maintenanceList)): ?>
    <h1>Thông tin bảo trì thiết bị #<?php echo htmlspecialchars($deviceDetails['id_thiet_bi'] ?? $maintenanceList[0]['id_thiet_bi'] ?? ''); ?></h1>
    <div class="device-info">
        <h2>Thông tin thiết bị</h2>
        <p><strong>Thiết bị:</strong> <?php echo htmlspecialchars($deviceDetails['loai_thiet_bi'] ?? 'Máy Nén Khí TB1001'); ?></p>
        <p><strong>Nhà cung cấp:</strong> <?php echo htmlspecialchars('Karz Storz'); ?></p>
        <p><strong>Tên Khách Hàng:</strong> <?php echo htmlspecialchars($deviceDetails['khach_hang'] ?? 'Bệnh viện Hoàn Mỹ Sài Gòn'); ?></p>
    </div>
    <div class="history-section">
        <h2>Lịch sử bảo trì</h2>
        <div class="table-container">
            <table class="history-table">
                <thead>
                    <tr>
                        <th>ID Số seri</th>
                        <th>Khu vực</th>
                        <th>Ngày</th>
                        <th>Loại</th>
                        <th>Nguyên nhân</th>
                        <th>Mô tả</th>
                        <th>Người phụ trách</th>
                        <th>Kết quả</th>
                        <th>Hình ảnh</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($maintenanceList as $record): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($record['id_seri'] ?? 'Không có'); ?></td>
                            <td><?php echo htmlspecialchars($record['vi_tri_lap_dat'] ?? ''); ?></td>
                            <td><?php echo htmlspecialchars($record['ngay_hoan_thanh']); ?></td>
                            <td><?php echo htmlspecialchars($record['loai_bao_tri']); ?></td>
                            <td><?php echo htmlspecialchars($record['nguyen_nhan_hu_hong']); ?></td>
                            <td><?php echo htmlspecialchars($record['mo_ta_cong_viec']); ?></td>
                            <td><?php echo htmlspecialchars($record['nguoi_phu_trach']); ?></td>
                            <td><?php echo htmlspecialchars($record['ket_qua']); ?></td>
                            <td>
                                <?php if ($record['hinh_anh']): ?>
                                    <a href="<?php echo htmlspecialchars($record['hinh_anh']); ?>" target="_blank" class="image-link">📎 Xem trước/sau</a>
                                <?php else: ?>
                                    Không có
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <div class="next-maintenance">
        <strong>Lịch bảo trì tiếp theo:</strong> <?php echo htmlspecialchars($deviceDetails['lich_tiep_theo'] ?? '15/06/2025'); ?>
    </div>
    <a href="https://baotri.hoangphucthanh.vn/" class="home-button">Về Trang Chủ</a>
<?php else: ?>
    <div class="error">Không tìm thấy thông tin bảo trì.</div>
    <a href="https://baotri.hoangphucthanh.vn/" class="home-button">Về Trang Chủ</a>
<?php endif; ?>
</div>
</body>
</html>