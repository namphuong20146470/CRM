<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Xử lý CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    exit("HTTP/1.1 200 OK");
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Cấu hình kết nối database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'H&ptiot2024');
define('DB_NAME', 'HOPT');

// Kết nối database
$connUser = new mysqli("localhost", "root", "H&ptiot2024", "user") or die("User DB failed: " . $connUser->connect_error);
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME) or die("Connection failed: " . $conn->connect_error);
$conn->set_charset("utf8");

// Hàm xử lý truy vấn database
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
if (isset($_GET['all_data']) || isset($_GET['latest']) || isset($_GET['loai_bao_tri']) || isset($_GET['import_bao_tri']) || isset($_GET['edit_bao_tri']) || isset($_GET['delete_bao_tri']) || $_SERVER['REQUEST_METHOD'] === 'POST') {
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

    if (isset($_GET['id']) && !isset($_GET['id_seri'])) {
        if (!is_numeric($_GET['id'])) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            exit;
        }
        $stmt = $conn->prepare("SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh, id_seri FROM bao_tri_1 WHERE id_thiet_bi = ? ORDER BY ngay_hoan_thanh DESC");
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
        $columnsResult = $conn->query("SHOW COLUMNS FROM bao_tri_1");
        $columns = [];
        $dateColumns = ['ngay_bat_dau', 'ngay_hoan_thanh', 'lich_tiep_theo'];
        
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
        $result = handleDBQuery($conn, "SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh, id_seri FROM bao_tri_1 ORDER BY ngay_hoan_thanh DESC LIMIT 1");
        $data = $result->fetch_assoc();
        echo json_encode($data ? ["success" => true, "data" => $data] : ["success" => false, "message" => "No data found"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // API: Lấy toàn bộ dữ liệu từ bảng loai_bao_tri
    if (isset($_GET['loai_bao_tri'])) {
        $columnsResult = $conn->query("SHOW COLUMNS FROM loai_bao_tri");
        $columns = [];
        $dateColumns = ['ngay_cap_nhat'];

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
        $result = $conn->query("SELECT $selectSql FROM loai_bao_tri ORDER BY ngay_cap_nhat DESC");

        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // API: Thêm dữ liệu vào bảng loai_bao_tri
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['import_bao_tri'])) {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!$data) {
            echo json_encode(["success" => false, "message" => "Invalid JSON: " . json_last_error_msg()]);
            exit();
        }

        // Kiểm tra nếu dữ liệu là mảng (import nhiều bản ghi)
        if (isset($data[0]) && is_array($data)) {
            $conn->begin_transaction();
            $stmt = $conn->prepare("INSERT INTO loai_bao_tri (ma_loai_bao_tri, loai_bao_tri, trang_thai, nguoi_cap_nhat, ngay_cap_nhat, mo_ta) VALUES (?, ?, ?, ?, ?, ?)");
            $results = ['success' => 0, 'failed' => 0, 'errors' => []];

            foreach ($data as $i => $row) {
                // Kiểm tra các trường bắt buộc
                if (!isset($row['ma_loai_bao_tri']) || !isset($row['loai_bao_tri']) || !isset($row['nguoi_cap_nhat'])) {
                    $results['failed']++;
                    $results['errors'][] = "Row " . ($i + 1) . ": Missing required fields (ma_loai_bao_tri, loai_bao_tri, nguoi_cap_nhat)";
                    continue;
                }

                // Gán giá trị mặc định nếu không có
                $trang_thai = isset($row['trang_thai']) ? $row['trang_thai'] : 'Hoạt động';
                $ngay_cap_nhat = isset($row['ngay_cap_nhat']) ? $row['ngay_cap_nhat'] : date('Y-m-d');
                $mo_ta = isset($row['mo_ta']) ? $row['mo_ta'] : null;

                $stmt->bind_param(
                    "ssssss",
                    $row['ma_loai_bao_tri'],
                    $row['loai_bao_tri'],
                    $trang_thai,
                    $row['nguoi_cap_nhat'],
                    $ngay_cap_nhat,
                    $mo_ta
                );

                if ($stmt->execute()) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                    $results['errors'][] = "Row " . ($i + 1) . ": " . $stmt->error;
                }
            }

            if ($results['failed'] > 0) {
                $conn->rollback();
                echo json_encode(["success" => false, "message" => "Import failed", "details" => $results]);
            } else {
                $conn->commit();
                echo json_encode(["success" => true, "message" => "Imported " . $results['success'] . " records"]);
            }
            $stmt->close();
            exit;
        }

        // Import một bản ghi
        if (!isset($data['ma_loai_bao_tri']) || !isset($data['loai_bao_tri']) || !isset($data['nguoi_cap_nhat'])) {
            echo json_encode(["success" => false, "message" => "Missing required fields (ma_loai_bao_tri, loai_bao_tri, nguoi_cap_nhat)"]);
            exit;
        }

        // Gán giá trị mặc định nếu không có
        $trang_thai = isset($data['trang_thai']) ? $data['trang_thai'] : 'Hoạt động';
        $ngay_cap_nhat = isset($data['ngay_cap_nhat']) ? $data['ngay_cap_nhat'] : date('Y-m-d');
        $mo_ta = isset($data['mo_ta']) ? $data['mo_ta'] : null;

        $stmt = $conn->prepare("INSERT INTO loai_bao_tri (ma_loai_bao_tri, loai_bao_tri, trang_thai, nguoi_cap_nhat, ngay_cap_nhat, mo_ta) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "ssssss",
            $data['ma_loai_bao_tri'],
            $data['loai_bao_tri'],
            $trang_thai,
            $data['nguoi_cap_nhat'],
            $ngay_cap_nhat,
            $mo_ta
        );

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Record added", "last_insert_id" => $conn->insert_id]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        exit;
    }

    // API mới: Chỉnh sửa dữ liệu trong bảng loai_bao_tri
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['edit_bao_tri'])) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['id'])) {
            echo json_encode(["success" => false, "message" => "Invalid data or missing id"]);
            exit;
        }

        $id = $data['id'];
        unset($data['id']); // Loại bỏ id khỏi dữ liệu để không cập nhật vào câu lệnh SQL

        if (empty($data)) {
            echo json_encode(["success" => false, "message" => "No fields to update"]);
            exit;
        }

        // Chuẩn bị câu lệnh UPDATE
        $fields = [];
        $values = [];
        $types = "";
        foreach ($data as $key => $value) {
            // Chỉ cho phép cập nhật các trường có trong bảng
            if (in_array($key, ['ma_loai_bao_tri', 'loai_bao_tri', 'trang_thai', 'nguoi_cap_nhat', 'ngay_cap_nhat', 'mo_ta'])) {
                $fields[] = "`$key` = ?";
                $values[] = $value;
                $types .= "s"; // Tất cả các trường đều được coi là string
            }
        }

        if (empty($fields)) {
            echo json_encode(["success" => false, "message" => "No valid fields to update"]);
            exit;
        }

        $values[] = $id;
        $types .= "i"; // id là kiểu integer

        $sql = "UPDATE loai_bao_tri SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Record updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        exit;
    }

    // API mới: Xóa dữ liệu trong bảng loai_bao_tri
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['delete_bao_tri'])) {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['id'])) {
            echo json_encode(["success" => false, "message" => "Invalid data or missing id"]);
            exit;
        }

        $id = $data['id'];
        $stmt = $conn->prepare("DELETE FROM loai_bao_tri WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Record deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && !isset($_GET['update']) && !isset($_GET['delete']) && !isset($_GET['add_extended']) && !isset($_GET['import_bao_tri']) && !isset($_GET['edit_bao_tri']) && !isset($_GET['delete_bao_tri'])) {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'khach_hang'")->num_rows) $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN khach_hang VARCHAR(255)");
        if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'vi_tri_lap_dat'")->num_rows) $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN vi_tri_lap_dat VARCHAR(255)");
        if (!$conn->query("SHOW COLUMNS FROM bao_tri_1 LIKE 'id_seri'")->num_rows) $conn->query("ALTER TABLE bao_tri_1 ADD COLUMN id_seri VARCHAR(255)");

        if (isset($data[0]) && is_array($data)) {
            $conn->begin_transaction();
            $stmt = $conn->prepare("INSERT INTO bao_tri_1 (id_thiet_bi, ngay_bat_dau, ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, lich_tiep_theo, trang_thai, khach_hang, vi_tri_lap_dat, id_seri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $results = ['success' => 0, 'failed' => 0, 'errors' => []];
            foreach ($data as $i => $r) {
                $stmt->bind_param("issssssssssss", $r['id_thiet_bi'], $r['ngay_bat_dau'], $r['ngay_hoan_thanh'], $r['loai_bao_tri'], $r['nguoi_phu_trach'], $r['mo_ta_cong_viec'], $r['nguyen_nhan_hu_hong'], $r['ket_qua'], $r['lich_tiep_theo'], $r['trang_thai'], $r['khach_hang'], $r['vi_tri_lap_dat'], $r['id_seri']);
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

        $stmt = $conn->prepare("INSERT INTO bao_tri_1 (id_thiet_bi, ngay_bat_dau, ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, lich_tiep_theo, trang_thai, khach_hang, vi_tri_lap_dat, id_seri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("issssssssssss", $data['id_thiet_bi'], $data['ngay_bat_dau'], $data['ngay_hoan_thanh'], $data['loai_bao_tri'], $data['nguoi_phu_trach'], $data['mo_ta_cong_viec'], $data['nguyen_nhan_hu_hong'], $data['ket_qua'], $data['lich_tiep_theo'], $data['trang_thai'], $data['khach_hang'], $data['vi_tri_lap_dat'], $data['id_seri']);
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
            'hinh_anh' => 'TEXT',
            'id_seri' => 'VARCHAR(255)'
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

// Xử lý dữ liệu cho giao diện chi tiết thiết bị
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
        $stmt = $conn->prepare("SELECT STT, id_bao_tri, id_thiet_bi, loai_thiet_bi, khach_hang, vi_tri_lap_dat, DATE_FORMAT(ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, DATE_FORMAT(ngay_hoan_thanh, '%Y-%m-%d') AS ngay_hoan_thanh, loai_bao_tri, nguoi_phu_trach, mo_ta_cong_viec, nguyen_nhan_hu_hong, ket_qua, DATE_FORMAT(lich_tiep_theo, '%Y-%m-%d') AS lich_tiep_theo, trang_thai, hinh_anh, id_seri FROM bao_tri_1 WHERE id_thiet_bi = ? ORDER BY ngay_hoan_thanh DESC LIMIT 1");
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
            $whereClauses[] = "id_seri = ?";
            $params[] = $id_seri;
            $types .= "s";
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

        // Chuyển hướng sang file giao diện
        include 'device_details.php';
    }
}

$conn->close();
?>