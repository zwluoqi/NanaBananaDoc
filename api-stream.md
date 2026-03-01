# 流式请求模式

`mode` 设为 `"stream"` 时，使用 Server-Sent Events (SSE) 实时推送生成进度和最终结果。适合需要向用户展示进度的前端集成场景。

## 请求示例

```sh
curl -N -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "赛博朋克风格的未来城市夜景",
    "selectedModel": "nano-banana",
    "mode": "stream"
  }'
```

::: tip
使用 `curl` 时需要加 `-N` 参数禁用缓冲，否则无法实时看到流式输出。
:::

## 响应格式

返回 `Content-Type: text/event-stream`，通过 SSE 协议推送多条事件：

```text
data: {"type":"status","message":"Starting generation...","progress":0}

data: {"type":"status","message":"Processing...","progress":50}

data: {"type":"complete","message":"Generation complete","progress":100,"data":{"success":true,"imageUrls":["https://..."]}}
```

### 事件类型

| `type` | 说明 | 主要字段 |
|--------|------|----------|
| `status` | 进度更新 | `message`、`progress`（0-100） |
| `complete` | 生成完成 | `data`（包含 `success`、`imageUrls` 等） |
| `error` | 生成失败 | `message`（错误信息）、`data`（包含 `success: false`） |

### 事件数据结构

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

## 代码示例

::: code-group

```python [Python]
import requests
import json

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"

# 流式模式 — 实时接收生成进度
response = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "赛博朋克风格的未来城市夜景",
        "selectedModel": "nano-banana",
        "mode": "stream"
    },
    stream=True  # 启用流式接收
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

// 流式模式 — 使用 fetch 接收 SSE
async function generateWithStream() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt: "赛博朋克风格的未来城市夜景",
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

```javascript [浏览器前端]
const API_KEY = "nb_your_api_key_here";
const BASE_URL = "https://www.nananobanana.com/api/v1";

// 浏览器中使用 fetch + ReadableStream
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
    buffer = lines.pop() || "";  // 保留未完整的行

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
          // 忽略解析错误（如心跳事件）
        }
      }
    }
  }
}

// 使用示例
generateWithProgress(
  "一只可爱的橘猫",
  (progress, message) => {
    document.getElementById("progress").style.width = `${progress}%`;
    document.getElementById("status").textContent = message;
  },
  (data) => {
    document.getElementById("result").src = data.imageUrls[0];
  },
  (error) => {
    alert("生成失败: " + error);
  }
);
```

:::

## 连接机制

### 心跳保活
服务器每 **15 秒** 发送一次心跳事件以保持连接：

```text
data: {"type":"status","message":"Processing...","progress":0}
```

### 连接关闭
当生成完成（`complete`）或失败（`error`）后，服务器会自动关闭 SSE 连接。

### 客户端断开
如果客户端主动断开连接，服务器端会检测到并停止推送。生成任务会继续在后台完成，结果可通过 `GET /api/v1/generate?id={generationId}` 查询。

## 适用场景

- ✅ 前端 UI 实时展示生成进度条
- ✅ 需要向用户反馈当前处理状态
- ✅ 长时间生成场景，避免超时断连

## 注意事项

::: warning
- 流式请求使用 SSE 协议（`text/event-stream`），某些代理服务器或 CDN 可能会缓冲 SSE 数据导致延迟。确保你的网络环境支持 SSE。
- 客户端应妥善处理连接中断和重连逻辑。
- 每条 SSE 事件以 `data: ` 开头，以两个换行符 `\n\n` 结尾。
:::
