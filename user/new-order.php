<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/api.php';

start_session();
require_login();

$user       = current_user();
$db         = get_db();
$page_title = 'New Order';
$active_nav = 'new_order';
$errors     = [];
$success    = '';

// Load active services
$stmt = $db->prepare("SELECT * FROM services WHERE status = 'active' ORDER BY category, name");
$stmt->execute();
$services = $stmt->fetchAll();

// Group categories
$categories = array_unique(array_column($services, 'category'));
sort($categories);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $service_id_local = (int)($_POST['service_id'] ?? 0);
    $link             = trim($_POST['link'] ?? '');
    $quantity         = (int)($_POST['quantity'] ?? 0);
    $runs             = isset($_POST['runs']) && $_POST['runs'] !== '' ? (int)$_POST['runs'] : null;
    $interval         = isset($_POST['interval']) && $_POST['interval'] !== '' ? (int)$_POST['interval'] : null;

    // Validate
    if ($service_id_local <= 0) {
        $errors[] = 'Please select a service.';
    }

    if ($link === '') {
        $errors[] = 'Link is required.';
    }

    if (strlen($link) > 500) {
        $errors[] = 'Link is too long (max 500 characters).';
    }

    // Load service
    $service = null;
    if (empty($errors)) {
        $stmt = $db->prepare("SELECT * FROM services WHERE id = ? AND status = 'active' LIMIT 1");
        $stmt->execute([$service_id_local]);
        $service = $stmt->fetch();

        if (!$service) {
            $errors[] = 'Invalid or unavailable service.';
        }
    }

    if ($service && empty($errors)) {
        if ($quantity < (int)$service['min'] || $quantity > (int)$service['max']) {
            $errors[] = sprintf(
                'Quantity must be between %s and %s for this service.',
                number_format((int)$service['min']),
                number_format((int)$service['max'])
            );
        }

        if ((int)$service['dripfeed'] !== 1) {
            $runs = null;
            $interval = null;
        } else {
            if ($runs !== null && $runs < 1) {
                $errors[] = 'Runs must be at least 1.';
            }

            if ($interval !== null && $interval < 1) {
                $errors[] = 'Interval must be at least 1 minute.';
            }
        }
    }

    // Calculate charge: price is stored per 1,000 units
    $charge = 0.0;
    if ($service && empty($errors)) {
        $charge = round((float)$service['price'] * $quantity / 1000, 5);

        if ((float)$user['balance'] < $charge) {
            $errors[] = sprintf(
                'Insufficient balance. This order costs %s but your balance is %s.',
                format_currency($charge),
                format_currency($user['balance'])
            );
        }
    }

    // Place order
    if (empty($errors) && $service) {
        $api = get_api();
        $result = $api->addOrder(
            (int)$service['service_id'],
            $link,
            $quantity,
            $runs,
            $interval
        );

        if (isset($result['error'])) {
            $errors[] = 'API error: ' . $result['error'];
        } else {
            $ext_order_id = isset($result['order']) ? (int)$result['order'] : null;
            $new_balance  = round((float)$user['balance'] - $charge, 5);

            $db->beginTransaction();

            try {
                $stmt = $db->prepare(
                    'INSERT INTO orders
                     (user_id, service_id, external_order_id, link, quantity, charge, status, runs, interval_minutes, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())'
                );

                $stmt->execute([
                    $user['id'],
                    $service['id'],
                    $ext_order_id,
                    $link,
                    $quantity,
                    $charge,
                    'Pending',
                    $runs,
                    $interval,
                ]);

                $order_id = (int)$db->lastInsertId();

                $db->prepare('UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?')
                   ->execute([$new_balance, $user['id']]);

                $db->prepare(
                    'INSERT INTO transactions
                     (user_id, type, amount, balance_before, balance_after, description, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, NOW())'
                )->execute([
                    $user['id'],
                    'order',
                    -$charge,
                    $user['balance'],
                    $new_balance,
                    'Order #' . $order_id . ' — ' . $service['name'],
                ]);

                $db->commit();

                set_flash('success', 'Order #' . $order_id . ' placed successfully!');
                redirect(base_url('user/orders.php'));
            } catch (PDOException $e) {
                $db->rollBack();
                $errors[] = 'Failed to save order. Please try again.';
            }
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<?php render_flash(); ?>

<?php foreach ($errors as $err): ?>
    <div class="alert alert-danger"><?= e($err) ?></div>
<?php endforeach; ?>

<div class="card">
    <div class="card-header">
        <span class="card-title">Place New Order</span>
    </div>

    <?php if (empty($services)): ?>
        <div class="alert alert-warning">
            No services are currently available. Please check back later or contact support.
        </div>
    <?php else: ?>
        <form method="POST" action="" novalidate>
            <?= csrf_field() ?>

            <div class="form-group">
                <label class="form-label" for="category_select">Category</label>
                <select id="category_select" name="category" class="form-select">
                    <option value="">— Select Category —</option>
                    <?php foreach ($categories as $cat): ?>
                        <option value="<?= e($cat) ?>" <?= (($_POST['category'] ?? '') === $cat) ? 'selected' : '' ?>>
                            <?= e($cat) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label" for="service_select">Service</label>
                <select id="service_select" name="service_id" class="form-select">
                    <option value="">— Select Service —</option>
                </select>
            </div>

            <div id="service_info" class="service-info mb-16">
                <dl>
                    <dt>Rate</dt>
                    <dd id="info_rate">—</dd>

                    <dt>Min Order</dt>
                    <dd id="info_min">—</dd>

                    <dt>Max Order</dt>
                    <dd id="info_max">—</dd>

                    <dt>Description</dt>
                    <dd id="info_desc">—</dd>

                    <dt>Charge</dt>
                    <dd id="info_charge">$0.00000</dd>
                </dl>
            </div>

            <div class="form-group">
                <label class="form-label" for="link">Link</label>
                <input
                    type="url"
                    id="link"
                    name="link"
                    class="form-control"
                    placeholder="https://"
                    value="<?= e($_POST['link'] ?? '') ?>"
                    required
                    maxlength="500"
                >
            </div>

            <div class="form-group">
                <label class="form-label" for="quantity">Quantity</label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    class="form-control"
                    placeholder="Enter quantity"
                    value="<?= e($_POST['quantity'] ?? '') ?>"
                    required
                    min="1"
                >
            </div>

            <div class="form-group">
                <label class="form-label" for="charge_preview">Total Charge</label>
                <input
                    type="text"
                    id="charge_preview"
                    class="form-control"
                    value="$0.00000"
                    readonly
                >
            </div>

            <div id="dripfeed_section" style="display:none">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="runs">Runs</label>
                        <input
                            type="number"
                            id="runs"
                            name="runs"
                            class="form-control"
                            placeholder="Number of runs"
                            value="<?= e($_POST['runs'] ?? '') ?>"
                            min="1"
                        >
                        <div class="form-text">For drip-feed orders only.</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="interval">Interval (minutes)</label>
                        <input
                            type="number"
                            id="interval"
                            name="interval"
                            class="form-control"
                            placeholder="Minutes between runs"
                            value="<?= e($_POST['interval'] ?? '') ?>"
                            min="1"
                        >
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-primary">Place Order</button>
        </form>
    <?php endif; ?>
</div>

<script>
window.servicesData = <?= json_encode(
    array_values($services),
    JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
) ?>;

(function () {
    const services = Array.isArray(window.servicesData) ? window.servicesData : [];

    const categorySelect  = document.getElementById('category_select');
    const serviceSelect   = document.getElementById('service_select');
    const quantityInput   = document.getElementById('quantity');
    const runsInput       = document.getElementById('runs');
    const intervalInput   = document.getElementById('interval');

    const infoRate        = document.getElementById('info_rate');
    const infoMin         = document.getElementById('info_min');
    const infoMax         = document.getElementById('info_max');
    const infoDesc        = document.getElementById('info_desc');
    const infoCharge      = document.getElementById('info_charge');
    const chargePreview   = document.getElementById('charge_preview');
    const dripfeedSection = document.getElementById('dripfeed_section');

    const oldCategory  = <?= json_encode($_POST['category'] ?? '') ?>;
    const oldServiceId = <?= json_encode((string)($_POST['service_id'] ?? '')) ?>;

    function formatMoney(value) {
        const num = Number(value) || 0;
        return '$' + num.toFixed(5);
    }

    function formatNumber(value) {
        const num = Number(value) || 0;
        return num.toLocaleString();
    }

    function getSelectedService() {
        const selectedId = String(serviceSelect.value || '');
        return services.find(service => String(service.id) === selectedId) || null;
    }

    function calculateCharge() {
        const service = getSelectedService();
        const quantity = parseInt(quantityInput.value || '0', 10);

        if (!service || !quantity || quantity < 1) {
            infoCharge.textContent = '$0.00000';
            chargePreview.value = '$0.00000';
            return;
        }

        const price = parseFloat(service.price || 0);
        const charge = (price * quantity) / 1000;

        infoCharge.textContent = formatMoney(charge);
        chargePreview.value = formatMoney(charge);
    }

    function updateServiceInfo() {
        const service = getSelectedService();

        if (!service) {
            infoRate.textContent = '—';
            infoMin.textContent = '—';
            infoMax.textContent = '—';
            infoDesc.textContent = '—';
            infoCharge.textContent = '$0.00000';
            chargePreview.value = '$0.00000';
            dripfeedSection.style.display = 'none';
            quantityInput.min = '1';
            quantityInput.removeAttribute('max');
            runsInput.value = '';
            intervalInput.value = '';
            return;
        }

        infoRate.textContent = formatMoney(service.price || 0) + ' / 1000';
        infoMin.textContent = formatNumber(service.min || 0);
        infoMax.textContent = formatNumber(service.max || 0);
        infoDesc.textContent = service.description ? service.description : '—';

        quantityInput.min = String(service.min || 1);
        quantityInput.max = String(service.max || '');

        if (Number(service.dripfeed) === 1) {
            dripfeedSection.style.display = 'block';
        } else {
            dripfeedSection.style.display = 'none';
            runsInput.value = '';
            intervalInput.value = '';
        }

        calculateCharge();
    }

    function populateServices(selectedCategory, selectedServiceId = '') {
        serviceSelect.innerHTML = '<option value="">— Select Service —</option>';

        const filtered = services.filter(service => service.category === selectedCategory);

        filtered.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;

            if (String(service.id) === String(selectedServiceId)) {
                option.selected = true;
            }

            serviceSelect.appendChild(option);
        });

        updateServiceInfo();
    }

    categorySelect.addEventListener('change', function () {
        populateServices(this.value, '');
    });

    serviceSelect.addEventListener('change', updateServiceInfo);
    quantityInput.addEventListener('input', calculateCharge);

    if (oldCategory) {
        categorySelect.value = oldCategory;
        populateServices(oldCategory, oldServiceId);
    } else if (categorySelect.value) {
        populateServices(categorySelect.value, oldServiceId);
    } else {
        updateServiceInfo();
    }

    calculateCharge();
})();
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>