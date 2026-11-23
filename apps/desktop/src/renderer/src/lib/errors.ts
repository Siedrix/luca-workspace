/** Electron prefixes IPC errors with "Error invoking remote method '…': Error: ". Strip it. */
export function ipcErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  return message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
}
