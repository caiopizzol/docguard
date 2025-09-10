export interface DocWorksConfig {
  source: string // URL (https://docs.site.com) or local path (./docs)
  threshold?: number // Global threshold (0-100), defaults to 100
  questions?: string[] // Standalone questions (treated as implicit "general" journey)
  journeys?: Record<string, JourneyConfig | string[]>
  provider?: string // Simplified to allow any provider name
  model?: string
  api_key?: string
}

export interface JourneyConfig {
  threshold?: number // Journey-specific threshold (0-100)
  questions: string[]
}

export interface ValidationResult {
  question: string
  answerable: 'YES' | 'PARTIAL' | 'NO'
  confidence: number
  path: string[] // URLs visited
  reason: string
  missing?: string[] // What's missing
}

export interface JourneyResults {
  [journey: string]: ValidationResult[]
}
