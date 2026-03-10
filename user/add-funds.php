<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';

start_session();
require_login();

$user       = current_user();
$db         = get_db();
$page_title = 'Add Funds';
$active_nav = 'add_funds';
$errors     = [];
$success    = '';

$telegramUsername = '@a18ll9';

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
| Put your QR image here:
|   /assets/img/gcash-qr.jpg
| or
|   /assets/img/gcash-qr.png
|--------------------------------------------------------------------------
*/
$qrImageWebPath = base_url('assets/img/gcash-qr.jpg');
$receiptUploadDir = __DIR__ . '/../uploads/receipts';

// Create upload directory if missing
if (!is_dir($receiptUploadDir)) {
    @mkdir($receiptUploadDir, 0775, true);
}

/*
|--------------------------------------------------------------------------
| OPTIONAL: Create table automatically if it does not exist
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

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $amount           = trim((string)($_POST['amount'] ?? ''));
    $sender_name      = trim((string)($_POST['sender_name'] ?? ''));
    $reference_number = trim((string)($_POST['reference_number'] ?? ''));
    $notes            = trim((string)($_POST['notes'] ?? ''));

    if ($amount === '' || !is_numeric($amount) || (float)$amount <= 0) {
        $errors[] = 'Please enter a valid amount.';
    }

    if ($sender_name === '') {
        $errors[] = 'Sender name is required.';
    }

    if (strlen($sender_name) > 255) {
        $errors[] = 'Sender name is too long.';
    }

    if ($reference_number !== '' && strlen($reference_number) > 100) {
        $errors[] = 'Reference number is too long.';
    }

    if (strlen($notes) > 2000) {
        $errors[] = 'Notes are too long.';
    }

    if (!isset($_FILES['receipt']) || !is_array($_FILES['receipt'])) {
        $errors[] = 'Please upload your receipt.';
    }

    $savedReceiptPath = null;

    if (empty($errors) && isset($_FILES['receipt']) && is_array($_FILES['receipt'])) {
        $file = $_FILES['receipt'];

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $errors[] = 'Receipt upload failed. Please try again.';
        } else {
            $tmpName   = (string)$file['tmp_name'];
            $fileName  = (string)$file['name'];
            $fileSize  = (int)$file['size'];
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
            $allowedMimeTypes  = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/pdf',
            ];

            $mimeType = mime_content_type($tmpName) ?: '';

            if (!in_array($extension, $allowedExtensions, true)) {
                $errors[] = 'Receipt must be a JPG, PNG, WEBP, or PDF file.';
            }

            if (!in_array($mimeType, $allowedMimeTypes, true)) {
                $errors[] = 'Invalid receipt file type.';
            }

            if ($fileSize <= 0 || $fileSize > 5 * 1024 * 1024) {
                $errors[] = 'Receipt file must be less than 5MB.';
            }

            if (empty($errors)) {
                $safeName = 'receipt_u' . (int)$user['id'] . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
                $targetPath = $receiptUploadDir . '/' . $safeName;

                if (!move_uploaded_file($tmpName, $targetPath)) {
                    $errors[] = 'Failed to save receipt file.';
                } else {
                    $savedReceiptPath = 'uploads/receipts/' . $safeName;
                }
            }
        }
    }

    if (empty($errors)) {
        $stmt = $db->prepare("
            INSERT INTO fund_requests
            (user_id, amount, sender_name, reference_number, receipt_path, notes, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
        ");

        $stmt->execute([
            $user['id'],
            round((float)$amount, 2),
            $sender_name,
            $reference_number !== '' ? $reference_number : null,
            $savedReceiptPath,
            $notes !== '' ? $notes : null,
        ]);

        set_flash('success', 'Your fund request has been submitted successfully. Please wait for confirmation.');
        redirect(base_url('user/add-funds.php'));
    }
}

// Transaction history (last 20)
$stmt = $db->prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
);
$stmt->execute([$user['id']]);
$transactions = $stmt->fetchAll();

// Recent fund requests
$stmt = $db->prepare(
    'SELECT * FROM fund_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
);
$stmt->execute([$user['id']]);
$fundRequests = $stmt->fetchAll();

require_once __DIR__ . '/../includes/header.php';
?>

<?php render_flash(); ?>

<?php foreach ($errors as $err): ?>
    <div class="alert alert-danger"><?= e($err) ?></div>
<?php endforeach; ?>

<div class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
    <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div>
            <div class="stat-value"><?= e(format_currency($user['balance'])) ?></div>
            <div class="stat-label">Current Balance</div>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <span class="card-title">Add Funds</span>
    </div>

    <div class="alert alert-info" style="margin-bottom:16px">
        <strong>Payment Instructions</strong><br>
        Contact Telegram only: <strong><?= e($telegramUsername) ?></strong><br>
        Or pay using the GCash QR code below, then upload your receipt and submit the form.
    </div>

    <div style="display:grid; grid-template-columns: minmax(260px, 320px) 1fr; gap:24px; align-items:start;">
        <div>
            <div style="border:1px solid #e5e7eb; border-radius:12px; padding:16px; background:#fff;">
                <div style="font-weight:700; margin-bottom:12px;">GCash QR Code</div>

                <div style="text-align:center;">
                    <img
                        src="<?= e($qrImageWebPath) ?>"
                        alt="GCash QR Code"
                        style="max-width:100%; width:100%; border-radius:10px; border:1px solid #e5e7eb; background:#f8fafc;"
                    >
                </div>

                <p class="text-muted" style="font-size:.9rem; margin-top:10px;">
                    Scan this QR code, complete the payment, then upload the receipt.
                </p>
            </div>

            <div style="margin-top:16px; border:1px solid #e5e7eb; border-radius:12px; padding:16px; background:#fff;">
                <div style="font-weight:700; margin-bottom:8px;">Telegram Contact</div>
                <p style="margin:0;">
                    Username: <strong><?= e($telegramUsername) ?></strong>
                </p>
                <p class="text-muted" style="font-size:.9rem; margin-top:8px;">
                    Send your username <strong><?= e($user['username']) ?></strong> and amount if you want manual confirmation through Telegram.
                </p>
            </div>
        </div>

        <div>
            <form method="POST" action="" enctype="multipart/form-data" novalidate>
                <?= csrf_field() ?>

                <div class="form-group">
                    <label class="form-label" for="amount">Amount</label>
                    <input
                        type="number"
                        step="0.01"
                        min="1"
                        id="amount"
                        name="amount"
                        class="form-control"
                        placeholder="Enter amount"
                        value="<?= e($_POST['amount'] ?? '') ?>"
                        required
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="sender_name">Sender Name</label>
                    <input
                        type="text"
                        id="sender_name"
                        name="sender_name"
                        class="form-control"
                        placeholder="Name used in GCash payment"
                        value="<?= e($_POST['sender_name'] ?? '') ?>"
                        required
                        maxlength="255"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="reference_number">Reference Number <span class="text-muted">(optional)</span></label>
                    <input
                        type="text"
                        id="reference_number"
                        name="reference_number"
                        class="form-control"
                        placeholder="GCash reference number"
                        value="<?= e($_POST['reference_number'] ?? '') ?>"
                        maxlength="100"
                    >
                </div>

                <div class="form-group">
                    <label class="form-label" for="receipt">Upload Receipt</label>
                    <input
                        type="file"
                        id="receipt"
                        name="receipt"
                        class="form-control"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        required
                    >
                    <div class="form-text">Allowed: JPG, PNG, WEBP, PDF. Max size: 5MB.</div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="notes">Notes <span class="text-muted">(optional)</span></label>
                    <textarea
                        id="notes"
                        name="notes"
                        class="form-control"
                        rows="4"
                        placeholder="Any extra details"
                    ><?= e($_POST['notes'] ?? '') ?></textarea>
                </div>

                <button type="submit" class="btn btn-primary">Submit Fund Request</button>
            </form>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <span class="card-title">Recent Fund Requests</span>
    </div>

    <?php if (empty($fundRequests)): ?>
        <p class="text-muted text-center" style="padding:20px 0">No fund requests yet.</p>
    <?php else: ?>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Amount</th>
                        <th>Sender</th>
                        <th>Reference</th>
                        <th>Receipt</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($fundRequests as $req): ?>
                        <tr>
                            <td><?= e($req['id']) ?></td>
                            <td><?= e(format_currency($req['amount'])) ?></td>
                            <td><?= e($req['sender_name']) ?></td>
                            <td><?= e($req['reference_number'] ?? '—') ?></td>
                            <td>
                                <?php if (!empty($req['receipt_path'])): ?>
                                    <a href="<?= e(base_url($req['receipt_path'])) ?>" target="_blank">View Receipt</a>
                                <?php else: ?>
                                    —
                                <?php endif; ?>
                            </td>
                            <td>
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
                                <span class="badge <?= e($badge) ?>"><?= e(ucfirst($req['status'])) ?></span>
                            </td>
                            <td><?= e(date('M j, Y g:i A', strtotime($req['created_at']))) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<div class="card">
    <div class="card-header">
        <span class="card-title">Transaction History</span>
    </div>

    <?php if (empty($transactions)): ?>
        <p class="text-muted text-center" style="padding:20px 0">No transactions yet.</p>
    <?php else: ?>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>Description</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($transactions as $tx): ?>
                        <tr>
                            <td><?= e($tx['id']) ?></td>
                            <td>
                                <span class="badge <?= $tx['type'] === 'add_funds' ? 'badge-success' : ($tx['type'] === 'refund' ? 'badge-info' : 'badge-secondary') ?>">
                                    <?= e(ucfirst(str_replace('_', ' ', $tx['type']))) ?>
                                </span>
                            </td>
                            <td style="color: <?= (float)$tx['amount'] >= 0 ? '#155724' : '#721c24' ?>; font-weight:600">
                                <?= (float)$tx['amount'] >= 0 ? '+' : '' ?><?= e(format_currency($tx['amount'])) ?>
                            </td>
                            <td><?= e(format_currency($tx['balance_before'])) ?></td>
                            <td><?= e(format_currency($tx['balance_after'])) ?></td>
                            <td><?= e($tx['description']) ?></td>
                            <td><?= e(date('M j, Y g:i A', strtotime($tx['created_at']))) ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>