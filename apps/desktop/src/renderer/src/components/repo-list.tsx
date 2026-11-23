import { FolderGit2, Loader2, NotebookText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DocsFolder, GitRepo } from '../../../shared/types'

interface RepoListProps {
  docs: DocsFolder | null
  repos: GitRepo[]
  loading?: boolean
  error?: string | null
  className?: string
}

/** The work folder's contents: the docs folder pinned on top, then the git repos. */
export function RepoList({
  docs,
  repos,
  loading,
  error,
  className
}: RepoListProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Scanning folder…
      </div>
    )
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  }

  return (
    <div className={cn('flex min-h-0 flex-col gap-3', className)}>
      {docs && <DocsCard docs={docs} />}

      {repos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No git repositories found at the top level of this folder.
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1 rounded-lg border">
          <ul className="divide-y">
            {repos.map((repo) => (
              <li key={repo.path} className="flex items-center gap-3 px-4 py-3">
                <FolderGit2 className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{repo.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{repo.path}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  )
}

function DocsCard({ docs }: { docs: DocsFolder }): React.JSX.Element {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-lg border border-dashed bg-muted/40 px-4 py-3">
      <NotebookText className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{docs.name}</p>
        <p className="truncate text-xs text-muted-foreground">{docs.path}</p>
      </div>
      <Badge variant="outline">Personal notes</Badge>
    </div>
  )
}
