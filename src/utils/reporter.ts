import {
  JourneyResults,
  DocWorksConfig,
  JourneyConfig,
} from '../types/config.js'
import { getJourneyThreshold } from './config.js'

export function formatReport(
  results: JourneyResults,
  config: DocWorksConfig
): number {
  let totalQuestions = 0
  let answeredQuestions = 0
  let partialQuestions = 0
  const failedJourneys: string[] = []

  // Check if any journeys have explicit thresholds
  const hasJourneyThresholds =
    config.journeys &&
    Object.entries(config.journeys).some(
      ([_, journeyConfig]) =>
        !Array.isArray(journeyConfig) && journeyConfig.threshold !== undefined
    )

  // Calculate stats and check per-journey thresholds
  for (const [journey, questions] of Object.entries(results)) {
    const answered = questions.filter((q) => q.answerable === 'YES').length
    const partial = questions.filter((q) => q.answerable === 'PARTIAL').length
    const failed = questions.filter((q) => q.answerable === 'NO').length

    totalQuestions += questions.length
    answeredQuestions += answered
    partialQuestions += partial

    // Only check journey thresholds if we're using journey-specific mode
    if (hasJourneyThresholds) {
      const threshold = getJourneyThreshold(journey, config)
      const journeyScore = Math.round((answered / questions.length) * 100)

      if (journeyScore < threshold) {
        failedJourneys.push(`${journey} (${journeyScore}% < ${threshold}%)`)
      }
    }
  }

  const score = Math.round((answeredQuestions / totalQuestions) * 100)

  // Terminal output
  console.log('\n' + '='.repeat(50))
  console.log('\nDocumentation Validation Report\n')

  for (const [journey, questions] of Object.entries(results)) {
    console.log(`Journey: ${journey}`)
    console.log('─'.repeat(40))

    for (const q of questions) {
      const icon =
        q.answerable === 'YES' ? '✅' : q.answerable === 'PARTIAL' ? '⚠️' : '❌'

      console.log(`${icon} ${q.question}`)
      console.log(`   Confidence: ${Math.round(q.confidence * 100)}%`)
      console.log(`   Path: ${q.path.length} pages searched`)

      if (q.missing && q.missing.length > 0) {
        console.log(`   Missing:`)
        q.missing.forEach((m) => console.log(`     - ${m}`))
      }
    }
    console.log()
  }

  // Summary
  console.log('='.repeat(50))
  const threshold = config.threshold ?? 100
  console.log(`\nOverall Score: ${score}/100 (Threshold: ${threshold})\n`)

  // If any journeys are configured with thresholds, ONLY check those
  // Otherwise check global
  if (hasJourneyThresholds) {
    // Only check journey thresholds
    if (failedJourneys.length > 0) {
      console.log('❌ Failed journeys:', failedJourneys.join(', '))
      return 1
    } else {
      console.log('✅ Documentation validation passed!')
      return 0
    }
  } else {
    // Only check global threshold
    if (score >= threshold) {
      console.log('✅ Documentation validation passed!')
      return 0
    } else {
      console.log(
        `❌ Documentation validation failed (${score}% < ${threshold}% threshold)`
      )
      return 1
    }
  }
}

export function formatJSON(
  results: JourneyResults,
  source: string,
  config: DocWorksConfig
): string {
  const stats = {
    total: 0,
    answered: 0,
    partial: 0,
    missing: 0,
  }

  // Calculate pass/fail for each journey
  const journeyResults: Record<string, any> = {}
  for (const [journey, questions] of Object.entries(results)) {
    const threshold = getJourneyThreshold(journey, config)

    const score = Math.round(
      (questions.filter((q) => q.answerable === 'YES').length /
        questions.length) *
        100
    )

    journeyResults[journey] = {
      score,
      threshold,
      passed: score >= threshold,
      questions,
    }

    stats.total += questions.length
    stats.answered += questions.filter((q) => q.answerable === 'YES').length
    stats.partial += questions.filter((q) => q.answerable === 'PARTIAL').length
    stats.missing += questions.filter((q) => q.answerable === 'NO').length
  }

  const overallScore = Math.round((stats.answered / stats.total) * 100)
  const overallThreshold = config.threshold ?? 100

  return JSON.stringify(
    {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source,
      score: overallScore,
      threshold: overallThreshold,
      passed: overallScore >= overallThreshold,
      stats,
      results: journeyResults,
    },
    null,
    2
  )
}
