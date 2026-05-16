<?php
require_once 'db.php';
require_once 'auth.php';

header('Content-Type: application/json');
checkAuth($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

try {
    if ($action === 'add') {
        $name = $input['name'] ?? '';
        $main_title = $input['main_title'] ?? '';
        
        if (!$name || !$main_title) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing name or main_title"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO personnel (name, main_title) VALUES (?, ?)");
        $stmt->execute([$name, $main_title]);
        echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);

    } elseif ($action === 'update') {
        $id = $input['id'] ?? null;
        $name = $input['name'] ?? '';
        $main_title = $input['main_title'] ?? '';

        if (!$id || !$name || !$main_title) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE personnel SET name = ?, main_title = ? WHERE id = ?");
        $stmt->execute([$name, $main_title, $id]);
        echo json_encode(["status" => "success"]);

    } elseif ($action === 'delete') {
        $id = $input['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing ID"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM personnel WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);

    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
    }

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error"]);
}
?>
