# Sync Request Mode

When `mode` is `"sync"` or omitted, the server waits for image generation to complete before returning the result. This is the simplest integration method, suitable for scripts and simple backend integrations.

## Request Example

```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "A cute orange cat sitting on a windowsill",
    "selectedModel": "nano-banana",
    "mode": "sync"
  }'
```

::: tip
The `mode` parameter can be omitted — sync is the default mode.
:::

## Response Format

### Success Response (`200 OK`)

```json
{
  "success": true,
  "generationId": "clxx...",
  "imageUrls": ["https://..."],
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether generation succeeded |
| `generationId` | `string` | Generation record ID |
| `imageUrls` | `string[]` | Generated image URLs |
| `creditsUsed` | `number` | Credits consumed |
| `remainingCredits` | `number` | Remaining account credits |

### Warning Response (`200 OK`)

When generation completes but triggers content safety check:

```json
{
  "success": false,
  "warning": true,
  "generationId": "clxx...",
  "message": "Content safety check failed",
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

### Error Responses

See [Common Error Responses](/en/api#_6-common-error-responses).

## Code Examples

::: code-group

```python [Python]
import requests

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"

# Text-to-Image — Sync mode (default)
response = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "A cute orange cat sitting on a windowsill with sunlight",
        "selectedModel": "nano-banana"
    }
)

result = response.json()
if result.get("success"):
    print("Image URLs:", result["imageUrls"])
    print("Credits used:", result["creditsUsed"])
else:
    print("Error:", result.get("error"))

# Image-to-Image — Sync mode
response_img2img = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "Replace the background with a beach, keep the person unchanged",
        "referenceImageUrls": ["https://example.com/your-image.jpg"],
        "selectedModel": "nano-banana"
    }
)

result_img2img = response_img2img.json()
print("Img2Img Result:", result_img2img)
```

```javascript [Node.js]
const API_KEY = "nb_your_api_key_here";
const BASE_URL = "https://www.nananobanana.com/api/v1";

// Text-to-Image — Sync mode (default)
async function generateImage() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt: "A cute orange cat sitting on a windowsill",
      selectedModel: "nano-banana"
    })
  });

  const result = await response.json();
  if (result.success) {
    console.log("Image URLs:", result.imageUrls);
    console.log("Credits used:", result.creditsUsed);
  } else {
    console.error("Error:", result.error);
  }
}

generateImage();
```

:::

## Best For

- ✅ Script-based batch calls (wait for each to complete)
- ✅ Backend service integrations (no frontend progress needed)
- ✅ Quick prototyping and testing

## Important Notes

::: warning
In sync mode, the request blocks until image generation completes. Depending on the model and image complexity, generation may take 10-60 seconds. Make sure your client's timeout is long enough — we recommend at least 120 seconds.
:::
