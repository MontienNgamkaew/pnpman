<?php
require_once __DIR__ . '/api/db.php';

try {
    echo "Connected to database successfully.\n";

    // 1. Consolidated safety: Create college_settings table (V2 fallback)
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS college_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            college_name VARCHAR(255) NOT NULL DEFAULT 'วิทยาลัยการอาชีพพนมไพร',
            logo_path VARCHAR(255) NULL,
            theme_preset VARCHAR(50) NOT NULL DEFAULT 'rose'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        $stmt = $pdo->query("SELECT COUNT(*) FROM college_settings WHERE id = 1");
        if ($stmt->fetchColumn() == 0) {
            $pdo->exec("INSERT INTO college_settings (id, college_name, logo_path, theme_preset) VALUES (1, 'วิทยาลัยการอาชีพพนมไพร', '', 'rose')");
        }
        echo "Verified 'college_settings' table successfully.\n";
    } catch (PDOException $e) {
        echo "Note: college_settings verify failed: " . $e->getMessage() . "\n";
    }

    // 2. Consolidated safety: Modify assignments.role to VARCHAR(100) (V1 fallback)
    try {
        $pdo->exec("ALTER TABLE assignments MODIFY role VARCHAR(100) NOT NULL");
        echo "Modified 'assignments.role' column to VARCHAR successfully.\n";
    } catch (PDOException $e) {
        echo "Note: assignments.role modify failed: " . $e->getMessage() . "\n";
    }

    // 3. Consolidated safety: Add sort_order to assignments (V3 fallback)
    try {
        $pdo->exec("ALTER TABLE assignments ADD COLUMN sort_order INT NOT NULL DEFAULT 0");
        echo "Added 'sort_order' column to 'assignments' table successfully.\n";
    } catch (PDOException $e) {
        // column likely exists
    }

    // 4. Consolidated safety: Add photo_path to personnel (V4 fallback)
    try {
        $pdo->exec("ALTER TABLE personnel ADD COLUMN photo_path VARCHAR(255) NULL DEFAULT NULL");
        echo "Added 'photo_path' column to 'personnel' table successfully.\n";
    } catch (PDOException $e) {
        // column likely exists
    }

    // 5. CRITICAL FIX: Modify personnel.main_title to VARCHAR(100) to resolve ENUM mismatch
    try {
        $pdo->exec("ALTER TABLE personnel MODIFY main_title VARCHAR(100) NOT NULL");
        echo "Successfully modified 'personnel.main_title' column from ENUM to VARCHAR.\n";
    } catch (PDOException $e) {
        echo "Failed to modify 'personnel.main_title' column: " . $e->getMessage() . "\n";
    }

    // 6. CRITICAL FIX: Update old short title terms to match new UI Options ('ข้าราชการ' -> 'ข้าราชการครู', 'พนักงานราชการ' -> 'พนักงานราชการครู')
    try {
        $pdo->exec("UPDATE personnel SET main_title = 'ข้าราชการครู' WHERE main_title = 'ข้าราชการ'");
        $pdo->exec("UPDATE personnel SET main_title = 'พนักงานราชการครู' WHERE main_title = 'พนักงานราชการ'");
        echo "Successfully updated old personnel titles to match UI options.\n";
    } catch (PDOException $e) {
        echo "Failed to update old personnel titles: " . $e->getMessage() . "\n";
    }

    // 7. Insert Director and Deputy Director positions with explicit IDs
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
