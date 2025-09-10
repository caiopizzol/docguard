export interface DocWorksConfig {
  source: string // URL (https://docs.site.com) or local path (./docs)
  questions?: string[] // Standalone questions (treated as implicit "general" journey)
  journeys?: Record<string, string[]>
  provider?: string // Simplified to allow any provider name
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
