<?php
declare(strict_types=1);

/**
 * BigSMMServer API wrapper.
 */
class SMMApi
{
    private string $api_url;
    private string $api_key;

    public function __construct(string $api_url, string $api_key)
    {
        $this->api_url = rtrim($api_url, '/');
        $this->api_key = $api_key;
    }

    public function services(): array
    {
        return $this->request(['action' => 'services']);
    }

    public function addOrder(
        int $service,
        string $link,
        int $quantity,
        ?int $runs = null,
        ?int $interval = null
    ): array {
        $params = [
            'action'   => 'add',
            'service'  => $service,
            'link'     => $link,
            'quantity' => $quantity,
        ];

        if ($runs !== null) {
            $params['runs'] = $runs;
        }

        if ($interval !== null) {
            $params['interval'] = $interval;
        }

        return $this->request($params);
    }

    public function orderStatus(int $order_id): array
    {
        return $this->request([
            'action' => 'status',
            'order'  => $order_id,
        ]);
    }

    public function multiOrderStatus(array $order_ids): array
    {
        return $this->request([
            'action' => 'status',
            'orders' => implode(',', $order_ids),
        ]);
    }

    public function refill(int $order_id): array
    {
        return $this->request([
            'action' => 'refill',
            'order'  => $order_id,
        ]);
    }

    public function multiRefill(array $order_ids): array
    {
        return $this->request([
            'action' => 'refill',
            'orders' => implode(',', $order_ids),
        ]);
    }

    public function refillStatus(int $refill_id): array
    {
        return $this->request([
            'action' => 'refill_status',
            'refill' => $refill_id,
        ]);
    }

    public function multiRefillStatus(array $refill_ids): array
    {
        return $this->request([
            'action'  => 'refill_status',
            'refills' => implode(',', $refill_ids),
        ]);
    }

    public function cancel(array $order_ids): array
    {
        return $this->request([
            'action' => 'cancel',
            'orders' => implode(',', $order_ids),
        ]);
    }

    public function balance(): array
    {
        return $this->request(['action' => 'balance']);
    }

    /**
     * @param array<string,mixed> $params
     * @return array<mixed>
     */
    private function request(array $params): array
    {
        $params['key'] = $this->api_key;

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => $this->api_url,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => http_build_query($params),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT      => 'BigSMMServer-API-Client/1.0',
        ]);

        $response = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);

        curl_close($ch);

        if ($response === false) {
            return ['error' => 'cURL error: ' . $curlErr];
        }

        $decoded = json_decode((string) $response, true);

        // Some providers return valid JSON with a non-200 status.
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        if ($httpCode !== 200) {
            return [
                'error' => 'HTTP error: ' . $httpCode,
                'body'  => (string) $response,
            ];
        }

        return ['error' => 'JSON decode error: ' . json_last_error_msg()];
    }
}