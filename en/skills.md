# Nano Banana Agent Skill

This repository includes a standalone agent skill:

- Skill name: `nano-banana-api`
- Skill path: `skills/nano-banana-api`
- Use cases: text-to-image, image-to-image, model discovery, credit checks, sync/stream/async generation, and polling generation status
- Official website: `https://www.nananobanana.com`

## Directory Layout

```text
skills/nano-banana-api/
├── SKILL.md
├── agents/openai.yaml
├── references/api-reference.md
└── scripts/nano_banana_api.py
```

## Install Into Agents That Support skills.sh

After this repository is pushed to GitHub, install the skill from the repo with:

```bash
npx skills add https://github.com/zwluoqi/NanaBananaDoc --skill nano-banana-api --full-depth
```

The `owner/repo` shorthand also works:

```bash
npx skills add zwluoqi/NanaBananaDoc --skill nano-banana-api --full-depth
```

Notes:

- `--skill nano-banana-api` installs only this skill.
- `--full-depth` scans nested `skills/` directories in the repository.
- `skills.sh` distribution depends on the GitHub repository being public and pushed successfully.

## Use Locally

Set your API key:

```bash
export NANO_BANANA_API_KEY="nb_your_api_key_here"
```

Examples:

```bash
python3 skills/nano-banana-api/scripts/nano_banana_api.py models
python3 skills/nano-banana-api/scripts/nano_banana_api.py credits
python3 skills/nano-banana-api/scripts/nano_banana_api.py generate --prompt "A banana cat wearing sunglasses" --mode sync
python3 skills/nano-banana-api/scripts/nano_banana_api.py generate --prompt "Turn the background into a beach sunset" --reference-image-url https://example.com/source.jpg --mode async --wait
```

## Publish To ClawHub

Publish the skill with the `clawhub` CLI:

```bash
npx clawhub publish /absolute/path/to/NanaBananaDoc/skills/nano-banana-api \
  --slug nano-banana-api \
  --name "Nano Banana API" \
  --version 0.1.0 \
  --tags latest \
  --changelog "Initial release"
```

Use an absolute path. In some environments the CLI rejects relative paths with:

```text
Error: Path must be a folder
```

If needed, log in first:

```bash
npx clawhub login
```

After publishing, the skill may stay hidden briefly while security scanning completes.

## Notes About skills.sh Listing

`skills.sh` does not require a separate manual upload flow. The common path is:

1. Push `skills/nano-banana-api` to a public GitHub repository.
2. Install it via `npx skills add ...`.
3. The skill becomes discoverable inside the `skills.sh` ecosystem as it is installed and indexed.

## Related Files

- [Skill Definition](../skills/nano-banana-api/SKILL.md)
- [Skill CLI](../skills/nano-banana-api/scripts/nano_banana_api.py)
- [Skill Reference](../skills/nano-banana-api/references/api-reference.md)
