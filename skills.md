# Nano Banana Agent Skill

项目已内置可供 agent 直接安装和调用的独立 skill：

- Skill 名称：`nano-banana-api`
- Skill 目录：`skills/nano-banana-api`
- 适用场景：文生图、图生图、查询模型、查询积分、同步/流式/异步生成、轮询任务状态
- 官方网站：`https://www.nananobanana.com`

## 目录结构

```text
skills/nano-banana-api/
├── SKILL.md
├── agents/openai.yaml
├── references/api-reference.md
└── scripts/nano_banana_api.py
```

## 安装到支持 skills.sh 的 agent

仓库推送到 GitHub 后，可通过 `skills` CLI 从仓库安装：

```bash
npx skills add https://github.com/zwluoqi/NanaBananaDoc
```

如果使用 `owner/repo` 简写，也可以写成：

```bash
npx skills add zwluoqi/NanaBananaDoc
```

可选参数：

- `-g, --global`：安装到全局目录 `~/.claude/skills/`（默认安装到当前项目）。
- `-f, --force`：强制重新安装已存在的 skill。
- `--skip-setup`：跳过安装后的 setup 脚本。

说明：

- `skills.sh` 主要基于 GitHub 仓库分发 skill，因此仓库必须先公开并推送成功。

## 本地直接使用

设置 API Key：

```bash
export NANO_BANANA_API_KEY="nb_your_api_key_here"
```

调用示例：

```bash
python3 skills/nano-banana-api/scripts/nano_banana_api.py models
python3 skills/nano-banana-api/scripts/nano_banana_api.py credits
python3 skills/nano-banana-api/scripts/nano_banana_api.py generate --prompt "一只戴墨镜的香蕉猫" --mode sync
python3 skills/nano-banana-api/scripts/nano_banana_api.py generate --prompt "把背景改成海边日落" --reference-image-url https://example.com/source.jpg --mode async --wait
```

## 发布到 ClawHub

本 skill 可通过 `clawhub` CLI 发布：

```bash
npx clawhub publish /absolute/path/to/NanaBananaDoc/skills/nano-banana-api \
  --slug nano-banana-api \
  --name "Nano Banana API" \
  --version 0.1.0 \
  --tags latest \
  --changelog "Initial release"
```

建议使用绝对路径。当前 CLI 某些环境下对相对路径会报：

```text
Error: Path must be a folder
```

如果未登录，请先执行：

```bash
npx clawhub login
```

发布成功后，技能通常会先进入安全扫描，短时间内可能处于隐藏状态。

## 发布到 skills.sh 的注意事项

`skills.sh` 不需要单独手工上传后台。常见流程是：

1. 将 `skills/nano-banana-api` 推送到公开 GitHub 仓库。
2. 通过 `npx skills add ...` 从该仓库安装。
3. 随着安装和收录，技能会出现在 `skills.sh` 生态中。

## 相关文件

- [API Skill 定义](./skills/nano-banana-api/SKILL.md)
- [API Skill CLI](./skills/nano-banana-api/scripts/nano_banana_api.py)
- [API Skill Reference](./skills/nano-banana-api/references/api-reference.md)
