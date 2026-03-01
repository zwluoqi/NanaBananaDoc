# Nano Banana API 文档

通过 REST API 接口实现 AI 图像生成的程序化调用。支持文生图、图生图等多种生成模式，并提供同步、流式、异步三种请求方式。

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

## 4. 生成接口

### POST `/api/v1/generate`
生成图像。支持文生图和图生图两种模式，以及三种请求方式。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|:---:|------|
| `prompt` | `string` | **✓** | 图像生成提示词 |
| `selectedModel` | `string` | - | 模型名称，默认 `"nano-banana"` |
| `referenceImageUrls` | `string[]` | **\*** | 参考图片 URL 数组（图生图时必填） |
| `aspectRatio` | `string` | - | 宽高比，默认 `"default"` |
| `mode` | `string` | - | 请求方式：`"sync"`（默认）、`"stream"`、`"async"` |

::: tip
系统会根据是否传入 `referenceImageUrls` 自动判断生成类型（文生图 / 图生图），无需手动指定。
:::

### 三种请求方式

请根据你的使用场景选择合适的请求方式：

| 特性 | 同步 `sync` | 流式 `stream` | 异步 `async` |
|------|:-----------:|:-------------:|:------------:|
| 响应方式 | 等待完成后返回 | SSE 实时推送 | 立即返回，轮询结果 |
| 进度反馈 | ❌ | ✅ | ❌ |
| 适用场景 | 简单集成、脚本调用 | 前端实时展示 | 批量任务、后台处理 |
| 超时风险 | 较高（需等待完成） | 较低（持续连接） | 无（立即返回） |
| 复杂度 | ⭐ | ⭐⭐ | ⭐⭐ |

👉 查看各模式的详细说明和代码示例：
- [同步请求模式](/api-sync) — 最简单的集成方式
- [流式请求模式](/api-stream) — 实时进度推送
- [异步请求模式](/api-async) — 后台处理，轮询结果

### GET `/api/v1/generate`
查询生成记录的状态和结果。通常与异步模式配合使用。

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

**`processingStatus` 状态值**

| 状态 | 说明 |
|------|------|
| `processing` | 正在生成中 |
| `completed` | 生成完成，`outputImageUrls` 包含结果图片 |
| `failed` | 生成失败，`errorMessage` 包含错误信息 |

---

## 5. 其他接口

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

## 6. 通用错误响应

| 状态码 | 说明 |
|--------|------|
| `400 Bad Request` | 请求参数错误（如缺少 `prompt`、`mode` 值无效） |
| `401 Unauthorized` | API Key 无效或缺失 |
| `402 Payment Required` | 积分不足 |
| `403 Forbidden` | 账户未开通 API 访问权限 |
| `500 Internal Server Error` | 服务器内部错误 |
| `503 Service Unavailable` | 服务器繁忙（仅异步模式） |

## 7. 注意事项

- API 调用不进行安全关键词检查，请确保输入内容合规。
- 每次生成消耗的积分取决于选择的模型，默认模型消耗 1 积分。
- 图生图模式中，每增加一张参考图片额外消耗 1 积分。
- 生成的图片 URL 有效期为 15 天，请及时下载保存。
- 每个用户最多可创建 5 个 API Key。
- 需要账户开通 API 访问权限后才能调用（累计充值满 ¥1000 自动开通，或联系管理员手动开通）。

## 8. 联系我们

如有 API 集成相关问题，请通过以下方式联系我们：
- 📧 API 技术支持：[support@nananobanana.com](mailto:support@nananobanana.com)
- 📧 API 技术支持：[guimei0sgsg@gmail.com](mailto:guimei0sgsg@gmail.com)
