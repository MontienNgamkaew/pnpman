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

    // 1. Add photo_path column to personnel table (ignore if already exists)
    try {
        $pdo->exec("ALTER TABLE personnel ADD COLUMN photo_path VARCHAR(255) NULL DEFAULT NULL");
        echo "Added 'photo_path' column to 'personnel' table successfully.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "'photo_path' column already exists in 'personnel' table.\n";
        } else {
            throw $e;
        }
    }

    echo "Migration V4 completed successfully.\n";

} catch (PDOException $e) {
    echo "Connection or Execution failed: " . $e->getMessage() . "\n";
}
?>
