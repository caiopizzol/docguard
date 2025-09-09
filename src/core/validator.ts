import crypto from 'crypto'
import { ValidationResult, JourneyResults } from '../types/config.js'
import { checkAnswerability } from './ai.js'
import { getCached, setCached } from './cache.js'

export async function validateJourneys(
  journeys: Record<string, string[]>,
  docs: string,
  apiKey: string,
  useCache = true
): Promise<JourneyResults> {
  const results: JourneyResults = {}

  for (const [journey, questions] of Object.entries(journeys)) {
    results[journey] = await validateQuestions(
      questions,
      docs,
      apiKey,
      useCache
    )
  }

  return results
}

export async function validateQuestions(
  questions: string[],
  docs: string,
  apiKey: string,
  useCache = true
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  for (const question of questions) {
    // Generate cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(question + docs.substring(0, 1000)) // Use first 1KB for cache key
      .digest('hex')

    let result: ValidationResult | null = null

    // Try cache first
    if (useCache) {
      result = getCached(cacheKey)
    }

    // If not cached, check with AI
    if (!result) {
      const validation = await checkAnswerability(question, docs, apiKey)
      result = {
        question,
        ...validation,
      }

      // Cache the result
      if (useCache) {
        setCached(cacheKey, result)
      }
    }

    results.push(result)

    // Show progress
    const icon =
      result.answerable === 'YES'
        ? '✅'
        : result.answerable === 'PARTIAL'
          ? '⚠️'
          : '❌'
    console.log(`  ${icon} ${question}`)
  }

  return results
}
