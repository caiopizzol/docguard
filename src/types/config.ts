export interface DocGuardConfig {
  questions: {
    critical?: string[]
    important?: string[]
    nice_to_have?: string[]
  }
  provider?: 'openai' | 'anthropic'
  model?: string
  api_key?: string
  docs_path?: string
  cache_ttl?: number
}
