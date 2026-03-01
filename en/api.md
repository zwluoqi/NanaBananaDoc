# Nano Banana API Documentation

Programmatically generate AI images via REST API. Supports text-to-image, image-to-image, and three request modes: sync, stream, and async.

## 1. Quick Start

### Step 1: Get an API Key
Go to **Settings -> API Keys** on the website to create an API Key.

### Step 2: Send a Request
```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "A cute orange cat sitting on a windowsill",
    "selectedModel": "nano-banana"
  }'
```

## 2. Authentication

All API requests require an API Key in the HTTP Header:

```http
Authorization: Bearer nb_your_api_key_here
```

::: warning
⚠️ The API Key is only displayed once when created. Please keep it safe. Each user can create up to 5 API Keys.
:::

## 3. Base URL

```text
https://www.nananobanana.com/api/v1
```

## 4. Generate Endpoint

### POST `/api/v1/generate`
Generate an image. Supports text-to-image and image-to-image modes, with three request modes.

**Request Parameters**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `prompt` | `string` | **✓** | Image generation prompt |
| `selectedModel` | `string` | - | Model name, defaults to `"nano-banana"` |
| `referenceImageUrls` | `string[]` | **\*** | Reference image URL array (required for image-to-image) |
| `aspectRatio` | `string` | - | Aspect ratio, defaults to `"default"` |
| `mode` | `string` | - | Request mode: `"sync"` (default), `"stream"`, `"async"` |

::: tip
The system automatically determines the generation type (text-to-image / image-to-image) based on whether `referenceImageUrls` is provided.
:::

### Three Request Modes

Choose the request mode that best fits your use case:

| Feature | Sync `sync` | Stream `stream` | Async `async` |
|---------|:-----------:|:---------------:|:-------------:|
| Response | Wait for completion | SSE real-time push | Immediate return, poll for result |
| Progress feedback | ❌ | ✅ | ❌ |
| Best for | Simple integrations, scripts | Frontend real-time display | Batch tasks, background processing |
| Timeout risk | Higher (waits for completion) | Lower (persistent connection) | None (returns immediately) |
| Complexity | ⭐ | ⭐⭐ | ⭐⭐ |

👉 See detailed documentation and code examples for each mode:
- [Sync Mode](/en/api-sync) — Simplest integration
- [Stream Mode](/en/api-stream) — Real-time progress updates
- [Async Mode](/en/api-async) — Background processing with polling

### GET `/api/v1/generate`
Query the status and result of a generation record. Typically used with async mode.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Generation record ID |

**Response**

```json
{
  "data": {
    "id": "clxx...",
    "prompt": "...",
    "outputImageUrls": ["https://..."],
    "modelUsed": "nano-banana",
    "processingStatus": "completed",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**`processingStatus` Values**

| Status | Description |
|--------|-------------|
| `processing` | Generation in progress |
| `completed` | Generation complete, `outputImageUrls` contains result images |
| `failed` | Generation failed, `errorMessage` contains error details |

---

## 5. Other Endpoints

### GET `/api/v1/models`
Get the list of available image generation models. No authentication required.

**Response**

```json
{
  "data": [
    {
      "name": "nano-banana",
      "displayName": "Nano Banana",
      "creditsCost": 1,
      "supportsImageInput": true,
      "supportsAspectRatio": true,
      "requiresPro": false
    }
  ]
}
```

---

### GET `/api/v1/credits`
Query the current account's available credit balance.

**Response**

```json
{
  "data": {
    "credits": 100
  }
}
```

## 6. Common Error Responses

| Status Code | Description |
|-------------|-------------|
| `400 Bad Request` | Invalid request parameters (e.g., missing `prompt`, invalid `mode` value) |
| `401 Unauthorized` | Invalid or missing API Key |
| `402 Payment Required` | Insufficient credits |
| `403 Forbidden` | API access is not enabled for the account |
| `500 Internal Server Error` | Internal server error |
| `503 Service Unavailable` | Server busy (async mode only) |

## 7. Important Notes

- API calls do not perform safety keyword checks. Please ensure your input content is compliant.
- Credits consumed per generation depend on the selected model. The default model costs 1 credit.
- In image-to-image mode, each additional reference image costs 1 extra credit.
- Generated image URLs are valid for 15 days. Please download and save them promptly.
- Each user can create up to 5 API Keys.
- API access must be enabled for your account (automatically enabled when cumulative recharge exceeds ¥1000, or contact admin for manual activation).

## 8. Contact Us

For API integration questions, please reach out to us:
- 📧 API Support: [support@nananobanana.com](mailto:support@nananobanana.com)
- 📧 API Support: [guimei0sgsg@gmail.com](mailto:guimei0sgsg@gmail.com)
