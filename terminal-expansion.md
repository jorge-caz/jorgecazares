# Terminal Expansion Roadmap

This document breaks the full terminal feature into **bite-sized phases**.  Each phase can be shipped independently and keeps the desktop usable while work continues.

> **Drive/Root convention**  
> • The in-memory FS root (`id: "root"`) represents drive **`JorgeOS (C:)`**.  
> • Absolute paths therefore start with `C:/` (Windows-style).  
> • Forward slashes `/` are accepted inside the app to keep URLs simple.

---

## Phase 1 – Path helpers (absolute ⇄ relative)

1. **`utils/pathUtils.ts`** (already scaffolded)  
   • `getAbsolutePath(fs, nodeId): string` – `desktop-folder` → `C:/Users/Admin/Desktop`  
   • `resolvePath(fs, cwdId, path): FSNode | null` – handles:  
     - absolute (`C:/Windows/System32`)  
     - relative (`..`, `.`)  
     - mixed (`C:/Users/Admin/../Guest`)
2. Unit tests (Vitest) covering edge-cases.

> Delivered – core helpers landed in codebase.

---

## Phase 2 – `cd` (change directory)

1. **API**  
   ```ts
   cd(root, cwdId, path) => newCwdId
   ```
2. Update **`Terminal`** component to maintain internal `cwdId` state and echo the absolute path after each `cd`.
3. Error messaging for invalid paths (`echo 'The system cannot find the path specified.'`).

> Status – helper available; UI wiring pending.

---

## Phase 3 – `mkdir` (make directory)

1. **API**  
   ```ts
   mkdir(root, cwdId, 'NewFolder') => newRoot
   ```
2. Rules:  
   • Disallow creation inside protected/system folders.  
   • Auto-rename (`New Folder (2)`) if name collision.  
3. UI: Terminal prints `Directory "C:/.../NewFolder" created.`

---

## Phase 4 – `mv` (move / rename)

1. **API**  
   ```ts
   mv(root, cwdId, 'sourcePath', 'destPath') => newRoot
   ```
2. Behaviours:  
   • If `destPath` is folder → move *into* folder.  
   • If `destPath` ends with filename → rename while moving.  
3. Collision and protected-item safeguards.

---

## Phase 5 – `rm` (remove)

1. **API**  
   ```ts
   rm(root, cwdId, 'targetPath') => newRoot
   ```
2. Soft-delete: moved to *Recycle Bin* first; permanent delete on second call or from bin UI.
3. Block deletion of protected items (`system32`, etc.) and echo descriptive error.

---

## Phase 6 – `help` command & parser polish

1. Add a mini command parser to `Terminal` supporting:  
   `cd`, `mkdir`, `mv`, `rm`, `pwd`, `help`, and clear screen (`cls`).
2. `help` prints usage table:

   ```bash
   cd [path]             # change directory
   mkdir <name>          # create folder
   mv <src> <dest>       # move or rename
   rm <path>             # delete file/folder
   pwd                   # print current directory
   cls                   # clear terminal
   help                  # this text
   ```
3. Keyboard & UX niceties (arrow-key history, autocomplete optional).

---

## Stretch Goals

* Bash-style piping into existing desktop apps (e.g., `cat file.txt | notepad`).
* Themeable terminal (PowerShell, DOS, etc.).
* Real shell integration via Web Assembly for advanced users.

---

### Implementation Sequence

| Phase | PR Branch                | Est. Time |
|-------|--------------------------|-----------|
| 1     | `feature/terminal-paths` | 1 day     |
| 2     | `feature/terminal-cd`    | 0.5 day   |
| 3     | `feature/terminal-mkdir` | 0.5 day   |
| 4     | `feature/terminal-mv`    | 0.5 day   |
| 5     | `feature/terminal-rm`    | 0.5 day   |
| 6     | `feature/terminal-help`  | 1 day     |

> Total ≈ **4 days**, allowing review & polish.

---

## Current Status Snapshot (June 2025)

- [x] Context-menu **Open in Terminal** implemented (Phase 0).  
- [x] Path helpers scaffolding committed.  
- [ ] Command parser & remaining phases.

Let's iterate one phase at a time to keep PRs reviewable and the desktop stable. 