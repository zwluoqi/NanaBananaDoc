# Stream Request Mode

When `mode` is `"stream"`, the server uses Server-Sent Events (SSE) to push real-time generation progress and the final result. Best for frontend integrations that need to show progress to users.

## Request Example

```sh
curl -N -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "Cyberpunk style futuristic city at night",
    "selectedModel": "nano-banana",
    "mode": "stream"
  }'
```

::: tip
When using `curl`, add `-N` to disable buffering so you can see streaming output in real-time.
:::

## Response Format

Returns `Content-Type: text/event-stream`, pushing multiple events via SSE protocol:

```text
data: {"type":"status","message":"Starting generation...","progress":0}

data: {"type":"status","message":"Processing...","progress":50}

data: {"type":"complete","message":"Generation complete","progress":100,"data":{"success":true,"imageUrls":["https://..."]}}
```

### Event Types

| `type` | Description | Key Fields |
|--------|-------------|------------|
| `status` | Progress update | `message`, `progress` (0-100) |
| `complete` | Generation completed | `data` (contains `success`, `imageUrls`, etc.) |
| `error` | Generation failed | `message` (error info), `data` (contains `success: false`) |

### Event Data Structure

```typescript
interface ProgressEvent {
  type: 'status' | 'complete' | 'error'
  message: string
  progress: number          // 0 - 100
  data?: {
    success: boolean
    imageUrls?: string[]
    error?: string
  }
}
```

## Code Examples

::: code-group

```python [Python]
import requests
import json

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"

# Stream mode — receive generation progress in real-time
response = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "Cyberpunk style futuristic city at night",
        "selectedModel": "nano-banana",
        "mode": "stream"
    },
    stream=True  # Enable streaming
)

for line in response.iter_lines():
    if line:
        decoded = line.decode("utf-8")
        if decoded.startswith("data: "):
            event = json.loads(decoded[6:])
            
            if event["type"] == "status":
                print(f"Progress: {event.get('progress', 0)}% - {event['message']}")
            elif event["type"] == "complete":
                print("Generation complete!")
                print("Image URLs:", event["data"]["imageUrls"])
            elif event["type"] == "error":
                print("Error:", event["message"])
                break
```

```javascript [Node.js]
const API_KEY = "nb_your_api_key_here";
const BASE_URL = "https://www.nananobanana.com/api/v1";

// Stream mode — receive SSE events via fetch
async function generateWithStream() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt: "Cyberpunk style futuristic city at night",
      selectedModel: "nano-banana",
      mode: "stream"
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

    for (const line of lines) {
      const event = JSON.parse(line.slice(6));

      switch (event.type) {
        case "status":
          console.log(`Progress: ${event.progress}% - ${event.message}`);
          break;
        case "complete":
          console.log("Done! Images:", event.data.imageUrls);
          break;
        case "error":
          console.error("Error:", event.message);
          break;
      }
    }
  }
}

generateWithStream();
```

```javascript [Browser Frontend]
const API_KEY = "nb_your_api_key_here";
const BASE_URL = "https://www.nananobanana.com/api/v1";

// Browser implementation using fetch + ReadableStream
async function generateWithProgress(promptText, onProgress, onComplete, onError) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt: promptText,
      selectedModel: "nano-banana",
      mode: "stream"
    })
  });

  if (!response.ok) {
    const err = await response.json();
    onError(err.error || "Request failed");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";  // Keep incomplete lines

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const event = JSON.parse(line.slice(6));
          switch (event.type) {
            case "status":
              onProgress(event.progress, event.message);
              break;
            case "complete":
              onComplete(event.data);
              break;
            case "error":
              onError(event.message);
              return;
          }
        } catch (e) {
          // Ignore parse errors (e.g., heartbeat events)
        }
      }
    }
  }
}

// Usage example
generateWithProgress(
  "A cute orange cat",
  (progress, message) => {
    document.getElementById("progress").style.width = `${progress}%`;
    document.getElementById("status").textContent = message;
  },
  (data) => {
    document.getElementById("result").src = data.imageUrls[0];
  },
  (error) => {
    alert("Generation failed: " + error);
  }
);
```

:::

## Connection Mechanics

### Heartbeat
The server sends a heartbeat event every **15 seconds** to keep the connection alive:

```text
data: {"type":"status","message":"Processing...","progress":0}
```

### Connection Closing
After generation completes (`complete`) or fails (`error`), the server automatically closes the SSE connection.

### Client Disconnect
If the client disconnects, the server detects this and stops pushing events. The generation task continues in the background, and the result can be retrieved via `GET /api/v1/generate?id={generationId}`.

## Best For

- ✅ Frontend UI with real-time progress bars
- ✅ Providing users with processing status feedback
- ✅ Long generation scenarios where you want to avoid timeout

## Important Notes

::: warning
- Stream requests use the SSE protocol (`text/event-stream`). Some proxy servers or CDNs may buffer SSE data, causing delays. Ensure your network environment supports SSE.
- Clients should implement proper disconnection handling and reconnection logic.
- Each SSE event starts with `data: ` and ends with two newline characters `\n\n`.
:::
