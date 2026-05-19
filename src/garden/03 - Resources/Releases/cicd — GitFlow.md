
> [!quote] Gitflow is a legacy Git workflow..
>Gitflow is a legacy Git workflow that was originally a disruptive and novel strategy for managing Git branches. Gitflow has fallen in popularity in favor of trunk-based workflows, which are now considered best practices for modern continuous software development and DevOps practices. Gitflow also can be challenging to use with CI/CD.

---

# Why gitflow still fits certain dev orgs

* **Long UAT windows**: Release branches give UAT a *stable* home for weeks without freezing day-to-day dev on `develop`.
* **Light feature-flag maturity**: You don’t need to “ship dark.” Features live on branches until they’re ready; risky ones simply don’t merge before a release cut.
* **Clear guardrails**: Hotfixes come from `master`, business sign-off happens on `release/*`, developers iterate freely on `feature/*` and `develop`.
* **Auditability**: What UAT saw = what’s released; RCs and finals are versioned semantically and map 1:1 to Artifactory artifacts.

---

# Branches, versions, artifacts

| Branch           | Purpose                                 | Versioning & tags                       | Artifactory example                           |
| ---------------- | --------------------------------------- | --------------------------------------- | --------------------------------------------- |
| `feature/*`      | Isolated feature work, MR to `develop`  | **Snapshots** only: `<last tag>+<sha>`  | `generic-local/com/app/1.10.0+abc123/app.zip` |
| `develop`        | Integration line for next release       | **Beta prereleases**: `1.11.0-beta.N`   | `generic-local/com/app/1.11.0-beta.3/app.zip` |
| `release/x.y`    | UAT + perf/load hardening for x.y       | **RCs**: `x.y.0-rc.N`                   | `generic-local/com/app/1.11.0-rc.2/app.zip`   |
| `master`         | Production history                      | **Finals**: `x.y.z`, tag `vX.Y.Z`       | `generic-release/com/app/1.11.0/app.zip`      |
| `hotfix/x.y.z+1` | Urgent prod fixes based on last release | **Patch finals**: `x.y.(z+1)`, tag `v…` | `generic-release/com/app/1.11.1/app.zip`      |

> **Traceability rule:** artifact version == Git tag/version (store build number, git SHA, CI URLs as **properties**, not in the version).

---

# Environment mapping & what runs where

| Environment    | Source branch / artifact       | What’s deployed                              | Tests that run (must pass to promote) |
| -------------- | ------------------------------ | -------------------------------------------- | ------------------------------------- |
| **Feature CI** | `feature/*` snapshot (`+sha`)  | Ephemeral test deploy (if you support it)    | Unit, lint, **smoke E2E** on MR       |
| **Dev**        | `develop` **beta** (`-beta.N`) | Continuous deploy after `develop` passes CI  | **Smoke E2E**                         |
| **Test**       | `develop` **beta** (`-beta.N`) | Promote same beta from Dev                   | **Full E2E/regression/contract**      |
| **Preprod**    | `release/x.y` **RC** (`-rc.N`) | UAT/perf/load candidate                      | **UAT sign-off + load/perf gates**    |
| **Prod**       | `master` **final** (`x.y.z`)   | Promote the **exact RC** that passed preprod | Smoke + monitoring (rollback if fail) |

---

# Release train workflow (with triggers)

| Step | Action                    | Trigger / Gate                                                                                       | Resulting version / movement                            |
| ---- | ------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1    | Merge feature → `develop` | MR approved → CI builds snapshot; if full CI passes, **semantic-release prerelease** makes `-beta.N` | `develop` publishes `1.11.0-beta.N` → Dev/Test          |
| 2    | Cut `release/1.11`        | Product/eng decision; job creates branch from `develop`                                              | First **RC** `1.11.0-rc.0` → Preprod                    |
| 3    | Harden on `release/1.11`  | Automated perf tests + **manual UAT gate**; fixes are **committed on release** or cherry-picked in   | New RCs: `rc.1`, `rc.2`… each **re-deploys** to Preprod |
| 4    | Ship `1.11.0`             | All preprod gates green → **release job** runs                                                       | Semantic final **`1.11.0`** (tag `v1.11.0`)             |
| 5    | Promote & deploy prod     | After final tag, **promotion job** copies artifact to stable & deploys                               | Prod on **exact** bits tested; post-deploy smoke        |
| 6    | Back-merge bookkeeping    | Automation: merge `release/1.11` → `master` (tag lives here), then `master` → `develop`              | Keeps histories aligned (no code lost on develop)       |

---

# Hotfixes (clear & safe)

**Goal:** patch prod fast, keep all lines consistent.

1. Branch `hotfix/1.11.1` **from `master` at `v1.11.0`**
2. Implement fix → CI → semantic-release **final** `1.11.1`
3. Deploy to **preprod** quickly (sanity) → promote to **prod**
4. **Merge back**:

   * `hotfix/1.11.1` → `master` (already tagged by release job)
   * `master` → `develop` (so next train has the fix)
   * If `release/1.12` exists, **cherry-pick** fix → new **`1.12.0-rc.N`** and re-run preprod gates

> Yes, cherry-picking into an open `release/*` creates a **new RC** and immediately revalidates in Preprod. Hotfix itself is a **patch** on `master`.

---

# Merge strategies (keep it predictable)

| Flow                                   | Merge style                                          | Why                                                                     |
| -------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `feature/*` → `develop`                | **Squash merge**                                     | Clean history; one commit per feature; reverts are easy                 |
| `develop` → `release/x.y` (branch cut) | **Create branch** (no merge)                         | Snapshot the train cleanly                                              |
| Fixes on `release/x.y`                 | **Direct commits** or **cherry-pick** from `develop` | Keep RC isolated; only intended changes land                            |
| `release/x.y` → `master` (finalize)    | **Merge commit (no-ff)**                             | Preserve release boundary in history                                    |
| `master` → `develop` (back-merge)      | **Merge commit (no-ff)**                             | Ensure develop contains what’s in prod; avoid rebase on shared branches |
| `hotfix/*` → `master`                  | **Merge commit (no-ff)**                             | Keep hotfix cut visible; tag anchored on master                         |
| `master` → `develop` (after hotfix)    | **Merge commit (no-ff)**                             | Propagate fix forward safely                                            |
| Cherry-pick into `release/*`           | **Cherry-pick**                                      | Minimal blast radius; bumps RC (`-rc.N+1`)                              |

> Avoid **rebase** on shared branches (`develop`, `release/*`, `master`) to protect CI provenance and tags.

---

# Testing layers (what blocks what)

| Layer                            | Runs on                           | Blocks           |
| -------------------------------- | --------------------------------- | ---------------- |
| Unit/Lint/Type                   | feature, develop, release, hotfix | ✅                |
| **Smoke E2E**                    | feature MR pipelines, Dev         | ✅                |
| **Full E2E/Regression**          | Test (betas from `develop`)       | ✅                |
| **Load/Performance**             | Preprod (RCs)                     | ✅                |
| **UAT (manual gate)**            | Preprod (RCs)                     | ✅                |
| **Post-deploy smoke & monitors** | Prod                              | rollback if fail |

---

# Guardrails that make this work

* **Build once, promote upward** (the RC promoted to prod is byte-identical).
* **Configuration out of the artifact**; env via CI/CD vars/secret store.
* **Version alignment** between Git tags and Artifactory paths; use **properties** for SHA/pipeline.
* **RCs/finals only via semantic-release**; snapshots for feature/develop speed.
* **Release branches are short-lived**; close them after final and back-merges.
