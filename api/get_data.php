<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    $year = isset($_GET['year']) ? intval($_GET['year']) : 2569;

    // Get all personnel
    $stmt = $pdo->query("SELECT * FROM personnel");
    $personnel = $stmt->fetchAll();

    // Get all departments
    $stmt = $pdo->query("SELECT * FROM departments ORDER BY sort_order, id");
    $departments = $stmt->fetchAll();

    // Get all jobs
    $stmt = $pdo->query("SELECT * FROM jobs ORDER BY sort_order, id");
    $jobs = $stmt->fetchAll();

    // Get all assignments
    $stmt = $pdo->prepare("SELECT * FROM assignments WHERE academic_year = ?");
    $stmt->execute([$year]);
    $assignments = $stmt->fetchAll();

    // Return the response
    echo json_encode([
        "status" => "success",
        "data" => [
            "personnel" => $personnel,
            "departments" => $departments,
            "jobs" => $jobs,
            "assignments" => $assignments
        ]
    ]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
