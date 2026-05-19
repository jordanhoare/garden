# second-brain

A digital garden of interconnected notes on software development, philosophy, and general thoughts. Structured using the [Zettelkasten](https://zettelkasten.de/) and [PARA](https://fortelabs.com/blog/para/) methods. Authored in [Obsidian](https://obsidian.md/) and published via [Quartz](https://quartz.jzhao.xyz/).

## Prerequisites

- [Node.js](https://nodejs.org/) 22+ (pinned via `.mise.toml` — `mise install` sets this automatically)
- [pre-commit](https://pre-commit.com/) (`brew install pre-commit`)
- [mise](https://mise.jdx.dev/)
- Git

## Setup

```bash
git clone https://github.com/jordanhoare/second-brain.git
cd second-brain
mise install        # installs Node 22 via .mise.toml
mise run setup      # installs Quartz npm dependencies and pre-commit hooks
```

Point Obsidian at the `garden/` directory as your vault.

## Daily use

| Command            | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `mise run serve`   | Sync notes and serve locally at `localhost:8080` with live reload |
| `mise run build`   | Sync notes and build the static site to `quartz/public/`          |
| `mise run sync`    | Format notes, pull latest, commit changes, push                   |
| `mise run prepare` | Run formatting hooks across all garden files                      |
| `mise run clean`   | Remove all generated artefacts                                    |

## Syncing between machines

Run `mise run sync` when starting or finishing a session. It formats, pulls with rebase, commits if there are changes, and pushes.

```bash
# beginning of session
mise run sync

# ... edit notes in Obsidian or terminal ...

# end of session
mise run sync
```
