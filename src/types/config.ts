export interface DocGuardConfig {
  source: string | SourceConfig
  journeys: Record<string, string[]>
  provider?: 'openai' | 'anthropic'
  model?: string
  api_key?: string
}

export interface SourceConfig {
  type: 'llms.txt' | 'mcp'
  server?: string // For MCP servers
}

export interface ValidationResult {
  question: string
  answerable: 'YES' | 'PARTIAL' | 'NO'
  reason: string
  location?: string
}

export interface JourneyResults {
  [journey: string]: ValidationResult[]
}

export interface DocSource {
  name: string
  fetch(): Promise<string>
  search?(query: string): Promise<string>
}
