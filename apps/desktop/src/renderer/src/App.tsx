import { useEffect, useState } from 'react'
import { Home } from '@/pages/home'
import { Onboarding } from '@/pages/onboarding'
import { Settings } from '@/pages/settings'
import type { AppSettings } from '../../shared/types'

type View = 'home' | 'settings'

function App(): React.JSX.Element | null {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    window.api.getSettings().then(setSettings)
  }, [])

  // Avoid flashing onboarding before settings have loaded.
  if (!settings) return null

  if (!settings.workspacePath) {
    return <Onboarding onComplete={setSettings} />
  }

  if (view === 'settings') {
    return (
      <Settings
        settings={settings}
        onSaved={(next) => {
          setSettings(next)
          setView('home')
        }}
        onClose={() => setView('home')}
      />
    )
  }

  return <Home workspacePath={settings.workspacePath} onOpenSettings={() => setView('settings')} />
}

export default App
