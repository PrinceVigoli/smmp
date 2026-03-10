<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/api.php';

$db  = get_db();
$api = get_api();

$items = $api->services();

if (isset($items['error'])) {
    exit("API error: " . $items['error'] . PHP_EOL);
}

if (!is_array($items)) {
    exit("Unexpected API response format." . PHP_EOL);
}

$findStmt = $db->prepare("SELECT id FROM services WHERE service_id = ? LIMIT 1");

$insertStmt = $db->prepare("
    INSERT INTO services
    (
        service_id, name, type, category, rate, price, min, max,
        description, dripfeed, refill, cancel, status, created_at, updated_at
    )
    VALUES
    (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, 'active', NOW(), NOW()
    )
");

$updateStmt = $db->prepare("
    UPDATE services
    SET
        name = ?,
        type = ?,
        category = ?,
        rate = ?,
        price = ?,
        min = ?,
        max = ?,
        description = ?,
        dripfeed = ?,
        refill = ?,
        cancel = ?,
        status = 'active',
        updated_at = NOW()
    WHERE service_id = ?
");

$inserted = 0;
$updated  = 0;
$skipped  = 0;

foreach ($items as $row) {
    if (!is_array($row)) {
        $skipped++;
        continue;
    }

    $serviceId   = (int)($row['service'] ?? 0);
    $name        = trim((string)($row['name'] ?? ''));
    $type        = trim((string)($row['type'] ?? 'Default'));
    $category    = trim((string)($row['category'] ?? 'Uncategorized'));
    $rate        = (float)($row['rate'] ?? 0);
    $price       = $rate; // keep same as provider unless you want markup
    $min         = (int)($row['min'] ?? 0);
    $max         = (int)($row['max'] ?? 0);
    $description = trim((string)($row['desc'] ?? ''));
    $dripfeed    = !empty($row['dripfeed']) ? 1 : 0;
    $refill      = !empty($row['refill']) ? 1 : 0;
    $cancel      = !empty($row['cancel']) ? 1 : 0;

    if ($serviceId <= 0 || $name === '') {
        $skipped++;
        continue;
    }

    $findStmt->execute([$serviceId]);
    $existing = $findStmt->fetch();

    if ($existing) {
        $updateStmt->execute([
            $name,
            $type,
            $category,
            $rate,
            $price,
            $min,
            $max,
            $description,
            $dripfeed,
            $refill,
            $cancel,
            $serviceId,
        ]);
        $updated++;
    } else {
        $insertStmt->execute([
            $serviceId,
            $name,
            $type,
            $category,
            $rate,
            $price,
            $min,
            $max,
            $description,
            $dripfeed,
            $refill,
            $cancel,
        ]);
        $inserted++;
    }
}

echo "Done." . PHP_EOL;
echo "Inserted: {$inserted}" . PHP_EOL;
echo "Updated: {$updated}" . PHP_EOL;
echo "Skipped: {$skipped}" . PHP_EOL;