<?php
function checkAuth($pdo) {
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    $token = $matches[1];
    $stmt = $pdo->prepare("SELECT id FROM users WHERE auth_token = ?");
    $stmt->execute([$token]);
    if (!$stmt->fetch()) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized (Invalid Token)']);
        exit;
    }
    return true;
}
?>
