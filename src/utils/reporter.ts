import { JourneyResults } from '../types/config.js'

export function formatReport(results: JourneyResults): number {
  let totalQuestions = 0
  let answeredQuestions = 0
  let partialQuestions = 0
  const failedJourneys: string[] = []

  // Calculate stats
  for (const [journey, questions] of Object.entries(results)) {
    const answered = questions.filter((q) => q.answerable === 'YES').length
    const partial = questions.filter((q) => q.answerable === 'PARTIAL').length
    const failed = questions.filter((q) => q.answerable === 'NO').length

    totalQuestions += questions.length
    answeredQuestions += answered
    partialQuestions += partial

    if (failed > 0) {
      failedJourneys.push(journey)
    }
  }

  const score = Math.round((answeredQuestions / totalQuestions) * 100)

  // Terminal output
  console.log('\n' + '='.repeat(50))
  console.log('\nDocumentation Validation Report\n')

  for (const [journey, questions] of Object.entries(results)) {
    const failed = questions.filter((q) => q.answerable === 'NO')
    const partial = questions.filter((q) => q.answerable === 'PARTIAL')
    const success = questions.filter((q) => q.answerable === 'YES')

    const journeyScore = Math.round((success.length / questions.length) * 100)

    console.log(`Journey: ${journey}`)
    console.log(`  Score: ${journeyScore}%`)
    console.log(`  Complete: ${success.length}`)
    if (partial.length > 0) console.log(`  Partial: ${partial.length}`)
    if (failed.length > 0) {
      console.log(`  Missing: ${failed.length}`)
      for (const q of failed) {
        console.log(`     • ${q.question}`)
      }
    }
    console.log()
  }

  // Summary
  console.log('='.repeat(50))
  console.log(`\nOverall Score: ${score}/100\n`)

  if (score >= 80) {
    console.log('Documentation is AI-ready!')
    console.log('Developers and AI agents can successfully use your docs.\n')
    return 0
  } else if (score >= 50) {
    console.log('Documentation needs improvement')
    console.log('Some journeys cannot be completed.\n')
    return 0
  } else {
    console.log('Documentation is incomplete')
    console.log('Many developer journeys will fail.\n')
    return 1
  }
}

export function formatJSON(results: JourneyResults, source: string): string {
  const stats = {
    total: 0,
    answered: 0,
    partial: 0,
    missing: 0,
  }

  for (const questions of Object.values(results)) {
    stats.total += questions.length
    stats.answered += questions.filter((q) => q.answerable === 'YES').length
    stats.partial += questions.filter((q) => q.answerable === 'PARTIAL').length
    stats.missing += questions.filter((q) => q.answerable === 'NO').length
  }

  return JSON.stringify(
    {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source,
      score: Math.round((stats.answered / stats.total) * 100),
      stats,
      results,
    },
    null,
    2
  )
}
