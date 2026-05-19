# second-brain

A digital garden of interconnected notes on software development, philosophy, and general thoughts. Structured using the [Zettelkasten](https://zettelkasten.de/) and [PARA](https://fortelabs.com/blog/para/) methods. Authored in [Obsidian](https://obsidian.md/) and published via [Quartz](https://quartz.jzhao.xyz/).

---

## Prerequisites

- [Node.js](https://nodejs.org/) 22+ (pinned via `.mise.toml` — `mise install` sets this automatically)
- [mise](https://mise.jdx.dev/) (or any Node version manager)
- Git

## Setup (new machine)

```bash
git clone https://github.com/jordanhoare/second-brain.git
cd second-brain
mise install        # installs Node 22 via .mise.toml
mise run setup      # installs Quartz npm dependencies and pre-commit hooks
```

## Daily use

| Command | Description |
|---------|-------------|
| `mise run serve` | Sync notes and serve locally at `localhost:8080` with live reload |
| `mise run build` | Sync notes and build the static site to `src/quartz/public/` |
| `mise run sync` | Pull latest, commit garden changes, push |
| `mise run clean` | Remove all generated artefacts |

## Syncing between machines

Run `mise run sync` when starting or finishing a session. It pulls with rebase, stages only the garden (`src/garden/`), commits if there are changes, and pushes.

```bash
# beginning of session
mise run sync

# ... edit notes in Obsidian or terminal ...

# end of session
mise run sync
```

To avoid conflicts: always `mise run sync` before opening Obsidian on a second machine.

## Publishing

Pushing to `master` triggers a GitHub Actions workflow that:

1. Copies `src/garden/` into Quartz (excluding `09 - Meta/Templates`)
2. Builds the static site
3. Deploys to GitHub Pages

No manual publishing step required.

## Structure

```
src/
├── garden/               # Obsidian vault (the source of truth)
│   ├── 00 - Maps of Content/
│   ├── 01 - Projects/
│   ├── 02 - Areas/
│   ├── 03 - Resources/
│   ├── 04 - Permanent/
│   ├── 05 - Fleeting/
│   ├── 06 - Journal/
│   ├── 07 - Archives/
│   ├── 08 - Essays/
│   └── 09 - Meta/        # templates (excluded from published site)
└── quartz/               # Quartz SSG (customised install)
```
