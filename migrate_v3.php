<?php
$host = '127.0.0.1';
$db   = 'pnpman_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Connected to database successfully.\n";

    // 1. Add sort_order column to assignments table (ignore if already exists)
    try {
        $pdo->exec("ALTER TABLE assignments ADD COLUMN sort_order INT NOT NULL DEFAULT 0");
        echo "Added 'sort_order' column to 'assignments' table successfully.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "'sort_order' column already exists in 'assignments' table.\n";
        } else {
            throw $e;
        }
    }

    echo "Migration V3 completed successfully.\n";

} catch (PDOException $e) {
    echo "Connection or Execution failed: " . $e->getMessage() . "\n";
}
?>
