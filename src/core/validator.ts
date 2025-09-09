import { checkAnswerability } from './ai.js'
import { getCached, setCached } from './cache.js'
import crypto from 'crypto'

export async function validateQuestions(
  questions: any,
  docs: string,
  apiKey: string,
  useCache: boolean = true
): Promise<any> {
  const results = {
    critical: [],
    important: [],
    nice_to_have: [],
  }

  // Flatten all questions with their priority
  const allQuestions: Array<{ question: string; priority: string }> = []
  for (const [priority, questionList] of Object.entries(questions)) {
    if (Array.isArray(questionList)) {
      for (const question of questionList) {
        allQuestions.push({ question, priority })
      }
    }
  }

  // Check each question
  for (const { question, priority } of allQuestions) {
    // Generate cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(question + docs)
      .digest('hex')

    let result

    // Try cache first
    if (useCache) {
      result = getCached(cacheKey)
    }

    // If not cached, check with AI
    if (!result) {
      result = await checkAnswerability(question, docs, apiKey)

      // Cache the result
      if (useCache) {
        setCached(cacheKey, result)
      }
    }

    // Store result
    if (!(results as any)[priority]) {
      ;(results as any)[priority] = []
    }

    ;(results as any)[priority].push({
      question,
      ...result,
    })

    // Show progress
    const icon =
      result.answerable === 'YES'
        ? '✅'
        : result.answerable === 'PARTIAL'
          ? '⚠️'
          : '❌'
    console.log(`${icon} ${question}`)
  }

  return results
}
//*
