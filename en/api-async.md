# Async Request Mode

When `mode` is `"async"`, the server immediately returns a task ID and processes the generation in the background. Clients poll for results. Best for batch processing or latency-sensitive scenarios.

## Workflow

```
Client                              Server
  │                                    │
  │─── POST /generate (async) ───────►│
  │                                    │  Returns generationId immediately
  │◄── 200 { generationId } ──────────│
  │                                    │  Processing in background...
  │─── GET /generate?id=xxx ─────────►│
  │◄── { status: "processing" } ──────│
  │                                    │
  │─── GET /generate?id=xxx ─────────►│
  │◄── { status: "processing" } ──────│
  │                                    │  Generation complete
  │─── GET /generate?id=xxx ─────────►│
  │◄── { status: "completed" } ───────│
  │    { outputImageUrls: [...] }      │
```

## Request Example

### 1. Submit Generation Task

```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "Chinese ink painting style landscape",
    "selectedModel": "nano-banana",
    "mode": "async"
  }'
```

### 2. Poll for Results

```sh
curl https://www.nananobanana.com/api/v1/generate?id=YOUR_GENERATION_ID \
  -H "Authorization: Bearer nb_your_api_key_here"
```

## Response Format

### Submit Success (`200 OK`)

```json
{
  "success": true,
  "async": true,
  "generationId": "clxx...",
  "message": "Generation started. Use GET /api/v1/generate?id={generationId} to poll for results.",
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether submission succeeded |
| `async` | `boolean` | Always `true`, indicates async mode |
| `generationId` | `string` | Task ID for polling |
| `message` | `string` | Instruction message |
| `creditsUsed` | `number` | Credits consumed |
| `remainingCredits` | `number` | Remaining account credits |

### Polling Response

When polling `GET /api/v1/generate?id={generationId}`, check the `processingStatus`:

**Processing:**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "Chinese ink painting style landscape",
    "outputImageUrls": null,
    "modelUsed": "nano-banana",
    "processingStatus": "processing",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Completed:**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "Chinese ink painting style landscape",
    "outputImageUrls": ["https://..."],
    "modelUsed": "nano-banana",
    "processingStatus": "completed",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Failed:**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "Chinese ink painting style landscape",
    "outputImageUrls": null,
    "modelUsed": "nano-banana",
    "processingStatus": "failed",
    "errorMessage": "Generation failed due to server error",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Server Busy (`503 Service Unavailable`)

When the concurrent task limit is reached:

```json
{
  "error": "Server is busy, too many concurrent tasks. Please retry later.",
  "type": "server_busy",
  "activeTasks": 10
}
```

::: warning
When the server is busy, consumed credits are **automatically refunded**.
:::

## Code Examples

::: code-group

```python [Python]
import requests
import time

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

# Async mode — submit task and poll for results
response = requests.post(
    f"{BASE_URL}/generate",
    headers=HEADERS,
    json={
        "prompt": "Chinese ink painting style landscape",
        "selectedModel": "nano-banana",
        "mode": "async"
    }
)

result = response.json()

# Handle server busy
if response.status_code == 503:
    print("Server busy, please retry later.")
    exit()

if not result.get("success"):
    print("Submit failed:", result.get("error"))
    exit()

generation_id = result["generationId"]
print(f"Task submitted! ID: {generation_id}")
print(f"Credits used: {result['creditsUsed']}")

# Poll for results
max_retries = 60  # Max 60 polls (~3 minutes)
for i in range(max_retries):
    status_response = requests.get(
        f"{BASE_URL}/generate?id={generation_id}",
        headers=HEADERS
    )
    data = status_response.json()["data"]
    
    print(f"[{i+1}/{max_retries}] Status: {data['processingStatus']}")
    
    if data["processingStatus"] == "completed":
        print("✅ Generation complete!")
        print("Image URLs:", data["outputImageUrls"])
        break
    elif data["processingStatus"] == "failed":
        print("❌ Generation failed:", data.get("errorMessage"))
        break
    
    time.sleep(3)  # Poll every 3 seconds
else:
    print("⏰ Timeout: generation did not complete in time.")
```

```javascript [Node.js]
const API_KEY = "nb_your_api_key_here";
const BASE_URL = "https://www.nananobanana.com/api/v1";
const HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`
};

// Async mode — submit task and poll for results
async function generateAsync() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      prompt: "Chinese ink painting style landscape",
      selectedModel: "nano-banana",
      mode: "async"
    })
  });

  // Handle server busy
  if (response.status === 503) {
    console.error("Server busy, please retry later.");
    return;
  }

  const result = await response.json();
  if (!result.success) {
    console.error("Submit failed:", result.error);
    return;
  }

  const generationId = result.generationId;
  console.log(`Task submitted! ID: ${generationId}`);
  console.log(`Credits used: ${result.creditsUsed}`);

  // Poll for results
  const maxRetries = 60;
  for (let i = 0; i < maxRetries; i++) {
    const statusRes = await fetch(
      `${BASE_URL}/generate?id=${generationId}`,
      { headers: HEADERS }
    );
    const { data } = await statusRes.json();

    console.log(`[${i + 1}/${maxRetries}] Status: ${data.processingStatus}`);

    if (data.processingStatus === "completed") {
      console.log("✅ Generation complete!");
      console.log("Image URLs:", data.outputImageUrls);
      return;
    } else if (data.processingStatus === "failed") {
      console.error("❌ Generation failed:", data.errorMessage);
      return;
    }

    await new Promise(r => setTimeout(r, 3000)); // Poll every 3 seconds
  }

  console.error("⏰ Timeout: generation did not complete in time.");
}

generateAsync();
```

```python [Python Batch Processing]
import requests
import time

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

prompts = [
    "Sunrise at Mount Fuji",
    "The Eiffel Tower at night",
    "Autumn streets of Kyoto",
]

# Submit batch tasks
task_ids = []
for prompt in prompts:
    response = requests.post(
        f"{BASE_URL}/generate",
        headers=HEADERS,
        json={
            "prompt": prompt,
            "selectedModel": "nano-banana",
            "mode": "async"
        }
    )
    result = response.json()
    if result.get("success"):
        task_ids.append(result["generationId"])
        print(f"✅ Submitted: {prompt[:20]}... -> {result['generationId']}")
    else:
        print(f"❌ Failed: {prompt[:20]}... -> {result.get('error')}")

print(f"\nSubmitted {len(task_ids)} tasks. Polling for results...\n")

# Poll all tasks
pending = set(task_ids)
results = {}

while pending:
    for task_id in list(pending):
        resp = requests.get(
            f"{BASE_URL}/generate?id={task_id}",
            headers=HEADERS
        )
        data = resp.json()["data"]
        
        if data["processingStatus"] == "completed":
            results[task_id] = data["outputImageUrls"]
            pending.discard(task_id)
            print(f"✅ Completed: {task_id}")
        elif data["processingStatus"] == "failed":
            pending.discard(task_id)
            print(f"❌ Failed: {task_id} - {data.get('errorMessage')}")
    
    if pending:
        print(f"⏳ {len(pending)} tasks still processing...")
        time.sleep(3)

print(f"\nAll done! {len(results)} images generated.")
for task_id, urls in results.items():
    print(f"  {task_id}: {urls}")
```

:::

## Best For

- ✅ Batch generating multiple images
- ✅ Background task processing (no user waiting)
- ✅ Latency-sensitive HTTP response scenarios
- ✅ Architectures that decouple "submit" and "get results"

## Polling Recommendations

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| Poll interval | 3 seconds | Avoid excessive requests |
| Max retries | 60 | ~3 minutes timeout |
| Initial delay | 5 seconds | Give the server time to start |

## Important Notes

::: warning
- Credits are deducted when the task is submitted, not when generation completes.
- If the server is busy (503), credits are automatically refunded.
- When generation fails, credits are **not** automatically refunded.
- Set a reasonable polling timeout to avoid waiting indefinitely.
:::
