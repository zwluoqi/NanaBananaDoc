# Nano Banana API 文档

通过 REST API 接口实现 AI 图像生成的程序化调用。支持文生图、图生图等多种生成模式。

## 1. 快速开始

### 第一步：获取 API Key
前往官网 **设置 -> API 密钥** 页面创建 API Key。

### 第二步：发送请求
```sh
curl -X POST https://www.nananobanana.com/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer nb_your_api_key_here" \
  -d '{
    "prompt": "一只可爱的橘猫坐在窗台上",
    "selectedModel": "nano-banana"
  }'
```

## 2. 认证方式

所有 API 请求需要在 HTTP Header 中携带 API Key 进行认证：

```http
Authorization: Bearer nb_your_api_key_here
```

::: warning
⚠️ API Key 仅在创建时显示一次，请妥善保管。每个用户最多可创建 5 个 API Key。
:::

## 3. Base URL

```text
https://www.nananobanana.com/api/v1
```

## 4. API 接口

### POST `/api/v1/generate`
生成图像。支持文生图和图生图两种模式。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|:---:|------|
| `prompt` | `string` | **✓** | 图像生成提示词 |
| `selectedModel` | `string` | - | 模型名称，默认 `"nano-banana"` |
| `referenceImageUrls` | `string[]` | **\*** | 参考图片 URL 数组（图生图时必填） |
| `aspectRatio` | `string` | - | 宽高比，默认 `"default"` |

**成功响应 (`200 OK`)**

```json
{
  "success": true,
  "generationId": "clxx...",
  "imageUrls": ["https://..."],
  "creditsUsed": 1,
  "remainingCredits": 99
}
```

**错误响应**

- `401 Unauthorized`: API Key 无效或缺失
- `400 Bad Request`: 请求参数错误
- `402 Payment Required`: 积分不足
- `500 Internal Server Error`: 服务器内部错误

---

### GET `/api/v1/generate`
查询生成记录的状态和结果。

**查询参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 生成记录 ID |

**响应**

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

---

### GET `/api/v1/models`
获取可用的图像生成模型列表。无需认证。

**响应**

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
查询当前账户可用积分余额。

**响应**

```json
{
  "data": {
    "credits": 100
  }
}
```

## 5. 代码示例

::: code-group

```python [Python]
import requests

API_KEY = "nb_your_api_key_here"
BASE_URL = "https://www.nananobanana.com/api/v1"

# Text-to-Image 文生图示例
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

# Image-to-Image 图生图示例
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

// Text-to-Image 文生图示例
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

## 6. 注意事项

- API 调用不进行安全关键词检查，请确保输入内容合规。
- 每次生成消耗的积分取决于选择的模型，默认模型消耗 1 积分。
- 图生图模式中，每增加一张参考图片额外消耗 1 积分。
- 生成的图片 URL 有效期为 15 天，请及时下载保存。
- 每个用户最多可创建 5 个 API Key。

## 7. 联系我们

如有 API 集成相关问题，请通过以下方式联系我们：
- 📧 API 技术支持：[support@nananobanana.com](mailto:support@nananobanana.com)
- 📧 API 技术支持：[guimei0sgsg@gmail.com](mailto:guimei0sgsg@gmail.com)

