export async function checkOllamaAvailable(): Promise<boolean> {
  // Only check for Ollama in development
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(1000) // 1 second timeout
    })
    return response.ok
  } catch {
    return false
  }
}

export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags')
    if (response.ok) {
      const data = await response.json()
      return data.models?.map((m: any) => m.name) || []
    }
  } catch {
    // Silent fail
  }
  return []
}