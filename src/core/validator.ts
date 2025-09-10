import {
  ValidationResult,
  JourneyResults,
  DocWorksConfig,
} from '../types/config.js'
import { callProvider } from '../providers/index.js'

export async function validateJourneys(
  journeys: Record<string, string[]>,
  docs: string,
  apiKey: string,
  config?: DocWorksConfig
): Promise<JourneyResults> {
  const results: JourneyResults = {}

  for (const [journey, questions] of Object.entries(journeys)) {
    results[journey] = await validateQuestions(questions, docs, apiKey, config)
  }

  return results
}

export async function validateQuestions(
  questions: string[],
  docs: string,
  apiKey: string,
  config?: DocWorksConfig
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  const provider = config?.provider || 'openai'
  const model = config?.model || 'gpt-4o-mini'

  for (const question of questions) {
    // Check with AI
    const validation = await callProvider(
      provider,
      model,
      apiKey,
      question,
      docs
    )
    const result = validation

    results.push(result)

    // Show progress
    const icon =
      result.answerable === 'YES'
        ? '✅'
        : result.answerable === 'PARTIAL'
          ? '⚠️'
          : '❌'
    console.log(
      `  ${icon} ${question} (${Math.round(result.confidence * 100)}%)`
    )
  }

  return results
}
