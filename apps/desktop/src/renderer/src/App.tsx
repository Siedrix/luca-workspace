import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

function App(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const ping = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Electron + shadcn/ui</CardTitle>
          <CardDescription>React, TypeScript, Tailwind v4 and electron-vite.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Clicked {count} {count === 1 ? 'time' : 'times'}.
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => setCount((c) => c + 1)}>Increment</Button>
          <Button variant="outline" onClick={ping}>
            Send IPC ping
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default App
