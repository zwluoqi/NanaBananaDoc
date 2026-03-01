# 异步请求模式

`mode` 设为 `"async"` 时，服务器立即返回生成任务 ID，并在后台处理。客户端通过轮询查询结果。适合批量调用或对响应时间敏感的场景。

## 工作流程

```
客户端                            服务器
  │                                 │
  │─── POST /generate (async) ────►│
  │                                 │  立即返回 generationId
  │◄── 200 { generationId } ───────│
  │                                 │  后台生成中...
  │─── GET /generate?id=xxx ──────►│
  │◄── { status: "processing" } ───│
  │                                 │
  │─── GET /generate?id=xxx ──────►│
  │◄── { status: "processing" } ───│
  │                                 │  生成完成
  │─── GET /generate?id=xxx ──────►│
  │◄── { status: "completed" } ────│
  │    { outputImageUrls: [...] }   │
```

## 请求示例

### 1. 提交生成任务

```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "水墨画风格的山水风景",
    "selectedModel": "nano-banana",
    "mode": "async"
  }'
```

### 2. 轮询查询结果

```sh
curl https://www.nananobanana.com/api/v1/generate?id=YOUR_GENERATION_ID \
  -H "Authorization: Bearer nb_your_api_key_here"
```

## 响应格式

### 提交成功 (`200 OK`)

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

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | `boolean` | 是否提交成功 |
| `async` | `boolean` | 固定为 `true`，标识异步模式 |
| `generationId` | `string` | 生成任务 ID，用于轮询查询 |
| `message` | `string` | 提示信息 |
| `creditsUsed` | `number` | 本次消耗的积分 |
| `remainingCredits` | `number` | 账户剩余积分 |

### 轮询响应

轮询 `GET /api/v1/generate?id={generationId}` 时，根据 `processingStatus` 判断状态：

**生成中：**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "水墨画风格的山水风景",
    "outputImageUrls": null,
    "modelUsed": "nano-banana",
    "processingStatus": "processing",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**生成完成：**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "水墨画风格的山水风景",
    "outputImageUrls": ["https://..."],
    "modelUsed": "nano-banana",
    "processingStatus": "completed",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**生成失败：**
```json
{
  "data": {
    "id": "clxx...",
    "prompt": "水墨画风格的山水风景",
    "outputImageUrls": null,
    "modelUsed": "nano-banana",
    "processingStatus": "failed",
    "errorMessage": "Generation failed due to server error",
    "creditsUsed": 1,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 服务器繁忙 (`503 Service Unavailable`)

当并发任务数达到上限时：

```json
{
  "error": "Server is busy, too many concurrent tasks. Please retry later.",
  "type": "server_busy",
  "activeTasks": 10
}
```

::: warning
服务器繁忙时，已扣除的积分将**自动退还**，无需手动处理。
:::

## 代码示例

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

# 异步模式 — 提交任务后轮询结果
response = requests.post(
    f"{BASE_URL}/generate",
    headers=HEADERS,
    json={
        "prompt": "水墨画风格的山水风景",
        "selectedModel": "nano-banana",
        "mode": "async"
    }
)

result = response.json()

# 处理服务器繁忙
if response.status_code == 503:
    print("Server busy, please retry later.")
    exit()

if not result.get("success"):
    print("Submit failed:", result.get("error"))
    exit()

generation_id = result["generationId"]
print(f"Task submitted! ID: {generation_id}")
print(f"Credits used: {result['creditsUsed']}")

# 轮询查询结果
max_retries = 60  # 最多轮询 60 次（3 分钟）
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
    
    time.sleep(3)  # 每 3 秒轮询一次
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

// 异步模式 — 提交任务后轮询结果
async function generateAsync() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      prompt: "水墨画风格的山水风景",
      selectedModel: "nano-banana",
      mode: "async"
    })
  });

  // 处理服务器繁忙
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

  // 轮询查询结果
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

    await new Promise(r => setTimeout(r, 3000)); // 每 3 秒轮询
  }

  console.error("⏰ Timeout: generation did not complete in time.");
}

generateAsync();
```

```python [Python 批量任务]
import requests
import time
from concurrent.futures import ThreadPoolExecutor

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

prompts = [
    "日出时的富士山",
    "夜晚的巴黎铁塔",
    "秋天的京都街道",
]

# 批量提交任务
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

# 轮询所有任务
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

## 适用场景

- ✅ 批量生成多张图片
- ✅ 后台任务处理（无需用户等待）
- ✅ 对 HTTP 响应时间敏感的场景
- ✅ 需要解耦"提交"和"获取结果"的架构设计

## 轮询建议

| 参数 | 建议值 | 说明 |
|------|--------|------|
| 轮询间隔 | 3 秒 | 避免过于频繁的请求 |
| 最大轮询次数 | 60 次 | 约 3 分钟超时 |
| 首次轮询延迟 | 5 秒 | 给服务器足够的启动时间 |

## 注意事项

::: warning
- 积分在提交任务时即扣除，而非生成完成后。
- 如果服务器繁忙（503），积分会自动退还。
- 生成失败时积分**不会**自动退还（API 调用默认 `noRefund=true`）。
- 建议设置合理的轮询超时，避免无限等待。
:::
