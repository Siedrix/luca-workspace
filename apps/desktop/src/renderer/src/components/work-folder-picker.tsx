import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RepoList } from '@/components/repo-list'
import { useWorkspaceScan } from '@/hooks/use-workspace-scan'

interface WorkFolderPickerProps {
  /** The folder currently shown. */
  value: string | null
  onChange: (path: string) => void
  /** Preview the docs folder and git repositories inside the chosen folder. Defaults to true. */
  showContents?: boolean
}

/**
 * Lets the user choose a work folder with the native dialog and, optionally, previews the
 * docs folder and git repositories found directly inside it. Used by onboarding and settings.
 */
export function WorkFolderPicker({
  value,
  onChange,
  showContents = true
}: WorkFolderPickerProps): React.JSX.Element {
  const [picking, setPicking] = useState(false)
  // Passing null skips the scan when the preview is hidden.
  const { docs, repos, loading, error } = useWorkspaceScan(showContents ? value : null)

  const choose = async (): Promise<void> => {
    setPicking(true)
    try {
      const path = await window.api.pickFolder()
      if (path) onChange(path)
    } finally {
      setPicking(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <FolderOpen className="size-5 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 truncate font-mono text-sm" title={value ?? undefined}>
          {value ?? <span className="font-sans text-muted-foreground">No folder selected</span>}
        </p>
        <Button variant={value ? 'outline' : 'default'} onClick={choose} disabled={picking}>
          {value ? 'Change…' : 'Choose folder…'}
        </Button>
      </div>

      {showContents && value && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">Git repositories</h3>
            {!loading && !error && <Badge variant="secondary">{repos.length}</Badge>}
          </div>
          <RepoList
            docs={docs}
            repos={repos}
            loading={loading}
            error={error}
            className="min-h-0 flex-1"
          />
        </div>
      )}
    </div>
  )
}
