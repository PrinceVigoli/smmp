<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

start_session();
require_login();

$user = current_user();
if (($user['role'] ?? '') !== 'admin') {
    http_response_code(403);
    exit('Access denied.');
}

$db         = get_db();
$page_title = 'Fund Requests';
$active_nav = 'fund_requests';
$errors     = [];

/*
|--------------------------------------------------------------------------
| Ensure table exists
|--------------------------------------------------------------------------
*/
$db->exec("
    CREATE TABLE IF NOT EXISTS fund_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        sender_name VARCHAR(255) DEFAULT NULL,
        reference_number VARCHAR(100) DEFAULT NULL,
        receipt_path VARCHAR(255) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

/*
|--------------------------------------------------------------------------
| Handle approve / reject
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $requestId = (int)($_POST['request_id'] ?? 0);
    $action    = trim((string)($_POST['action_type'] ?? ''));

    if ($requestId <= 0) {
        $errors[] = 'Invalid request.';
    }

    if (!in_array($action, ['approve', 'reject'], true)) {
        $errors[] = 'Invalid action.';
    }

    if (empty($errors)) {
        $stmt = $db->prepare("
            SELECT fr.*, u.username, u.balance
            FROM fund_requests fr
            INNER JOIN users u ON u.id = fr.user_id
            WHERE fr.id = ?
            LIMIT 1
        ");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();

        if (!$request) {
            $errors[] = 'Fund request not found.';
        } else {
            if ($request['status'] !== 'pending') {
                $errors[] = 'This request has already been processed.';
            }
        }
    }

    if (empty($errors) && isset($request)) {
        $db->beginTransaction();

        try {
            if ($action === 'approve') {
                $amount         = round((float)$request['amount'], 2);
                $balanceBefore  = round((float)$request['balance'], 2);
                $balanceAfter   = round($balanceBefore + $amount, 2);

                $db->prepare("
                    UPDATE users
                    SET balance = ?, updated_at = NOW()
                    WHERE id = ?
                ")->execute([$balanceAfter, $request['user_id']]);

                $db->prepare("
                    INSERT INTO transactions
                    (user_id, type, amount, balance_before, balance_after, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, NOW())
                ")->execute([
                    $request['user_id'],
                    'add_funds',
                    $amount,
                    $balanceBefore,
                    $balanceAfter,
                    'Fund request #' . $request['id'] . ' approved',
                ]);

                $db->prepare("
                    UPDATE fund_requests
                    SET status = 'approved', updated_at = NOW()
                    WHERE id = ?
                ")->execute([$request['id']]);

                $db->commit();
                set_flash('success', 'Fund request approved and balance credited.');
                redirect(base_url('admin/fund-requests.php'));
            }

            if ($action === 'reject') {
                $db->prepare("
                    UPDATE fund_requests
                    SET status = 'rejected', updated_at = NOW()
                    WHERE id = ?
                ")->execute([$request['id']]);

                $db->commit();
                set_flash('success', 'Fund request rejected.');
                redirect(base_url('admin/fund-requests.php'));
            }
        } catch (PDOException $e) {
            $db->rollBack();
            $errors[] = 'Failed to process fund request.';
        }
    }
}

/*
|--------------------------------------------------------------------------
| Load requests
|--------------------------------------------------------------------------
*/
$statusFilter = trim((string)($_GET['status'] ?? ''));
$allowedStatuses = ['pending', 'approved', 'rejected'];

$sql = "
    SELECT fr.*, u.username
    FROM fund_requests fr
    INNER JOIN users u ON u.id = fr.user_id
";
$params = [];

if (in_array($statusFilter, $allowedStatuses, true)) {
    $sql .= " WHERE fr.status = ? ";
    $params[] = $statusFilter;
}

$sql .= " ORDER BY 
            CASE fr.status
                WHEN 'pending' THEN 0
                WHEN 'approved' THEN 1
                WHEN 'rejected' THEN 2
                ELSE 3
            END,
            fr.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$requests = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<?php render_flash(); ?>

<?php foreach ($errors as $err): ?>
    <div class="alert alert-danger"><?= e($err) ?></div>
<?php endforeach; ?>

<div class="card">
    <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        <span class="card-title">Fund Requests</span>

        <form method="GET" action="" style="display:flex; gap:8px; align-items:center;">
            <select name="status" class="form-select" onchange="this.form.submit()">
                <option value="">All Statuses</option>
                <option value="pending"  <?= $statusFilter === 'pending' ? 'selected' : '' ?>>Pending</option>
                <option value="approved" <?= $statusFilter === 'approved' ? 'selected' : '' ?>>Approved</option>
                <option value="rejected" <?= $statusFilter === 'rejected' ? 'selected' : '' ?>>Rejected</option>
            </select>
        </form>
    </div>

    <?php if (empty($requests)): ?>
        <p class="text-muted text-center" style="padding:20px 0">No fund requests found.</p>
    <?php else: ?>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Sender</th>
                        <th>Reference</th>
                        <th>Receipt</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style="min-width:180px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($requests as $req): ?>
                        <?php
                        $badge = 'badge-secondary';
                        if ($req['status'] === 'approved') {
                            $badge = 'badge-success';
                        } elseif ($req['status'] === 'rejected') {
                            $badge = 'badge-danger';
                        } elseif ($req['status'] === 'pending') {
                            $badge = 'badge-warning';
                        }
                        ?>
                        <tr>
                            <td><?= e($req['id']) ?></td>
                            <td><?= e($req['username']) ?></td>
                            <td><?= e(format_currency($req['amount'])) ?></td>
                            <td><?= e($req['sender_name'] ?? '—') ?></td>
                            <td><?= e($req['reference_number'] ?? '—') ?></td>
                            <td>
                                <?php if (!empty($req['receipt_path'])): ?>
                                    <a href="<?= e(base_url($req['receipt_path'])) ?>" target="_blank">View Receipt</a>
                                <?php else: ?>
                                    —
                                <?php endif; ?>
                            </td>
                            <td style="max-width:220px;">
                                <?= e($req['notes'] ?? '—') ?>
                            </td>
                            <td>
                                <span class="badge <?= e($badge) ?>">
                                    <?= e(ucfirst($req['status'])) ?>
                                </span>
                            </td>
                            <td><?= e(date('M j, Y g:i A', strtotime($req['created_at']))) ?></td>
                            <td>
                                <?php if ($req['status'] === 'pending'): ?>
                                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                        <form method="POST" action="" onsubmit="return confirm('Approve this fund request and credit the balance?');">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="request_id" value="<?= e($req['id']) ?>">
                                            <input type="hidden" name="action_type" value="approve">
                                            <button type="submit" class="btn btn-success btn-sm">Approve</button>
                                        </form>

                                        <form method="POST" action="" onsubmit="return confirm('Reject this fund request?');">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="request_id" value="<?= e($req['id']) ?>">
                                            <input type="hidden" name="action_type" value="reject">
                                            <button type="submit" class="btn btn-danger btn-sm">Reject</button>
                                        </form>
                                    </div>
                                <?php else: ?>
                                    <span class="text-muted">Processed</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>