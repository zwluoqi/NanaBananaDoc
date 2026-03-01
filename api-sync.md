# 同步请求模式

`mode` 为 `"sync"` 或不传时，服务器将等待图像生成完成后一次性返回结果。这是最简单的集成方式，适合脚本调用和简单的后端集成场景。

## 请求示例

```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "一只可爱的橘猫坐在窗台上",
    "selectedModel": "nano-banana",
    "mode": "sync"
  }'
```

::: tip
`mode` 参数可以省略，默认即为同步模式。
:::

## 响应格式

### 成功响应 (`200 OK`)

```json
{
  "success": true,
  "generationId": "clxx...",
  "imageUrls": ["https://..."],
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | `boolean` | 是否成功 |
| `generationId` | `string` | 生成记录 ID |
| `imageUrls` | `string[]` | 生成的图片 URL 列表 |
| `creditsUsed` | `number` | 本次消耗的积分 |
| `remainingCredits` | `number` | 账户剩余积分 |

### 警告响应 (`200 OK`)

当生成完成但触发内容安全检查时：

```json
{
  "success": false,
  "warning": true,
  "generationId": "clxx...",
  "message": "内容安全检查未通过",
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

### 错误响应

参见 [通用错误响应](/api#_6-通用错误响应)。

## 代码示例

::: code-group

```python [Python]
import requests

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"

# 文生图 — 同步模式（默认）
response = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "一只可爱的橘猫坐在窗台上，阳光洒在它身上",
        "selectedModel": "nano-banana"
    }
)

result = response.json()
if result.get("success"):
    print("Image URLs:", result["imageUrls"])
    print("Credits used:", result["creditsUsed"])
else:
    print("Error:", result.get("error"))

# 图生图 — 同步模式
response_img2img = requests.post(
    f"{BASE_URL}/generate",
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    },
    json={
        "prompt": "将背景替换为海滩，保持人物不变",
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

// 文生图 — 同步模式（默认）
async function generateImage() {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt: "一只可爱的橘猫坐在窗台上",
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

## 适用场景

- ✅ 脚本批量调用（单次调用等待完成即可）
- ✅ 后端服务集成（无需前端进度展示）
- ✅ 快速原型验证

## 注意事项

::: warning
同步模式下，请求会一直等待直到图像生成完成。根据模型和图像复杂度，生成时间可能需要 10-60 秒。请确保客户端的超时设置足够长，建议至少设置为 120 秒。
:::
