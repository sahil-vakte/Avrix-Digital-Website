# AVRIX Digital website

Read and follow [AGENTS.md](AGENTS.md) before making changes. It contains the
content locations, schemas, British English conventions and verification rules.

Create a feature branch and a pull request targeting `main`. Never push directly
to `main`, commit `.env` files or deploy over SSH from an AI session. The GitHub
pipeline tests the change and deploys Avrix after a successful merge to `main`.
Keep copy-only changes in `content/`. Do not change the existing WIMS application.

See [the change workflow](docs/CHANGE-WORKFLOW.md) for commands and deployment
behaviour. A connected GitHub integration must support writing branches or PRs;
read-only integrations can review code but cannot publish changes by themselves.
