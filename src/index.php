<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit("HTTP/1.1 200 OK");
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'H&ptiot2024');
define('DB_NAME', 'HOPT');

$connUser = new mysqli("localhost", "root", "H&ptiot2024", "user") or die("User DB failed: " . $connUser->connect_error);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME) or die("Connection failed: " . $conn->connect_error);
$conn->set_charset("utf8");

function handleDBQuery($conn, $query, $params = [], $types = '') {
    $stmt = $conn->prepare($query);
    if ($params) $stmt->bind_param($types, ...$params);
    $stmt->execute();
    return $stmt->get_result();
}

// Xử lý đăng ký
if (isset($_GET['register']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data['reg_username']) && isset($data['reg_password'])) {
        $stmt = $connUser->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $data['reg_username'], password_hash($data['reg_password'], PASSWORD_BCRYPT));
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Registration successful"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }
    echo json_encode(["success" => false, "message" => "Username and password required"]);
    exit;
}

// Xử lý đăng ký qua form
if (isset($_POST['register'])) {
    if (isset($_POST['reg_username']) && isset($_POST['reg_password'])) {
        $stmt = $connUser->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        $stmt->bind_param("ss", $_POST['reg_username'], password_hash($_POST['reg_password'], PASSWORD_BCRYPT));
        echo $stmt->execute() ? "<div class='alert alert-success'>Registration successful. <a href='#login'>Login here</a></div>" : "<div class='alert alert-danger'>Error: " . $stmt->error . "</div>";
        $stmt->close();
    } else {
        echo "<div class='alert alert-warning'>Username and password required.</div>";
    }
}

// Xử lý đăng nhập
if (isset($_POST['login'])) {
    if (isset($_POST['login_username']) && isset($_POST['login_password'])) {
        $stmt = $connUser->prepare("SELECT password FROM users WHERE username = ?");
        $stmt->bind_param("s", $_POST['login_username']);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($hashed_password);
            $stmt->fetch();
            if (password_verify($_POST['login_password'], $hashed_password)) {
                $_SESSION['username'] = $_POST['login_username'];
                header("Location: index.php");
                exit;
            }
            echo "<div class='alert alert-danger'>Invalid password</div>";
        } else {
            echo "<div class='alert alert-danger'>Username not found</div>";
        }
        $stmt->close();
    } else {
        echo "<div class='alert alert-warning'>Username and password required.</div>";
    }
}

// Xử lý API JSON
if (isset($_GET['all_data']) || isset($_GET['latest']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
    header("Content-Type: application/json");

    if (isset($_GET['login']) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (isset($data['login_username']) && isset($data['login_password'])) {
            $stmt = $connUser->prepare("SELECT password FROM users WHERE username = ?");
            $stmt->bind_param("s", $data['login_username']);
            $stmt->execute();
            $stmt->store_result();
            if ($stmt->num_rows > 0) {
                $stmt->bind_result($hashed_password);
                $stmt->fetch();
                if (password_verify($data['login_password'], $hashed_password)) {
                    $_SESSION['username'] = $data['login_username'];
                    echo json_encode(["success" => true, "message" => "Login successful"]);
                } else {
                    echo json_encode(["success" => false, "message" => "Invalid password"]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Username not found"]);
            }
            $stmt->close();
            exit;
        }
        echo json_encode(["success" => false, "message" => "Username and password required"]);
        exit;
    }

    if (isset($_GET['id'])) {
        if (!is_numeric($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            exit;
        }
        $stmt = $conn->prepare("SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh FROM bao_tri_1 WHERE id_thiet_bi = ? ORDER BY ngay_hoan_thanh DESC");
        $stmt->bind_param("i", $_GET['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode($data ? ["success" => true, "data" => $data] : ["success" => false, "message" => "No data found"], JSON_UNESCAPED_UNICODE);
        $stmt->close();
        exit;
    }

    if (isset($_GET['all_data'])) {
        // Get all column names from the table
        $columnsResult = $conn->query("SHOW COLUMNS FROM bao_tri_1");
        $columns = [];
        $dateColumns = ['ngay_bat_dau', 'ngay_hoan_thanh', 'lich_tiep_theo'];
        
        // Build a dynamic select statement that formats date columns
        $selectParts = [];
        while ($column = $columnsResult->fetch_assoc()) {
            $columnName = $column['Field'];
            $columns[] = $columnName;
            
            if (in_array($columnName, $dateColumns)) {
                $selectParts[] = "DATE_FORMAT($columnName, '%Y-%m-%d') AS $columnName";
            } else {
                $selectParts[] = $columnName;
            }
        }
        
        $selectSql = implode(", ", $selectParts);
        $result = $conn->query("SELECT $selectSql FROM bao_tri_1 ORDER BY ngay_hoan_thanh DESC");
        
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (isset($_GET['latest'])) {
        $result = handleDBQuery($conn, "SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh FROM bao_tri_1 ORDER BY ngay_hoan_thanh DESC LIMIT 1");
        $data = $result->fetch_assoc();
        echo json_encode($data ? ["success" => true, "data" => $data] : ["success" => false, "message" => "No data found"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && !isset($_GET['update']) && !isset($_GET['delete']) && !isset($_GET['add_extended'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'khach_hang'")->num_rows) $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN khach_hang VARCHAR(255)");
        if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'vi_tri_lap_dat'")->num_rows) $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN vi_tri_lap_dat VARCHAR(255)");

        if (isset($data[0]) && is_array($data)) {
            $conn->begin_transaction();
            $stmt = $conn->prepare("INSERT INTO bao_tri_1 (id_thiet_bi, ngay_bat_dau, ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, lich_tiep_theo, trang_thai, khach_hang, vi_tri_lap_dat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $results = ['success' => 0, 'failed' => 0, 'errors' => []];
            foreach ($data as $i => $r) {
                $stmt->bind_param("isssssssssss", $r['id_thiet_bi'], $r['ngay_bat_dau'], $r['ngay_hoan_thanh'], $r['loai_bao_tri'], $r['nguoi_phu_trach'], $r['mo_ta_cong_viec'], $r['nguyen_nhan_hu_hong'], $r['ket_qua'], $r['lich_tiep_theo'], $r['trang_thai'], $r['khach_hang'], $r['vi_tri_lap_dat']);
                $stmt->execute() ? $results['success']++ : $results['failed']++ && $results['errors'][] = "Row " . ($i + 1) . ": " . $stmt->error;
            }
            if ($results['failed']) {
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Import failed", "details" => $results]);
            } else {
                $conn->commit();
                echo json_encode(["success" => true, "message" => "Imported " . $results['success'] . " records"]);
            }
            $stmt->close();
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO bao_tri_1 (id_thiet_bi, ngay_bat_dau, ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, lich_tiep_theo, trang_thai, khach_hang, vi_tri_lap_dat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssssssssss", $data['id_thiet_bi'], $data['ngay_bat_dau'], $data['ngay_hoan_thanh'], $data['loai_bao_tri'], $data['nguoi_phu_trach'], $data['mo_ta_cong_viec'], $data['nguyen_nhan_hu_hong'], $data['ket_qua'], $data['lich_tiep_theo'], $data['trang_thai'], $data['khach_hang'], $data['vi_tri_lap_dat']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record added"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['add_extended'])) {
        $rawInput = file_get_contents("php://input");
        $json = json_decode($rawInput, true);
        if (!$json) {
            echo json_encode(["success" => false, "message" => "Invalid JSON: " . json_last_error_msg()]);
            exit();
        }

        $standardFields = [
            'id_bao_tri' => 'INT',
            'id_thiet_bi' => 'INT',
            'loai_thiet_bi' => 'VARCHAR(255)',
            'khach_hang' => 'VARCHAR(255)',
            'vi_tri_lap_dat' => 'VARCHAR(255)',
            'ngay_bat_dau' => 'DATE',
            'ngay_hoan_thanh' => 'DATE',
            'loai_bao_tri' => 'VARCHAR(255)',
            'nguoi_phu_trach' => 'VARCHAR(255)',
            'mo_ta_cong_viec' => 'TEXT',
            'nguyen_nhan_hu_hong' => 'TEXT',
            'ket_qua' => 'TEXT',
            'lich_tiep_theo' => 'DATE',
            'trang_thai' => 'VARCHAR(100)',
            'hinh_anh' => 'TEXT'
        ];

        foreach ($standardFields as $field => $type) {
            $escapedField = $conn->real_escape_string($field);
            $check = $conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE '$escapedField'");
            if ($check->num_rows === 0) {
                if ($conn->query("ALTER TABLE bao_tri_1 ADD COLUMN `$escapedField` $type")) {
                    error_log("Added standard column: $escapedField");
                } else {
                    echo json_encode(["success" => false, "message" => "Failed to add column $escapedField: " . $conn->error]);
                    exit();
                }
            }
        }

        $addedColumns = [];
        foreach ($json as $key => $value) {
            if (!array_key_exists($key, $standardFields)) {
                $escapedKey = $conn->real_escape_string($key);
                $check = $conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE '$escapedKey'");
                if ($check->num_rows === 0) {
                    if ($conn->query("ALTER TABLE bao_tri_1 ADD COLUMN `$escapedKey` VARCHAR(255)")) {
                        $addedColumns[] = $key;
                        error_log("Added new column: $escapedKey");
                    } else {
                        echo json_encode(["success" => false, "message" => "Failed to add column $escapedKey: " . $conn->error]);
                        exit();
                    }
                }
            }
        }

        if (!isset($json['id_thiet_bi']) || empty($json['id_thiet_bi']) || $json['id_thiet_bi'] === null) {
            $json['id_thiet_bi'] = 'DEFAULT-' . time();
        }

        $columns = array_keys($json);
        $placeholders = array_fill(0, count($columns), '?');
        $values = array_values($json);

        $types = str_repeat('s', count($values));
        $sql = "INSERT INTO bao_tri_1 (" . implode(", ", array_map([$conn, 'real_escape_string'], $columns)) . ") VALUES (" . implode(", ", $placeholders) . ")";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "message" => "SQL preparation failed: " . $conn->error,
                "columns_added" => $addedColumns
            ]);
            exit();
        }

        $stmt->bind_param($types, ...$values);
        $result = $stmt->execute();
        $stmt->close();

        if ($result) {
            echo json_encode([
                "success" => true,
                "message" => "Data added successfully with new field(s)",
                "columns_added" => $addedColumns,
                "data_inserted" => $json,
                "last_insert_id" => $conn->insert_id
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Insertion failed: " . $conn->error,
                "columns_added" => $addedColumns,
                "data_attempted" => $json
            ]);
        }
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['update'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['STT'])) {
            echo json_encode(["success" => false, "message" => "Invalid data or missing STT"]);
            exit;
        }
        $STT = $data['STT'];
        unset($data['STT']);
        if (empty($data)) {
            echo json_encode(["success" => false, "message" => "No fields to update"]);
            exit;
        }

        $addedColumns = [];
        foreach ($data as $key => $value) {
            $escapedKey = $conn->real_escape_string($key);
            $check = $conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE '$escapedKey'");
            if ($check->num_rows === 0) {
                if ($conn->query("ALTER TABLE bao_tri_1 ADD COLUMN `$escapedKey` VARCHAR(255)")) {
                    $addedColumns[] = $key;
                }
            }
        }

        $fields = $values = [];
        $types = "";
        foreach ($data as $k => $v) {
            $fields[] = "`$k` = ?";
            $values[] = $v;
            $types .= "s";
        }

        if (empty($fields)) {
            echo json_encode(["success" => false, "message" => "No valid fields"]);
            exit;
        }

        $values[] = $STT;
        $types .= "i";
        $stmt = $conn->prepare("UPDATE bao_tri_1 SET " . implode(", ", $fields) . " WHERE STT = ?");
        $stmt->bind_param($types, ...$values);
        $result = $stmt->execute();
        echo $result ?
            json_encode(["success" => true, "message" => "Update successful", "columns_added" => $addedColumns]) :
            json_encode(["success" => false, "message" => "Update error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['delete'])) {
        $stmt = $conn->prepare("DELETE FROM bao_tri_1 WHERE STT = ?");
        $stmt->bind_param("i", $_POST['STT']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record deleted"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['delete'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['STT'])) {
            echo json_encode(["success" => false, "message" => "Missing STT"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM bao_tri_1 WHERE STT = ?");
        $stmt->bind_param("i", $data['STT']);
        echo $stmt->execute() ? json_encode(["success" => true, "message" => "Record deleted"]) : json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        $stmt->close();
        exit;
    }

    exit;
}

$data = [];
$deviceDetails = [];
$maintenanceList = [];

if (isset($_GET['id'])) {
    $parts = explode('/', $_GET['id']);
    if (count($parts) >= 2 && is_numeric($parts[0])) {
        $id_thiet_bi = $parts[0];
        $khu_vuc = isset($parts[1]) ? urldecode($parts[1]) : '';
        $id_seri = '';
        if (isset($_GET['id_seri'])) {
            $id_seri = urldecode($_GET['id_seri']);
        }

        // Lấy thông tin thiết bị (dùng record đầu tiên làm đại diện)
        $stmt = $conn->prepare("SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh FROM bao_tri_1 WHERE id_thiet_bi = ? ORDER BY ngay_hoan_thanh DESC LIMIT 1");
        $stmt->bind_param("i", $id_thiet_bi);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $deviceDetails = $row;
        }
        $stmt->close();

        // Lấy danh sách bảo trì dựa trên id_thiet_bi, khu_vuc, và id_seri
        $whereClauses = ["id_thiet_bi = ?"];
        $params = [$id_thiet_bi];
        $types = "i";

        if (!empty($khu_vuc)) {
            $whereClauses[] = "vi_tri_lap_dat LIKE ?";
            $params[] = "%" . $khu_vuc . "%";
            $types .= "s";
        }
        if (!empty($id_seri)) {
            // Giả định id_seri là một trường mới, bạn cần thêm cột 'id_seri' vào bảng bao_tri_1 nếu chưa có
            $whereClauses[] = "id_seri = ?";
            $params[] = $id_seri;
            $types .= "s";
            // Thêm cột id_seri nếu chưa tồn tại
            if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'id_seri'")->num_rows) {
                $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN id_seri VARCHAR(255)");
            }
        }

        $whereSql = implode(" AND ", $whereClauses);
        $stmt = $conn->prepare("SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh, id_seri FROM bao_tri_1 WHERE $whereSql ORDER BY ngay_hoan_thanh DESC");
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $maintenanceList[] = $row;
        }
        $stmt->close();
    }
}
?>
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
min-width: 600px; /* Ensures minimum width for scrolling */
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
/* Responsive adjustments */
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
<!-- <p><strong>Loại:</strong> <?php echo htmlspecialchars($deviceDetails['loai_thiet_bi'] ?? 'Máy nén khí'); ?></p> -->
<p><strong>Nhà cung cấp:</strong> <?php echo htmlspecialchars('Karz Storz'); ?></p>
<p><strong>Tên Khách Hàng:</strong> <?php echo htmlspecialchars($deviceDetails['khach_hang'] ?? 'Bệnh viện Hoàn Mỹ Sài Gòn'); ?></p>
<!-- <p><strong>Lắp đặt tại:</strong> <?php echo htmlspecialchars($deviceDetails['vi_tri_lap_dat'] ?? ''); ?> (Khu vực: <?php echo htmlspecialchars($khu_vuc); ?>)</p> -->
<!-- <p><strong>ID Số seri:</strong> <?php echo htmlspecialchars($id_seri ?: 'Không có'); ?></p> -->
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
<?php
$conn->close();
?>