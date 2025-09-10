export interface DocWorksConfig {
  source: string // URL (https://docs.site.com) or local path (./docs)
  journeys: Record<string, string[]>
  provider?: 'openai' | 'anthropic'
  model?: string
  api_key?: string
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
}
