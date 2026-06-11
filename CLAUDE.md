# Repo guide for agents

Personal static site for **hung.su**, built with Astro 6 and deployed to
Cloudflare (Workers static assets). Hung-Su hands agents loose ideas; agents
implement them and open a PR with a live preview link for him to review and
merge.

## How we work

- **Run with the idea.** Implement features, redesigns, new pages, components,
  posts — whatever the idea calls for. There is no file you are forbidden to
  touch. Creativity is welcome.
- **The PR is the gate, not a limit on your creativity.** Every change lands via
  a pull request. Hung-Su reviews each PR through its Cloudflare **preview link**
  and merges it himself — often from a phone, anywhere in the world. Nothing you
  do reaches the live site until he clicks merge.
- **One idea = one PR.** Each PR gets its own isolated preview deploy, so keep
  them focused and independently reviewable.

## Start every task in your own worktree

**Other agents may be sharing this checkout at the same time.** Working directly
in the primary checkout — or reusing a branch another agent created — leads to
collisions (mixed-up working trees, branches that grow unrelated commits). So
**before you make any change**, isolate yourself in a fresh git worktree on a new
branch off the latest `main`:

```sh
git fetch origin
git worktree add ../hung.su-2026-<slug> -b <type>/<slug> origin/main
cd ../hung.su-2026-<slug>
npm install   # worktrees don't share node_modules
```

- `<type>/<slug>` follows the branch convention below (`feat/…`, `fix/…`, `post/…`).
- Do **all** your work — edits, commits, `npm run build` — inside this worktree.
- Never branch off another agent's branch; always off `origin/main`.
- After your PR is merged, clean up: `git worktree remove ../hung.su-2026-<slug>`.

## Non-negotiables

1. **Never push to `main` or merge a PR.** Open the PR and stop. (`main` is
   branch-protected, so this is enforced — but don't try to work around it.)
2. **Keep the build green.** Run `npm run build` before opening a PR. If the
   build fails, the Cloudflare preview never deploys — and a PR with no preview
   link is useless for review. The required `Workers Builds: hungsu-2026` check
   blocks merge while it's red.
3. **Write a PR description that says what to look at and how to verify it** —
   e.g. "toggle the new dark-mode switch in the header." Hung-Su reviews via the
   preview link, so tell him exactly where to click.

## Branch / PR conventions

- Branch names: `feat/<slug>`, `fix/<slug>`, or `post/<slug>`.
- Open the PR with `gh pr create`, a clear title, and a body following the
  "what to look at" rule above.

## Authentication — act as the bot, never as Hung-Su

Agent work is attributed to the **`hungsu-bot`** GitHub account, not to Hung-Su.
The repo's local git commit identity is already set to the bot, so commits are
attributed correctly. For anything that talks to GitHub (push, PR), authenticate
with the bot's token so the PR is opened by the bot:

```sh
GH_TOKEN="$(cat ~/.config/hungsu-bot.token)" git push -u origin <branch>
GH_TOKEN="$(cat ~/.config/hungsu-bot.token)" gh pr create --title "..." --body "..."
```

`main` requires one approving review, which the bot **cannot** give its own PR.
So opening the PR is the end of your job — Hung-Su approves and merges.

## Project reference

- **Blog posts** live in `src/content/blog/*.md` (use `.mdx` only when you need
  to embed components). Frontmatter is schema-checked in
  `src/content.config.ts`:
  - required: `title`, `description`, `pubDate`
  - optional: `updatedDate`, `heroImage` (a relative path into `src/assets/`)
  - A frontmatter mistake fails the build, so it'll be caught before merge.
- **Site config:** `src/consts.ts` (site title/description) and
  `astro.config.mjs` (`site` is `https://hung.su`).
- **Deploy:** the site ships as **static assets** via `wrangler.jsonc` — no SSR.
  Do **not** re-add the `@astrojs/cloudflare` adapter unless a feature genuinely
  needs server rendering: it enables Astro Sessions + KV auto-provisioning,
  which previously broke every deploy. If you change `wrangler.jsonc`,
  `astro.config.mjs`, `package.json`, or `.github/`, call it out prominently in
  the PR description — those affect build/deploy.

## Local commands

| Command         | Action                                            |
| --------------- | ------------------------------------------------- |
| `npm install`   | Install dependencies                              |
| `npm run build` | Build + type/frontmatter check (run before a PR)  |
| `npm run dev`   | Local dev server                                  |
