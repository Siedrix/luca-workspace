# workspace

pnpm monorepo.

- `apps/desktop` — Electron + React + TypeScript (electron-vite), Tailwind CSS v4, shadcn/ui
- `packages/*` — shared packages (empty for now)

```sh
pnpm install
pnpm dev        # run the desktop app
pnpm build      # typecheck + build all
pnpm lint
```

Add shadcn components from `apps/desktop`:

```sh
cd apps/desktop && pnpm dlx shadcn@latest add dialog
```
