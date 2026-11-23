# Website maintenance

- Portfolio data/artwork lives in the separate private repo at C:/Users/chels/Documents/Codex/portfolio-api. Never copy it or credentials into this public repo.
- After changing projects.html, run `python tools/sync-projects-route.py` before publishing. It generates the clean /projects/ entry point with root-relative assets.
- Local preview: `python tools/serve.py --port 4184`. This supports the extensionless URLs used by GitHub Pages.
- Preserve unrelated working-tree changes; stage only the current task's files or hunks.
