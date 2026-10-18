# Making changes with an AI coding tool

Use the same GitHub repository with Claude, Codex, ChatGPT or your local editor.
The chosen integration must support editing a branch and creating a pull request.
GitHub access that only reads a repository is sufficient for review, but not for
publishing edits. Do not share server passwords or SSH keys with the AI tool.

1. Ask for the change on a new feature branch, following `AGENTS.md`. Claude also
   reads the root `CLAUDE.md` entry point.
2. Have the tool open a pull request against `main` and run the required checks.
3. Review the changes and merge once CI is green.
4. The same CI run on `main` builds and checks the code, then deploys Avrix to the
   existing server. Watch **GitHub → Actions → CI → Deploy Avrix server**.

Example request:

> Update the WIMS solution page with the supplied copy. Follow AGENTS.md, keep
> URLs stable, run content validation and the frontend build, and open a PR
> against main. Do not push directly to main or change deployment credentials.

## What the pipeline does

Pull requests run content, lint, TypeScript, frontend tests, backend tests,
database migration checks, accessibility, performance and deployment archive
validation. They do not receive production deployment secrets or deploy.

Only a successful `push` CI run on `main` can deploy. The deployment uses the
exact frontend artifact already checked in that run and tracked backend source
from the same commit. A production-environment restriction limits deployment
credentials to `main`. Server identity is pinned instead of accepted on first use.

A dedicated SSH account and key can invoke only the Avrix deployment command.
There is no interactive shell, port forwarding, general file upload or arbitrary
sudo. Executable application and dependency code runs as `avrix` inside its
existing resource limits. Each release has its own Python environment, followed
by a database backup, migrations, static collection and an atomic release switch.
Only the Avrix API is restarted; WIMS and Nginx configuration are not modified.

Backend health, the frontend release marker and WIMS health/identity are checked.
If the new application fails after switching, the previous application release
is reactivated. Database migrations are not reversed: backend changes must keep
the old application compatible with the migrated schema during rollback.

Production `.env`, database contents, accounts and email/Turnstile secrets stay
on the server and are not replaced by deployment. Routine deployments do not
update root-owned deployment scripts, Nginx or service configuration; those need
separate maintenance. Release directories are retained for rollback; review disk
usage and remove older inactive releases during server maintenance.

## Configuration

Repository variables:

- `ENABLE_VPS_DEPLOY=true` enables the main-branch deployment job.
- `PUBLIC_FORMS_ENABLED=false` keeps enquiry/newsletter forms disabled until SMTP
  and Turnstile are ready. Match the server's `PUBLIC_FORMS_ENABLED` setting; the
  deployment rejects a mismatch rather than publishing inconsistent forms.
- `VITE_TURNSTILE_SITE_KEY` is the public widget key, needed when forms are enabled.

Production environment secrets: `AVRIX_VPS_HOST`, `AVRIX_VPS_USER`,
`AVRIX_VPS_SSH_KEY` and `AVRIX_VPS_KNOWN_HOSTS`. Do not put their values in code,
PR descriptions, screenshots or chat. Existing legacy deployment workflows stay
disabled. Initial activation requires the open launch PR to be merged into
`main`, then `main` should be the repository's default branch for future tools.
