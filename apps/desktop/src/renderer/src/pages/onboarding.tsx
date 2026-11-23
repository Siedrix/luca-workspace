import { useState } from 'react'
import { ArrowRight, FolderGit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WorkFolderPicker } from '@/components/work-folder-picker'
import { ipcErrorMessage } from '@/lib/errors'
import type { AppSettings } from '../../../shared/types'

interface OnboardingProps {
  onComplete: (settings: AppSettings) => void
}

type Step = 'welcome' | 'folder'

export function Onboarding({ onComplete }: OnboardingProps): React.JSX.Element {
  const [step, setStep] = useState<Step>('welcome')
  const [folder, setFolder] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finish = async (): Promise<void> => {
    if (!folder) return
    setSaving(true)
    setError(null)
    try {
      onComplete(await window.api.setWorkspacePath(folder))
    } catch (err) {
      setError(ipcErrorMessage(err))
      setSaving(false)
    }
  }

  if (step === 'welcome') {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-8 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border bg-card">
          <FolderGit2 className="size-7" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome</h1>
          <p className="text-muted-foreground">
            To get started, pick the folder where you keep your projects. We&apos;ll find the git
            repositories inside it.
          </p>
        </div>
        <Button size="lg" onClick={() => setStep('folder')}>
          Get started <ArrowRight />
        </Button>
      </main>
    )
  }

  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-6 p-8">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">Step 1 of 1</p>
          <h1 className="text-2xl font-semibold tracking-tight">Choose your work folder</h1>
          <p className="text-sm text-muted-foreground">
            Every folder directly inside it that contains a <code>.git</code> will be listed. The
            app keeps its data in a <code>.workspace.json</code> file it creates there. You can
            change the folder later in Settings.
          </p>
        </header>

        <WorkFolderPicker value={folder} onChange={setFolder} />

        <footer className="flex items-center justify-between gap-4 border-t pt-4">
          <Button variant="ghost" onClick={() => setStep('welcome')}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={finish} disabled={!folder || saving}>
              Continue <ArrowRight />
            </Button>
          </div>
        </footer>
      </div>
    </main>
  )
}
