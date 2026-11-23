import { useState } from 'react'
import { RefreshCw, Settings as SettingsIcon, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepoList } from '@/components/repo-list'
import { useWorkspaceScan } from '@/hooks/use-workspace-scan'
import { useWorkspaceDb } from '@/hooks/use-workspace-db'

interface HomeProps {
  workspacePath: string
  onOpenSettings: () => void
}

export function Home({ workspacePath, onOpenSettings }: HomeProps): React.JSX.Element {
  const [reloadKey, setReloadKey] = useState(0)
  const { docs, repos, loading, error } = useWorkspaceScan(workspacePath, reloadKey)
  const { error: dbError } = useWorkspaceDb(workspacePath, reloadKey)

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Repositories</h1>
            {!loading && !error && <Badge variant="secondary">{repos.length}</Badge>}
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground" title={workspacePath}>
            {workspacePath}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setReloadKey((k) => k + 1)}
          aria-label="Refresh"
        >
          <RefreshCw />
        </Button>
        <Button variant="outline" onClick={onOpenSettings}>
          <SettingsIcon /> Settings
        </Button>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4 p-8">
        {dbError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>{dbError}</p>
          </div>
        )}
        <RepoList
          docs={docs}
          repos={repos}
          loading={loading}
          error={error}
          className="min-h-0 flex-1"
        />
      </div>
    </main>
  )
}
