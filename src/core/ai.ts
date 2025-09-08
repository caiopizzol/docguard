import { createProvider } from './providers/base.js'

export async function checkAnswerability(
  question: string,
  docs: string,
  apiKey: string,
  provider = 'openai',
  model?: string
) {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const aiProvider = createProvider(provider, apiKey, model)
      return await aiProvider.checkAnswerability(question, docs)
    } catch (error: any) {
      lastError = error

      // Retry on rate limits with exponential backoff
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }

      // Don't retry on other errors
      break
    }
  }

  // Return error state instead of throwing
  return {
    answerable: 'ERROR' as const,
    reason: lastError?.message || 'Unknown error',
    location: 'N/A',
  }
}
