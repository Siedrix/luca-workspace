import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { WorkFolderPicker } from '@/components/work-folder-picker'
import { ipcErrorMessage } from '@/lib/errors'
import type { AppSettings } from '../../../shared/types'

interface SettingsProps {
  settings: AppSettings
  onSaved: (settings: AppSettings) => void
  onClose: () => void
}

export function Settings({ settings, onSaved, onClose }: SettingsProps): React.JSX.Element {
  const [folder, setFolder] = useState(settings.workspacePath)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = folder !== settings.workspacePath

  const save = async (): Promise<void> => {
    if (!folder) return
    setSaving(true)
    setError(null)
    try {
      onSaved(await window.api.setWorkspacePath(folder))
    } catch (err) {
      setError(ipcErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Back">
          <ArrowLeft />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-6 p-8">
        <section className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-medium">Work folder</h2>
            <p className="text-sm text-muted-foreground">
              The app lists every folder directly inside this one that contains a <code>.git</code>.
              Its data is stored in <code>.workspace.json</code> in that folder; switching folders
              creates a new file there and leaves the old one untouched.
            </p>
          </div>
          <Separator />
          <WorkFolderPicker value={folder} onChange={setFolder} />
        </section>

        <footer className="flex items-center justify-end gap-3 border-t pt-4">
          {error && <p className="mr-auto text-sm text-destructive">{error}</p>}
          <Button
            variant="ghost"
            onClick={() => setFolder(settings.workspacePath)}
            disabled={!dirty || saving}
          >
            Reset
          </Button>
          <Button onClick={save} disabled={!dirty || !folder || saving}>
            Save
          </Button>
        </footer>
      </div>
    </main>
  )
}
