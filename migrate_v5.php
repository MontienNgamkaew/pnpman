<?php
require_once __DIR__ . '/api/db.php';

try {
    echo "Connected to database successfully.\n";

    // Insert Director and Deputy Director positions with explicit IDs
    $stmt = $pdo->prepare("
        INSERT INTO jobs (id, department_id, name, sort_order) VALUES
        (900, NULL, 'ผู้อำนวยการวิทยาลัย', 0),
        (901, 1, 'รองผู้อำนวยการฝ่ายบริหารทรัพยากร', 0),
        (902, 2, 'รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน', 0),
        (903, 3, 'รองผู้อำนวยการฝ่ายพัฒนากิจการนักเรียน นักศึกษา', 0),
        (904, 4, 'รองผู้อำนวยการฝ่ายวิชาการ', 0)
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            department_id = VALUES(department_id)
    ");
    $stmt->execute();
    echo "Director and Deputy Director positions inserted/updated successfully (IDs 900-904).\n";

    echo "Migration V5 completed successfully.\n";

} catch (PDOException $e) {
    echo "Connection or Execution failed: " . $e->getMessage() . "\n";
}
?>
